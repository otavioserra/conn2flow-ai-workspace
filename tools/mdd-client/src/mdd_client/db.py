"""Portable, scoped MDD storage. Markdown is preserved when sources disappear."""
from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol

from .core.indexer import INFRA, metadata, parse
from .storage import lock, write

LAYERS = {"normative", "procedural", "episodic", "raw"}
RELATIONS = {"implements", "depends_on", "supersedes", "references", "blocks"}
FIELDS = ("workspace_slug", "target", "layer", "doc_id", "slug", "title", "summary", "content",
          "frontmatter_json", "tags", "source_path", "checksum_sha256", "status", "updated_at")


class MDDDriver(Protocol):
    def upsert(self, record: dict) -> int: ...
    def query(self, query: str, **filters) -> list[dict]: ...
    def graph(self, doc_id: str, **filters) -> list[dict]: ...


class SQLiteMDDDriver:
    def __init__(self, path: Path | str):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(path, timeout=30)
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript("""
            PRAGMA journal_mode=WAL;
            PRAGMA synchronous=NORMAL;
            PRAGMA foreign_keys=ON;
            CREATE TABLE IF NOT EXISTS mdd_memories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              workspace_slug TEXT NOT NULL DEFAULT 'default', target TEXT NOT NULL DEFAULT 'global',
              layer TEXT NOT NULL CHECK(layer IN ('normative','procedural','episodic','raw')),
              doc_id TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, summary TEXT,
              content TEXT NOT NULL, frontmatter_json TEXT, tags TEXT, source_path TEXT,
              checksum_sha256 TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'A', updated_at TEXT NOT NULL,
              UNIQUE(workspace_slug,target,doc_id));
            CREATE INDEX IF NOT EXISTS mdd_scope ON mdd_memories(workspace_slug,target,layer,status);
            CREATE TABLE IF NOT EXISTS mdd_memory_links (
              id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_slug TEXT NOT NULL DEFAULT 'default',
              source_doc_id TEXT NOT NULL, target_doc_id TEXT NOT NULL, relation_type TEXT NOT NULL,
              UNIQUE(workspace_slug,source_doc_id,target_doc_id,relation_type));
            CREATE INDEX IF NOT EXISTS mdd_links_target ON mdd_memory_links(workspace_slug,target_doc_id);
            CREATE VIRTUAL TABLE IF NOT EXISTS mdd_memories_fts USING fts5(
              doc_id,title,summary,content,tags,content='mdd_memories',content_rowid='id',
              tokenize='unicode61 remove_diacritics 2');
            CREATE TRIGGER IF NOT EXISTS mdd_fts_insert AFTER INSERT ON mdd_memories BEGIN
              INSERT INTO mdd_memories_fts(rowid,doc_id,title,summary,content,tags)
              VALUES(new.id,new.doc_id,new.title,new.summary,new.content,new.tags); END;
            CREATE TRIGGER IF NOT EXISTS mdd_fts_delete AFTER DELETE ON mdd_memories BEGIN
              INSERT INTO mdd_memories_fts(mdd_memories_fts,rowid,doc_id,title,summary,content,tags)
              VALUES('delete',old.id,old.doc_id,old.title,old.summary,old.content,old.tags); END;
            CREATE TRIGGER IF NOT EXISTS mdd_fts_update AFTER UPDATE ON mdd_memories BEGIN
              INSERT INTO mdd_memories_fts(mdd_memories_fts,rowid,doc_id,title,summary,content,tags)
              VALUES('delete',old.id,old.doc_id,old.title,old.summary,old.content,old.tags);
              INSERT INTO mdd_memories_fts(rowid,doc_id,title,summary,content,tags)
              VALUES(new.id,new.doc_id,new.title,new.summary,new.content,new.tags); END;
        """)

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def upsert(self, record: dict) -> int:
        r = dict(record)
        # The web storage uses these aliases; identity and tenant are assigned by its authenticated caller.
        for src, dst in {"doc_key": "doc_id", "content_md": "content", "source_sha256": "checksum_sha256",
                         "metadata_json": "frontmatter_json", "summary_medium": "summary", "data_modificacao":"updated_at"}.items():
            if src in r and dst not in r:
                r[dst] = r[src]
        if r.get("layer") not in LAYERS or not str(r.get("doc_id", "")).strip():
            raise ValueError("A valid layer and doc_id are required")
        r.setdefault("workspace_slug", "default")
        r.setdefault("target", "global")
        r.setdefault("title", r["doc_id"])
        r.setdefault("content", "")
        r.setdefault("status", "A")
        if any(not isinstance(r[key], str) for key in ("workspace_slug", "target", "doc_id", "title", "content")):
            raise ValueError("Memory identity, title and content must be strings")
        if r['status'] not in {'A','I'}:
            raise ValueError('Invalid memory status')
        r.setdefault("slug", r["doc_id"].lower())
        r.setdefault("checksum_sha256", hashlib.sha256(r["content"].encode()).hexdigest())
        r.setdefault("updated_at", datetime.now(UTC).isoformat())
        if isinstance(r.get("frontmatter_json"), dict):
            r["frontmatter_json"] = json.dumps(r["frontmatter_json"], ensure_ascii=False)
        if isinstance(r.get("tags"), list):
            r["tags"] = " ".join(r["tags"])
        sql = f"INSERT INTO mdd_memories ({','.join(FIELDS)}) VALUES ({','.join('?' for _ in FIELDS)})"
        sql += " ON CONFLICT(workspace_slug,target,doc_id) DO UPDATE SET "
        sql += ",".join(f"{f}=excluded.{f}" for f in FIELDS if f not in {"workspace_slug", "target", "doc_id"})
        owned = not self.connection.in_transaction
        try:
            self.connection.execute(sql, [r.get(f) for f in FIELDS])
            if owned:
                self.connection.commit()
        except Exception:
            if owned:
                self.connection.rollback()
            raise
        return self.connection.execute("SELECT id FROM mdd_memories WHERE workspace_slug=? AND target=? AND doc_id=?",
                                       (r["workspace_slug"], r["target"], r["doc_id"])).fetchone()[0]

    def link(self, source: str, target: str, relation: str = "references", workspace_slug: str = "default"):
        if relation not in RELATIONS:
            raise ValueError("Invalid relation")
        with self.connection:
            self.connection.execute("INSERT OR IGNORE INTO mdd_memory_links(workspace_slug,source_doc_id,target_doc_id,relation_type) VALUES(?,?,?,?)",
                                    (workspace_slug, source, target, relation))

    def query(self, query: str, *, workspace_slug="default", target=None, layer=None, limit=10):
        if not 1 <= limit <= 1000:
            raise ValueError("limit must be between 1 and 1000")
        sql = "SELECT m.*,bm25(mdd_memories_fts) AS rank FROM mdd_memories_fts JOIN mdd_memories m ON m.id=mdd_memories_fts.rowid WHERE mdd_memories_fts MATCH ? AND m.workspace_slug=? AND m.status='A'"
        # Treat human input as words, rather than allowing accidental FTS operator syntax.
        terms = re.findall(r"\w+", query, re.UNICODE)
        if not terms:
            return []
        args = [' AND '.join('"' + word + '"' for word in terms), workspace_slug]
        for key, value in (("target", target), ("layer", layer)):
            if value is not None:
                sql += f" AND m.{key}=?"
                args.append(value)
        return [dict(r) for r in self.connection.execute(sql + " ORDER BY rank,m.id LIMIT ?", [*args, limit])]

    def graph(self, doc_id: str, *, workspace_slug="default"):
        return [dict(r) for r in self.connection.execute("SELECT * FROM mdd_memory_links WHERE workspace_slug=? AND (source_doc_id=? OR target_doc_id=?) ORDER BY id", (workspace_slug, doc_id, doc_id))]

    def export_records(self, *, workspace_slug="default", target=None):
        sql, args = "SELECT * FROM mdd_memories WHERE workspace_slug=?", [workspace_slug]
        if target:
            sql += " AND target=?"
            args.append(target)
        return [dict(r) for r in self.connection.execute(sql + " ORDER BY id", args)]

    def import_jsonl(self, content: str, *, workspace_slug="default"):
        records = [json.loads(line) for line in content.splitlines() if line.strip()]
        # Validate before writing, including all layers; never trust an imported tenant scope.
        if any(not isinstance(r, dict) or r.get("layer") not in LAYERS or not (r.get("doc_id") or r.get("doc_key")) for r in records):
            raise ValueError("Invalid memory JSONL")
        with self.connection:
            self.connection.execute("BEGIN IMMEDIATE")
            for record in records:
                self.upsert({**record, "workspace_slug": workspace_slug})
        return len(records)


def classify(path: Path) -> str:
    if "raw" in path.parts:
        return "raw"
    if "skills" in path.parts or path.name.startswith(("03-", "04-")):
        return "procedural"
    if "decisions" in path.parts or path.name.startswith(("00-", "01-", "02-")):
        return "normative"
    return "episodic"


def sync(repo: Path, driver: SQLiteMDDDriver, *, include_skills=False, workspace_slug="default"):
    repo = repo.resolve()
    files = list((repo / "memory").rglob("*.md"))
    if include_skills:
        files += list((repo / ".gemini" / "skills").rglob("*.md"))
    changed = unchanged = 0
    snapshots = {r['source_path']:r['checksum_sha256'] for r in driver.connection.execute('SELECT source_path,checksum_sha256 FROM mdd_memories WHERE workspace_slug=? AND source_path IS NOT NULL',(workspace_slug,))}
    parents = {}
    for path in sorted(files):
        if path.name.lower() in INFRA:
            continue
        if path.parent not in parents:
            parents[path.parent] = path.parent.resolve()
        if path.is_symlink() or not parents[path.parent].is_relative_to(repo):
            continue
        raw = path.read_bytes()
        checksum = hashlib.sha256(raw).hexdigest()
        source = path.relative_to(repo).as_posix()
        if snapshots.get(source) == checksum:
            unchanged += 1
            continue
        text = raw.decode("utf-8-sig")
        fm, body, _, _ = parse(text)
        meta = metadata(path, repo, text)
        doc_id = fm.get("id") or meta["id"]
        if "skills" in path.relative_to(repo).parts:
            doc_id = "SKILL-" + path.parent.name
        # Dual archives retain the original ID in frontmatter, but must not replace the live record.
        if any(part in {"archive", "archive-1", "archive-2"} for part in path.relative_to(repo).parts):
            doc_id += "@" + hashlib.sha256(source.encode()).hexdigest()[:12]
        driver.upsert(dict(workspace_slug=workspace_slug, target=fm.get("target", "global"),
                           layer=fm.get("layer") if fm.get("layer") in LAYERS else classify(path.relative_to(repo)), doc_id=doc_id, slug=path.stem,
                           title=meta["title"], summary=fm.get("summary_medium", meta.get("summary_short", "")),
                           content=body, frontmatter_json=fm, source_path=source, checksum_sha256=checksum))
        for key, rel in (("batch", "implements"), ("request", "implements"), ("backlog_origin", "depends_on"), ("supersedes", "supersedes")):
            if fm.get(key):
                driver.link(doc_id, fm[key], rel, workspace_slug)
        for linked in re.findall(r"\[([A-Z][A-Z-]*-\d+)\]\([^\n)]+\)", body):
            if linked != doc_id:
                driver.link(doc_id, linked, "references", workspace_slug)
        changed += 1
    return {"changed": changed, "unchanged": unchanged}


def learn(driver: SQLiteMDDDriver, repo: Path, record: dict, *, write_md=False):
    if write_md:
        # IDs cannot introduce directories or escape the authored memory root.
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,119}", record["doc_id"]):
            raise ValueError("Unsafe document ID")
        if record.get("layer") not in LAYERS:
            raise ValueError("Invalid layer")
        repo = repo.resolve()
        with lock(repo):
            old = driver.connection.execute("SELECT source_path FROM mdd_memories WHERE workspace_slug=? AND target=? AND doc_id=?", (record.get("workspace_slug", "default"), record.get("target", "global"), record["doc_id"])).fetchone()
            path = repo / (old[0] if old and old[0] else "memory/raw/" + record["doc_id"] + ".md")
            if path.is_symlink() or not path.resolve().is_relative_to((repo / "memory").resolve()):
                raise ValueError("Unsafe authored path")
            path.parent.mkdir(parents=True, exist_ok=True)
            head = {"id": record["doc_id"], "title": record["title"], "layer": record["layer"], "target": record["target"], "summary_medium": record.get("summary", "")}
            defaults={'status':'active','date':datetime.now(UTC).date().isoformat(),'author':'executor','target_repo':repo.name,'summary_short':record.get('summary','')[:140]}
            head={**defaults,**head}
            if path.exists():
                original = path.read_bytes()
                fm, _, _, errors = parse(original.decode("utf-8-sig"))
                if errors or fm.get("id") != record["doc_id"]:
                    raise ValueError("Existing document identity or frontmatter conflicts")
                head = {**fm, **head}
                backup = path.with_suffix("." + hashlib.sha256(original).hexdigest()[:16] + ".md.bak")
                if not backup.exists():
                    write(repo, backup, original)
            content = ("---\n" + "\n".join(f"{k}: {json.dumps(v, ensure_ascii=False)}" for k, v in head.items()) + "\n---\n\n" + record["content"]).encode()
            write(repo, path, content)
            record = {**record, "source_path": path.relative_to(repo).as_posix(), "checksum_sha256": hashlib.sha256(content).hexdigest()}
    return driver.upsert(record)

"""Federated skill-feedback bus (ARCH-018 Phase 2).

Feedback is an atomic Markdown file ``FB-XXX-<slug>.md`` in ``memory/inbox/feedback/``.
The inbox index uses the generic indexer renderer, so ``mdd index`` keeps it stable.
GitHub Issues are optional and always go through an injectable runner (tests never
touch the network). The SQLite/FTS5 database is updated only when it already exists.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import unicodedata
from collections.abc import Callable, Sequence
from datetime import UTC, datetime
from pathlib import Path

from .core.indexer import _quote, parse, render, set_metadata
from .storage import contained, lock, write

INBOX = Path("memory/inbox/feedback")
PERSONAS = ("architect", "executor", "reviewer", "curator", "optimizer")
KINDS = ("gap", "bug", "bloat", "proposal", "learning")
SEVERITIES = ("high", "medium", "low")
SCOPES = ("global", "local")
VERDICTS = ("ACCEPT", "NEEDS_EVIDENCE", "QUARANTINE", "REJECT", "LOCAL_ONLY")
PENDING = "PENDING"
READY = "READY"
QUARANTINE = "QUARANTINE"
AUTO_REVIEWER = "auto-recurrence"
GITHUB_LABEL = "skill-feedback"
FIELDS = ("id", "title", "status", "verdict", "date", "author", "target_repo", "repo", "request", "batch",
          "persona", "skill", "kind", "severity", "scope", "recurrence", "evidence", "summary_short", "github_issue")
FILTERS = ("status", "verdict", "skill", "repo", "severity")
ID = re.compile(r"^FB-(\d{3,})-.*\.md$", re.I)

Runner = Callable[[Sequence[str]], str]


def run_gh(command: Sequence[str]) -> str:
    """Default GitHub runner: the authenticated ``gh`` CLI, never a shell."""
    result = subprocess.run(list(command), capture_output=True, text=True, timeout=60, check=False)
    if result.returncode:
        raise ValueError(f"gh failed: {(result.stderr or result.stdout).strip()}")
    return result.stdout


def resolve_root(path: Path | None = None, matrix: Path | None = None, scope: str = "global") -> Path:
    """Local scope writes to the current repo; global scope writes to the matrix inbox."""
    if scope == "local":
        candidate = path or Path(".")
    else:
        candidate = matrix or (Path(os.environ["MDD_MATRIX"]) if os.environ.get("MDD_MATRIX") else None)
        if candidate is None:
            from .sync import find_matrix

            candidate = find_matrix(None)
    candidate = candidate.resolve()
    if not (candidate / "memory").is_dir():
        raise ValueError(f"Feedback inbox root has no memory/ folder: {candidate}")
    return candidate


def _inbox(root: Path) -> Path:
    return contained(root, root / INBOX)


def _slug(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return (slug[:48].rstrip("-") or "feedback")


def _choice(name: str, value: str | None, choices: Sequence[str], required: bool = True) -> str:
    if value is None or value == "":
        if required:
            raise ValueError(f"--{name} is required ({'|'.join(choices)})")
        return ""
    if value not in choices:
        raise ValueError(f"Invalid {name}: {value} (expected {'|'.join(choices)})")
    return value


def _next_id(inbox: Path) -> str:
    numbers = [int(m[1]) for p in inbox.rglob("FB-*.md") if (m := ID.match(p.name))]
    return f"FB-{max(numbers, default=0) + 1:03d}"


def _occurrences(inbox: Path, skill: str, kind: str) -> list[tuple[Path, dict[str, str]]]:
    """Every FB record (inbox and archive) sharing ``(skill, kind)``; archived records still count."""
    found = []
    for path in sorted(inbox.rglob("FB-*.md")):
        if ID.match(path.name):
            fm, _, _, _ = parse(path.read_bytes().decode("utf-8-sig"))
            if fm.get("skill") == skill and fm.get("kind") == kind:
                found.append((path, fm))
    return found


def _origin(fm: dict[str, str], path: Path) -> tuple[str, ...]:
    """ARCH-018 §4: repeats inside one batch are one occurrence; records without a batch count alone."""
    batch = str(fm.get("batch", "")).strip().upper()
    return ("batch", str(fm.get("repo", "")).strip().casefold(), batch) if batch else ("record", path.name)


def _promote(root: Path, path: Path, promoted_by: str) -> None:
    """Rewrite an auto-quarantined record as READY; caller already owns the MDD lock."""
    content = path.read_bytes().decode("utf-8-sig")
    newline = "\r\n" if "\r\n" in content else "\n"
    head, sep, rest = content.partition(newline + "---" + newline)
    lines = head.split(newline)
    for key, value in (("status", READY), ("verdict", PENDING), ("promoted_by", promoted_by)):
        entry = f"{key}: {_quote(value)}"
        for number, line in enumerate(lines):
            if line.startswith(f"{key}:"):
                lines[number] = entry
                break
        else:
            lines.append(entry)
    write(root, path, newline.join(lines) + sep + rest)


def _ensure_inbox(root: Path) -> Path:
    inbox = _inbox(root)
    inbox.mkdir(parents=True, exist_ok=True)
    readme = inbox / "README.md"
    if not readme.exists():
        write(root, readme, "# Skill Feedback Inbox\n\nAtomic `FB-XXX-<slug>.md` records written by `mdd feedback submit`.\n"
                            "Triage with `mdd feedback triage <id> --verdict ...`; never edit IDs by hand.\n")
    return inbox


def _write_indexes(root: Path, inbox: Path) -> None:
    write(root, inbox / "index.md", render(root, inbox))
    write(root, inbox.parent / "index.md", render(root, inbox.parent))


def _document(meta: dict[str, str], proposal: str) -> str:
    header = "\n".join(f"{key}: {_quote(meta.get(key, ''))}" for key in FIELDS)
    body = [f"# {meta['id']} — {meta['summary_short']}", "",
            f"* **Skill**: `{meta['skill']}` · **Kind**: `{meta['kind']}` · **Severity**: `{meta['severity']}` · **Scope**: `{meta['scope']}`",
            f"* **Origin**: `{meta['repo']}` {meta['request']} {meta['batch']} (persona `{meta['persona']}`)".rstrip(), "",
            "## Evidence", "", meta["evidence"], "", "## Proposal", "", proposal or "_No proposal supplied._", ""]
    return "---\n" + header + "\n---\n\n" + "\n".join(body)


def _issue_body(meta: dict[str, str], proposal: str) -> str:
    lines = [f"**Skill**: `{meta['skill']}`", f"**Kind**: `{meta['kind']}` · **Severity**: `{meta['severity']}` · **Scope**: `{meta['scope']}`",
             f"**Origin**: `{meta['repo']}` {meta['request']} {meta['batch']} · persona `{meta['persona']}`".rstrip()]
    if meta.get("id"):
        lines.append(f"**Inbox record**: `{meta['id']}`")
    return "\n".join(lines) + f"\n\n## Evidence\n\n{meta['evidence']}\n\n## Proposal\n\n{proposal or '_No proposal supplied._'}\n"


def _index_db(root: Path, path: Path, text: str) -> bool:
    database = root / "memory" / ".mdd.sqlite"
    if not database.is_file():
        return False
    from .db import SQLiteMDDDriver

    fm, body, _, _ = parse(text)
    with SQLiteMDDDriver(database) as driver:
        driver.upsert(dict(target="global", layer="episodic", doc_id=fm["id"], slug=path.stem, title=fm["title"],
                           summary=fm.get("summary_short", ""), content=body, frontmatter_json=fm,
                           tags=["feedback", fm.get("skill", ""), fm.get("kind", ""), fm.get("verdict", "")],
                           source_path=path.relative_to(root).as_posix()))
    return True


def submit(root: Path | None, data: dict, *, github: bool = False, github_repo: str | None = None,
           runner: Runner | None = None, today: str | None = None, force_ready: bool = False) -> dict:
    """Validate, allocate the next FB ID under the MDD lock, write, index and optionally open an Issue.

    Anti-bloat quarantine (ARCH-018 Phase 4): ``high`` severity is born ``READY``; ``medium``/``low``
    are born in ``QUARANTINE`` on the first ``(skill, kind)`` occurrence. An occurrence is one
    ``(repo, batch)`` origin (a record without a batch counts alone), so repeats inside one batch do
    not self-promote. From the second distinct origin (or with ``force_ready``) the record is
    ``READY`` and auto-quarantined siblings in the inbox are promoted. Curator verdicts
    (``status: TRIAGED``) are never touched.
    """
    scope = _choice("scope", data.get("scope") or "global", SCOPES)
    summary = " ".join(str(data.get("summary") or "").split())
    evidence = str(data.get("evidence") or "").strip()
    skill = str(data.get("skill") or "").strip()
    if not summary or not evidence or not skill:
        raise ValueError("--summary, --evidence and --skill are required (evidence is the Curator's first filter)")
    if not re.fullmatch(r"[a-z0-9][a-z0-9:_-]{0,119}", skill):
        raise ValueError(f"Invalid skill name: {skill}")
    meta = {
        "id": "", "title": "", "status": PENDING, "verdict": PENDING, "date": today or datetime.now(UTC).date().isoformat(),
        "author": _choice("persona", data.get("persona"), PERSONAS), "target_repo": "",
        "repo": str(data.get("repo") or (root.name if root else Path.cwd().name)).strip(),
        "request": str(data.get("request") or "").strip(), "batch": str(data.get("batch") or "").strip(),
        "persona": data.get("persona"), "skill": skill, "kind": _choice("kind", data.get("kind"), KINDS),
        "severity": _choice("severity", data.get("severity"), SEVERITIES), "scope": scope,
        "evidence": evidence, "summary_short": summary[:140], "github_issue": "",
    }
    proposal = str(data.get("proposal") or "").strip()
    if root is None and not github:
        raise ValueError("No matrix inbox available: pass --matrix, set MDD_MATRIX or use --github")
    result: dict = {"id": None, "path": None, "index": None, "database": False, "github_issue": None,
                    "status": PENDING, "recurrence": None, "promoted": []}
    if root is not None:
        root = root.resolve()
        promoted: list[Path] = []
        with lock(root):
            inbox = _ensure_inbox(root)
            previous = _occurrences(inbox, skill, meta["kind"])
            meta["id"] = _next_id(inbox)
            path = contained(root, inbox / f"{meta['id']}-{_slug(summary)}.md")
            recurrence = len({_origin(fm, p) for p, fm in previous} | {_origin(meta, path)})
            ready = force_ready or meta["severity"] == "high" or recurrence >= 2
            meta["title"] = f"{meta['id']} — {summary}"[:200]
            meta["target_repo"] = root.name
            meta["status"], meta["verdict"] = (READY, PENDING) if ready else (QUARANTINE, QUARANTINE)
            meta["recurrence"] = str(recurrence)
            text = _document(meta, proposal)
            write(root, path, text)
            if ready:
                for sibling, fm in previous:
                    if sibling.parent == inbox and fm.get("status") == QUARANTINE:
                        _promote(root, sibling, meta["id"])
                        promoted.append(sibling)
            _write_indexes(root, inbox)
        result.update(id=meta["id"], path=path.relative_to(root).as_posix(), index=(INBOX / "index.md").as_posix(),
                      database=_index_db(root, path, text), status=meta["status"], recurrence=recurrence,
                      promoted=[re.match(r"FB-\d+", p.name, re.I)[0] for p in promoted])
        for sibling in promoted:
            _index_db(root, sibling, sibling.read_text(encoding="utf-8"))
    else:
        meta["status"] = READY if (force_ready or meta["severity"] == "high") else QUARANTINE
        result["status"] = meta["status"]
    if github:
        title = f"[skill-feedback] {skill}: {summary}"[:240]
        command = ["gh", "issue", "create", "--title", title, "--body", _issue_body(meta, proposal), "--label", GITHUB_LABEL]
        if github_repo:
            command += ["--repo", github_repo]
        try:
            output = (runner or run_gh)(command)
        except (ValueError, OSError, subprocess.SubprocessError) as exc:
            result["github_error"] = str(exc)
        else:
            url = next((t for t in output.split() if t.startswith("https://")), output.strip())
            result["github_issue"] = url
            if result["path"]:
                set_metadata(root, result["path"], {"github_issue": url})
                result["database"] = _index_db(root, root / result["path"], (root / result["path"]).read_text(encoding="utf-8"))
    return result


def _records(root: Path) -> list[dict]:
    inbox = root / INBOX
    if not inbox.is_dir():
        return []
    records, origins = [], {}
    top = _inbox(root)
    for path in sorted(top.rglob("FB-*.md")):
        if not ID.match(path.name):
            continue
        contained(root, path)
        fm, _, _, _ = parse(path.read_bytes().decode("utf-8-sig"))
        origins.setdefault((fm.get("skill", ""), fm.get("kind", "")), set()).add(_origin(fm, path))
        if path.parent == top:
            records.append({**{k: fm.get(k, "") for k in FIELDS}, **fm, "source": "inbox",
                            "path": path.relative_to(root).as_posix()})
    for record in records:  # Recurrence is computed live (inbox + archive), never trusted from disk.
        record["recurrence"] = len(origins[(record.get("skill", ""), record.get("kind", ""))])
    return records


def list_feedback(root: Path | None, filters: dict | None = None, *, include_github: bool = False,
                  github_repo: str | None = None, runner: Runner | None = None) -> list[dict]:
    """Return inbox records (optionally plus open GitHub Issues) matching every given filter."""
    filters = {k: v for k, v in (filters or {}).items() if v not in (None, "") and k in FILTERS}
    records = _records(root.resolve()) if root else []
    if include_github:
        command = ["gh", "issue", "list", "--label", GITHUB_LABEL, "--state", "all", "--json", "number,title,url,state,labels"]
        if github_repo:
            command += ["--repo", github_repo]
        known = {r.get("github_issue") for r in records}
        for issue in json.loads((runner or run_gh)(command) or "[]"):
            if issue.get("url") in known:
                continue
            records.append({"id": f"GH-{issue.get('number')}", "title": issue.get("title", ""), "status": issue.get("state", ""),
                            "verdict": PENDING, "skill": "", "repo": "", "severity": "", "summary_short": issue.get("title", ""),
                            "github_issue": issue.get("url", ""), "source": "github"})
    return [r for r in records if all(str(r.get(k, "")).casefold() == str(v).casefold() for k, v in filters.items())]


def triage(root: Path, feedback_id: str, verdict: str, *, reason: str, reviewer: str = "curator",
           today: str | None = None) -> dict:
    """Record one Tribunal-of-4-Filters verdict; the inbox index is rebuilt atomically."""
    verdict = _choice("verdict", verdict, VERDICTS)
    if not reason or not reason.strip():
        raise ValueError("--reason is required for triage")
    root = root.resolve()
    if not re.fullmatch(r"FB-\d{3,}", feedback_id, re.I):
        raise ValueError(f"Invalid feedback ID: {feedback_id}")
    matches = [r for r in _records(root) if r["id"].upper() == feedback_id.upper()]
    if len(matches) != 1:
        raise ValueError(f"Feedback not found or not unique: {feedback_id}")
    updates = {"status": "TRIAGED", "verdict": verdict, "triage_reason": " ".join(reason.split()),
               "triage_reviewer": reviewer, "triage_date": today or datetime.now(UTC).date().isoformat()}
    if verdict == "LOCAL_ONLY":
        updates["scope"] = "local"
    path = set_metadata(root, matches[0]["path"], updates)
    database = _index_db(root, path, path.read_text(encoding="utf-8"))
    return {"id": matches[0]["id"], "path": matches[0]["path"], **updates, "database": database}

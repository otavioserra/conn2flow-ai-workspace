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
GITHUB_LABEL = "skill-feedback"
FIELDS = ("id", "title", "status", "verdict", "date", "author", "target_repo", "repo", "request", "batch",
          "persona", "skill", "kind", "severity", "scope", "evidence", "summary_short", "github_issue")
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
           runner: Runner | None = None, today: str | None = None) -> dict:
    """Validate, allocate the next FB ID under the MDD lock, write, index and optionally open an Issue."""
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
    result: dict = {"id": None, "path": None, "index": None, "database": False, "github_issue": None}
    if root is not None:
        root = root.resolve()
        with lock(root):
            inbox = _ensure_inbox(root)
            meta["id"] = _next_id(inbox)
            meta["title"] = f"{meta['id']} — {summary}"[:200]
            meta["target_repo"] = root.name
            path = contained(root, inbox / f"{meta['id']}-{_slug(summary)}.md")
            text = _document(meta, proposal)
            write(root, path, text)
            _write_indexes(root, inbox)
        result.update(id=meta["id"], path=path.relative_to(root).as_posix(), index=(INBOX / "index.md").as_posix(),
                      database=_index_db(root, path, text))
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
    records = []
    for path in sorted(_inbox(root).glob("FB-*.md")):
        contained(root, path)
        fm, _, _, _ = parse(path.read_bytes().decode("utf-8-sig"))
        records.append({**{k: fm.get(k, "") for k in FIELDS}, **fm, "source": "inbox",
                        "path": path.relative_to(root).as_posix()})
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

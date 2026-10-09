"""Deterministic scalar YAML metadata and indexes, shared contract with Core PHP.

Read tolerantly; mutate only the supported string mapping/block-scalar dialect.
Each replacement is atomic; cooperative writers share memory/.mdd.lock. On an
index write failure restore the document. A process crash between replacements
can be repaired with index(), without loss of document content.
"""

import json
import os
import re
from pathlib import Path
from urllib.parse import quote

from ..storage import contained, lock, write

FIELDS = ("id", "title", "status", "date", "author", "target_repo", "summary_short", "summary_medium")
INFRA = {"index.md", "readme.md", "current.md", "batch-index.md", "decision-log.md", "validation-checklist.md"}
HEADER = re.compile(r"\A(?:\ufeff)?---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", re.S)
KEY = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$")


def _scalar(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("#"):
        return ""
    if raw.startswith('"'):
        value, end = json.JSONDecoder().raw_decode(raw)
        if not isinstance(value, str) or (raw[end:].strip() and not raw[end:].lstrip().startswith("#")):
            raise ValueError("Invalid quoted scalar")
        return value
    if raw.startswith("'"):
        match = re.fullmatch(r"'((?:[^']|'')*)'[ \t]*(?:#.*)?", raw)
        if not match:
            raise ValueError("Invalid quoted scalar")
        return match[1].replace("''", "'")
    if raw.startswith(("[", "{", "&", "*", "!", "|", ">", "@", "`", ",", "]", "}")) or re.match(r"^[-?:](?:\s|$)", raw):
        raise ValueError("Unsupported YAML scalar")
    value = re.split(r"[ \t]+#", raw, maxsplit=1)[0].rstrip()
    if re.search(r":(?:\s|$)|[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", value):
        raise ValueError("Invalid plain YAML scalar")
    return value


def _block_value(raw: str, block: list[str]) -> str:
    nonempty = [s for s in block if s.strip()]
    indent = len(nonempty[0]) - len(nonempty[0].lstrip(" ")) if nonempty else 0
    if any(s.startswith("\t") or len(s) - len(s.lstrip(" ")) < indent for s in nonempty):
        raise ValueError("Invalid block indentation")
    parts = [s[indent:] if s.strip() else "" for s in block]
    if not parts:
        return ""
    value = ""
    for n, part in enumerate(parts):
        value += part
        sep = "\n"
        if raw[0] == ">" and n + 1 < len(parts) and part and not part.startswith((" ", "\t")):
            next_part = parts[n + 1]
            if next_part and not next_part.startswith((" ", "\t")):
                sep = " "
            elif not next_part:
                following = next((s for s in parts[n + 2:] if s), "")
                if following and not following.startswith((" ", "\t")):
                    sep = ""
        value += sep
    if raw[1:2] == "-":
        return value.rstrip("\n")
    if raw[1:2] == "+":
        return value
    return value.rstrip("\n") + "\n" if value.strip("\n") else ""


def parse(content: str) -> tuple[dict[str, str], str, bool, list[str]]:
    match = HEADER.match(content)
    if not match:
        errors = ["Unclosed frontmatter"] if content.lstrip("\ufeff").startswith("---\n") or content.lstrip("\ufeff").startswith("---\r\n") else []
        return {}, content.lstrip("\ufeff"), False, errors
    lines = match[1].replace("\r\n", "\n").split("\n")
    meta: dict[str, str] = {}
    errors = []
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        entry = KEY.match(line)
        if not entry:
            errors.append("Unsupported YAML mapping")
            continue
        key, raw = entry.groups()
        if key in meta:
            errors.append(f"Duplicate field: {key}")
        try:
            if re.fullmatch(r"[|>][-+]?(?:[ \t]+#.*)?", raw):
                block = []
                while i < len(lines) and (not lines[i].strip() or lines[i].startswith((" ", "\t"))):
                    block.append(lines[i])
                    i += 1
                meta[key] = _block_value(raw, block)
            else:
                meta[key] = _scalar(raw)
        except (ValueError, json.JSONDecodeError):
            errors.append(f"Unsupported value: {key}")
    return meta, content[match.end():], True, errors


def metadata(path: Path, repo: Path, content: str | None = None) -> dict[str, str]:
    content = content if content is not None else path.read_bytes().decode("utf-8")
    parsed, body, _, _ = parse(content)
    heading = re.search(r"^# +(.+)$", body, re.M)
    title = heading[1].strip() if heading else path.stem
    identity = re.match(r"([A-Za-z][A-Za-z0-9_-]*-\d+)\b", title)
    status = re.search(r"^\s*(?:[*-]\s*)?(?:\*\*)?Status(?:\*\*)?\s*:\s*(.+)$", body, re.M | re.I)
    paragraph = []
    in_code = False
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            continue
        prose = not in_code and stripped and not re.match(r"^(?:[#|>*+-]|\d+[.)]\s|<!--|---)", stripped)
        if prose:
            paragraph.append(stripped)
        elif paragraph:
            break
    summary = " ".join(paragraph)
    if len(summary) > 120:
        summary = summary[:117] + "..."
    fallback = {
        "id": identity[1].upper() if identity else path.stem.upper(),
        "title": title,
        "status": status[1].strip(" `*.\r\n") if status else ("archived" if any(p == "archive" or p.startswith("archive-") for p in path.parts) else "indexed"),
        "date": "", "author": "", "target_repo": repo.name,
        "summary_short": summary, "summary_medium": summary,
    }
    return fallback | parsed


def _memory(repo: Path) -> Path:
    target = contained(repo, repo / "memory")
    if not target.is_dir():
        raise ValueError(f"Memory folder not found: {target}")
    return target


def _walk(repo: Path):
    for directory, children, names in os.walk(_memory(repo), followlinks=False):
        children[:] = sorted(c for c in children if not c.startswith(".") and not (Path(directory) / c).is_symlink() and not getattr(os.path, "isjunction", lambda _: False)(Path(directory) / c))
        for name in sorted(names):
            if name.lower().endswith(".md"):
                yield contained(repo, Path(directory) / name)


def resolve(repo: Path, target: str, directory: bool = False) -> Path:
    repo = repo.resolve()
    memory = _memory(repo)
    supplied = Path(target)
    candidates = [supplied] if supplied.is_absolute() else [repo / supplied, memory / supplied]
    for candidate in candidates:
        if candidate.exists():
            candidate = contained(repo, candidate)
            if not candidate.resolve().is_relative_to(memory.resolve()):
                raise ValueError("Target must be inside memory/")
            if candidate.is_dir() != directory or (not directory and candidate.suffix.lower() != ".md"):
                raise ValueError("Invalid target type")
            return candidate
    if directory or supplied.name != target:
        raise ValueError(f"Target not found: {target}")
    matches = [p for p in _walk(repo) if p.name.casefold() == target.casefold() or p.stem.casefold() == target.casefold()]
    if len(matches) != 1:
        raise ValueError(f"Target must be unique: {target} ({len(matches)} matches)")
    return matches[0]


def _cell(value: str) -> str:
    return " ".join(value.split()).replace("&", "&amp;").replace("|", "&#124;").replace("<", "&lt;").replace(">", "&gt;").replace("[", "&#91;").replace("]", "&#93;")


def render(repo: Path, directory: Path, overrides: dict[Path, str] | None = None) -> str:
    rows = [f"# Index — {directory.name}", "", "| ID | Title | Executive summary | Relative link | Status |", "| --- | --- | --- | --- | --- |"]
    overrides = overrides or {}
    children = []
    for path in sorted(directory.iterdir(), key=lambda p: p.name.encode("utf-8")):
        if path.name.startswith("."):
            continue
        contained(repo, path)
        if path.is_dir():
            if (path / "index.md").is_file():
                contained(repo, path / "index.md")
                children.append(f"- [{_cell(path.name)}](<{quote(path.name, safe='-._~')}/index.md>)")
        elif path.suffix.lower() == ".md" and path.name.lower() not in INFRA:
            meta = metadata(path, repo, overrides.get(path))
            link = quote(path.name, safe="-._~")
            rows.append(f"| {_cell(meta['id'])} | {_cell(meta['title'])} | {_cell(meta['summary_short'])} | [source](<{link}>) | {_cell(meta['status'])} |")
    if children:
        rows += ["", "## Directories", "", *children]
    return "\n".join(rows) + "\n"


def index(repo: Path, target: str | None = None) -> list[Path]:
    repo = repo.resolve()
    with lock(repo):
        directories = [resolve(repo, target, True)] if target else sorted({p.parent for p in _walk(repo) if p.name == "index.md"})
        for directory in directories:
            write(repo, directory / "index.md", render(repo, directory))
    return [d / "index.md" for d in directories]


def get(repo: Path, target: str, field: str | None = None) -> dict[str, str] | str:
    repo = repo.resolve()
    meta = metadata(resolve(repo, target), repo)
    if field is not None:
        if field not in meta:
            raise ValueError(f"Unknown field: {field}")
        return meta[field]
    return meta


def set_metadata(repo: Path, target: str, updates: dict[str, str]) -> Path:
    repo = repo.resolve()
    if not updates or any(not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", key) for key in updates):
        raise ValueError("Supply valid metadata fields")
    with lock(repo):
        path = resolve(repo, target)
        before = path.read_bytes()
        content = before.decode("utf-8")
        parsed, body, has, errors = parse(content)
        if errors:
            raise ValueError("Cannot safely mutate frontmatter: " + "; ".join(errors))
        newline = "\r\n" if "\r\n" in content else "\n"
        if has:
            header = HEADER.match(content)[1].replace("\r\n", "\n")
            for key, value in updates.items():
                entry = f"{key}: {_quote(value)}"
                lines = header.split("\n")
                for start, line in enumerate(lines):
                    match = KEY.match(line)
                    if match and match[1] == key:
                        end = start + 1
                        if re.fullmatch(r"[|>][-+]?(?:[ \t]+#.*)?", match[2]):
                            while end < len(lines) and (not lines[end].strip() or lines[end].startswith((" ", "\t"))):
                                end += 1
                        lines[start:end] = [entry]
                        break
                else:
                    lines.append(entry)
                header = "\n".join(lines)
        else:
            meta = metadata(path, repo, content) | updates
            header = "\n".join(f"{key}: {_quote(value)}" for key, value in meta.items())
        bom = "\ufeff" if content.startswith("\ufeff") else ""
        after = bom + "---" + newline + header.replace("\n", newline) + newline + "---" + newline + body
        rendered = render(repo, path.parent, {path: after})
        write(repo, path, after)
        try:
            write(repo, path.parent / "index.md", rendered)
        except BaseException:
            write(repo, path, before)
            raise
    return path


def _quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False).replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")

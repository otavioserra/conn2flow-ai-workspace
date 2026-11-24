"""Remote skill updates with a disposable checkout and per-project seed hashes."""

from __future__ import annotations

import hashlib
import json
import os
import re
import stat
import subprocess
import tempfile
from contextlib import contextmanager, nullcontext
from pathlib import Path
from urllib.parse import urlsplit

from .bootstrap import IGNORED_DIRS, KITS, SKILL_NAME, detect_domain, discover_domains, resolve_skills
from .storage import contained, lock, write

SOURCE_URL = "https://github.com/otavioserra/conn2flow-ai-workspace.git"
STATE = "memory/skill-sync-state.json"
CUSTOMIZATIONS = "memory/sync-customizations.json"
CACHE_MARKER = "mdd-remote-source"


def _git(cwd: Path, args: list[str]) -> str:
    env = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
    env.update(GIT_TERMINAL_PROMPT="0", GCM_INTERACTIVE="never")
    result = subprocess.run(
        ["git", "-c", "protocol.file.allow=never", "-c", "protocol.ext.allow=never", *args],
        cwd=cwd, env=env, capture_output=True, encoding="utf-8", errors="replace", timeout=120,
    )
    if result.returncode:
        raise ValueError(f"Git {args[0]} failed: {result.stderr.strip()}")
    return result.stdout.strip()


def _cache_path(root: Path, source: str, cache_dir: Path | None) -> Path:
    url = urlsplit(source)
    if url.scheme != "https" or not url.hostname or url.username or url.password or url.query or url.fragment:
        raise ValueError("Remote matrix URL must use HTTPS without embedded credentials")
    default_name = "conn2flow-ai-workspace" if source == SOURCE_URL else hashlib.sha256(source.encode()).hexdigest()[:16]
    cache = Path(os.path.abspath(cache_dir.expanduser() if cache_dir else Path.home() / ".mdd/cache" / default_name))
    # Check the supplied path before resolving it so junctions cannot redirect a reset.
    for part in (cache, *cache.parents):
        attributes = getattr(part.lstat(), "st_file_attributes", 0) if part.exists() or part.is_symlink() else 0
        if part.is_symlink() or attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
            raise ValueError(f"Linked cache path: {part}")
    resolved = cache.resolve()
    if root.is_relative_to(resolved) or resolved.is_relative_to(root):
        raise ValueError("Remote cache and project must be in separate directories")
    return resolved


@contextmanager
def _locked_cache(cache: Path):
    cache.parent.mkdir(parents=True, exist_ok=True)
    reservation = cache.with_name(f".{cache.name}.mdd-lock")
    try:
        reservation.mkdir()
    except FileExistsError as exc:
        raise ValueError(f"Remote cache is in use: {cache}") from exc
    try:
        yield
    finally:
        reservation.rmdir()


def _checkout(cache: Path, source: str, git) -> str:
    if not cache.exists():
        with tempfile.TemporaryDirectory(prefix=".mdd-clone-", dir=cache.parent) as temporary:
            checkout = Path(temporary) / "checkout"
            git(cache.parent, ["clone", "--depth", "1", "--branch", "main", "--single-branch", "--", source, str(checkout)])
            marker = contained(checkout, checkout / ".git" / CACHE_MARKER)
            marker.write_text(source + "\n", encoding="utf-8")
            checkout.rename(cache)
    else:
        metadata = contained(cache, cache / ".git")
        marker = contained(cache, metadata / CACHE_MARKER)
        if not metadata.is_dir() or not marker.is_file() or marker.read_text(encoding="utf-8").strip() != source:
            raise ValueError(f"Cache path is not an MDD checkout for this source: {cache}")
        if git(cache, ["remote", "get-url", "origin"]) != source or Path(git(cache, ["rev-parse", "--show-toplevel"])).resolve() != cache:
            raise ValueError(f"Cache origin or worktree changed: {cache}")
        git(cache, ["fetch", "--depth", "1", "origin", "+refs/heads/main:refs/remotes/origin/main"])
        # Bind the worktree and gitdir explicitly. Only the owned cache can be reset.
        git(cache, [f"--git-dir={metadata}", f"--work-tree={cache}", "reset", "--hard", "origin/main"])
    return git(cache, ["rev-parse", "HEAD"])


def _hash(content: bytes) -> str:
    return hashlib.sha256(content.replace(b"\r\n", b"\n")).hexdigest()


def _object(root: Path, relative: str) -> dict:
    file = contained(root, root / relative)
    if not file.exists():
        return {}
    data = json.loads(file.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"Invalid JSON object: {relative}")
    return data


def _state(root: Path) -> dict:
    data = _object(root, STATE)
    if data and (data.get("version") != 1 or not isinstance(data.get("files"), dict) or
                 any(not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest)
                     for digest in data["files"].values()) or
                 not isinstance(data.get("domain", "auto"), str)):
        raise ValueError(f"Invalid remote skill state: {STATE}")
    return data or {"version": 1, "files": {}}


def _skill_files(root: Path, source: Path):
    contained(root, source / "SKILL.md")
    for file in sorted(source.rglob("*")):
        relative = file.relative_to(source)
        if any(part in IGNORED_DIRS for part in relative.parts):
            continue
        file = contained(root, file)
        if not file.is_dir():
            if not stat.S_ISREG(file.stat().st_mode):
                raise ValueError(f"Invalid skill source file: {file}")
            yield relative, file.read_bytes()


def remember_bootstrap(root: Path, matrix: Path, catalog: Path, skills, kit_folders: list[str], domain: str) -> None:
    """Enroll byte-identical seeds, including existing copies, without claiming local edits."""
    data = _state(root)
    before = json.dumps(data, sort_keys=True)
    if domain and domain != "auto":
        data["domain"] = domain
    else:
        data.pop("domain", None)
    for name, source in skills:
        for relative, seed in _skill_files(matrix if source.is_relative_to(matrix) else catalog, source):
            for kit in kit_folders:
                target = Path(kit) / "skills" / name / relative
                try:
                    local = contained(root, root / target)
                except ValueError:
                    continue
                if local.is_file() and _hash(local.read_bytes()) == _hash(seed):
                    data["files"][target.as_posix()] = _hash(seed)
    if json.dumps(data, sort_keys=True) != before:
        write(root, root / STATE, json.dumps(data, indent=2, sort_keys=True) + "\n")


def _acknowledged(local: bytes | None, acknowledgment: object) -> bool:
    if local is None or not isinstance(acknowledgment, dict):
        return False
    normalized = local.replace(b"\r\n", b"\n")
    hashes = {hashlib.sha256(data).hexdigest() for data in (local, normalized, normalized.replace(b"\n", b"\r\n"))}
    return acknowledgment.get("local_sha256") in hashes


def _plan_skill(root: Path, base: Path, sources, known: dict, customizations: dict, report: dict):
    """Update a skill as a group so a conflicting file keeps its entire local version."""
    parent = (base / "SKILL.md").as_posix()
    if parent in customizations:
        local = contained(root, root / parent)
        content = local.read_bytes() if local.is_file() else None
        if _acknowledged(content, customizations[parent]):
            report["customized"].append(parent)
        else:
            report["conflicts"].append({"path": parent, "reason": "customization_changed"})
        return {}, {}

    pending, seeds, conflicts = {}, {}, []
    parent_path = contained(root, root / parent)
    if not parent_path.is_file() and parent_path.parent.is_dir() and any(parent_path.parent.iterdir()):
        report["conflicts"].append({"path": parent, "reason": "local_skill_directory"})
        return {}, {}
    for relative, seed in sources:
        target = contained(root, root / base / relative)
        key = target.relative_to(root).as_posix()
        if target.exists() and not target.is_file():
            conflicts.append({"path": key, "reason": "not_a_file"})
            continue
        local = target.read_bytes() if target.is_file() else None
        current = _hash(local) if local is not None else None
        incoming = _hash(seed)
        if current == incoming:
            seeds[key] = incoming
        elif current != known.get(key):
            conflicts.append({"path": key, "reason": "locally_modified" if key in known else "unknown_baseline"})
        else:
            if local and b"\r\n" in local and b"\n" not in local.replace(b"\r\n", b""):
                seed = seed.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")
            pending[key] = (local, seed)
            seeds[key] = incoming
    if conflicts:
        report["conflicts"].extend(conflicts)
        return {}, {}
    return pending, seeds


def _update_project(root: Path, cache: Path, revision: str, domain: str, check_only: bool) -> dict:
    data = _state(root)
    known = data["files"]
    customizations = _object(root, CUSTOMIZATIONS)
    domains_dir = contained(cache, cache / "domains")
    for manifest in domains_dir.glob("*/domain.json"):
        contained(cache, manifest)
    domains, errors = discover_domains(domains_dir)
    domain = domain.strip().lower()
    if domain in ("", "auto"):
        domain = data.get("domain") or detect_domain(root, domains)["id"]
    chosen = next((item for item in domains if item["id"] == domain), None)
    if chosen is None:
        raise ValueError(f"Unknown remote domain: {domain}")
    canonical = contained(cache, cache / ".gemini/skills")
    kits, conflicts = [], []
    for folder in KITS.values():
        relative = f"{folder}/skills"
        try:
            if contained(root, root / relative).is_dir():
                kits.append(folder)
        except ValueError:
            conflicts.append({"path": relative, "reason": "linked_path"})
    report = {"status": "PASS", "domain": domain, "revision": revision, "check_only": check_only,
              "kits": kits, "available": [], "updated": [], "conflicts": conflicts, "customized": [],
              "metadata_changed": False, "domain_errors": errors}
    changes, seeds = {}, {}
    for name, source in resolve_skills(chosen, canonical):
        if not SKILL_NAME.fullmatch(name):
            raise ValueError(f"Invalid remote skill name: {name}")
        sources = list(_skill_files(cache, source))
        for kit in kits:
            base = Path(kit) / "skills" / name
            try:
                pending, accepted = _plan_skill(root, base, sources, known, customizations, report)
            except ValueError:
                conflicts.append({"path": base.as_posix(), "reason": "linked_path"})
                continue
            changes.update(pending)
            seeds.update(accepted)
    report["available"] = sorted(changes)
    if not check_only:
        for key, (previous, content) in changes.items():
            target = contained(root, root / key)
            actual = target.read_bytes() if target.is_file() else None
            if actual != previous or (actual is None and target.exists()):
                raise ValueError(f"Remote skill changed during update: {key}")
            write(root, target, content)
        report["updated"] = sorted(changes)
        if any(known.get(key) != digest for key, digest in seeds.items()):
            known.update(seeds)
            write(root, root / STATE, json.dumps(data, indent=2, sort_keys=True) + "\n")
            report["metadata_changed"] = True
    return report


def remote_sync(root: Path, *, source_url: str = SOURCE_URL, cache_dir: Path | None = None,
                domain: str = "auto", check_only: bool = False, git=_git) -> dict:
    root = root.resolve()
    if not root.is_dir():
        raise ValueError(f"Project directory does not exist: {root}")
    cache = _cache_path(root, source_url, cache_dir)
    read_only = check_only or not any((root / folder / "skills").is_dir() for folder in KITS.values())
    with _locked_cache(cache):
        revision = _checkout(cache, source_url, git)
        with nullcontext() if read_only else lock(root):
            return _update_project(root, cache, revision, domain, check_only)

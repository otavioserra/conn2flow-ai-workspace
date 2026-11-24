"""Framework-agnostic MDD bootstrap (ARCH-019 Phase 1).

Domains are declarative manifests discovered at runtime from ``domains/<id>/domain.json``;
no domain id is hard-coded here, so a new domain added by Pull Request works without code
changes. ``bootstrap`` detects the stack, picks a domain (``auto`` or explicit), creates the
memory tree and installs skills. It never overwrites an existing file (DEC-136): existing
skills, rules, local guides and memory documents are reported as preserved.
"""

from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path

from . import memory
from .storage import contained, lock, write

DOMAIN_ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")
SKILL_NAME = re.compile(r"^[a-z0-9][a-z0-9-]{0,80}$")
SKILLS_MODES = ("core-mdd-only", "all-canonical")
FALLBACK_DOMAIN = "generic"
# Kit alias (CLI) -> folder in the target project.
KITS = {"gemini": ".gemini", "claude": ".claude", "codex": ".codex", "cursor": ".cursor", "copilot": ".github"}
GOVERNANCE_C2F = {"c2f-mdd-indexing-and-handoffs", "c2f-multilingual-skills-governance"}
IGNORED_DIRS = {".git", "node_modules", "vendor", ".venv", "venv", "__pycache__", "dist", "build"}

# (stack id, label, files that prove it). Detection is shallow: project root only.
STACKS = (
    ("node", "Node.js", ("package.json",)),
    ("typescript", "TypeScript", ("tsconfig.json",)),
    ("python", "Python", ("pyproject.toml", "requirements.txt", "setup.py", "setup.cfg", "Pipfile")),
    ("php", "PHP", ("composer.json",)),
    ("go", "Go", ("go.mod",)),
    ("rust", "Rust", ("Cargo.toml",)),
    ("docker", "Docker", ("Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml")),
)
TEST_MARKERS = ("tests", "test", "__tests__", "spec", "phpunit.xml", "phpunit.xml.dist", "pytest.ini",
                "jest.config.js", "jest.config.ts", "vitest.config.ts", "vitest.config.js")
PACKAGE_MANAGERS = (("pnpm-lock.yaml", "pnpm"), ("yarn.lock", "yarn"), ("package-lock.json", "npm"),
                    ("poetry.lock", "poetry"), ("uv.lock", "uv"), ("requirements.txt", "pip"),
                    ("composer.lock", "composer"), ("Cargo.lock", "cargo"), ("go.sum", "go"))


# ── Domain catalog ──────────────────────────────────────────────────────────

def find_domains_dir(matrix: Path | None = None, domains_dir: Path | None = None) -> Path:
    """``--domains-dir`` > ``<--matrix>/domains`` > ``MDD_DOMAINS_DIR`` > ``MDD_MATRIX`` > this workspace."""
    candidates = [domains_dir, matrix / "domains" if matrix else None,
                  Path(os.environ["MDD_DOMAINS_DIR"]) if os.environ.get("MDD_DOMAINS_DIR") else None,
                  Path(os.environ["MDD_MATRIX"]) / "domains" if os.environ.get("MDD_MATRIX") else None,
                  Path(__file__).resolve().parents[4] / "domains"]
    for candidate in candidates:
        if candidate is not None and candidate.is_dir():
            return candidate.resolve()
    raise ValueError("domains/ catalog not found: pass --domains-dir or --matrix, or set MDD_DOMAINS_DIR")


def _validate(data: object, folder: str) -> dict:
    if not isinstance(data, dict):
        raise ValueError("domain.json must be an object")
    domain_id = data.get("id")
    if not isinstance(domain_id, str) or not DOMAIN_ID.match(domain_id) or domain_id != folder:
        raise ValueError(f"id must match the folder name and {DOMAIN_ID.pattern}")
    for field in ("name", "description"):
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError(f"{field} is required")
    detectors = data.get("detectors", {})
    if not isinstance(detectors, dict):
        raise ValueError("detectors must be an object")
    for key in ("files", "dirs"):
        paths = detectors.get(key, [])
        if not isinstance(paths, list) or not all(isinstance(item, str) and item for item in paths):
            raise ValueError(f"detectors.{key} must list relative paths")
    markers = detectors.get("markers", [])
    if not isinstance(markers, list):
        raise ValueError("detectors.markers must be a list")
    for marker in markers:
        if not (isinstance(marker, dict) and isinstance(marker.get("file"), str) and isinstance(marker.get("contains"), str)):
            raise ValueError("detectors.markers items need file and contains")
    mode = data.get("skills_mode")
    if isinstance(mode, list):
        if not mode or not all(isinstance(name, str) and SKILL_NAME.match(name) for name in mode):
            raise ValueError("skills_mode list must name skills")
    elif mode not in SKILLS_MODES:
        raise ValueError(f"skills_mode must be {' | '.join(SKILLS_MODES)} or a list of skill names")
    extra = data.get("extra_skills_dir")
    if extra is not None and (not isinstance(extra, str) or Path(extra).is_absolute() or ".." in Path(extra).parts):
        raise ValueError("extra_skills_dir must be a relative path inside the domain folder")
    if not isinstance(data.get("generate_local_project_skill", False), bool):
        raise ValueError("generate_local_project_skill must be true or false")
    priority = data.get("priority", 50)
    if not isinstance(priority, int) or isinstance(priority, bool):
        raise ValueError("priority must be an integer")
    return {**data, "detectors": {"files": detectors.get("files", []), "dirs": detectors.get("dirs", []),
                                  "markers": detectors.get("markers", [])},
            "extra_skills_dir": extra, "priority": priority,
            "generate_local_project_skill": data.get("generate_local_project_skill", False)}


def discover_domains(domains_dir: Path) -> tuple[list[dict], list[dict]]:
    """Every ``<id>/domain.json`` becomes a domain; invalid manifests are reported, never fatal."""
    domains, errors = [], []
    for manifest in sorted(domains_dir.glob("*/domain.json")):
        try:
            domain = _validate(json.loads(manifest.read_text(encoding="utf-8")), manifest.parent.name)
        except (ValueError, json.JSONDecodeError) as exc:
            errors.append({"domain": manifest.parent.name, "error": str(exc)})
            continue
        domain["path"] = manifest.parent.as_posix()
        domains.append(domain)
    return domains, errors


def _domain_summary(domain: dict) -> dict:
    mode = domain["skills_mode"]
    return {"id": domain["id"], "name": domain["name"], "description": domain["description"],
            "skills_mode": mode if isinstance(mode, str) else "explicit",
            "generate_local_project_skill": domain["generate_local_project_skill"],
            "has_extra_skills": bool(domain.get("extra_skills_dir"))}


# ── Detection ───────────────────────────────────────────────────────────────

def _read(path: Path, limit: int = 512 * 1024) -> str:
    try:
        with path.open("rb") as stream:
            return stream.read(limit).decode("utf-8", errors="replace")
    except OSError:
        return ""


def detect_stack(root: Path) -> dict:
    root = root.resolve()
    stacks = [{"id": key, "label": label, "evidence": next(name for name in files if (root / name).exists())}
              for key, label, files in STACKS if any((root / name).exists() for name in files)]
    tests = [name for name in TEST_MARKERS if (root / name).exists()]
    managers = [manager for marker, manager in PACKAGE_MANAGERS if (root / marker).exists()]
    commands: list[str] = []
    package = root / "package.json"
    if package.is_file():
        try:
            scripts = json.loads(_read(package)).get("scripts", {}) or {}
        except (json.JSONDecodeError, AttributeError):
            scripts = {}
        runner = "pnpm" if "pnpm" in managers else "yarn" if "yarn" in managers else "npm"
        commands += [f"{runner} run {name}" for name in ("build", "test", "lint") if name in scripts]
    ids = {stack["id"] for stack in stacks}
    if "python" in ids and tests:
        commands.append("pytest")
    if "php" in ids and any(name.startswith("phpunit") for name in tests):
        commands.append("vendor/bin/phpunit")
    if "go" in ids:
        commands.append("go test ./...")
    if "rust" in ids:
        commands.append("cargo test")
    top = sorted(item.name + ("/" if item.is_dir() else "") for item in root.iterdir()
                 if not item.name.startswith(".") and item.name not in IGNORED_DIRS) if root.is_dir() else []
    return {"stacks": stacks, "tests": tests, "package_managers": managers, "commands": commands,
            "git": (root / ".git").exists(), "top_level": top[:40]}


def _hits(root: Path, domain: dict) -> list[str]:
    detectors, hits = domain["detectors"], []

    def candidate(name: str) -> Path | None:
        if Path(name).anchor or ".." in Path(name).parts:
            return None
        try:
            return contained(root, root / name)
        except ValueError:
            return None

    for name in detectors["files"]:
        if (path := candidate(name)) is not None and path.is_file():
            hits.append(f"file:{name}")
    for name in detectors["dirs"]:
        if (path := candidate(name)) is not None and path.is_dir():
            hits.append(f"dir:{name}")
    for marker in detectors["markers"]:
        path = candidate(marker["file"])
        if path is not None and path.is_file() and marker["contains"].lower() in _read(path).lower():
            hits.append(f"marker:{marker['file']}~{marker['contains']}")
    return hits


def detect_domain(root: Path, domains: list[dict]) -> dict:
    """Most detector hits wins; ties go to the higher ``priority``; no hit falls back to generic."""
    scored = [(len(hits), domain["priority"], domain["id"], hits)
              for domain in domains if (hits := _hits(root.resolve(), domain))]
    if scored:
        count, _, domain_id, hits = max(scored, key=lambda item: (item[0], item[1], item[2]))
        return {"id": domain_id, "evidence": hits, "fallback": False}
    ids = {domain["id"] for domain in domains}
    fallback = FALLBACK_DOMAIN if FALLBACK_DOMAIN in ids else (sorted(ids)[0] if ids else None)
    if fallback is None:
        raise ValueError("domains/ catalog is empty")
    return {"id": fallback, "evidence": [], "fallback": True}


def list_domains(domains_dir: Path, path: Path | None = None) -> dict:
    domains, errors = discover_domains(domains_dir)
    result = {"domains_dir": domains_dir.as_posix(), "domains": [_domain_summary(d) for d in domains], "errors": errors}
    if path is not None and domains:
        result["detected"] = detect_domain(path, domains)
    return result


# ── Installation ────────────────────────────────────────────────────────────

def _is_core_mdd(name: str) -> bool:
    return name.startswith("c2f-persona-") or name in GOVERNANCE_C2F or not name.startswith("c2f-")


def resolve_skills(domain: dict, canonical_dir: Path | None) -> list[tuple[str, Path]]:
    """(name, source dir) pairs for the domain: canonical selection plus its own extra skills."""
    canonical = {p.parent.name: p.parent for p in sorted(canonical_dir.glob("*/SKILL.md"))} if canonical_dir else {}
    mode = domain["skills_mode"]
    if mode == "all-canonical":
        names = sorted(canonical)
    elif mode == "core-mdd-only":
        names = sorted(name for name in canonical if _is_core_mdd(name))
    else:
        missing = [name for name in mode if name not in canonical]
        if missing:
            raise ValueError(f"Domain {domain['id']} names skills absent from the matrix: {', '.join(missing)}")
        names = list(mode)
    selected = [(name, canonical[name]) for name in names]
    if domain.get("extra_skills_dir"):
        base = Path(domain["path"]) / domain["extra_skills_dir"]
        for skill in sorted(base.glob("*/SKILL.md")):
            if SKILL_NAME.match(skill.parent.name) and skill.parent.name not in names:
                selected.append((skill.parent.name, skill.parent))
    if not selected and mode in SKILLS_MODES and not canonical:
        raise ValueError("Canonical skills not found: pass --matrix (needs .gemini/skills/)")
    return selected


def _slug(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "project"


def local_skill(root: Path, domain: dict, stack: dict) -> str:
    slug = _slug(root.name)
    stacks = ", ".join(f"{s['label']} (`{s['evidence']}`)" for s in stack["stacks"]) or "not detected — fill in"
    commands = "\n".join(f"- `{c}`" for c in stack["commands"]) or "- (no build/test command detected — record them here)"
    tree = "\n".join(f"- `{entry}`" for entry in stack["top_level"]) or "- (empty folder)"
    tests = ", ".join(f"`{t}`" for t in stack["tests"]) or "none detected"
    return (
        "---\n"
        f"name: {slug}-project-guide\n"
        f"description: \"Read before changing {root.name}: detected stack, layout and validation commands. "
        "Local project skill generated by mdd bootstrap; evolved by the local c2f-persona-curator.\"\n"
        "---\n\n"
        f"# {root.name} — project guide (local skill)\n\n"
        f"Generated by `mdd bootstrap` (domain `{domain['id']}`). This is a starting point: replace guesses with "
        "verified facts and keep it under 200 lines. Project-specific rules live here, never in the canonical `c2f-*` skills.\n\n"
        "## Detected stack\n\n"
        f"- Stacks: {stacks}\n"
        f"- Package managers: {', '.join(stack['package_managers']) or 'not detected'}\n"
        f"- Tests: {tests}\n"
        f"- Git repository: {'yes' if stack['git'] else 'no'}\n\n"
        "## Validation commands\n\n"
        f"{commands}\n\n"
        "## Top-level layout\n\n"
        f"{tree}\n\n"
        "## Memory (MDD)\n\n"
        "- Start at `memory/00-baseline-architecture.md`, then `memory/human-requests/CURRENT.md`.\n"
        "- Verified learnings go to `memory/learnings/LRN-XXX-<slug>.md`; raw observations to `memory/raw/active/`.\n"
        "- Skill feedback: `mdd feedback submit` (scope `local` for rules that only apply to this project).\n"
    )


RULES = ("# MDD entry\n\nRead memory/00-baseline-architecture.md, 01-general-memory.md, 02-policy.md, then "
         "human-requests/CURRENT.md.\nRespect approved scope, preserve local skills and use explicit git paths.\n")


def _copy_tree(root: Path, source: Path, destination: Path) -> int:
    """Copy a skill folder file by file; refuses links and never replaces a file."""
    copied = 0
    for file in sorted(source.rglob("*")):
        if file.is_dir() or file.is_symlink() or any(part in IGNORED_DIRS for part in file.relative_to(source).parts):
            continue
        target = contained(root, destination / file.relative_to(source))
        if target.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, target)
        copied += 1
    return copied


def parse_kits(value: str | None) -> list[str]:
    if not value:
        return list(KITS)
    kits = [item.strip().lower() for item in value.split(",") if item.strip()]
    unknown = [kit for kit in kits if kit not in KITS]
    if unknown or not kits:
        raise ValueError(f"Unknown kit(s): {', '.join(unknown) or value}. Use {','.join(KITS)}")
    return list(dict.fromkeys(kits))


def bootstrap(root: Path, domain: str = "auto", *, kits: list[str] | None = None, matrix: Path | None = None,
              domains_dir: Path | None = None, dry_run: bool = False, with_ci_sync: bool = False) -> dict:
    root = root.resolve()
    if not root.is_dir():
        raise ValueError(f"Target folder does not exist: {root}")
    catalog = find_domains_dir(matrix, domains_dir)
    domains, errors = discover_domains(catalog)
    by_id = {d["id"]: d for d in domains}
    detection = detect_domain(root, domains)
    chosen_id = detection["id"] if domain in (None, "", "auto") else domain.strip().lower()
    if chosen_id not in by_id:
        raise ValueError(f"Unknown domain '{chosen_id}'. Available: {', '.join(sorted(by_id)) or 'none'}")
    chosen = by_id[chosen_id]
    kit_names = kits or list(KITS)
    stack = detect_stack(root)
    matrix_root = matrix.resolve() if matrix else Path(catalog).parent
    canonical_dir = matrix_root / ".gemini/skills"
    skills = resolve_skills(chosen, canonical_dir if canonical_dir.is_dir() else None)
    report = {"path": root.as_posix(), "domain": chosen_id, "requested_domain": domain or "auto",
              "detected": detection, "domains_dir": catalog.as_posix(), "errors": errors, "stack": stack,
              "kits": kit_names, "dry_run": dry_run, "memory": {"created": [], "preserved": False},
              "skills": {"installed": [], "preserved": []}, "rules": {"created": [], "preserved": []},
              "local_skill": {"created": [], "preserved": []}}
    if with_ci_sync:
        workflow = contained(root, root / ".github/workflows/mdd-skills-autosync.yml")
        template = matrix_root / "templates/ci/mdd-skills-autosync.yml"
        existing = workflow.exists()
        workflow_content = None if existing else template.read_bytes()
        report["ci_sync"] = {"path": workflow.relative_to(root).as_posix(),
                             "status": "preserved" if existing else "planned" if dry_run else "created"}
    if dry_run:
        report["skills"]["planned"] = [name for name, _ in skills]
        return report

    if (root / "memory" / "00-baseline-architecture.md").exists():
        # Existing MDD memory is never rewritten: only absent areas are added (e.g. memory/learnings/).
        report["memory"]["preserved"] = True
        for area in memory.AREAS:
            folder = contained(root, root / "memory" / area)
            if not folder.exists():
                folder.mkdir(parents=True)
                report["memory"]["created"].append(f"{area}/")
    else:
        report["memory"]["created"] = memory.init(root, "software")

    slug = _slug(root.name)
    with lock(root):
        for kit in kit_names:
            base = root / KITS[kit]
            for name, source in skills:
                destination = contained(root, base / "skills" / name)
                if (destination / "SKILL.md").exists():
                    report["skills"]["preserved"].append(f"{KITS[kit]}/skills/{name}")
                    continue
                _copy_tree(root, source, destination)
                report["skills"]["installed"].append(f"{KITS[kit]}/skills/{name}")
            rules = contained(root, base / "rules" / "mdd.md")
            bucket = "preserved" if rules.exists() else "created"
            if bucket == "created":
                write(root, rules, RULES)
            report["rules"][bucket].append(rules.relative_to(root).as_posix())
            if chosen["generate_local_project_skill"]:
                guide = contained(root, base / "skills" / f"{slug}-project-guide" / "SKILL.md")
                bucket = "preserved" if guide.exists() else "created"
                if bucket == "created":
                    write(root, guide, local_skill(root, chosen, stack))
                report["local_skill"][bucket].append(guide.relative_to(root).as_posix())
        from .remote_sync import remember_bootstrap

        remember_bootstrap(root, matrix_root, catalog, skills, [KITS[kit] for kit in kit_names],
                           chosen_id if domain not in (None, "", "auto") else "auto")
        if with_ci_sync and workflow_content is not None:
            write(root, workflow, workflow_content)
    return report

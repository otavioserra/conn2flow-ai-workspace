"""Adapter to the canonical propagation pipeline (Node is required for sync)."""

import json
import os
import subprocess
import tempfile
from pathlib import Path

from .storage import contained, lock, write

KITS = (".gemini", ".claude", ".cursor", ".codex", ".github")


def find_matrix(matrix: Path | None = None) -> Path:
    candidate = matrix or (
        Path(os.environ["MDD_MATRIX"]) if os.environ.get("MDD_MATRIX") else Path(__file__).resolve().parents[4]
    )
    if not (candidate / "scripts/skills/sync-skills.cjs").is_file():
        raise ValueError("Specify the matrix with --matrix or MDD_MATRIX")
    return candidate.resolve()


def sync(root: Path, matrix: Path, audit: bool = False) -> dict:
    root, matrix = root.resolve(), matrix.resolve()
    script = matrix / "scripts/skills/sync-skills.cjs"
    source = matrix / ".gemini/skills"
    skills = sorted(p for p in source.glob("*/SKILL.md") if p.is_file())
    if len(skills) != 44 or not script.is_file():
        raise ValueError("Matrix must contain the canonical synchronizer and exactly 44 skills")
    for kit in KITS:
        contained(root, root / kit / "skills")
        if (root / kit / "skills").exists():
            for path in (root / kit / "skills").rglob("*"):
                contained(root, path)
    with lock(root), tempfile.TemporaryDirectory(prefix="mdd-sync-") as temporary:
        report = Path(temporary) / "report.json"
        command = ["node", str(script), "--target", str(root), "--report", str(report)]
        if not audit:
            command.extend(["--apply", "--all"])
        result = subprocess.run(command, capture_output=True, text=True, timeout=120, check=False)
        if not report.exists():
            raise ValueError(f"Canonical sync failed: {result.stderr.strip() or result.stdout.strip()}")
        data = json.loads(report.read_text(encoding="utf-8"))
        if result.returncode and data.get("status") != "FAIL":
            raise ValueError("Canonical synchronizer failed")
        return data


def install_kits(root: Path, matrix: Path) -> None:
    """Provision portable rules, preserve local settings; sync canonical skills."""
    sync(root, matrix)
    with lock(root):
        for kit in KITS:
            path = root / kit / "rules/mdd.md"
            if not contained(root, path).exists():
                write(
                    root,
                    path,
                    "# MDD entry\n\nRead memory/00-baseline-architecture.md, 01-general-memory.md, 02-policy.md, then human-requests/CURRENT.md.\nRespect approved scope, preserve local skills and use explicit git paths.\n",
                )

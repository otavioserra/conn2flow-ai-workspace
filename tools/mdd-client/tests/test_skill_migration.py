import hashlib
import json
import os
import subprocess

import pytest
from mdd_client.memory import init
from mdd_client.sync import sync
from test_sync import MATRIX


def test_real_migration_preserves_helpers_and_is_idempotent(tmp_path):
    init(tmp_path)
    legacy = tmp_path / ".claude/skills/start-sdd-slice"
    legacy.mkdir(parents=True)
    (legacy / "SKILL.md").write_bytes(b"legacy entry")
    (legacy / "extra.txt").write_bytes(b"preserve auxiliary data")
    result = sync(tmp_path, MATRIX)
    assert result["status"] == "PASS" and len(result["renamed_skills"]) == 1
    current = legacy.with_name("start-mdd-slice")
    assert not legacy.exists()
    assert (current / "extra.txt").read_bytes() == b"preserve auxiliary data"
    assert (current / "SKILL.md").read_bytes() == (MATRIX / ".gemini/skills/start-mdd-slice/SKILL.md").read_bytes()
    assert not sync(tmp_path, MATRIX)["renamed_skills"]
    assert sync(tmp_path, MATRIX, True)["status"] == "PASS"


def test_migration_refuses_coexistence_without_changing_either_directory(tmp_path):
    init(tmp_path)
    base = tmp_path / ".codex/skills"
    for name in ["sdd-workflow", "mdd-workflow"]:
        folder = base / name
        folder.mkdir(parents=True)
        (folder / "SKILL.md").write_bytes(name.encode())
    with pytest.raises(ValueError, match="coexistem"):
        sync(tmp_path, MATRIX)
    assert (base / "sdd-workflow/SKILL.md").read_bytes() == b"sdd-workflow"
    assert (base / "mdd-workflow/SKILL.md").read_bytes() == b"mdd-workflow"


def test_partial_apply_does_not_migrate_unselected_skills(tmp_path):
    init(tmp_path)
    legacy = tmp_path / ".claude/skills/sdd-workflow"
    legacy.mkdir(parents=True)
    (legacy / "SKILL.md").write_bytes(b"leave unselected alias")
    report = tmp_path / "audit.json"
    result = subprocess.run([
        "node", str(MATRIX / "scripts/skills/sync-skills.cjs"), "--target", str(tmp_path),
        "--apply", "c2f-executor-agent", "--report", str(report),
    ], capture_output=True, check=False)
    assert result.returncode == 1  # Remaining missing/legacy skills keep the audit failing.
    assert legacy.exists() and not legacy.with_name("mdd-workflow").exists()


def test_linked_legacy_directory_is_rejected_without_touching_external_data(tmp_path):
    init(tmp_path)
    external = tmp_path / "external"
    external.mkdir()
    marker = external / "SKILL.md"
    marker.write_bytes(b"external data must survive")
    legacy = tmp_path / ".claude/skills/sdd-workflow"
    legacy.parent.mkdir(parents=True)
    if os.name == "nt":
        subprocess.run(["cmd.exe", "/d", "/c", "mklink", "/J", str(legacy), str(external)], check=True, capture_output=True)
    else:
        legacy.symlink_to(external, target_is_directory=True)
    try:
        with pytest.raises(ValueError, match="vinculada|Linked"):
            sync(tmp_path, MATRIX)
        direct = subprocess.run([
            "node", str(MATRIX / "scripts/skills/sync-skills.cjs"), "--target", str(tmp_path), "--apply", "--all",
        ], capture_output=True, text=True, check=False)
        assert direct.returncode != 0 and "vinculada" in direct.stderr
        assert marker.read_bytes() == b"external data must survive"
    finally:
        # Native nonrecursive unlink; never traverse a junction during fixture cleanup.
        if os.name == "nt":
            os.rmdir(legacy)
        else:
            legacy.unlink()


def test_customization_acknowledgement_moves_without_refreshing_hashes(tmp_path):
    init(tmp_path)
    old = ".claude/skills/sdd-workflow/SKILL.md"
    new = ".claude/skills/mdd-workflow/SKILL.md"
    legacy = tmp_path / old
    legacy.parent.mkdir(parents=True)
    legacy.write_bytes(b"intentional local workflow")
    seed = MATRIX / ".gemini/skills/mdd-workflow/SKILL.md"
    entry = {"local_sha256": hashlib.sha256(legacy.read_bytes()).hexdigest(), "seed_sha256": hashlib.sha256(seed.read_bytes()).hexdigest()}
    manifest = tmp_path / "memory/sync-customizations.json"
    manifest.write_text(json.dumps({old: entry}), encoding="utf-8")
    result = sync(tmp_path, MATRIX)
    assert result["status"] == "PASS"
    assert result["customizations_migrated"][0]["to"] == new
    assert (tmp_path / new).read_bytes() == b"intentional local workflow"
    assert json.loads(manifest.read_text()) == {new: entry}
    # Do not manufacture acknowledgement for a newer seed.
    stale = dict(entry, seed_sha256="old seed")
    manifest.write_text(json.dumps({new: stale}), encoding="utf-8")
    assert sync(tmp_path, MATRIX, True)["status"] == "FAIL"
    assert json.loads(manifest.read_text())[new]["seed_sha256"] == "old seed"


def test_conflicting_acknowledgements_fail_before_directory_rename(tmp_path):
    init(tmp_path)
    legacy = tmp_path / ".claude/skills/sdd-workflow"
    legacy.mkdir(parents=True)
    (legacy / "SKILL.md").write_bytes(b"keep original")
    manifest = tmp_path / "memory/sync-customizations.json"
    data = {".claude/skills/sdd-workflow/SKILL.md": {"local_sha256": "old"}, ".claude/skills/mdd-workflow/SKILL.md": {"local_sha256": "different"}}
    manifest.write_text(json.dumps(data), encoding="utf-8")
    before = manifest.read_bytes()
    with pytest.raises(ValueError, match="antiga e nova coexistem"):
        sync(tmp_path, MATRIX)
    assert legacy.exists() and not legacy.with_name("mdd-workflow").exists()
    assert manifest.read_bytes() == before

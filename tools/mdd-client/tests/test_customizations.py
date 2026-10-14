import hashlib
import json

import pytest
from mdd_client.cli import app
from mdd_client.memory import init
from mdd_client.sync import customize, sync
from test_sync import MATRIX
from typer.testing import CliRunner


def test_exact_customization_survives_sync_and_local_change_reopens(tmp_path):
    init(tmp_path)
    sync(tmp_path, MATRIX)
    target = ".claude/skills/c2f-ai-features/SKILL.md"
    local = tmp_path / target
    local.write_bytes(b"intentional local behavior")
    missing = tmp_path / ".codex/skills/c2f-ai-features/SKILL.md"
    seed = missing.read_bytes()
    missing.unlink()
    mixed = sync(tmp_path, MATRIX, True)
    assert mixed["status"] == "FAIL"
    assert all(item["path"] for item in mixed["divergentes"])
    assert {item["motivo"] for item in mixed["divergentes"]} == {"ausente", "conteúdo diferente"}
    missing.write_bytes(seed)
    result = CliRunner().invoke(app, ["sync", "--path", str(tmp_path), "--matrix", str(MATRIX), "--customize", target])
    assert result.exit_code == 0, result.output
    entry = json.loads(result.output)["customization"]
    assert entry["local_sha256"] == hashlib.sha256(local.read_bytes()).hexdigest()
    audit = sync(tmp_path, MATRIX, True)
    assert audit["status"] == "PASS" and audit["customizadas"][0]["path"] == target
    assert len(audit["sha256"]) == 45
    assert sync(tmp_path, MATRIX)["status"] == "PASS"
    assert local.read_bytes() == b"intentional local behavior"
    customize(tmp_path, MATRIX, target)  # Existing manifest, atomic update.
    with pytest.raises(ValueError, match="changed since audit"):
        customize(tmp_path, MATRIX, target, "stale", entry["seed_sha256"])
    customize(tmp_path, MATRIX, target, entry["local_sha256"], entry["seed_sha256"])
    manifest = tmp_path / "memory/sync-customizations.json"
    data = json.loads(manifest.read_text())
    data[target]["seed_sha256"] = "old seed"
    manifest.write_text(json.dumps(data))
    assert sync(tmp_path, MATRIX, True)["status"] == "FAIL"
    customize(tmp_path, MATRIX, target)
    local.write_bytes(b"new local change")
    assert sync(tmp_path, MATRIX, True)["status"] == "FAIL"


def test_changed_seed_reopens_and_missing_files_fail(tmp_path):
    init(tmp_path)
    matrix = tmp_path / "matrix"
    source = matrix / ".gemini/skills/example/SKILL.md"
    source.parent.mkdir(parents=True)
    source.write_bytes(b"seed")
    target = ".codex/skills/example/SKILL.md"
    local = tmp_path / target
    local.parent.mkdir(parents=True)
    local.write_bytes(b"local")
    old = customize(tmp_path, matrix, target)
    source.write_bytes(b"new seed")
    assert old["seed_sha256"] != hashlib.sha256(source.read_bytes()).hexdigest()
    with pytest.raises(ValueError):
        customize(tmp_path, matrix, "../escape")
    with pytest.raises(ValueError, match="kit/skills"):
        customize(tmp_path, matrix, "README.md")
    with pytest.raises(FileNotFoundError):
        customize(tmp_path, matrix, ".codex/skills/absent/SKILL.md")

from pathlib import Path

import pytest
from mdd_client.memory import init
from mdd_client.sync import KITS, install_kits, sync

MATRIX = Path(__file__).resolve().parents[3]


def test_real_45_skill_pipeline_preserves_local(tmp_path):
    init(tmp_path)
    local = tmp_path / ".claude/skills/local/SKILL.md"
    local.parent.mkdir(parents=True)
    local.write_bytes(b"private local skill")
    config = tmp_path / ".gemini/config.json"
    config.parent.mkdir(parents=True)
    config.write_bytes(b'{"local":true}')
    result = sync(tmp_path, MATRIX)
    assert result["status"] == "PASS"
    assert result["skills_canonicas"] == 45 and result["alvos"] == 5
    for kit in KITS:
        for source in (MATRIX / ".gemini/skills").glob("*/SKILL.md"):
            assert (tmp_path / kit / "skills" / source.parent.name / "SKILL.md").read_bytes() == source.read_bytes()
    assert local.read_bytes() == b"private local skill"
    assert config.read_bytes() == b'{"local":true}'
    assert sync(tmp_path, MATRIX)["escritos"] == []
    assert sync(tmp_path, MATRIX, True)["status"] == "PASS"
    install_kits(tmp_path, MATRIX)
    assert (tmp_path / ".codex/rules/mdd.md").exists()


def test_invalid_matrix_and_audit_missing(tmp_path):
    init(tmp_path)
    with pytest.raises(ValueError, match="45"):
        sync(tmp_path, tmp_path)
    result = sync(tmp_path, MATRIX, True)
    assert result["status"] == "FAIL" and result["escritos"] == []
    assert not (tmp_path / ".claude").exists()

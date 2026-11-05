"""Exercise real Node/Python entrypoints against isolated 46-skill matrices."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

import pytest
from mdd_client.cli import app
from mdd_client.sync import sync
from typer.testing import CliRunner

MATRIX = Path(__file__).resolve().parents[3]
NAME = "c2f-database-operations"


@pytest.fixture
def translated_matrix(tmp_path):
    matrix = tmp_path / "matrix"
    scripts = matrix / "scripts/skills"
    scripts.mkdir(parents=True)
    for name in ["sync-skills.cjs", "skill-customizations.cjs", "translations.cjs"]:
        shutil.copyfile(MATRIX / "scripts/skills" / name, scripts / name)
    sources = sorted((MATRIX / ".gemini/skills").glob("*/SKILL.md"))
    assert len(sources) == 46
    for source in sources:
        output = matrix / ".gemini/skills" / source.parent.name / "SKILL.md"
        output.parent.mkdir(parents=True)
        output.write_bytes(b"original seed\n")
    registry = {"en": {NAME: {"source_sha256": hashlib.sha256(b"original seed\n").hexdigest(),
                              "translated_at": "2026-11-05", "translator": "fixture"}}}
    (scripts / "translated.json").write_text(json.dumps(registry), encoding="utf-8")
    return matrix


def run_node(matrix, *args):
    report = matrix / "audit.json"
    result = subprocess.run(["node", str(matrix / "scripts/skills/sync-skills.cjs"), *args,
                             "--report", str(report)], capture_output=True, text=True, encoding="utf-8")
    return result, json.loads(report.read_text(encoding="utf-8")) if report.exists() else None


def change_source(matrix):
    (matrix / ".gemini/skills" / NAME / "SKILL.md").write_bytes(b"source changed after review\n")


def test_drift_warning_python_cli_is_nonblocking_and_audit_is_readonly(tmp_path, translated_matrix):
    target = tmp_path / "client"
    target.mkdir()
    assert sync(target, translated_matrix)["status"] == "PASS"
    change_source(translated_matrix)
    sync(target, translated_matrix)  # Update ordinary copies; translation hash remains old.
    before = (translated_matrix / "scripts/skills/translated.json").read_bytes()
    result = CliRunner().invoke(app, ["sync", "--path", str(target), "--matrix", str(translated_matrix), "--audit"])
    assert result.exit_code == 0, result.output
    assert "[DRIFT-WARNING]" in result.output and "DRIFT_WARNING" in result.output
    data = sync(target, translated_matrix, audit=True)
    assert data["translation_drift"][0]["skill"] == NAME
    assert data["escritos"] == []
    assert (translated_matrix / "scripts/skills/translated.json").read_bytes() == before


def test_translated_template_survives_apply_and_missing_file_still_fails(translated_matrix):
    kit = translated_matrix / "templates/en/templates/spec-driven-project-gemini-kit/.gemini/skills"
    shutil.copytree(translated_matrix / ".gemini/skills", kit)
    translation = kit / NAME / "SKILL.md"
    translation.write_bytes(b"Reviewed English; never overwrite.\n")
    result, data = run_node(translated_matrix)
    assert result.returncode == 0 and data["status"] == "PASS"
    change_source(translated_matrix)
    result, data = run_node(translated_matrix, "--apply", "--all")
    assert result.returncode == 0 and data["status"] == "DRIFT_WARNING"
    assert "[DRIFT-WARNING]" in result.stderr
    assert translation.read_bytes() == b"Reviewed English; never overwrite.\n"
    translation.unlink()
    result, data = run_node(translated_matrix)
    assert result.returncode == 1 and data["status"] == "FAIL"
    assert any(item["skill"] == NAME and item["motivo"] == "ausente" for item in data["divergentes"])


def test_explicit_hash_acknowledgement_updates_only_registry(tmp_path, translated_matrix):
    target = tmp_path / "client"
    target.mkdir()
    change_source(translated_matrix)
    sync(target, translated_matrix)
    result, _ = run_node(translated_matrix, "--update-translation-hash", NAME, "en", "--translator", "reviewed-agent")
    assert result.returncode == 0, result.stderr
    registry = json.loads((translated_matrix / "scripts/skills/translated.json").read_text())
    entry = registry["en"][NAME]
    assert entry["source_sha256"] == hashlib.sha256(b"source changed after review\n").hexdigest()
    assert entry["translator"] == "reviewed-agent"
    assert sync(target, translated_matrix, audit=True)["status"] == "PASS"


@pytest.mark.parametrize("skill,language", [("../escape", "en"), (NAME, "es"), ("missing", "en")])
def test_invalid_acknowledgement_does_not_write_registry(translated_matrix, skill, language):
    file = translated_matrix / "scripts/skills/translated.json"
    before = file.read_bytes()
    result, _ = run_node(translated_matrix, "--update-translation-hash", skill, language)
    assert result.returncode != 0
    assert file.read_bytes() == before


def test_bad_hash_is_rejected_before_writing_clients(tmp_path, translated_matrix):
    file = translated_matrix / "scripts/skills/translated.json"
    registry = json.loads(file.read_text())
    registry["en"][NAME]["source_sha256"] = "not-a-hash"
    file.write_text(json.dumps(registry))
    target = tmp_path / "client"
    target.mkdir()
    with pytest.raises(ValueError, match="Invalid translation"):
        sync(target, translated_matrix)
    assert not (target / ".claude").exists()

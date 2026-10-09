import os

import pytest
from mdd_client.cli import app
from mdd_client.memory import AREAS, init, status
from mdd_client.storage import contained, lock
from typer.testing import CliRunner


@pytest.mark.parametrize("kind", ["software", "mobile", "general"])
def test_init_complete_and_idempotent(tmp_path, kind):
    project = tmp_path / "project"
    assert len(init(project, kind)) == 4
    assert kind in (project / "memory/00-baseline-architecture.md").read_text()
    for area in AREAS:
        for node in (area, f"{area}/archive", f"{area}/archive/original", f"{area}/archive/compacted"):
            assert (project / "memory" / node / "index.md").is_file()
    path = project / "memory/02-policy.md"
    path.write_text("My custom policy", encoding="utf-8")
    before = {p.relative_to(project): p.read_bytes() for p in project.rglob("*") if p.is_file()}
    assert init(project, kind) == []
    assert before == {p.relative_to(project): p.read_bytes() for p in project.rglob("*") if p.is_file()}
    assert status(project)["healthy"]


def test_invalid_type_no_files(tmp_path):
    with pytest.raises(ValueError):
        init(tmp_path, "invalid")
    assert list(tmp_path.iterdir()) == []


def test_escape_and_existing_lock(tmp_path):
    with pytest.raises(ValueError, match="escapes"):
        contained(tmp_path, tmp_path / "../outside")
    with lock(tmp_path), pytest.raises(ValueError, match="Another MDD"):
        init(tmp_path)
    assert not (tmp_path / "memory/.mdd.lock").exists()


def test_linked_memory_rejected(tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    project = tmp_path / "project"
    project.mkdir()
    if os.name == "nt":
        import subprocess

        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(project / "memory"), str(outside)], check=True, capture_output=True
        )
    else:
        (project / "memory").symlink_to(outside, target_is_directory=True)
    try:
        with pytest.raises(ValueError):
            init(project)
        assert list(outside.iterdir()) == []
    finally:
        if os.name == "nt":
            os.rmdir(project / "memory")
        else:
            (project / "memory").unlink()


def test_cli_validation_and_json(tmp_path):
    runner = CliRunner()
    assert runner.invoke(app, ["init", str(tmp_path), "--type", "mobile"]).exit_code == 0
    result = runner.invoke(app, ["status", "--path", str(tmp_path), "--json"])
    assert result.exit_code == 0, result.output
    import json

    assert json.loads(result.output)["healthy"]
    assert runner.invoke(app, ["init", str(tmp_path), "--kits", "--matrix", str(tmp_path / "missing")]).exit_code == 1
    assert runner.invoke(app, ["status", "--path", str(tmp_path / "absent")]).exit_code == 1

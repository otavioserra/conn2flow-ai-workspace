"""ARCH-019 Phase 1: pluggable domains/ catalog + mdd bootstrap."""

import json
import shutil
from pathlib import Path

import pytest
from mdd_client import bootstrap as boot
from mdd_client.cli import app
from typer.testing import CliRunner

REPO = Path(__file__).resolve().parents[3]

LARAVEL = {
    "id": "laravel", "name": "Laravel (fixture)", "description": "Fixture domain proving extensibility via PR only.",
    "priority": 60,
    "detectors": {"files": ["artisan"], "dirs": [], "markers": [{"file": "composer.json", "contains": "laravel/framework"}]},
    "skills_mode": ["c2f-persona-executor", "mdd-workflow"], "extra_skills_dir": "skills",
    "generate_local_project_skill": True,
}


def _skill(folder: Path, name: str, body: str = "") -> None:
    (folder / name).mkdir(parents=True)
    (folder / name / "SKILL.md").write_text(f"---\nname: {name}\n---\n# {name}\n{body}", encoding="utf-8")


@pytest.fixture
def matrix(tmp_path):
    """Minimal matrix: the real domains/ catalog plus a fixture domain added 'by PR', no code change."""
    root = tmp_path / "matrix"
    shutil.copytree(REPO / "domains", root / "domains")
    canonical = root / ".gemini/skills"
    for name in ("c2f-persona-executor", "c2f-persona-curator", "mdd-workflow", "c2f-mdd-indexing-and-handoffs",
                 "c2f-hooks-system", "c2f-javascript-ajax"):
        _skill(canonical, name)
    (canonical / "c2f-javascript-ajax/subskills").mkdir()
    (canonical / "c2f-javascript-ajax/subskills/fetch.md").write_text("# fetch\n", encoding="utf-8")
    laravel = root / "domains/laravel"
    laravel.mkdir()
    (laravel / "domain.json").write_text(json.dumps(LARAVEL), encoding="utf-8")
    _skill(laravel / "skills", "laravel-eloquent")
    broken = root / "domains/broken"
    broken.mkdir()
    (broken / "domain.json").write_text(json.dumps({"id": "other", "name": "x", "description": "y",
                                                   "skills_mode": "all-canonical"}), encoding="utf-8")
    return root


def _snapshot(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


def test_real_catalog_ships_generic_and_conn2flow():
    domains, errors = boot.discover_domains(REPO / "domains")
    assert errors == []
    by_id = {d["id"]: d for d in domains}
    assert {"generic", "conn2flow"} <= set(by_id)
    assert by_id["generic"]["skills_mode"] == "core-mdd-only" and by_id["generic"]["generate_local_project_skill"]
    assert by_id["conn2flow"]["skills_mode"] == "all-canonical" and "gestor" in by_id["conn2flow"]["detectors"]["dirs"]
    assert (REPO / "domains/README.md").is_file()


def test_list_domains_discovers_fixture_and_reports_invalid(matrix, tmp_path):
    project = tmp_path / "api"
    project.mkdir()
    (project / "artisan").write_text("#!/usr/bin/env php\n", encoding="utf-8")
    result = CliRunner().invoke(app, ["bootstrap", "--list-domains", "--json", "--matrix", str(matrix), "--path", str(project)])
    assert result.exit_code == 0, result.output
    data = json.loads(result.stdout)
    assert [d["id"] for d in data["domains"]] == ["conn2flow", "generic", "laravel"]
    assert data["errors"][0]["domain"] == "broken"
    assert data["detected"] == {"id": "laravel", "evidence": ["file:artisan"], "fallback": False}


def test_auto_detects_custom_laravel_domain_and_installs_its_skills(matrix, tmp_path):
    project = tmp_path / "Shop API"
    project.mkdir()
    (project / "composer.json").write_text('{"require": {"laravel/framework": "^11"}}', encoding="utf-8")
    (project / "artisan").write_text("php", encoding="utf-8")
    (project / "tests").mkdir()
    (project / "phpunit.xml").write_text("<phpunit/>", encoding="utf-8")
    report = boot.bootstrap(project, "auto", kits=["claude", "copilot"], matrix=matrix)
    assert report["domain"] == "laravel" and set(report["detected"]["evidence"]) == {
        "file:artisan", "marker:composer.json~laravel/framework"}
    installed = set(report["skills"]["installed"])
    assert installed == {f"{kit}/skills/{name}" for kit in (".claude", ".github")
                         for name in ("c2f-persona-executor", "mdd-workflow", "laravel-eloquent")}
    assert not (project / ".gemini").exists()
    guide = (project / ".claude/skills/shop-api-project-guide/SKILL.md").read_text(encoding="utf-8")
    assert "PHP (`composer.json`)" in guide and "vendor/bin/phpunit" in guide and "name: shop-api-project-guide" in guide
    assert (project / "memory/learnings").is_dir() and (project / "memory/human-requests/CURRENT.md").is_file()


def test_generic_project_gets_core_mdd_only_and_stack_detection(matrix, tmp_path):
    project = tmp_path / "web"
    project.mkdir()
    (project / "package.json").write_text('{"scripts": {"build": "tsc", "test": "vitest"}}', encoding="utf-8")
    (project / "tsconfig.json").write_text("{}", encoding="utf-8")
    (project / "pnpm-lock.yaml").write_text("", encoding="utf-8")
    report = boot.bootstrap(project, "auto", kits=["gemini"], matrix=matrix)
    assert report["domain"] == "generic" and report["detected"]["fallback"]
    names = sorted(Path(p).name for p in report["skills"]["installed"])
    assert names == ["c2f-mdd-indexing-and-handoffs", "c2f-persona-curator", "c2f-persona-executor", "mdd-workflow"]
    assert [s["id"] for s in report["stack"]["stacks"]] == ["node", "typescript"]
    assert report["stack"]["commands"] == ["pnpm run build", "pnpm run test"]
    assert report["local_skill"]["created"] == [".gemini/skills/web-project-guide/SKILL.md"]


def test_conn2flow_project_and_explicit_domain(matrix, tmp_path):
    project = tmp_path / "site"
    (project / "gestor").mkdir(parents=True)
    (project / "gestor/config.php").write_text("<?php", encoding="utf-8")
    report = boot.bootstrap(project, "auto", kits=["codex"], matrix=matrix)
    assert report["domain"] == "conn2flow"
    assert len(report["skills"]["installed"]) == 6  # all-canonical fixture catalog
    assert (project / ".codex/skills/c2f-javascript-ajax/subskills/fetch.md").is_file()
    assert report["local_skill"] == {"created": [], "preserved": []}
    forced = boot.bootstrap(tmp_path / "site", "generic", kits=["cursor"], matrix=matrix, dry_run=True)
    assert forced["domain"] == "generic" and forced["dry_run"] and not (project / ".cursor").exists()
    with pytest.raises(ValueError, match="Unknown domain 'rails'"):
        boot.bootstrap(project, "rails", matrix=matrix)
    with pytest.raises(ValueError, match="Unknown kit"):
        boot.parse_kits("gemini,vim")


def test_bootstrap_is_idempotent_and_never_overwrites(matrix, tmp_path):
    project = tmp_path / "app"
    project.mkdir()
    boot.bootstrap(project, "generic", kits=["claude"], matrix=matrix)
    custom = project / ".claude/skills/c2f-persona-executor/SKILL.md"
    custom.write_text("my local edit", encoding="utf-8")
    (project / "memory/02-policy.md").write_text("custom policy", encoding="utf-8")
    before = _snapshot(project)
    again = boot.bootstrap(project, "generic", kits=["claude"], matrix=matrix)
    assert _snapshot(project) == before
    assert again["skills"]["installed"] == [] and again["memory"]["preserved"] and again["memory"]["created"] == []
    assert again["local_skill"]["preserved"] == [".claude/skills/app-project-guide/SKILL.md"]
    assert custom.read_text(encoding="utf-8") == "my local edit"


def test_existing_memory_only_gains_missing_areas(matrix, tmp_path):
    project = tmp_path / "legacy"
    (project / "memory").mkdir(parents=True)
    (project / "memory/00-baseline-architecture.md").write_text("# mine", encoding="utf-8")
    (project / "memory/index.md").write_text("handwritten", encoding="utf-8")
    report = boot.bootstrap(project, "generic", kits=["gemini"], matrix=matrix)
    assert "learnings/" in report["memory"]["created"]
    assert (project / "memory/index.md").read_text(encoding="utf-8") == "handwritten"
    assert not (project / "memory/01-general-memory.md").exists()


def test_cli_bootstrap_json(matrix, tmp_path):
    project = tmp_path / "cli"
    project.mkdir()
    result = CliRunner().invoke(app, ["bootstrap", "--path", str(project), "--matrix", str(matrix), "--kits", "gemini", "--json"])
    assert result.exit_code == 0, result.output
    assert json.loads(result.stdout)["domain"] == "generic"
    bad = CliRunner().invoke(app, ["bootstrap", "--path", str(project), "--matrix", str(matrix), "--domain", "nope"])
    assert bad.exit_code == 1 and "Unknown domain" in bad.output

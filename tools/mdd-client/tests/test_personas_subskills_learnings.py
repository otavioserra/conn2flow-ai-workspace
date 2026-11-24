"""REQ-088 / ARCH-018 Phase 1: persona aliases, subskills/, skills index and memory/learnings/."""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

import pytest
from mdd_client.core import indexer
from mdd_client.memory import AREAS, init
from mdd_client.sync import sync
from test_sync import MATRIX

PERSONAS = ["c2f-persona-architect", "c2f-persona-curator", "c2f-persona-executor",
            "c2f-persona-optimizer", "c2f-persona-reviewer"]
ALIASES = {"c2f-architect-master": "c2f-persona-architect", "c2f-executor-agent": "c2f-persona-executor",
           "c2f-reviewer-agent": "c2f-persona-reviewer"}
SUBSKILL = "c2f-payment-gateways/subskills/mercadopago-webhook-hmac.md"


def node(*args, cwd=None):
    return subprocess.run(["node", *map(str, args)], capture_output=True, text=True, encoding="utf-8", cwd=cwd)


def test_catalog_has_five_personas_and_no_legacy_names():
    skills = MATRIX / ".gemini/skills"
    names = sorted(p.parent.name for p in skills.glob("*/SKILL.md"))
    assert len(names) == 48
    assert [n for n in names if n.startswith("c2f-persona-")] == PERSONAS
    for legacy in ALIASES:
        assert not (skills / legacy).exists()
    for persona in PERSONAS:
        text = (skills / persona / "SKILL.md").read_text(encoding="utf-8-sig")
        assert f"name: {persona}\n" in text.replace("\r\n", "\n") and "user-invocable: true" in text
    registry = json.loads((MATRIX / "scripts/skills/translated.json").read_text(encoding="utf-8"))
    assert set(PERSONAS) <= set(registry["en"]) and not set(ALIASES) & set(registry["en"])


@pytest.mark.parametrize("legacy,current", sorted(ALIASES.items()))
def test_persona_alias_moves_whole_folder_once(tmp_path, legacy, current):
    init(tmp_path)
    folder = tmp_path / ".claude/skills" / legacy
    folder.mkdir(parents=True)
    (folder / "SKILL.md").write_bytes(b"legacy persona")
    (folder / "notes.txt").write_bytes(b"keep me")
    result = sync(tmp_path, MATRIX)
    assert result["status"] == "PASS"
    assert [(Path(m["source"]).name, Path(m["destination"]).name) for m in result["renamed_skills"]] == [(legacy, current)]
    assert not folder.exists()
    moved = folder.with_name(current)
    assert (moved / "notes.txt").read_bytes() == b"keep me"
    assert (moved / "SKILL.md").read_bytes() == (MATRIX / ".gemini/skills" / current / "SKILL.md").read_bytes()
    assert sync(tmp_path, MATRIX)["renamed_skills"] == []  # Idempotent: nothing left to migrate.


def test_persona_alias_refuses_coexistence(tmp_path):
    init(tmp_path)
    for name in ["c2f-executor-agent", "c2f-persona-executor"]:
        folder = tmp_path / ".codex/skills" / name
        folder.mkdir(parents=True)
        (folder / "SKILL.md").write_bytes(name.encode())
    with pytest.raises(ValueError, match="coexistem"):
        sync(tmp_path, MATRIX)
    assert (tmp_path / ".codex/skills/c2f-executor-agent/SKILL.md").read_bytes() == b"c2f-executor-agent"


def test_subskills_propagate_with_parent_and_are_audited(tmp_path):
    init(tmp_path)
    seed = (MATRIX / ".gemini/skills" / SUBSKILL).read_bytes()
    result = sync(tmp_path, MATRIX)
    assert result["status"] == "PASS"
    assert result["subskills"] == {"c2f-payment-gateways": ["subskills/mercadopago-webhook-hmac.md"]}
    for kit in (".gemini", ".claude", ".cursor", ".codex", ".github"):
        assert (tmp_path / kit / "skills" / SUBSKILL).read_bytes() == seed
    assert sync(tmp_path, MATRIX, True)["subskills_iguais"] == 5

    changed = tmp_path / ".claude/skills" / SUBSKILL
    changed.write_bytes(b"local edit")
    missing = tmp_path / ".codex/skills" / SUBSKILL
    missing.unlink()
    audit = sync(tmp_path, MATRIX, True)
    assert audit["status"] == "FAIL" and audit["escritos"] == []
    reasons = {(item["onde"].split("/")[-1], item["motivo"]) for item in audit["divergentes"]}
    assert reasons == {(".claude", "subskill diferente"), (".codex", "subskill ausente")}
    assert sync(tmp_path, MATRIX)["status"] == "PASS"  # Apply restores both from the matrix.
    assert changed.read_bytes() == seed and missing.read_bytes() == seed


def test_subskill_change_reopens_translation_review(tmp_path):
    matrix = tmp_path / "matrix"
    scripts = matrix / "scripts/skills"
    scripts.mkdir(parents=True)
    for name in ["sync-skills.cjs", "skill-customizations.cjs", "translations.cjs"]:
        shutil.copyfile(MATRIX / "scripts/skills" / name, scripts / name)
    for source in sorted((MATRIX / ".gemini/skills").glob("*/SKILL.md")):
        output = matrix / ".gemini/skills" / source.parent.name / "SKILL.md"
        output.parent.mkdir(parents=True)
        output.write_bytes(b"seed\n")
    sub = matrix / ".gemini/skills/c2f-payment-gateways/subskills/recipe.md"
    sub.parent.mkdir()
    sub.write_bytes(b"recipe v1\n")
    registry = {"en": {"c2f-payment-gateways": {"source_sha256": "0" * 64, "translated_at": "2026-11-24", "translator": "fixture"}}}
    (scripts / "translated.json").write_text(json.dumps(registry), encoding="utf-8")
    script = scripts / "sync-skills.cjs"
    assert node(script, "--update-translation-hash", "c2f-payment-gateways", "en").returncode == 0
    acknowledged = json.loads((scripts / "translated.json").read_text())["en"]["c2f-payment-gateways"]["source_sha256"]
    assert acknowledged != hashlib.sha256(b"seed\n").hexdigest()  # The hash covers the subskill too.
    report = tmp_path / "audit.json"
    target = tmp_path / "client"
    target.mkdir()
    assert node(script, "--target", target, "--apply", "--all", "--report", report).returncode == 0
    assert json.loads(report.read_text(encoding="utf-8"))["status"] == "PASS"
    sub.write_bytes(b"recipe v2\n")
    result = node(script, "--target", target, "--report", report)
    data = json.loads(report.read_text(encoding="utf-8"))
    assert "[DRIFT-WARNING]" in result.stderr
    assert data["translation_drift"][0]["skill"] == "c2f-payment-gateways"


def test_skills_index_is_current_and_detects_staleness(tmp_path):
    check = node(MATRIX / "scripts/skills/generate-skills-index.cjs", "--check")
    assert check.returncode == 0, check.stdout + check.stderr
    index = (MATRIX / ".gemini/skills/index.md").read_text(encoding="utf-8")
    assert "**48 skills** — 5 persona, 34 core, 9 governance; 1 subskill file(s)" in index
    assert f"]({SUBSKILL})" in index

    copy = tmp_path / "matrix"
    shutil.copytree(MATRIX / "scripts/skills", copy / "scripts/skills", ignore=shutil.ignore_patterns("*.py"))
    shutil.copytree(MATRIX / ".gemini/skills", copy / ".gemini/skills")
    script = copy / "scripts/skills/generate-skills-index.cjs"
    assert node(script, "--check").returncode == 0
    with (copy / ".gemini/skills/c2f-persona-curator/SKILL.md").open("ab") as handle:
        handle.write(b"\nextra line\n")
    assert node(script, "--check").returncode == 1
    first = node(script)
    assert first.returncode == 0
    generated = (copy / ".gemini/skills/index.md").read_bytes()
    assert node(script).returncode == 0 and (copy / ".gemini/skills/index.md").read_bytes() == generated
    assert b"\r\n" not in generated


def test_learnings_area_is_created_and_indexed(tmp_path):
    assert "learnings" in AREAS
    init(tmp_path)
    memory = tmp_path / "memory"
    for node_path in ("learnings", "learnings/archive", "learnings/archive/compacted", "learnings/archive/original"):
        assert (memory / node_path / "index.md").is_file()
    (memory / "learnings/LRN-001-crlf-hash.md").write_text(
        '---\nid: "LRN-001"\ntitle: "Hash after CRLF normalization"\nstatus: "active"\n'
        'summary_short: "Compare skills after LF normalization."\n---\n\n# LRN-001\n', encoding="utf-8")
    indexer.index(tmp_path)
    learnings = (memory / "learnings/index.md").read_text(encoding="utf-8")
    assert "| LRN-001 | Hash after CRLF normalization | Compare skills after LF normalization. |" in learnings
    assert "[archive](<archive/index.md>)" in learnings
    assert "[learnings](<learnings/index.md>)" in (memory / "index.md").read_text(encoding="utf-8")
    assert indexer.resolve(tmp_path, "lrn-001") == memory / "learnings/LRN-001-crlf-hash.md"


@pytest.mark.parametrize("language", ["pt-br", "en"])
def test_mdd_boilerplates_ship_learnings(language):
    memory = MATRIX / "templates" / language / "mdd-boilerplate/memory"
    for node_path in ("learnings", "learnings/archive", "learnings/archive/compacted", "learnings/archive/original"):
        assert (memory / node_path / "index.md").is_file()
    assert "LRN-XXX" in (memory / "learnings/README.md").read_text(encoding="utf-8")
    assert "learnings/index.md" in (memory / "index.md").read_text(encoding="utf-8")
    assert not (MATRIX / "templates" / language / "sdd-boilerplate/memory/learnings").exists()

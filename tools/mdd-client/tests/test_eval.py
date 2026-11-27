"""REQ-091 / ARCH-018 Phase 4: `mdd eval` deterministic skill regression runner."""
import json
import shutil
import subprocess
from pathlib import Path

import pytest
from mdd_client import skill_eval
from mdd_client.cli import app
from typer.testing import CliRunner

MATRIX = Path(__file__).resolve().parents[3]
REQUIRED_TRAPS = {"c2f-javascript-ajax", "c2f-persona-executor", "c2f-shell-and-windows-traps", "mdd-memory-gardening",
                  "c2f-hooks-system", "c2f-environment-configuration", "c2f-persona-architect", "c2f-payment-gateways"}


def test_real_matrix_suite_passes_offline_with_ten_or_more_scenarios():
    data = skill_eval.run(MATRIX)
    assert data["status"] == "EVAL-PASS", [r["failures"] for r in data["results"] if r["failures"]]
    assert data["provider"] == "deterministic" and data["scenarios"] >= 10 and data["failed"] == 0
    assert REQUIRED_TRAPS <= set(data["skills"])
    ids = [r["id"] for r in data["results"]]
    assert len(ids) == len(set(ids)) and ids == sorted(ids)
    executor = next(r for r in data["results"] if r["id"].startswith("EVAL-012"))
    assert executor["metrics"]["budget"] == 200 and executor["metrics"]["translation_copies"]["en"] >= 5
    # REQ-093 / BATCH-095: the 1st Optimizer round left no skill OVER budget; the 2 new FB scenarios make 15.
    assert data["scenarios"] >= 15 and not [item for item in data["budget_attention"] if item["state"] == "OVER"]
    assert skill_eval.run(MATRIX) == data  # Deterministic: same input, same report.


@pytest.fixture
def matrix(tmp_path):
    """Minimal matrix: one skill with a subskill, one EN template copy and one scenario."""
    skill = tmp_path / ".gemini/skills/c2f-demo"
    (skill / "subskills").mkdir(parents=True)
    (skill / "SKILL.md").write_text("---\nname: c2f-demo\n---\nUse ai:archive-memory.\r\nNunca git add -A.\n", encoding="utf-8")
    (skill / "subskills/recipe.md").write_text("x-signature: ts=1\n", encoding="utf-8")
    en = tmp_path / "templates/en/templates/kit-a/.claude/skills/c2f-demo/SKILL.md"
    en.parent.mkdir(parents=True)
    en.write_text("Use ai:archive-memory.\n", encoding="utf-8")
    scenarios = tmp_path / "tools/mdd-client/evals/skills"
    scenarios.mkdir(parents=True)
    write(scenarios, "EVAL-001-demo", must_include=["ai:archive-memory", "x-signature: ts="],
          must_match=[r"Nunca git add -A\.$"], must_not_include=["ai:archive-mdd"], subskills=["subskills/recipe.md"],
          translations={"en": {"must_include": ["ai:archive-memory"]}})
    (tmp_path / "scripts/skills").mkdir(parents=True)
    (tmp_path / "scripts/skills/sync-skills.cjs").write_text("// marker for find_matrix\n", encoding="utf-8")
    return tmp_path


def write(directory, scenario_id, skill="c2f-demo", **fields):
    data = {"id": scenario_id, "title": "Demo", "skill": skill, "trap": "demo trap", **fields}
    (directory / f"{scenario_id.lower()}.json").write_text(json.dumps(data), encoding="utf-8")


def test_fixture_passes_then_each_regression_fails(matrix):
    assert skill_eval.run(matrix)["status"] == "EVAL-PASS"
    skill = matrix / ".gemini/skills/c2f-demo"
    (skill / "SKILL.md").write_text("Use ai:archive-mdd.\nNunca git add -A. depois\n", encoding="utf-8")
    (skill / "subskills/recipe.md").unlink()
    (matrix / "templates/en/templates/kit-a/.claude/skills/c2f-demo/SKILL.md").write_text("stale\n", encoding="utf-8")
    data = skill_eval.run(matrix)
    assert (data["status"], data["passed"], data["failed"]) == ("EVAL-FAIL", 0, 1)
    failures = "\n".join(data["results"][0]["failures"])
    for expected in ("missing required term 'ai:archive-memory'", "missing required term 'x-signature: ts='",
                     "no match for required pattern", "forbidden anti-pattern present 'ai:archive-mdd'",
                     "required subskill missing subskills/recipe.md", "kit-a/.claude/skills/c2f-demo/SKILL.md (en): missing"):
        assert expected in failures


def test_missing_translation_copy_max_lines_and_forbidden_regex(matrix):
    shutil.rmtree(matrix / "templates")
    scenarios = matrix / "tools/mdd-client/evals/skills"
    write(scenarios, "EVAL-002-limits", max_lines=2, must_not_match=[r"git add -A"])
    data = skill_eval.run(matrix)
    first, second = data["results"]
    assert "no translation copy found" in " ".join(first["failures"])
    assert any("exceeds scenario max_lines 2" in f for f in second["failures"])
    assert any("forbidden pattern 'git add -A' matched" in f for f in second["failures"])
    assert second["metrics"]["lines"] == 5  # CRLF/LF normalized before counting.


def test_skill_filter_and_scenario_validation(matrix):
    scenarios = matrix / "tools/mdd-client/evals/skills"
    assert skill_eval.run(matrix, skill="c2f-demo")["scenarios"] == 1
    with pytest.raises(ValueError, match="No eval scenario covers skill"):
        skill_eval.run(matrix, skill="c2f-missing")
    for bad, message in ((dict(must_include=[]), "at least one assertion"),
                         (dict(must_match=["("]), "unterminated|missing"),
                         (dict(must_include=["x"], must_have=["y"]), "unknown assertion keys"),
                         (dict(must_include="x"), "list of non-empty strings")):
        extra = scenarios / "eval-099-bad.json"
        write(scenarios, "EVAL-099-bad", **bad)
        with pytest.raises(Exception, match=message):
            skill_eval.run(matrix)
        extra.unlink()
    write(scenarios, "EVAL-001-demo", skill="c2f-demo", must_include=["x"])  # Rewrites the same file: still unique.
    (scenarios / "copy.json").write_text((scenarios / "eval-001-demo.json").read_text(encoding="utf-8"), encoding="utf-8")
    with pytest.raises(ValueError, match="duplicated id"):
        skill_eval.run(matrix)


def test_related_skills_share_one_verdict_and_check_each_translation(matrix):
    directory = matrix / "tools/mdd-client/evals/skills"
    related = {"skill": "c2f-related", "must_include": ["ativar"],
               "translations": {"en": {"must_include": ["activate"]}}}
    write(directory, "EVAL-002-related", must_include=["ai:archive-memory"], related_skills=[related])
    source = matrix / ".gemini/skills/c2f-related/SKILL.md"
    template = matrix / "templates/en/templates/kit-a/.claude/skills/c2f-related/SKILL.md"
    for path, content in ((source, "ativar"), (template, "activate")):
        path.parent.mkdir(parents=True)
        path.write_text(content, encoding="utf-8")

    data = skill_eval.run(matrix, skill="c2f-related")
    assert (data["status"], data["scenarios"], data["skills"]) == ("EVAL-PASS", 1, ["c2f-demo", "c2f-related"])
    assert data["results"][0]["related_skills"]["c2f-related"]["translation_copies"] == {"en": 1}

    source.write_text("traduzir", encoding="utf-8")
    template.write_text("translate", encoding="utf-8")
    data = skill_eval.run(matrix, skill="c2f-related")
    assert (data["status"], data["scenarios"], data["failed"]) == ("EVAL-FAIL", 1, 1)
    failures = data["results"][0]["failures"]
    assert any("c2f-related (pt-br)" in failure for failure in failures)
    assert any("c2f-related/SKILL.md (en)" in failure for failure in failures)

    for checks, message in (({}, "list of skill checks"), ([related, related], "duplicate skill"),
                           ([{**related, "must_have": ["activate"]}], "unknown assertion keys")):
        write(directory, "EVAL-002-related", must_include=["ai:archive-memory"], related_skills=checks)
        with pytest.raises(ValueError, match=message):
            skill_eval.run(matrix)


def test_pluggable_provider_interface(matrix, monkeypatch):
    with pytest.raises(ValueError, match="Unknown provider: llm"):
        skill_eval.run(matrix, provider="llm")
    seen = []

    class Judge:
        name = "judge"

        def evaluate(self, scenario, corpus):
            seen.append((scenario.id, corpus.skill, sorted(corpus.subskills), sorted(corpus.translations["en"])))
            return ["judge says no"]

    monkeypatch.setitem(skill_eval.PROVIDERS, "deterministic", skill_eval.DeterministicProvider)
    skill_eval.register_provider("judge", Judge)
    try:
        data = skill_eval.run(matrix, provider="judge")
    finally:
        skill_eval.PROVIDERS.pop("judge")
    assert (data["status"], data["provider"]) == ("EVAL-FAIL", "judge")
    assert seen == [("EVAL-001-demo", "c2f-demo", ["subskills/recipe.md"],
                     ["templates/en/templates/kit-a/.claude/skills/c2f-demo/SKILL.md"])]
    with pytest.raises(ValueError, match="Invalid provider name"):
        skill_eval.register_provider("Bad Name", Judge)


def test_cli_exit_codes_and_json(matrix):
    runner = CliRunner()
    ok = runner.invoke(app, ["eval", "--matrix", str(matrix), "--json"])
    assert ok.exit_code == 0 and json.loads(ok.stdout)["status"] == "EVAL-PASS"
    table = runner.invoke(app, ["eval", "--matrix", str(matrix)])
    assert table.exit_code == 0 and "EVAL-PASS" in table.stdout
    (matrix / ".gemini/skills/c2f-demo/SKILL.md").write_text("vazio\n", encoding="utf-8")
    failed = runner.invoke(app, ["eval", "--matrix", str(matrix), "--json"])
    assert failed.exit_code == 1 and json.loads(failed.stdout)["status"] == "EVAL-FAIL"
    unknown = runner.invoke(app, ["eval", "--matrix", str(matrix), "--provider", "llm"])
    assert unknown.exit_code == 1 and "Unknown provider" in unknown.output


def test_budget_report_is_readonly_and_lists_over_near():
    index = MATRIX / ".gemini/skills/index.md"
    before = index.read_bytes()
    result = subprocess.run(["node", str(MATRIX / "scripts/skills/generate-skills-index.cjs"), "--budget-report"],
                            capture_output=True, text=True, encoding="utf-8", check=True)
    report = json.loads(result.stdout)
    assert report["status"] == "REPORT" and report["skills"] == 48
    assert report["counts"]["OVER"] == len(report["over"]) and report["counts"]["NEAR"] == len(report["near"])
    assert sum(report["counts"].values()) == 48
    assert all(item["lines"] > item["budget"] for item in report["over"])
    assert all(item["lines"] <= item["budget"] for item in report["near"])
    assert [i["ratio"] for i in report["over"]] == sorted((i["ratio"] for i in report["over"]), reverse=True)
    text = subprocess.run(["node", str(MATRIX / "scripts/skills/generate-skills-index.cjs"), "--budget-report", "--text"],
                          capture_output=True, text=True, encoding="utf-8", check=True).stdout
    assert text.startswith("Skill Budget — 48 skills:") and index.read_bytes() == before

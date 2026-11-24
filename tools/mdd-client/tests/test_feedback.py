import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from mdd_client import feedback
from mdd_client.cli import app
from mdd_client.core import indexer
from mdd_client.db import SQLiteMDDDriver
from typer.testing import CliRunner

MATRIX = Path(__file__).resolve().parents[3]
BASE = dict(persona="executor", skill="c2f-persona-executor", kind="gap", severity="medium",
            summary="Falta exemplo de lock", evidence="batch-091.md linha 10", repo="conn2flow-site",
            request="REQ-089", batch="BATCH-091")


@pytest.fixture
def matrix(tmp_path):
    (tmp_path / "memory").mkdir()
    return tmp_path


def submit(root, force_ready=False, **extra):
    return feedback.submit(root, {**BASE, **extra}, today="2026-11-24", force_ready=force_ready)


def test_submit_allocates_sequential_ids_and_indexes(matrix):
    first = submit(matrix)
    second = submit(matrix, summary="Ação: duplicar? Não!", kind="bug", severity="high")
    assert (first["id"], second["id"]) == ("FB-001", "FB-002")
    assert first["path"] == "memory/inbox/feedback/FB-001-falta-exemplo-de-lock.md"
    assert second["path"].endswith("FB-002-acao-duplicar-nao.md")
    meta = indexer.get(matrix, "FB-002")
    assert (meta["status"], meta["verdict"], meta["recurrence"]) == ("READY", "PENDING", "1")  # high: born eligible
    assert indexer.get(matrix, "FB-001")["status"] == "QUARANTINE"  # medium, first (skill, kind)
    assert (meta["persona"], meta["skill"], meta["scope"], meta["github_issue"]) == ("executor", "c2f-persona-executor", "global", "")
    index = (matrix / "memory/inbox/feedback/index.md").read_text(encoding="utf-8")
    assert "FB-001" in index and "FB-002" in index and "README" not in index
    assert "feedback/index.md" in (matrix / "memory/inbox/index.md").read_text(encoding="utf-8")
    # Archived records still reserve their numbers; the generic indexer stays compatible.
    archive = matrix / "memory/inbox/feedback/archive"
    archive.mkdir()
    (matrix / first["path"]).rename(archive / "FB-001-old.md")
    assert submit(matrix)["id"] == "FB-003"
    before = (matrix / "memory/inbox/feedback/index.md").read_text(encoding="utf-8")
    indexer.index(matrix, "inbox/feedback")
    assert (matrix / "memory/inbox/feedback/index.md").read_text(encoding="utf-8") == before


def test_submit_validates_enums_and_evidence(matrix):
    for field, value in (("persona", "boss"), ("kind", "rant"), ("severity", "urgent"), ("scope", "planet"), ("skill", "../x")):
        with pytest.raises(ValueError):
            submit(matrix, **{field: value})
    with pytest.raises(ValueError, match="evidence"):
        submit(matrix, evidence="  ")
    with pytest.raises(ValueError, match="matrix"):
        feedback.submit(None, BASE)
    assert not (matrix / "memory/inbox").exists()


def test_multiline_evidence_round_trips(matrix):
    result = submit(matrix, evidence='linha 1\nlinha "2"', proposal="Adicionar seção")
    assert feedback.list_feedback(matrix)[0]["evidence"] == 'linha 1\nlinha "2"'
    body = (matrix / result["path"]).read_text(encoding="utf-8")
    assert "## Proposal\n\nAdicionar seção" in body


def test_list_filters(matrix):
    submit(matrix)
    submit(matrix, skill="c2f-persona-reviewer", severity="high", repo="conn2flow")
    assert len(feedback.list_feedback(matrix)) == 2
    assert [r["id"] for r in feedback.list_feedback(matrix, {"severity": "HIGH"})] == ["FB-002"]
    assert [r["id"] for r in feedback.list_feedback(matrix, {"skill": "c2f-persona-executor", "repo": "conn2flow-site"})] == ["FB-001"]
    assert feedback.list_feedback(matrix, {"verdict": "ACCEPT"}) == []
    empty = matrix / "empty"
    (empty / "memory").mkdir(parents=True)
    assert feedback.list_feedback(empty) == []


def test_triage_records_verdict_and_reindexes(matrix):
    submit(matrix)
    submit(matrix)
    result = feedback.triage(matrix, "fb-002", "LOCAL_ONLY", reason="Regra específica do site", reviewer="curator", today="2026-11-25")
    assert result["verdict"] == "LOCAL_ONLY" and result["scope"] == "local"
    meta = indexer.get(matrix, "FB-002")
    assert (meta["status"], meta["triage_reason"], meta["triage_reviewer"], meta["triage_date"]) == (
        "TRIAGED", "Regra específica do site", "curator", "2026-11-25")
    assert "TRIAGED" in (matrix / "memory/inbox/feedback/index.md").read_text(encoding="utf-8")
    assert [r["id"] for r in feedback.list_feedback(matrix, {"verdict": "local_only"})] == ["FB-002"]
    with pytest.raises(ValueError, match="verdict"):
        feedback.triage(matrix, "FB-001", "MAYBE", reason="x")
    with pytest.raises(ValueError, match="reason"):
        feedback.triage(matrix, "FB-001", "ACCEPT", reason=" ")
    with pytest.raises(ValueError, match="not found"):
        feedback.triage(matrix, "FB-099", "ACCEPT", reason="x")
    with pytest.raises(ValueError, match="Invalid"):
        feedback.triage(matrix, "../FB-001", "ACCEPT", reason="x")


def test_sqlite_is_updated_only_when_present(matrix):
    assert submit(matrix)["database"] is False
    assert not (matrix / "memory/.mdd.sqlite").exists()
    SQLiteMDDDriver(matrix / "memory/.mdd.sqlite").close()
    assert submit(matrix, summary="Busca FTS exemplar")["database"] is True
    feedback.triage(matrix, "FB-002", "ACCEPT", reason="ok")
    with SQLiteMDDDriver(matrix / "memory/.mdd.sqlite") as driver:
        rows = driver.query("exemplar")
        assert [r["doc_id"] for r in rows] == ["FB-002"]
        assert json.loads(rows[0]["frontmatter_json"])["verdict"] == "ACCEPT"


def test_github_backend_uses_injected_runner(matrix):
    calls = []

    def runner(command):
        calls.append(list(command))
        if command[:3] == ["gh", "issue", "create"]:
            return "Creating issue\nhttps://github.com/acme/ws/issues/7\n"
        return json.dumps([{"number": 7, "title": "dup", "url": "https://github.com/acme/ws/issues/7", "state": "OPEN"},
                           {"number": 8, "title": "remote only", "url": "https://github.com/acme/ws/issues/8", "state": "OPEN"}])

    result = feedback.submit(matrix, BASE, github=True, github_repo="acme/ws", runner=runner)
    assert result["github_issue"] == "https://github.com/acme/ws/issues/7"
    label, create = calls[0], calls[1]
    assert label[:4] == ["gh", "label", "create", "skill-feedback"] and "--force" in label
    assert label[label.index("--color") + 1] == "0E8A16" and label[label.index("--repo") + 1] == "acme/ws"
    assert create[create.index("--label") + 1] == "skill-feedback" and create[create.index("--repo") + 1] == "acme/ws"
    assert "FB-001" in create[create.index("--body") + 1]
    assert indexer.get(matrix, "FB-001", "github_issue") == "https://github.com/acme/ws/issues/7"
    rows = feedback.list_feedback(matrix, include_github=True, runner=runner)
    assert [(r["id"], r["source"]) for r in rows] == [("FB-001", "inbox"), ("GH-8", "github")]
    # GitHub-only mode (no matrix disk) and runner failure keep the local record.
    remote = feedback.submit(None, BASE, github=True, runner=runner)
    assert remote["id"] is None and remote["github_issue"].endswith("/7")

    def broken(command):
        raise ValueError("gh failed: auth")

    failed = feedback.submit(matrix, BASE, github=True, runner=broken)
    assert failed["id"] == "FB-002" and failed["github_error"] == "gh failed: auth" and failed["github_issue"] is None


def test_github_label_is_created_before_issue_and_never_blocks_it(matrix):
    calls = []

    def runner(command):
        calls.append(list(command))
        if command[:3] == ["gh", "label", "create"]:
            raise ValueError("gh failed: label exists without --force support")
        return "https://github.com/acme/ws/issues/9\n"

    result = feedback.submit(matrix, BASE, github=True, runner=runner)
    assert [c[:3] for c in calls] == [["gh", "label", "create"], ["gh", "issue", "create"]]
    assert "--repo" not in calls[0]
    assert result["github_issue"].endswith("/9") and "label" in result["github_label_error"]
    assert feedback.ensure_github_label(lambda c: "", "acme/ws") is None


def test_scope_resolution(matrix, monkeypatch):
    local = matrix / "site"
    (local / "memory").mkdir(parents=True)
    assert feedback.resolve_root(local, None, "local") == local.resolve()
    monkeypatch.setenv("MDD_MATRIX", str(matrix))
    assert feedback.resolve_root(None, None, "global") == matrix.resolve()
    with pytest.raises(ValueError, match="memory"):
        feedback.resolve_root(None, matrix / "missing", "global")


def test_cli_submit_list_triage_json(matrix):
    runner = CliRunner()
    args = ["feedback", "submit", "--matrix", str(matrix), "--persona", "reviewer", "--skill", "c2f-persona-reviewer",
            "--kind", "bloat", "--severity", "low", "--summary", "Seção duplicada", "--evidence", "SKILL.md:40",
            "--req", "REQ-089", "--batch", "BATCH-091", "--repo", "conn2flow", "--json"]
    result = runner.invoke(app, args)
    assert result.exit_code == 0, result.output
    assert json.loads(result.output)["id"] == "FB-001"
    listed = runner.invoke(app, ["feedback", "list", "--matrix", str(matrix), "--skill", "c2f-persona-reviewer", "--json"])
    assert [r["request"] for r in json.loads(listed.output)] == ["REQ-089"]
    assert "FB-001" in runner.invoke(app, ["feedback", "list", "--matrix", str(matrix)]).output
    triaged = runner.invoke(app, ["feedback", "triage", "FB-001", "--matrix", str(matrix), "--verdict", "REJECT",
                                  "--reason", "Sem ganho", "--date", "2026-11-26", "--json"])
    assert json.loads(triaged.output)["triage_date"] == "2026-11-26"
    bad = runner.invoke(app, [*args[:-1], "--kind", "rant"])
    assert bad.exit_code == 1 and "Invalid kind" in bad.output


NODE = shutil.which("node")
HUB = MATRIX / "mcp-hub" / "dist" / "index.js"


@pytest.mark.skipif(not NODE, reason="node unavailable")
def test_governance_audit_ignores_crlf_only_differences(tmp_path):
    matrix = tmp_path / "matrix"
    scripts = matrix / "scripts/skills"
    scripts.mkdir(parents=True)
    for name in ("audit-mdd-governance.cjs", "translations.cjs"):
        shutil.copyfile(MATRIX / "scripts/skills" / name, scripts / name)
    names = [f"skill-{n:02d}" for n in range(42)] + ["start-mdd-slice", "continue-mdd-batch", "mdd-workflow",
             "mdd-memory-gardening", "c2f-project-pipeline-and-tasks", "c2f-resources-system"]
    names[0] = "c2f-persona-executor"
    for name in names:
        text = f"---\nname: {name}\n---\nCategoria A\nCategoria B\nCategoria C\n--skip-css\n".encode()
        for kit in (".gemini", ".claude", ".cursor", ".codex", ".github"):
            target = matrix / kit / "skills" / name / "SKILL.md"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(text if kit == ".gemini" else text.replace(b"\n", b"\r\n"))

    def audit():
        result = subprocess.run([NODE, str(scripts / "audit-mdd-governance.cjs"), "--repos", "matrix"],
                                capture_output=True, text=True, timeout=60, check=False)
        return json.loads(result.stdout)

    assert audit()["status"] == "PASS" and audit()["copies_checked"] == 240
    (matrix / ".claude/skills/mdd-workflow/SKILL.md").write_bytes(b"---\r\nname: mdd-workflow\r\n---\r\nother\r\n")
    assert audit()["errors"] == [f"Different copy: {matrix / '.claude/skills/mdd-workflow/SKILL.md'}"]


@pytest.mark.skipif(not NODE or not HUB.is_file(), reason="node or built mcp-hub unavailable")
def test_conn2flow_hub_feedback_tools_delegate_to_cli(matrix):
    requests = [
        {"jsonrpc": "2.0", "id": 1, "method": "tools/list"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "submit_skill_feedback", "arguments": {
            "persona": "architect", "skill": "c2f-persona-architect", "kind": "proposal", "severity": "medium",
            "summary": "Via MCP", "evidence": "rev-091", "repo": "conn2flow-ai-workspace", "req": "REQ-089"}}},
        {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "list_skill_feedback", "arguments": {
            "skill": "c2f-persona-architect"}}},
        {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "submit_skill_feedback", "arguments": {
            "persona": "architect", "skill": "c2f-persona-architect", "kind": "nope", "severity": "low",
            "summary": "x", "evidence": "y"}}},
    ]
    env = {**os.environ, "MDD_CLI": json.dumps([sys.executable, "-m", "mdd_client.cli"]), "MDD_MATRIX": str(matrix)}

    def call(request):  # one process per request: the stdio hub answers lines concurrently
        process = subprocess.run([NODE, str(HUB)], input=json.dumps(request) + "\n", capture_output=True, text=True,
                                 encoding="utf-8", env=env, timeout=120, check=False)
        return json.loads(process.stdout.splitlines()[0])

    responses = {r["id"]: call(r) for r in requests}
    names = {tool["name"] for tool in responses[1]["result"]["tools"]}
    assert {"c2f_run_command", "dispatch_task", "report_completion", "log_session_event",
            "submit_skill_feedback", "list_skill_feedback"} <= names
    submitted = json.loads(responses[2]["result"]["content"][0]["text"])
    assert submitted["id"] == "FB-001" and (matrix / submitted["path"]).is_file()
    listed = json.loads(responses[3]["result"]["content"][0]["text"])
    assert [r["summary_short"] for r in listed] == ["Via MCP"]
    assert responses[4]["result"]["isError"] and "Invalid kind" in responses[4]["result"]["content"][0]["text"]


def test_python_mcp_feedback_tools_match_cli(matrix, monkeypatch):
    """REQ-090: `mdd mcp` exposes submit/list_skill_feedback with the hub's contract."""
    import asyncio

    from mcp.server.fastmcp.exceptions import ToolError
    from mdd_client import mcp_server

    monkeypatch.delenv("MDD_MATRIX", raising=False)
    server = mcp_server.create_server(matrix)

    async def call(name, **args):
        _, structured = await server.call_tool(name, args)
        return structured

    async def check():
        names = {tool.name for tool in await server.list_tools()}
        assert {"submit_skill_feedback", "list_skill_feedback"} <= names
        first = await call("submit_skill_feedback", persona="executor", skill="c2f-persona-executor", kind="gap",
                           severity="high", summary="Fila serial no hub", evidence="server.ts:startStdio",
                           req="REQ-090", batch="BATCH-092", matrix=str(matrix))
        assert first["id"] == "FB-001" and first["path"].startswith("memory/inbox/feedback/FB-001-")
        await call("submit_skill_feedback", persona="reviewer", skill="c2f-persona-reviewer", kind="bloat",
                   severity="low", summary="Outro", evidence="x", matrix=str(matrix))
        listed = await call("list_skill_feedback", severity="HIGH", matrix=str(matrix))
        assert listed["count"] == 1 and listed["feedback"][0]["request"] == "REQ-090"
        assert listed["feedback"][0]["repo"] == matrix.name
        feedback.triage(matrix, "FB-001", "ACCEPT", reason="ok", today="2026-11-24")
        assert (await call("list_skill_feedback", verdict="ACCEPT", matrix=str(matrix)))["count"] == 1
        local = await call("list_skill_feedback", scope="local")
        assert local["count"] == 2
        with pytest.raises(ToolError, match="Invalid kind"):
            await call("submit_skill_feedback", persona="executor", skill="s", kind="rant", severity="low",
                       summary="x", evidence="y", matrix=str(matrix))
        with pytest.raises(ToolError, match="escapes"):
            await call("list_skill_feedback", scope="local", path="../fora")

    asyncio.run(check())


def test_recurrence_quarantine_promotes_on_second_occurrence(matrix):
    """REQ-091: medium/low first (skill, kind) occurrence waits in QUARANTINE; the 2nd promotes both."""
    first = submit(matrix, severity="low")
    assert (first["status"], first["recurrence"], first["promoted"]) == ("QUARANTINE", 1, [])
    meta = indexer.get(matrix, "FB-001")
    assert (meta["status"], meta["verdict"]) == ("QUARANTINE", "QUARANTINE")
    other = submit(matrix, kind="bug")  # different kind: independent counter
    assert other["status"] == "QUARANTINE" and other["recurrence"] == 1
    # ARCH-018 §4: a repeat inside the same (repo, batch) is the same occurrence.
    same_batch = submit(matrix, summary="Repetido no mesmo lote", severity="low", repo="CONN2FLOW-SITE", batch="batch-091")
    assert (same_batch["status"], same_batch["recurrence"], same_batch["promoted"]) == ("QUARANTINE", 1, [])
    second = submit(matrix, summary="Mesmo problema de lock", batch="BATCH-092")
    assert (second["status"], second["recurrence"], second["promoted"]) == ("READY", 2, ["FB-001", "FB-003"])
    promoted = indexer.get(matrix, "FB-001")
    assert (promoted["status"], promoted["verdict"], promoted["promoted_by"]) == ("READY", "PENDING", "FB-004")
    assert indexer.get(matrix, "FB-002")["status"] == "QUARANTINE"
    rows = {r["id"]: r for r in feedback.list_feedback(matrix)}
    assert [rows[f"FB-00{n}"]["recurrence"] for n in (1, 2, 3, 4)] == [2, 1, 2, 2]
    assert [r["id"] for r in feedback.list_feedback(matrix, {"status": "QUARANTINE"})] == ["FB-002"]
    index = (matrix / "memory/inbox/feedback/index.md").read_text(encoding="utf-8")
    assert "FB-004" in index and not (matrix / "memory/.mdd.lock").exists()


def test_force_ready_archive_counts_and_curator_verdicts_are_kept(matrix):
    assert submit(matrix, severity="medium", force_ready=True)["status"] == "READY"
    feedback.triage(matrix, "FB-001", "QUARANTINE", reason="curator hold", today="2026-11-24")
    archive = matrix / "memory/inbox/feedback/archive"
    archive.mkdir()
    old = submit(matrix, skill="mdd-workflow", severity="low")
    (matrix / old["path"]).rename(archive / Path(old["path"]).name)
    # Archived occurrence still counts for recurrence; it is never rewritten.
    again = submit(matrix, skill="mdd-workflow", severity="low", batch="BATCH-092")
    assert (again["status"], again["recurrence"], again["promoted"]) == ("READY", 2, [])
    # Manual curator QUARANTINE (status TRIAGED) is not auto-promoted.
    third = submit(matrix, severity="low", batch="BATCH-093")
    assert third["status"] == "READY" and third["promoted"] == []
    assert indexer.get(matrix, "FB-001")["status"] == "TRIAGED"


def test_cli_force_ready_and_recurrence_json(matrix):
    runner = CliRunner()
    args = ["feedback", "submit", "--matrix", str(matrix), "--persona", "executor", "--skill", "mdd-workflow",
            "--kind", "gap", "--severity", "low", "--summary", "x", "--evidence", "y", "--json"]
    assert json.loads(runner.invoke(app, args).stdout)["status"] == "QUARANTINE"
    forced = runner.invoke(app, [*args[:-1], "--force-ready", "--json"])
    assert forced.exit_code == 0 and json.loads(forced.stdout)["status"] == "READY"
    rows = json.loads(runner.invoke(app, ["feedback", "list", "--matrix", str(matrix), "--json"]).stdout)
    assert [r["recurrence"] for r in rows] == [2, 2]

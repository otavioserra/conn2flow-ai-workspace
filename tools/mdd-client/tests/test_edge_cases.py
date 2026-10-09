import asyncio
import json

import pytest
from mdd_client.cli import app
from mdd_client.daemon import watch
from mdd_client.memory import LIMIT, compact, init, partitions, relink
from mdd_client.report import collect
from mdd_client.sync import find_matrix
from typer.testing import CliRunner


def test_partition_boundary_links_and_relocation(tmp_path):
    init(tmp_path)
    target = tmp_path / "memory/sessions/large.md"
    sibling = target.parent / "small.md"
    sibling.write_text("# Small", encoding="utf-8")
    content = "x" * 3990 + "[sibling](small.md#anchor)\n" + "z" * LIMIT
    assert "".join(partitions(content)) == content
    target.write_text(content, encoding="utf-8")
    compact(tmp_path, True)
    parts = sorted((target.parent / "archive/compacted").glob("large-*-part-*.md"))
    assert "[sibling](../../small.md#anchor)" in "".join(p.read_text() for p in parts)


def test_oversized_json_archived_as_valid_json(tmp_path):
    init(tmp_path)
    path = tmp_path / "memory/reports/record.json"
    data = json.dumps({"observations": "é" * LIMIT}, ensure_ascii=False).encode()
    path.write_bytes(data)
    result = compact(tmp_path, True)
    assert "memory/reports/record.json" in result["archive"]
    assert not path.exists()
    original = next((path.parent / "archive/original").glob("record-*.json"))
    assert original.read_bytes() == data
    assert json.loads(original.read_text(encoding="utf-8"))["observations"] == "é" * LIMIT


@pytest.mark.parametrize(
    "name,area",
    [("VALIDATION-CHECKLIST.md", "validation"), ("DECISION-LOG.md", "decisions"), ("BATCH-INDEX.md", "implementation")],
)
def test_aggregate_history_window(tmp_path, name, area):
    init(tmp_path)
    path = tmp_path / "memory" / area / name
    if name == "VALIDATION-CHECKLIST.md":
        content = "# Validation\n\n" + "".join(f"## BATCH-{i:03}\n\nEvidence {i}\n\n" for i in range(1, 13))
    else:
        prefix = "DEC" if name == "DECISION-LOG.md" else "BATCH"
        content = "# History\n\n| ID | Status |\n| --- | --- |\n" + "".join(
            f"| **{prefix}-{i:03}** | complete |\n" for i in range(1, 13)
        )
    path.write_bytes(content.encode())
    result = compact(tmp_path, True)
    assert path.relative_to(tmp_path).as_posix() in result["trim"]
    assert "001" not in path.read_text() and "003" in path.read_text() and "012" in path.read_text()
    assert next((path.parent / "archive/original").glob(f"{path.stem}-*.md")).read_bytes() == content.encode()
    assert not compact(tmp_path)["trim"]


def test_relink_space_query_fragment(tmp_path):
    old = tmp_path / "a.md"
    new = tmp_path / "sub/a.md"
    content = "[doc](<a file.md?q=1#anchor>) [anchor](#here) [absolute](/docs/help)"
    value = relink(content, old, new, {}, tmp_path)
    assert "<../a file.md?q=1#anchor>" in value
    assert "[anchor](#here)" in value and "[absolute](/docs/help)" in value


def test_reference_style_and_file_uri_repaired(tmp_path):
    old = tmp_path / "old.md"
    archived = tmp_path / "archive/original/old.md"
    pointer = tmp_path / "pointer.md"
    text = f'[ref]: old.md#anchor "title"\n\n[absolute]({old.as_uri()}#anchor)\n'
    repaired = relink(text, pointer, pointer, {old: archived}, tmp_path)
    assert '[ref]: archive/original/old.md#anchor "title"' in repaired
    assert archived.as_uri() + "#anchor" in repaired


def test_large_log_and_missing_matrix(tmp_path, monkeypatch):
    init(tmp_path)
    log = tmp_path / "big.log"
    log.write_bytes(b"x" * (5 * 1024 * 1024 + 1))
    with pytest.raises(ValueError, match="5 MiB"):
        collect(tmp_path, [log])
    monkeypatch.setenv("MDD_MATRIX", str(tmp_path))
    with pytest.raises(ValueError, match="matrix"):
        find_matrix()


def test_daemon_change_alerts_and_interval(tmp_path):
    init(tmp_path)

    async def exercise():
        events = []
        stop = asyncio.Event()

        def emit(value):
            events.append(value)
            if len(events) == 1:
                (tmp_path / "memory/reports/new.md").write_text("new")
            else:
                stop.set()

        await asyncio.wait_for(watch(tmp_path, interval=0.1, emit=emit, stop=stop), 5)
        assert events[1]["active_files"] == events[0]["active_files"] + 1

    asyncio.run(exercise())


def test_cli_unhealthy_and_sync(tmp_path):
    init(tmp_path)
    runner = CliRunner()
    result = runner.invoke(app, ["sync", "--path", str(tmp_path)])
    assert result.exit_code == 0, result.output
    (tmp_path / "memory/reports/big.md").write_text("x" * LIMIT)
    assert runner.invoke(app, ["status", "--path", str(tmp_path)]).exit_code == 1
    assert runner.invoke(app, ["compact", "--path", str(tmp_path), "--apply"]).exit_code == 0

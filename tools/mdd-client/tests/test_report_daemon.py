import asyncio
import json

import pytest
from mdd_client.cli import app
from mdd_client.daemon import watch
from mdd_client.memory import init
from mdd_client.report import export
from typer.testing import CliRunner


def test_export_logs_are_aggregate_only(tmp_path):
    init(tmp_path)
    path = tmp_path / "build.log"
    path.write_text("ERROR secret-token=never-export failed\nWARNING user@example.com\ntimeout\n", encoding="utf-8")
    target, data = export(tmp_path, [path])
    assert data["friction"] == {"errors": 2, "warnings": 1, "timeouts": 1}
    serialized = target.read_text()
    assert "never-export" not in serialized and "user@example.com" not in serialized
    assert json.loads(serialized)["report_id"] == data["report_id"]


def test_watch_once_and_stop(tmp_path):
    init(tmp_path)
    emitted = []
    asyncio.run(watch(tmp_path, once=True, emit=emitted.append))
    assert len(emitted) == 1 and emitted[0]["healthy"]

    async def check():
        stop = asyncio.Event()

        def emit(value):
            emitted.append(value)
            stop.set()

        await watch(tmp_path, interval=0.1, emit=emit, stop=stop)

    asyncio.run(check())
    with pytest.raises(ValueError):
        asyncio.run(watch(tmp_path, interval=0))


@pytest.mark.parametrize("command", ["report", "daemon", "watch", "compact"])
def test_cli_commands(tmp_path, command):
    init(tmp_path)
    args = [command, "--path", str(tmp_path)]
    if command in {"daemon", "watch"}:
        args.append("--once")
    result = CliRunner().invoke(app, args)
    assert result.exit_code == 0, result.output

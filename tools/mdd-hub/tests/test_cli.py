from mdd_hub import cli
from typer.testing import CliRunner


def test_server_binding_and_arguments(tmp_path, monkeypatch):
    calls = []
    monkeypatch.delenv("MDD_HUB_TOKEN", raising=False)
    monkeypatch.setattr(cli.uvicorn, "run", lambda app, **kwargs: calls.append(kwargs))
    runner = CliRunner()
    assert runner.invoke(cli.app, ["serve", "--root", str(tmp_path)]).exit_code == 0
    assert calls[0] == {"host": "127.0.0.1", "port": 8765}
    assert runner.invoke(cli.app, ["serve", "--host", "0.0.0.0"]).exit_code == 2
    assert (
        runner.invoke(cli.app, ["serve", "--root", str(tmp_path), "--watch-docs", "--mode", "unknown"]).exit_code == 2
    )
    monkeypatch.setenv("MDD_HUB_TOKEN", "test-only")
    assert runner.invoke(cli.app, ["serve", "--root", str(tmp_path), "--host", "0.0.0.0"]).exit_code == 0


def test_watch_once_success_and_errors(tmp_path, monkeypatch):
    result = {"errors": {}, "changes": 0}

    class Stub:
        def __init__(self, *args):
            pass

        async def cycle(self):
            return result

    monkeypatch.setattr(cli, "Watcher", Stub)
    runner = CliRunner()
    args = ["watch", "--root", str(tmp_path), "--once"]
    assert runner.invoke(cli.app, args).exit_code == 0
    result["errors"] = {"codex": "HTTP 503"}
    assert runner.invoke(cli.app, args).exit_code == 1
    assert runner.invoke(cli.app, [*args, "--mode", "unknown"]).exit_code == 2


def test_continuous_cli_interrupt(tmp_path, monkeypatch):
    class Stub:
        def __init__(self, *args):
            pass

        async def run(self, *args):
            raise KeyboardInterrupt()

    monkeypatch.setattr(cli, "Watcher", Stub)
    assert CliRunner().invoke(cli.app, ["watch", "--root", str(tmp_path)]).exit_code == 130

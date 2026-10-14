import asyncio
import json
import socket
import subprocess
import sys

import httpx
import pytest
from mcp import ClientSession, StdioServerParameters
from mcp.client.sse import sse_client
from mcp.client.stdio import stdio_client
from mdd_client import mcp_server, memory
from mdd_client.cli import app
from typer.testing import CliRunner


def test_tools_use_real_core_and_reject_traversal(tmp_path, monkeypatch):
    server = mcp_server.create_server(tmp_path)

    async def call(name, **args):
        _, structured = await server.call_tool(name, args)
        return structured

    async def check():
        assert len(await server.list_tools()) == 9
        assert (await call("mdd_init"))["created"]
        assert not (await call("mdd_init"))["created"]
        health = await call("mdd_status")
        assert health["healthy"] and "No approved request" in health["current"]
        (tmp_path / "memory/human-requests/CURRENT.md").unlink()
        assert (await call("mdd_status"))["current"] is None
        doc = tmp_path / "memory/human-reviews/rev-001.md"
        doc.write_bytes(b'---\r\nid: "REV-001"\r\n# retained\r\nstatus: "pending"\r\n---\r\n# Review\r\n')
        assert (await call("mdd_meta_get", target="REV-001", field="status"))["value"] == "pending"
        await call("mdd_meta_set", target="REV-001", updates={"status": "RECOMMEND-APPROVAL"})
        assert b"# retained\r\n" in doc.read_bytes()
        assert len((await call("mdd_review_inbox"))["reviews"]) == 1
        await call("mdd_meta_set", target="REV-001", updates={"status": "HOMOLOGATED"})
        assert not (await call("mdd_review_inbox"))["reviews"]
        assert (await call("mdd_index", target="human-reviews"))["indexes"]
        assert not (await call("mdd_compact"))["archive"]
        exported = await call("mdd_report")
        assert exported["report"]["health"]["project"] == tmp_path.name
        async def send(data, hub, token):
            assert hub == "http://hub" and token == "test-token"
            return {"accepted": True}
        monkeypatch.setattr(mcp_server.report, "send", send)
        monkeypatch.setenv("MDD_HUB_TOKEN", "test-token")
        assert (await call("mdd_report", hub="http://hub"))["dispatch"]["accepted"]
        monkeypatch.setattr(mcp_server, "find_matrix", lambda matrix: tmp_path)
        monkeypatch.setattr(mcp_server, "sync", lambda root, matrix, audit: {"status": "PASS", "audit": audit})
        assert (await call("mdd_sync", matrix=str(tmp_path)))["audit"]
        from mcp.server.fastmcp.exceptions import ToolError
        with pytest.raises(ToolError, match="escapes"):
            await call("mdd_init", path="../escape")
        with pytest.raises(ToolError):
            await call("mdd_meta_set", target="REV-001", updates={})
    asyncio.run(check())


@pytest.mark.parametrize("transport", ["stdio", "sse"])
def test_serve_cancels_monitor_on_transport_exit(tmp_path, monkeypatch, capsys, transport):
    events = []
    class Server:
        async def run_stdio_async(self):
            await asyncio.sleep(0.03)
            events.append("stdio")
        async def run_sse_async(self):
            await asyncio.sleep(0.03)
            events.append("sse")
    async def watch(root, interval, emit):
        try:
            emit({"healthy": True})
            await asyncio.Event().wait()
        finally:
            events.append("stopped")
    monkeypatch.setattr(mcp_server, "create_server", lambda root, port: Server())
    monkeypatch.setattr(mcp_server.daemon, "watch", watch)
    asyncio.run(mcp_server.serve(tmp_path, transport, monitor=True))
    assert events == [transport, "stopped"]
    captured = capsys.readouterr()
    assert not captured.out and json.loads(captured.err)["healthy"]
    asyncio.run(mcp_server.serve(tmp_path, transport))


def test_monitor_failure_propagates_and_cancels_server(tmp_path, monkeypatch):
    stopped = []
    class Server:
        async def run_stdio_async(self):
            try:
                await asyncio.Event().wait()
            finally:
                stopped.append(True)
    async def watch(*args, **kwargs):
        raise ValueError("monitor failed")
    monkeypatch.setattr(mcp_server, "create_server", lambda root, port: Server())
    monkeypatch.setattr(mcp_server.daemon, "watch", watch)
    with pytest.raises(ValueError, match="monitor failed"):
        asyncio.run(mcp_server.serve(tmp_path, monitor=True))
    assert stopped


@pytest.mark.parametrize("args", [{"transport": "bad"}, {"port": 0}, {"port": 65536}, {"monitor": True, "interval": 0}])
def test_invalid_server_options(tmp_path, args):
    with pytest.raises(ValueError):
        asyncio.run(mcp_server.serve(tmp_path, **args))


def test_cli_mcp_and_daemon_options(tmp_path, monkeypatch):
    calls = []
    async def serve(*args, **kwargs):
        calls.append((args, kwargs))
    monkeypatch.setattr(mcp_server, "serve", serve)
    runner = CliRunner()
    for command in ["mcp", "daemon"]:
        args = [command, "--path", str(tmp_path), "--transport", "sse", "--port", "9876"]
        if command == "daemon":
            args.append("--mcp")
        result = runner.invoke(app, args)
        assert result.exit_code == 0, result.output
    assert calls[0][0] == (tmp_path.resolve(), "sse", 9876)
    assert calls[1][1]["monitor"]
    assert runner.invoke(app, ["daemon", "--mcp", "--once"]).exit_code == 1


@pytest.mark.parametrize("command", ["mcp", "daemon"])
def test_real_stdio_handshake_and_tools(tmp_path, command):
    memory.init(tmp_path)
    async def check():
        parameters = StdioServerParameters(command=sys.executable, args=[
            "-m", "mdd_client.cli", command, "--path", str(tmp_path),
            *(["--mcp", "--interval", "0.1"] if command == "daemon" else []),
        ])
        async with stdio_client(parameters) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await session.list_tools()
                assert {t.name for t in tools.tools} == {
                    "mdd_status", "mdd_init", "mdd_sync", "mdd_index", "mdd_meta_get",
                    "mdd_meta_set", "mdd_compact", "mdd_report", "mdd_review_inbox",
                }
                result = await session.call_tool("mdd_status", {})
                assert not result.isError and result.structuredContent["healthy"]
                invalid = await session.call_tool("mdd_status", {"path": "../outside"})
                assert invalid.isError
    asyncio.run(asyncio.wait_for(check(), 20))


def test_real_sse_handshake(tmp_path):
    memory.init(tmp_path)
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    with (tmp_path / "sse.log").open("wb") as log:
        process = subprocess.Popen([
            sys.executable, "-m", "mdd_client.cli", "mcp", "--path", str(tmp_path),
            "--transport", "sse", "--port", str(port),
        ], stdout=log, stderr=log)
        async def check():
            url = f"http://127.0.0.1:{port}"
            async with httpx.AsyncClient() as client:
                for _ in range(100):
                    assert process.poll() is None, (tmp_path / "sse.log").read_text()
                    try:
                        await client.get(url, timeout=0.2)
                        break
                    except (httpx.ConnectError, httpx.ConnectTimeout):
                        await asyncio.sleep(0.05)
                else:
                    pytest.fail("SSE server did not start")
            async with sse_client(url + "/sse") as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    assert len((await session.list_tools()).tools) == 9
                    result = await session.call_tool("mdd_status", {})
                    assert result.structuredContent["healthy"]
        try:
            asyncio.run(asyncio.wait_for(check(), 20))
        finally:
            process.terminate()
            process.wait(timeout=10)

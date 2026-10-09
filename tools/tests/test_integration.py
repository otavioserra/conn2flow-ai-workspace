"""Cross-package serialization and a real loopback Uvicorn server."""

import asyncio
import json
import os
import socket
import subprocess
import sys
import time

import httpx
from mdd_client.memory import init
from mdd_client.report import export, send


def test_client_submits_to_real_hub(tmp_path):
    project = tmp_path / "client-project"
    root = tmp_path / "hub"
    init(project)
    with socket.socket() as available:
        available.bind(("127.0.0.1", 0))
        port = available.getsockname()[1]
    env = {**os.environ, "MDD_HUB_TOKEN": "integration-test-only-token"}
    process = subprocess.Popen(
        [sys.executable, "-m", "mdd_hub.cli", "serve", "--root", str(root), "--port", str(port)],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    hub = f"http://127.0.0.1:{port}"
    try:
        deadline = time.monotonic() + 15
        while True:
            if process.poll() is not None:
                raise AssertionError(process.communicate()[1].decode())
            try:
                response = httpx.get(
                    hub + "/api/v1/status", headers={"Authorization": "Bearer integration-test-only-token"}, timeout=1
                )
                if response.status_code == 200:
                    break
            except httpx.TransportError:
                pass
            assert time.monotonic() < deadline, "Hub did not become ready"
            time.sleep(0.05)
        target, data = export(project)
        receipt = asyncio.run(send(data, hub, env["MDD_HUB_TOKEN"]))
        assert receipt == {"report_id": data["report_id"], "duplicate": False}
        assert asyncio.run(send(data, hub, env["MDD_HUB_TOKEN"]))["duplicate"]
        assert (
            json.loads((root / "memory/reports/clients" / target.name.removeprefix("report-")).read_text())["health"]
            == data["health"]
        )
        assert httpx.get(hub + "/api/v1/status").status_code == 401
    finally:
        process.terminate()
        process.communicate(timeout=10)

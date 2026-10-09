import json

from fastapi.testclient import TestClient
from mdd_hub.api import create_app


def test_ingestion_idempotence_consolidation_and_status(tmp_path, report_data):
    with TestClient(create_app(tmp_path)) as client:
        response = client.post("/api/v1/reports", json=report_data)
        assert response.status_code == 201, response.text
        assert client.post("/api/v1/reports", json=report_data).json()["duplicate"]
        assert client.get("/api/v1/status").json()["reports"] == 1
        assert client.get("/api/v1/status").json()["projects"] == 1
        report_data["friction"]["errors"] = 3
        assert client.post("/api/v1/reports", json=report_data).status_code == 409
    consolidated = json.loads((tmp_path / "memory/reports/clients/consolidated.json").read_text())
    assert consolidated["friction"]["errors"] == 2
    assert consolidated["lessons"] == [{"text": "Explicit git paths", "occurrences": 1}]
    with TestClient(create_app(tmp_path)) as restarted:
        assert restarted.get("/api/v1/status").json()["reports"] == 1


def test_auth_validation_and_body_limit(tmp_path, report_data):
    with TestClient(create_app(tmp_path, "test-only-token")) as client:
        assert client.get("/api/v1/status").status_code == 401
        headers = {"Authorization": "Bearer test-only-token"}
        assert client.post("/api/v1/reports", json=report_data, headers=headers).status_code == 201
        report_data["report_id"] = "../../escaped"
        assert client.post("/api/v1/reports", json=report_data, headers=headers).status_code == 422
        assert client.post("/api/v1/reports", content=b"x" * (256 * 1024 + 1), headers=headers).status_code == 413


def test_invalid_schema_negative_metrics_and_unknown_fields(tmp_path, report_data):
    with TestClient(create_app(tmp_path)) as client:
        report_data["friction"]["errors"] = -1
        assert client.post("/api/v1/reports", json=report_data).status_code == 422
        report_data["friction"]["errors"] = 0
        report_data["schema_version"] = 2
        assert client.post("/api/v1/reports", json=report_data).status_code == 422
        report_data["schema_version"] = 1
        report_data["raw_logs"] = "private"
        assert client.post("/api/v1/reports", json=report_data).status_code == 422


def test_lifespan_runs_and_stops_watcher(tmp_path):
    import threading

    class StubWatcher:
        health = {"enabled": True}
        started = threading.Event()
        stopped = threading.Event()

        async def run(self, interval, stop):
            self.started.set()
            try:
                await stop.wait()
            finally:
                self.stopped.set()

    watcher = StubWatcher()
    with TestClient(create_app(tmp_path, watcher=watcher)) as client:
        assert watcher.started.wait(2)
        assert client.get("/api/v1/status").json()["watcher"]["enabled"]
    assert watcher.stopped.wait(2)

import asyncio
from datetime import UTC

import httpx
import pytest
from fastapi.testclient import TestClient
from mdd_hub.api import create_app
from mdd_hub.evolution import Evolution, git
from mdd_hub.sources import Source, load
from mdd_hub.storage import exclusive, safe
from mdd_hub.watcher import Watcher


def test_watcher_continuous_stops_and_records_failed_cycle(tmp_path):
    watcher = Watcher(tmp_path, Evolution(tmp_path), ())

    async def exercise():
        stop = asyncio.Event()
        count = 0

        async def cycle():
            nonlocal count
            count += 1
            if count == 1:
                raise ValueError("busy mutation lock")
            stop.set()
            return {}

        watcher.cycle = cycle
        await asyncio.wait_for(watcher.run(1, stop), 5)
        assert count == 2
        assert "cycle" in watcher.health["errors"]

    asyncio.run(exercise())
    with pytest.raises(ValueError):
        asyncio.run(watcher.run(0, asyncio.Event()))


@pytest.mark.parametrize(
    "code,body", [(404, "not found"), (200, "x" * (2 * 1024 * 1024 + 1))], ids=["http-404", "oversized-body"]
)
def test_fetch_rejects_bad_response(tmp_path, code, body):
    watcher = Watcher(
        tmp_path,
        Evolution(tmp_path),
        (Source("codex", "https://example.com/docs"),),
        httpx.MockTransport(lambda r: httpx.Response(code, text=body)),
    )
    assert "codex" in asyncio.run(watcher.cycle())["errors"]
    assert not (tmp_path / "memory/raw/archive/watcher-state/codex.json").exists()


def test_source_invalid_structure_or_duplicates(tmp_path):
    path = tmp_path / "sources.yaml"
    for content in (
        "sources: {}",
        "sources: []",
        "sources:\n- name: test\n  url: https://example.com\n- name: test\n  url: https://example.com",
    ):
        path.write_text(content)
        with pytest.raises(ValueError):
            load(path)


def test_storage_containment_and_lock(tmp_path):
    with pytest.raises(ValueError):
        safe(tmp_path, tmp_path / "../escape")
    with exclusive(tmp_path, "test"), pytest.raises(ValueError, match="active"):
        with exclusive(tmp_path, "test"):
            pass


def test_date_and_lesson_limits(tmp_path, report_data):
    with TestClient(create_app(tmp_path)) as client:
        report_data["created_at"] = "2026-10-09T00:00:00"
        assert client.post("/api/v1/reports", json=report_data).status_code == 422
        report_data["created_at"] += "Z"
        report_data["lessons"] = ["x" * 2001]
        assert client.post("/api/v1/reports", json=report_data).status_code == 422


def test_headless_publication_to_local_bare_remote(tmp_path, change):
    project = tmp_path / "project"
    remote = tmp_path / "remote.git"
    project.mkdir()
    remote.mkdir()
    git(remote, "init", "--bare")
    git(project, "init")
    git(project, "config", "user.name", "MDD Test")
    git(project, "config", "user.email", "mdd-test@example.invalid")
    (project / "seed.md").write_text("seed")
    git(project, "add", "--", "seed.md")
    git(project, "commit", "-m", "initial")
    git(project, "remote", "add", "origin", str(remote))
    result = Evolution(project, "headless", publish=True).handle(change)
    assert result["status"] == "branch-pushed"
    assert git(remote, "rev-parse", result["branch"]) == result["commit"]


def test_incomplete_existing_branch_rejected(tmp_path, change):
    from datetime import datetime

    git(tmp_path, "init")
    git(tmp_path, "config", "user.name", "MDD Test")
    git(tmp_path, "config", "user.email", "mdd-test@example.invalid")
    (tmp_path / "seed").write_text("seed")
    git(tmp_path, "add", "--", "seed")
    git(tmp_path, "commit", "-m", "seed")
    branch = f"auto/docs-update-{datetime.now(UTC):%Y%m%d}-codex-{'a' * 12}"
    git(tmp_path, "branch", branch)
    with pytest.raises(RuntimeError):
        Evolution(tmp_path, "headless").handle(change)

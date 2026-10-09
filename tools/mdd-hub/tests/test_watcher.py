import asyncio

import httpx
import pytest
from mdd_hub.evolution import Evolution
from mdd_hub.sources import Source, load
from mdd_hub.watcher import Watcher, extract, normalize


def test_parser_structured_deltas():
    old = normalize("<main><h1>Version one</h1><p>Use --old /help timeout: 20</p></main>", True)
    new = normalize(
        "<nav>--noise</nav><main><h1>Version two</h1><p>Use --new /review retries=3</p><p>PowerShell quoting changed</p></main><script>--evil</script>",
        True,
    )
    delta = extract(old, new)
    assert delta["flags"] == ["--new"] and delta["removed_flags"] == ["--old"]
    assert delta["commands"] == ["review"] and delta["parameters"] == ["retries"]
    assert delta["shell_notes"] == ["PowerShell quoting changed"]
    assert "noise" not in new and "evil" not in new


def test_baseline_change_dedupe_restart(tmp_path):
    body = ["<main>Documentation version one --old /help timeout: 20</main>"]
    transport = httpx.MockTransport(
        lambda request: httpx.Response(200, text=body[0], headers={"content-type": "text/html"})
    )
    source = (Source("codex", "https://example.com/docs"),)
    watcher = Watcher(tmp_path, Evolution(tmp_path), source, transport)
    assert asyncio.run(watcher.cycle())["baselines"] == 1
    assert not (tmp_path / "memory/raw/inbox").exists()
    body[0] = "<main>Documentation version two --new /review timeout: 30</main>"
    assert asyncio.run(watcher.cycle())["changes"] == 1
    assert len(list((tmp_path / "memory/raw/inbox").glob("*.json"))) == 1
    restarted = Watcher(tmp_path, Evolution(tmp_path), source, transport)
    assert asyncio.run(restarted.cycle())["changes"] == 0


def test_http_failure_does_not_destroy_checkpoint(tmp_path):
    code = [200]
    calls = []

    def reply(request):
        calls.append(request)
        return httpx.Response(code[0], text="Documentation initial content --old")

    watcher = Watcher(
        tmp_path, Evolution(tmp_path), (Source("kimi", "https://example.com/docs"),), httpx.MockTransport(reply)
    )
    asyncio.run(watcher.cycle())
    checkpoint = tmp_path / "memory/raw/archive/watcher-state/kimi.json"
    original = checkpoint.read_bytes()
    code[0] = 503
    result = asyncio.run(watcher.cycle())
    assert "kimi" in result["errors"] and len(calls) == 4
    assert checkpoint.read_bytes() == original


def test_failed_evolution_retries_on_next_cycle(tmp_path):
    body = ["Documentation initial content --old"]

    class Failing:
        mode = "reviewer"

        def handle(self, change):
            raise RuntimeError("Unavailable git identity")

    watcher = Watcher(
        tmp_path,
        Failing(),
        (Source("codex", "https://example.com/docs"),),
        httpx.MockTransport(lambda r: httpx.Response(200, text=body[0])),
    )
    asyncio.run(watcher.cycle())
    checkpoint = tmp_path / "memory/raw/archive/watcher-state/codex.json"
    original = checkpoint.read_bytes()
    body[0] = "Documentation changed content --new"
    assert "codex" in asyncio.run(watcher.cycle())["errors"]
    assert checkpoint.read_bytes() == original
    watcher.evolution = Evolution(tmp_path)
    assert asyncio.run(watcher.cycle())["changes"] == 1


def test_sources_validation_and_empty_scrape(tmp_path):
    with pytest.raises(ValueError):
        Source("../escape", "https://example.com")
    with pytest.raises(ValueError):
        Source("valid", "http://example.com")
    path = tmp_path / "sources.yaml"
    path.write_text("sources:\n  - name: local-test\n    url: https://example.com/docs\n")
    assert load(path)[0].name == "local-test"
    watcher = Watcher(
        tmp_path, Evolution(tmp_path), load(path), httpx.MockTransport(lambda r: httpx.Response(200, text=""))
    )
    assert "local-test" in asyncio.run(watcher.cycle())["errors"]

"""Bounded asynchronous scraping, structured diffs and durable checkpoints."""

import asyncio
import hashlib
import json
import logging
import re
from datetime import UTC, datetime
from difflib import unified_diff
from html.parser import HTMLParser
from pathlib import Path

import httpx

from .sources import DEFAULT_SOURCES, Source
from .storage import exclusive, safe, store

logger = logging.getLogger(__name__)


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ignored = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "nav", "noscript", "svg"}:
            self.ignored += 1
        elif not self.ignored and tag in {"p", "div", "li", "pre", "h1", "h2", "h3", "br"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style", "nav", "noscript", "svg"} and self.ignored:
            self.ignored -= 1
        elif not self.ignored and tag in {"p", "div", "li", "pre", "h1", "h2", "h3"}:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.ignored:
            self.parts.append(data)


def normalize(body: str, html: bool = False) -> str:
    if html:
        parser = TextExtractor()
        parser.feed(body)
        body = "".join(parser.parts)
    return "\n".join(line for raw in body.splitlines() if (line := re.sub(r"\s+", " ", raw).strip()))


def extract(before: str, after: str) -> dict:
    def tokens(text: str, pattern: str) -> set[str]:
        return set(re.findall(pattern, text))

    added = [
        line[1:]
        for line in unified_diff(before.splitlines(), after.splitlines(), n=0)
        if line.startswith("+") and not line.startswith("+++")
    ]
    removed = [
        line[1:]
        for line in unified_diff(before.splitlines(), after.splitlines(), n=0)
        if line.startswith("-") and not line.startswith("---")
    ]
    patterns = {
        "flags": r"(?<!\w)--[a-zA-Z][\w-]*",
        "commands": r"(?<![\w:/])/([a-z][\w-]*)\b",
        "parameters": r"\b([a-z][a-z0-9_]{2,})\s*(?::|=)",
    }
    token_changes = {
        name: sorted(tokens(after, pattern) - tokens(before, pattern)) for name, pattern in patterns.items()
    }
    token_changes["removed_flags"] = sorted(tokens(before, patterns["flags"]) - tokens(after, patterns["flags"]))
    data = {name: [value[:100] for value in values[:50]] for name, values in token_changes.items()}
    data["added_lines"] = [line[:200] for line in added[:40]]
    data["removed_lines"] = [line[:200] for line in removed[:40]]
    data["shell_notes"] = [
        line[:200] for line in added if re.search(r"shell|powershell|bash|escape|quoting|windows", line, re.IGNORECASE)
    ][:10]
    data["truncated"] = (
        len(added) > 40
        or len(removed) > 40
        or any(len(line) > 200 for line in added + removed)
        or any(len(values) > 50 for values in token_changes.values())
    )
    return data


class Watcher:
    def __init__(
        self,
        root: Path,
        evolution,
        sources: tuple[Source, ...] = DEFAULT_SOURCES,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self.root = root.resolve()
        self.evolution = evolution
        self.sources = sources
        self.transport = transport
        self.health: dict = {"enabled": True, "mode": evolution.mode, "last_cycle": None, "errors": {}, "changes": 0}

    async def fetch(self, client: httpx.AsyncClient, source: Source) -> str:
        for attempt in range(3):
            try:
                async with client.stream("GET", source.url) as response:
                    response.raise_for_status()
                    body = bytearray()
                    async for piece in response.aiter_bytes():
                        body.extend(piece)
                        if len(body) > 2 * 1024 * 1024:
                            raise ValueError("Documentation response exceeds 2 MiB")
                    text = normalize(
                        body.decode("utf-8", errors="replace"), "html" in response.headers.get("content-type", "")
                    )
                    if len(text) < 20:
                        raise ValueError("Documentation is empty or too short")
                    return text
            except (httpx.TransportError, httpx.HTTPStatusError) as exc:
                if (
                    isinstance(exc, httpx.HTTPStatusError)
                    and exc.response.status_code < 500
                    and exc.response.status_code != 429
                ):
                    raise
                if attempt == 2:
                    raise
                await asyncio.sleep(0.1 * 2**attempt)
        raise RuntimeError("Unreachable retry state")

    async def cycle(self) -> dict:
        semaphore = asyncio.Semaphore(3)
        async with httpx.AsyncClient(
            timeout=20,
            follow_redirects=True,
            transport=self.transport,
            headers={"User-Agent": "MDD-Documentation-Watcher/0.1"},
        ) as client:

            async def fetch_one(source):
                async with semaphore:
                    try:
                        return source, await self.fetch(client, source), None
                    except (httpx.HTTPError, ValueError) as exc:
                        return source, None, f"{type(exc).__name__}: {exc}"

            fetched = await asyncio.gather(*(fetch_one(source) for source in self.sources))
        # One evolution at a time; checkpoints advance only after successful handling.
        changes, errors, baselines = 0, {}, 0
        with exclusive(self.root, "watcher"):
            for source, text, error in fetched:
                if error:
                    errors[source.name] = error
                    continue
                checkpoint = safe(self.root, self.root / "memory/raw/archive/watcher-state" / f"{source.name}.json")
                old = json.loads(checkpoint.read_text(encoding="utf-8")) if checkpoint.exists() else None
                digest = hashlib.sha256(text.encode()).hexdigest()
                if old and old.get("url") == source.url and old["digest"] == digest:
                    continue
                state = {"url": source.url, "digest": digest, "text": text}
                if old is None or old.get("url") != source.url:
                    store(self.root, checkpoint, state)
                    baselines += 1
                    continue
                change = {
                    "source": source.name,
                    "url": source.url,
                    "digest": digest,
                    "previous_digest": old["digest"],
                    "detected_at": datetime.now(UTC).isoformat(),
                    "changes": extract(old["text"], text),
                }
                try:
                    await asyncio.to_thread(self.evolution.handle, change)
                    store(self.root, checkpoint, state)
                    changes += 1
                except (OSError, ValueError, RuntimeError) as exc:
                    errors[source.name] = f"{type(exc).__name__}: {exc}"
        self.health.update(
            last_cycle=datetime.now(UTC).isoformat(), errors=errors, changes=changes, baselines=baselines
        )
        return dict(self.health)

    async def run(self, interval: float, stop: asyncio.Event) -> None:
        if interval < 1:
            raise ValueError("Watcher interval must be at least 1 second")
        while not stop.is_set():
            try:
                await self.cycle()
            except (OSError, ValueError, RuntimeError) as exc:
                self.health["errors"] = {"cycle": str(exc)}
                logger.exception("Documentation cycle failed")
            try:
                await asyncio.wait_for(stop.wait(), timeout=interval)
            except TimeoutError:
                pass

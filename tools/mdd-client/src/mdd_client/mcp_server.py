"""IDE-independent MCP adapter; all memory rules remain in the client core."""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP

from . import daemon, memory, report
from .core import indexer
from .storage import contained
from .sync import find_matrix, sync


def create_server(root: Path, port: int = 8765) -> FastMCP:
    """Bind tools to an explicitly selected project (and its descendants)."""
    root = root.resolve()
    server = FastMCP("MDD Client", host="127.0.0.1", port=port)

    def project(path: str = ".") -> Path:
        candidate = Path(path)
        return contained(root, candidate if candidate.is_absolute() else root / candidate)

    @server.tool()
    def mdd_status(path: str = ".") -> dict[str, Any]:
        """Return health, active inventory, size violations and CURRENT pointer."""
        repo = project(path)
        health = memory.status(repo)
        current = contained(repo, repo / "memory/human-requests/CURRENT.md")
        health["current"] = current.read_text(encoding="utf-8") if current.is_file() else None
        return health

    @server.tool()
    def mdd_init(path: str = ".", project_type: str = "software") -> dict[str, Any]:
        """Initialize governance without overwriting existing project documents."""
        repo = project(path)
        return {"project": str(repo), "created": memory.init(repo, project_type)}

    @server.tool()
    def mdd_sync(path: str = ".", matrix: str | None = None, audit: bool = True) -> dict[str, Any]:
        """Audit or propagate 45 skills through the canonical SHA-256 pipeline."""
        return sync(project(path), find_matrix(Path(matrix) if matrix else None), audit)

    @server.tool()
    def mdd_index(path: str = ".", target: str | None = None) -> dict[str, Any]:
        """Rebuild existing indexes or one explicitly selected memory directory."""
        return {"indexes": [str(p) for p in indexer.index(project(path), target)]}

    @server.tool()
    def mdd_meta_get(target: str, field: str | None = None, path: str = ".") -> dict[str, Any]:
        """Read metadata by a unique document ID or contained memory path."""
        return {"value": indexer.get(project(path), target, field)}

    @server.tool()
    def mdd_meta_set(target: str, updates: dict[str, str], path: str = ".") -> dict[str, Any]:
        """Atomically set metadata, preserving body, comments and line endings."""
        return {"document": str(indexer.set_metadata(project(path), target, updates))}

    @server.tool()
    def mdd_compact(path: str = ".", apply: bool = False) -> dict[str, Any]:
        """Audit retention; explicit apply preserves dual original/compacted archives."""
        return memory.compact(project(path), apply)

    @server.tool()
    async def mdd_report(path: str = ".", logs: list[str] | None = None, hub: str | None = None) -> dict[str, Any]:
        """Export aggregate metrics and optionally dispatch to an explicit Hub."""
        target, data = await asyncio.to_thread(report.export, project(path), [Path(p) for p in logs or []])
        result = {"document": str(target), "report": data}
        if hub:
            result["dispatch"] = await report.send(data, hub, os.environ.get("MDD_HUB_TOKEN"))
        return result

    @server.tool()
    def mdd_review_inbox(path: str = ".") -> dict[str, Any]:
        """List active review sheets awaiting human approval; never sign approval."""
        repo = project(path)
        inbox = contained(repo, repo / "memory/human-reviews")
        reviews = []
        for document in sorted(inbox.glob("rev-*.md")):
            contained(repo, document)
            meta = indexer.get(repo, document.relative_to(repo).as_posix())
            if meta["status"].upper() != "HOMOLOGATED":
                reviews.append({"path": document.relative_to(repo).as_posix(), "metadata": meta})
        return {"reviews": reviews}

    return server


async def serve(root: Path, transport: str = "stdio", port: int = 8765, monitor: bool = False, interval: float = 30) -> None:
    """Run MCP and optionally the monitor together; cancel both on exit/failure."""
    if transport not in {"stdio", "sse"}:
        raise ValueError("Transport must be stdio or sse")
    if not 1 <= port <= 65535:
        raise ValueError("Port must be between 1 and 65535")
    if monitor and interval < 0.1:
        raise ValueError("Interval must be at least 0.1 seconds")
    server = create_server(root, port)
    run = server.run_stdio_async if transport == "stdio" else server.run_sse_async
    tasks = [asyncio.create_task(run())]
    if monitor:
        tasks.append(asyncio.create_task(daemon.watch(
            root, interval, emit=lambda data: print(json.dumps(data), file=sys.stderr, flush=True)
        )))
    try:
        done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            task.result()
    finally:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)

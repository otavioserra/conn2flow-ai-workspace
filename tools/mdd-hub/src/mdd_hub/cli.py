"""Server and watcher entrypoints."""

import asyncio
import json
import logging
import os
from pathlib import Path

import typer
import uvicorn

from .api import create_app
from .evolution import Evolution
from .sources import load
from .watcher import Watcher

app = typer.Typer(no_args_is_help=True)


@app.command()
def serve(
    root: Path = typer.Option(Path(".")),
    host: str = "127.0.0.1",
    port: int = 8765,
    watch_docs: bool = False,
    mode: str = "reviewer",
    sources: Path | None = None,
    interval: float = 3600,
):
    """Serve reports and optionally run documentation monitoring."""
    token = os.environ.get("MDD_HUB_TOKEN")
    if host not in {"localhost", "127.0.0.1", "::1"} and not token:
        raise typer.BadParameter("Non-loopback binding requires MDD_HUB_TOKEN")
    try:
        watcher = Watcher(root, Evolution(root, mode), load(sources)) if watch_docs else None
        server = create_app(root, token, watcher, interval)
    except (ValueError, OSError) as exc:
        raise typer.BadParameter(str(exc)) from exc
    uvicorn.run(server, host=host, port=port)


@app.command()
def watch(
    root: Path = typer.Option(Path(".")),
    mode: str = "reviewer",
    sources: Path | None = None,
    interval: float = 3600,
    once: bool = False,
    publish: bool = False,
):
    """Scrape documentation; first cycle establishes baselines. --publish pushes a dedicated branch."""
    try:
        watcher = Watcher(root, Evolution(root, mode, publish), load(sources))
        if once:
            result = asyncio.run(watcher.cycle())
            typer.echo(json.dumps(result))
            if result["errors"]:
                raise typer.Exit(1)
        else:
            asyncio.run(watcher.run(interval, asyncio.Event()))
    except (ValueError, OSError) as exc:
        raise typer.BadParameter(str(exc)) from exc
    except KeyboardInterrupt:
        raise typer.Exit(130) from None


def main():
    logging.basicConfig(level=logging.INFO)
    app()


if __name__ == "__main__":
    main()

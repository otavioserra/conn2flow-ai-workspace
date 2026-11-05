"""Typer command surface for MDD Client."""

import asyncio
import json
import os
import sqlite3
import subprocess
from functools import wraps
from pathlib import Path

import httpx
import typer
from rich.console import Console
from rich.table import Table

from . import daemon as monitoring
from . import memory
from . import report as reporting
from .core import indexer
from .sync import customize, find_matrix, install_kits
from .sync import sync as synchronize

app = typer.Typer(no_args_is_help=True, help="Manage project memory and agent skills.")
console = Console()
meta_app = typer.Typer(no_args_is_help=True, help="Read and mutate memory frontmatter.")
app.add_typer(meta_app, name="meta")


def guarded(function):
    @wraps(function)
    def run(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except (ValueError, OSError, sqlite3.Error, subprocess.SubprocessError, httpx.HTTPError) as exc:
            console.print(f"[red]{type(exc).__name__}: {exc}[/red]", markup=False)
            raise typer.Exit(1) from exc
        except KeyboardInterrupt:
            raise typer.Exit(130) from None

    return run


@app.command()
@guarded
def init(
    path: Path = typer.Argument(Path(".")),
    project_type: str = typer.Option("software", "--type"),
    kits: bool = typer.Option(False, "--kits"),
    matrix: Path | None = typer.Option(None),
):
    """Create a complete, non-destructive memory tree."""
    if kits:
        matrix = find_matrix(matrix)
    created = memory.init(path, project_type)
    if kits:
        install_kits(path.resolve(), matrix.resolve())
    console.print(f"Initialized {path.resolve()} ({len(created)} new documents)")


@app.command()
@guarded
def sync(matrix: Path | None = typer.Option(None), path: Path = typer.Option(Path(".")), audit: bool = False,
         customization: str | None = typer.Option(None, "--customize"),
         local_sha256: str | None = None, seed_sha256: str | None = None):
    """Synchronize canonical skills through the official pipeline."""
    data = ({"status": "PASS", "customization": customize(path, find_matrix(matrix), customization, local_sha256, seed_sha256)}
            if customization else synchronize(path, find_matrix(matrix), audit))
    for item in data.get("translation_drift", []):
        typer.echo(f"[DRIFT-WARNING] Skill '{item['skill']}' em '{item['language']}' diverge da matriz PT-BR ({item['reason']}).", err=True)
    typer.echo(json.dumps(data, ensure_ascii=False))
    if data["status"] not in {"PASS", "DRIFT_WARNING"}:
        raise typer.Exit(1)


@app.command()
@guarded
def compact(path: Path = typer.Option(Path(".")), apply: bool = typer.Option(False, "--apply")):
    """Audit retention; --apply archives and splits oversized documents."""
    data = memory.compact(path, apply)
    typer.echo(json.dumps(data, ensure_ascii=False))
    if apply and not data.get("health", memory.status(path))["healthy"]:
        raise typer.Exit(1)


@app.command()
@guarded
def status(path: Path = typer.Option(Path(".")), as_json: bool = typer.Option(False, "--json")):
    """Display memory health (JSON output is available for integrations)."""
    data = memory.status(path)
    if as_json:
        typer.echo(json.dumps(data, ensure_ascii=False))
    else:
        table = Table(title=f"MDD — {data['project']}")
        table.add_column("Metric")
        table.add_column("Value")
        for name, value in data.items():
            if name != "project":
                table.add_row(name, str(value))
        console.print(table)
    if not data["healthy"]:
        raise typer.Exit(1)


@app.command()
@guarded
def report(path: Path = typer.Option(Path(".")), log: list[Path] = typer.Option([], "--log"), hub: str | None = None):
    """Export aggregate metrics and optionally submit to the Hub."""
    target, data = reporting.export(path.resolve(), log)
    console.print(str(target))
    if hub:
        typer.echo(json.dumps(asyncio.run(reporting.send(data, hub, os.environ.get("MDD_HUB_TOKEN")))))


@app.command("watch")
@app.command("daemon")
@guarded
def watch(
    path: Path = typer.Option(Path(".")), interval: float = 30, once: bool = False,
    mcp: bool = typer.Option(False, "--mcp"), transport: str = "stdio", port: int = 8765,
):
    """Monitor memory continuously; Ctrl+C stops; --once performs one cycle."""
    if mcp:
        if once:
            raise ValueError("--once cannot be combined with --mcp")
        from .mcp_server import serve

        asyncio.run(serve(path.resolve(), transport, port, monitor=True, interval=interval))
    else:
        asyncio.run(monitoring.watch(path.resolve(), interval, once, lambda data: typer.echo(json.dumps(data))))


@app.command("mcp")
@guarded
def mcp(path: Path = typer.Option(Path(".")), transport: str = "stdio", port: int = 8765):
    """Serve native MDD tools over stdio or loopback SSE."""
    from .mcp_server import serve

    asyncio.run(serve(path.resolve(), transport, port))


@app.command("index")
@guarded
def index(target_path: str | None = typer.Argument(None), path: Path = typer.Option(Path("."), "--path")):
    """Rebuild indexes; omitted target scans existing memory indexes."""
    for target in indexer.index(path, target_path):
        typer.echo(str(target))


@meta_app.command("get")
@guarded
def meta_get(
    target: str,
    field: str | None = typer.Argument(None),
    path: Path = typer.Option(Path("."), "--path"),
    as_json: bool = typer.Option(False, "--json"),
):
    """Read a document by path or unique ID; no field returns JSON."""
    value = indexer.get(path, target, field)
    typer.echo(json.dumps(value, ensure_ascii=False) if as_json or isinstance(value, dict) else value)


@meta_app.command("set")
@guarded
def meta_set(target: str, field: str, value: str, path: Path = typer.Option(Path("."), "--path")):
    """Atomically update a field and rebuild its directory index."""
    typer.echo(str(indexer.set_metadata(path, target, {field: value})))


db_app = typer.Typer(no_args_is_help=True, help="SQLite/FTS5 memory storage.")
app.add_typer(db_app, name="db")


def _db(workspace: Path):
    from .db import SQLiteMDDDriver
    return SQLiteMDDDriver(workspace.resolve() / "memory" / ".mdd.sqlite")


@db_app.command("sync")
@guarded
def db_sync(workspace: Path = Path("."), include_skills: bool = False):
    from .db import sync
    with _db(workspace) as driver:
        typer.echo(json.dumps(sync(workspace, driver, include_skills=include_skills)))


@db_app.command("query")
@guarded
def db_query(query: str, workspace: Path = Path("."), layer: str | None = None,
             target: str | None = None, limit: int = 10, as_json: bool = typer.Option(False, "--json")):
    with _db(workspace) as driver:
        rows = driver.query(query, layer=layer, target=target, limit=limit)
    typer.echo(json.dumps(rows, ensure_ascii=False) if as_json else "\n".join(f"{r['doc_id']}: {r['title']}\n{r['summary'] or ''}" for r in rows))


@db_app.command("graph")
@guarded
def db_graph(doc_id: str, workspace: Path = Path("."), as_json: bool = typer.Option(False, "--json")):
    with _db(workspace) as driver:
        rows = driver.graph(doc_id)
    typer.echo(json.dumps(rows) if as_json else "\n".join(f"{r['source_doc_id']} --{r['relation_type']}--> {r['target_doc_id']}" for r in rows))


@db_app.command("learn")
@guarded
def db_learn(layer: str = typer.Option(...), target: str = typer.Option("global"),
             doc_id: str = typer.Option(...), title: str = typer.Option(...),
             summary: str = "", content: str = typer.Option(...),
             workspace: Path = Path("."), write_md: bool = False):
    from .db import learn
    with _db(workspace) as driver:
        typer.echo(learn(driver, workspace.resolve(), dict(layer=layer, target=target, doc_id=doc_id,
                                                          title=title, summary=summary, content=content), write_md=write_md))


@db_app.command("export")
@guarded
def db_export(workspace: Path = Path("."), output: Path | None = None, target: str | None = None):
    with _db(workspace) as driver:
        data = "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in driver.export_records(target=target))
    if output:
        output.write_text(data, encoding="utf-8")
    else:
        typer.echo(data, nl=False)


@db_app.command("import")
@guarded
def db_import(source: Path, workspace: Path = Path(".")):
    with _db(workspace) as driver:
        typer.echo(driver.import_jsonl(source.read_text(encoding="utf-8")))


def main():
    app()


if __name__ == "__main__":
    main()

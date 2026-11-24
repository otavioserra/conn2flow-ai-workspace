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


@app.command("update")
@app.command()
@guarded
def sync(ctx: typer.Context, matrix: Path | None = typer.Option(None), path: Path = typer.Option(Path(".")), audit: bool = False,
         customization: str | None = typer.Option(None, "--customize"),
         local_sha256: str | None = None, seed_sha256: str | None = None,
         remote: bool = typer.Option(False, "--remote"), source_url: str | None = typer.Option(None, "--source-url"),
         cache_dir: Path | None = typer.Option(None, "--cache-dir"), domain: str | None = typer.Option(None, "--domain"),
         check_only: bool = typer.Option(False, "--check-only"), apply: bool = typer.Option(False, "--apply"),
         as_json: bool = typer.Option(False, "--json")):
    """Synchronize canonical skills. The update alias uses the remote matrix."""
    if remote or ctx.info_name == "update":
        from .remote_sync import SOURCE_URL, remote_sync

        if matrix or customization or audit or local_sha256 or seed_sha256 or (check_only and apply):
            raise ValueError("Remote sync cannot combine local options or --check-only and --apply")
        data = remote_sync(path, source_url=source_url or SOURCE_URL, cache_dir=cache_dir,
                           domain=domain or "auto", check_only=check_only)
        typer.echo(json.dumps(data, ensure_ascii=False))
        return
    if source_url or cache_dir or domain or check_only:
        raise ValueError("Remote options require --remote or mdd update")
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


feedback_app = typer.Typer(no_args_is_help=True, help="Federated skill-feedback inbox (ARCH-018 Phase 2).")
app.add_typer(feedback_app, name="feedback")


def _feedback_root(path: Path, matrix: Path | None, scope: str, github: bool) -> Path | None:
    from . import feedback

    try:
        return feedback.resolve_root(path, matrix, scope)
    except ValueError:
        if github and scope == "global" and matrix is None:
            return None  # GitHub-only fallback when the matrix disk is unreachable.
        raise


@feedback_app.command("submit")
@guarded
def feedback_submit(
    persona: str = typer.Option(..., help="architect|executor|reviewer|curator|optimizer"),
    skill: str = typer.Option(...), kind: str = typer.Option(..., help="gap|bug|bloat|proposal|learning"),
    severity: str = typer.Option(..., help="high|medium|low"), summary: str = typer.Option(...),
    evidence: str = typer.Option(...), proposal: str = "", repo: str | None = None,
    req: str = typer.Option("", "--req"), batch: str = "", scope: str = typer.Option("global", help="global|local"),
    matrix: Path | None = typer.Option(None), path: Path = typer.Option(Path("."), "--path"),
    github: bool = typer.Option(False, "--github"), github_repo: str | None = typer.Option(None, "--github-repo"),
    force_ready: bool = typer.Option(False, "--force-ready", help="Skip the first-occurrence QUARANTINE (medium/low)"),
    as_json: bool = typer.Option(False, "--json"),
):
    """Record one structured FB-XXX feedback (inbox + optional GitHub Issue)."""
    from . import feedback

    root = _feedback_root(path, matrix, scope, github)
    data = dict(persona=persona, skill=skill, kind=kind, severity=severity, summary=summary, evidence=evidence,
                proposal=proposal, repo=repo or path.resolve().name, request=req, batch=batch, scope=scope)
    result = feedback.submit(root, data, github=github, github_repo=github_repo, force_ready=force_ready)
    typer.echo(json.dumps(result, ensure_ascii=False) if as_json else
               f"{result['id'] or 'GitHub-only'}: {result['status']} {result['path'] or ''} {result['github_issue'] or ''}".strip())
    if result.get("github_error"):
        typer.echo(f"[GITHUB-ERROR] {result['github_error']}", err=True)
        raise typer.Exit(1)


@feedback_app.command("list")
@guarded
def feedback_list(
    status: str | None = None, verdict: str | None = None, skill: str | None = None, repo: str | None = None,
    severity: str | None = None, include_github: bool = typer.Option(False, "--include-github"),
    github_repo: str | None = typer.Option(None, "--github-repo"), scope: str = "global",
    matrix: Path | None = typer.Option(None), path: Path = typer.Option(Path("."), "--path"),
    as_json: bool = typer.Option(False, "--json"),
):
    """List inbox feedback filtered by status, verdict, skill, repo or severity."""
    from . import feedback

    root = _feedback_root(path, matrix, scope, include_github)
    rows = feedback.list_feedback(root, dict(status=status, verdict=verdict, skill=skill, repo=repo, severity=severity),
                                  include_github=include_github, github_repo=github_repo)
    if as_json:
        typer.echo(json.dumps(rows, ensure_ascii=False))
        return
    table = Table(title=f"Skill feedback ({len(rows)})")
    for column in ("ID", "Status", "Verdict", "Skill", "Kind", "Severity", "Recurrence", "Repo", "Summary"):
        table.add_column(column)
    for row in rows:
        table.add_row(*(str(row.get(k, "")) for k in ("id", "status", "verdict", "skill", "kind", "severity", "recurrence", "repo", "summary_short")))
    console.print(table)


@feedback_app.command("triage")
@guarded
def feedback_triage(
    feedback_id: str, verdict: str = typer.Option(..., help="ACCEPT|NEEDS_EVIDENCE|QUARANTINE|REJECT|LOCAL_ONLY"),
    reason: str = typer.Option(...), reviewer: str = "curator", date: str | None = None, scope: str = "global",
    matrix: Path | None = typer.Option(None), path: Path = typer.Option(Path("."), "--path"),
    as_json: bool = typer.Option(False, "--json"),
):
    """Apply a Tribunal-of-4-Filters verdict to one FB-XXX record."""
    from . import feedback

    result = feedback.triage(feedback.resolve_root(path, matrix, scope), feedback_id, verdict,
                             reason=reason, reviewer=reviewer, today=date)
    typer.echo(json.dumps(result, ensure_ascii=False) if as_json else f"{result['id']}: {result['verdict']} ({result['path']})")


@app.command("eval")
@guarded
def skill_eval(
    matrix: Path | None = typer.Option(None, help="Matrix root (default: MDD_MATRIX or this workspace)"),
    skill: str | None = typer.Option(None, "--skill", help="Only the scenarios of one skill"),
    provider: str = typer.Option("deterministic", "--provider", help="Evaluation provider (offline default: deterministic)"),
    scenarios: Path | None = typer.Option(None, "--scenarios", help="Scenario directory (default: tools/mdd-client/evals/skills)"),
    as_json: bool = typer.Option(False, "--json"),
):
    """Run skill regression evals; exit 1 on EVAL-FAIL."""
    from . import skill_eval as evals

    data = evals.run(find_matrix(matrix), skill=skill, provider=provider, scenarios_dir=scenarios)
    if as_json:
        typer.echo(json.dumps(data, ensure_ascii=False))
    else:
        table = Table(title=f"mdd eval — {data['status']} ({data['passed']}/{data['scenarios']}, provider {data['provider']})")
        for column in ("ID", "Skill", "Status", "Lines/Budget", "Failures"):
            table.add_column(column)
        for row in data["results"]:
            metrics = row["metrics"]
            table.add_row(row["id"], row["skill"], row["status"], f"{metrics['lines']}/{metrics['budget']} {metrics['budget_state']}",
                          "; ".join(row["failures"]) or "—")
        console.print(table)
        typer.echo(data["status"])
    if data["status"] != "EVAL-PASS":
        raise typer.Exit(1)


@app.command("bootstrap")
@guarded
def bootstrap_command(
    path: Path = typer.Option(Path("."), "--path", help="Project folder to initialize"),
    domain: str = typer.Option("auto", "--domain", help="auto or any <id> discovered in domains/"),
    list_domains: bool = typer.Option(False, "--list-domains", help="List the discovered domains and exit"),
    kits: str | None = typer.Option(None, "--kits", help="Comma list: gemini,claude,codex,cursor,copilot (default: all)"),
    matrix: Path | None = typer.Option(None, help="Matrix root with domains/ and .gemini/skills/"),
    domains_dir: Path | None = typer.Option(None, "--domains-dir", help="Alternative domains/ catalog"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Detect and plan without writing"),
    with_ci_sync: bool = typer.Option(False, "--with-ci-sync", help="Install the optional weekly GitHub workflow"),
    as_json: bool = typer.Option(False, "--json"),
):
    """Install MDD (memory/, domain skills, local project guide) in any project without overwriting files."""
    from . import bootstrap as boot

    if list_domains:
        data = boot.list_domains(boot.find_domains_dir(matrix, domains_dir), path)
        if as_json:
            typer.echo(json.dumps(data, ensure_ascii=False))
            return
        table = Table(title=f"MDD domains — {data['domains_dir']}")
        for column in ("ID", "Name", "Skills", "Local guide"):
            table.add_column(column)
        for item in data["domains"]:
            table.add_row(item["id"], item["name"], item["skills_mode"], "yes" if item["generate_local_project_skill"] else "no")
        console.print(table)
        if data.get("detected"):
            detected = data["detected"]
            typer.echo(f"auto -> {detected['id']} ({', '.join(detected['evidence']) or 'fallback'})")
        for error in data["errors"]:
            typer.echo(f"invalid domain {error['domain']}: {error['error']}", err=True)
        return
    data = boot.bootstrap(path, domain, kits=boot.parse_kits(kits), matrix=matrix, domains_dir=domains_dir,
                          dry_run=dry_run, with_ci_sync=with_ci_sync)
    if as_json:
        typer.echo(json.dumps(data, ensure_ascii=False))
        return
    stacks = ", ".join(s["label"] for s in data["stack"]["stacks"]) or "none"
    typer.echo(f"Domain: {data['domain']} (requested {data['requested_domain']}) · stack: {stacks}")
    if with_ci_sync:
        typer.echo(f"CI sync: {data['ci_sync']['path']} ({data['ci_sync']['status']})")
    if dry_run:
        typer.echo(f"Planned skills: {len(data['skills']['planned'])} per kit · kits: {','.join(data['kits'])}")
        return
    typer.echo(f"memory/: {len(data['memory']['created'])} new item(s){' (existing memory preserved)' if data['memory']['preserved'] else ''}")
    typer.echo(f"Skills: {len(data['skills']['installed'])} installed, {len(data['skills']['preserved'])} preserved")
    for guide in data["local_skill"]["created"]:
        typer.echo(f"Local project skill: {guide}")


def main():
    app()


if __name__ == "__main__":
    main()

"""Reproduce installed CLI checks and optionally capture official source baselines.

Usage: python tools/verify_mdd.py --output temp/mdd-smoke.json [--live-docs]
Requires both packages installed. Does not mutate the workspace's memory.
"""

import argparse
import ast
import json
import os
import platform
import subprocess
import sys
import tempfile
from datetime import UTC, datetime
from importlib.metadata import version
from pathlib import Path


def verify(live_docs: bool = False) -> dict:
    matrix = Path(__file__).resolve().parents[1]
    steps = []
    with tempfile.TemporaryDirectory(prefix="mdd-smoke-") as directory:
        root = Path(directory) / "example"

        def invoke(module: str, *args: str):
            result = subprocess.run(
                [sys.executable, "-m", module, *args],
                capture_output=True,
                text=True,
                encoding="utf-8",
                env={**os.environ, "PYTHONIOENCODING": "utf-8", "NO_COLOR": "1"},
                timeout=180,
            )
            if result.returncode:
                raise RuntimeError(f"CLI failed: {module} {args}: {result.stderr} {result.stdout}")
            output = result.stdout.strip()
            steps.append({"module": module, "command": args[0], "exit_code": result.returncode})
            return output

        invoke("mdd_client.cli", "--help")
        invoke("mdd_hub.cli", "--help")
        invoke("mdd_client.cli", "init", str(root), "--type", "general", "--kits", "--matrix", str(matrix))
        health = json.loads(invoke("mdd_client.cli", "status", "--path", str(root), "--json"))
        assert health["healthy"]
        synced = json.loads(invoke("mdd_client.cli", "sync", "--path", str(root), "--matrix", str(matrix)))
        if synced["escritos"] or synced["rules_written"]:
            raise AssertionError("Second sync must be idempotent")
        for number in range(12):
            (root / "memory/reports" / f"event-{number:02}.md").write_text(f"# Event {number}\n", encoding="utf-8")
        plan = json.loads(invoke("mdd_client.cli", "compact", "--path", str(root)))
        assert len(plan["archive"]) == 2
        archived = json.loads(invoke("mdd_client.cli", "compact", "--path", str(root), "--apply"))
        assert archived["health"]["healthy"]
        invoke("mdd_client.cli", "report", "--path", str(root))
        invoke("mdd_client.cli", "daemon", "--path", str(root), "--once")
        invoke("mdd_client.cli", "watch", "--path", str(root), "--once")
        sources = []
        if live_docs:
            hub = Path(directory) / "hub"
            live = json.loads(invoke("mdd_hub.cli", "watch", "--root", str(hub), "--once"))
            assert live["baselines"] == 7 and not live["errors"]
            for file in sorted((hub / "memory/raw/archive/watcher-state").glob("*.json")):
                state = json.loads(file.read_text(encoding="utf-8"))
                sources.append(
                    {
                        "source": file.stem,
                        "url": state["url"],
                        "digest": state["digest"],
                        "normalized_characters": len(state["text"]),
                        "baseline": True,
                    }
                )
        code = [*matrix.glob("tools/mdd-client/src/**/*.py"), *matrix.glob("tools/mdd-hub/src/**/*.py")]
        for path in code:
            ast.parse(path.read_text(encoding="utf-8"), feature_version=(3, 11))
        return {
            "status": "PASS",
            "tested_at": datetime.now(UTC).isoformat(),
            "python": platform.python_version(),
            "platform": platform.system(),
            "versions": {
                name: version(name)
                for name in (
                    "mdd-client",
                    "mdd-hub",
                    "typer",
                    "rich",
                    "fastapi",
                    "starlette",
                    "uvicorn",
                    "httpx",
                    "pytest",
                )
            },
            "cli_checks": steps,
            "canonical_skills": synced["skills_canonicas"],
            "kits": synced["alvos"],
            "archive_count": len(plan["archive"]),
            "python311_syntax_files": len(code),
            "live_sources": sources,
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--live-docs", action="store_true")
    args = parser.parse_args()
    result = verify(args.live_docs)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "status": result["status"],
                "cli_checks": len(result["cli_checks"]),
                "live_sources": len(result["live_sources"]),
            }
        )
    )

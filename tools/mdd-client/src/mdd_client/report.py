"""Explicit report export with aggregate-only log collection."""

import json
import re
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

import httpx

from .memory import status, update_index
from .storage import contained, lock, write


def collect(root: Path, logs: list[Path] | None = None) -> dict:
    counts = {"errors": 0, "warnings": 0, "timeouts": 0}
    for path in logs or []:
        path = contained(root, path if path.is_absolute() else root / path)
        if path.stat().st_size > 5 * 1024 * 1024:
            raise ValueError("Log exceeds the 5 MiB collection limit")
        text = path.read_text(encoding="utf-8", errors="replace")
        for name, pattern in (
            ("errors", r"\b(error|failed|failure)\b"),
            ("warnings", r"\bwarning\b"),
            ("timeouts", r"\b(timeout|timed out)\b"),
        ):
            counts[name] += len(re.findall(pattern, text, flags=re.IGNORECASE))
    return {
        "schema_version": 1,
        "report_id": str(uuid4()),
        "project": root.resolve().name,
        "created_at": datetime.now(UTC).isoformat(),
        "health": status(root),
        "friction": counts,
        "lessons": [],
    }


def export(root: Path, logs: list[Path] | None = None) -> tuple[Path, dict]:
    with lock(root):
        data = collect(root, logs)
        path = root / "memory/reports" / f"report-{data['report_id']}.json"
        write(root, path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        update_index(root, path.parent)
        return path, data


async def send(data: dict, hub: str, token: str | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(hub.rstrip("/") + "/api/v1/reports", json=data, headers=headers)
        response.raise_for_status()
        return response.json()

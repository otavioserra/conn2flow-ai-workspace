"""FastAPI report ingestion with idempotence and ecosystem telemetry."""

import asyncio
import json
import secrets
from collections import Counter
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

from .models import Report
from .storage import exclusive, safe, store


class ReportRepository:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.directory = safe(self.root, self.root / "memory/reports/clients")

    def reports(self) -> list[dict]:
        result = []
        for path in sorted(self.directory.glob("*.json")):
            if path.name == "consolidated.json":
                continue
            safe(self.root, path)
            result.append(json.loads(path.read_text(encoding="utf-8")))
        return result

    def ingest(self, report: Report) -> tuple[dict, bool]:
        data = report.model_dump(mode="json")
        with exclusive(self.root, "hub-reports"):
            path = safe(self.root, self.directory / f"{report.report_id}.json")
            duplicate = path.exists()
            if duplicate and json.loads(path.read_text(encoding="utf-8")) != data:
                raise ValueError("report_id is already associated with different content")
            if not duplicate:
                store(self.root, path, data)
            reports = self.reports()
            counts = Counter(lesson for item in reports for lesson in item["lessons"])
            consolidated = {
                "reports": len(reports),
                "projects": len({item["project"] for item in reports}),
                "friction": {
                    name: sum(item["friction"][name] for item in reports) for name in ("errors", "warnings", "timeouts")
                },
                "lessons": [{"text": text, "occurrences": count} for text, count in sorted(counts.items())],
            }
            store(
                self.root,
                self.root / "memory/reports/clients/index.md",
                "# Client reports\n\n"
                + "\n".join(f"- [{item['report_id']}]({item['report_id']}.json)" for item in reports)
                + "\n",
            )
            store(self.root, self.root / "memory/reports/clients/consolidated.json", consolidated)
            return {"report_id": str(report.report_id), "duplicate": duplicate}, duplicate

    def telemetry(self) -> dict:
        # consolidated.json is infrastructure, not an ingested report.
        reports = [r for r in self.reports() if "report_id" in r]
        return {
            "reports": len(reports),
            "projects": len({r["project"] for r in reports}),
            "unhealthy": sum(not r["health"]["healthy"] for r in reports),
        }


def create_app(root: Path, token: str | None = None, watcher=None, interval: float = 3600) -> FastAPI:
    repository = ReportRepository(root)
    if interval < 1:
        raise ValueError("Watcher interval must be at least 1 second")

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        stop = asyncio.Event()
        task = asyncio.create_task(watcher.run(interval, stop)) if watcher else None
        try:
            yield
        finally:
            stop.set()
            if task:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    app = FastAPI(title="MDD Hub", version="0.1.0", lifespan=lifespan)
    app.state.repository = repository

    @app.middleware("http")
    async def bounded_body(request: Request, call_next):
        if request.method == "POST":
            length = 0
            pieces = []
            async for chunk in request.stream():
                length += len(chunk)
                if length > 256 * 1024:
                    return JSONResponse(status_code=413, content={"detail": "Report exceeds 256 KiB"})
                pieces.append(chunk)
            request._body = b"".join(pieces)
        return await call_next(request)

    async def authorize(authorization: str | None = Header(default=None)):
        if token and (not authorization or not secrets.compare_digest(authorization, f"Bearer {token}")):
            raise HTTPException(status_code=401, detail="Invalid bearer token")

    @app.post("/api/v1/reports", dependencies=[Depends(authorize)])
    async def ingest(report: Report):
        try:
            result, duplicate = await asyncio.to_thread(repository.ingest, report)
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        return JSONResponse(result, status_code=200 if duplicate else 201)

    @app.get("/api/v1/status", dependencies=[Depends(authorize)])
    async def status():
        metrics = await asyncio.to_thread(repository.telemetry)
        return {
            "status": "ok",
            "schema_version": 1,
            **metrics,
            "watcher": watcher.health if watcher else {"enabled": False},
        }

    return app

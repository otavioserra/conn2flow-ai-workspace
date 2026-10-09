from datetime import UTC, datetime
from uuid import uuid4

import pytest


@pytest.fixture
def report_data():
    return {
        "schema_version": 1,
        "report_id": str(uuid4()),
        "project": "example",
        "created_at": datetime.now(UTC).isoformat(),
        "health": {
            "project": "example",
            "active_files": 4,
            "active_bytes": 100,
            "windows": {"reports": 0},
            "oversized": [],
            "near_limit": [],
            "missing": [],
            "healthy": True,
        },
        "friction": {"errors": 2, "warnings": 1, "timeouts": 0},
        "lessons": ["Explicit git paths"],
    }


@pytest.fixture
def change():
    return {
        "source": "codex",
        "url": "https://example.com/docs",
        "digest": "a" * 64,
        "previous_digest": "b" * 64,
        "detected_at": datetime.now(UTC).isoformat(),
        "changes": {"flags": ["--new"], "added_lines": ["New --new command"]},
    }

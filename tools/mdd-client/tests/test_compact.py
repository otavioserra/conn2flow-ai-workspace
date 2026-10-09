import hashlib
import os

import pytest
from mdd_client.memory import LIMIT, compact, init


def populate(tmp_path, area="reports", count=12):
    init(tmp_path)
    directory = tmp_path / "memory" / area
    for number in range(count):
        path = directory / f"item-{number:02}.md"
        path.write_bytes(f"# Item {number}\r\n\r\nExact original é\r\n".encode())
        os.utime(path, (number + 1, number + 1))
    return directory


def test_window_dual_archive_and_links(tmp_path):
    directory = populate(tmp_path)
    original = (directory / "item-00.md").read_bytes()
    pointer = tmp_path / "memory/handoffs/example.md"
    pointer.write_text(
        "[old](../reports/item-00.md#anchor) [external](https://example.com/item-00.md) [sibling](../../../other/item-00.md)",
        encoding="utf-8",
    )
    assert len(compact(tmp_path)["archive"]) == 2
    assert (directory / "item-00.md").exists()
    result = compact(tmp_path, True)
    assert result["health"]["windows"]["reports"] == 10
    archived = directory / "archive/original/item-00.md"
    assert archived.read_bytes() == original
    summary = next((directory / "archive/compacted").glob("item-00-*.md"))
    assert hashlib.sha256(original).hexdigest() in summary.read_text()
    text = pointer.read_text()
    assert "../reports/archive/original/item-00.md#anchor" in text
    assert "https://example.com/item-00.md" in text
    assert "../../../other/item-00.md" in text
    assert not compact(tmp_path, True)["archive"]


@pytest.mark.parametrize("size", [LIMIT, LIMIT + 1000, 200000])
def test_split_keeps_all_original_bytes(tmp_path, size):
    init(tmp_path)
    path = tmp_path / "memory/sessions/large.md"
    data = ("# Content é\r\n" + "x" * size).encode()
    path.write_bytes(data)
    result = compact(tmp_path, True)
    assert result["health"]["healthy"]
    archive = path.parent / "archive/original"
    assert next(archive.glob("large-*.md")).read_bytes() == data
    pieces = sorted((path.parent / "archive/compacted").glob("large-*-part-*.md"))
    assert b"".join(p.read_bytes() for p in pieces) == data
    assert path.stat().st_size < LIMIT
    assert not compact(tmp_path)["split"]


def test_current_and_chief_protected(tmp_path):
    directory = populate(tmp_path, "human-requests")
    first = directory / "item-00.md"
    first.rename(directory / "req-001.md")
    (directory / "CURRENT.md").write_text("Active req-001 and BATCH-003", encoding="utf-8")
    (tmp_path / "memory/ENGINEERING-MEMORY-CHIEF.md").write_text("x" * LIMIT)
    plan = compact(tmp_path, True)
    assert (directory / "req-001.md").exists()
    assert "memory/ENGINEERING-MEMORY-CHIEF.md" in plan["protected"]
    assert not plan["health"]["healthy"]


def test_collision_aborts_without_removing_source(tmp_path):
    directory = populate(tmp_path)
    destination = directory / "archive/original/item-00.md"
    destination.write_text("different archive", encoding="utf-8")
    with pytest.raises(ValueError, match="collision"):
        compact(tmp_path, True)
    assert (directory / "item-00.md").exists()
    assert destination.read_text() == "different archive"


def test_healthy_memory_remains_identical(tmp_path):
    init(tmp_path)
    before = {p: p.read_bytes() for p in tmp_path.rglob("*.md")}
    result = compact(tmp_path, True)
    assert not result["archive"] and not result["split"]
    assert before == {p: p.read_bytes() for p in tmp_path.rglob("*.md")}

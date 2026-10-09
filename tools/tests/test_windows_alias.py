"""Exercise canonical containment on both supported platforms."""

import ctypes
import os
from pathlib import Path

import pytest
from mdd_client.storage import contained
from mdd_hub.storage import safe


@pytest.mark.parametrize("validate", [contained, safe], ids=["client", "hub"])
def test_equivalent_path_spelling_is_accepted(tmp_path, validate):
    root = tmp_path / "long project directory"
    root.mkdir()
    if os.name == "nt":
        buffer = ctypes.create_unicode_buffer(32768)
        length = ctypes.windll.kernel32.GetShortPathNameW(str(root), buffer, len(buffer))
        assert length, "GetShortPathNameW failed"
        alias = Path(buffer.value)
    else:
        alias = root / ".." / root.name
    destination = alias / "memory/nested/new.md"
    assert validate(root, destination).resolve() == root / "memory/nested/new.md"
    with pytest.raises(ValueError):
        validate(root, alias / "../outside.md")

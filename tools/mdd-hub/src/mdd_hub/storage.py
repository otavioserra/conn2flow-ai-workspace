"""Local atomic persistence with containment checks."""

import json
import os
import tempfile
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path


def safe(root: Path, path: Path) -> Path:
    root = root.resolve()
    absolute = Path(os.path.abspath(path))
    if not absolute.is_relative_to(root) or not absolute.resolve().is_relative_to(root):
        raise ValueError("Storage path escapes configured root")
    for node in (absolute, *absolute.parents):
        if node == root:
            break
        if node.is_symlink() or getattr(os.path, "isjunction", lambda _: False)(node):
            raise ValueError("Storage cannot traverse a linked path")
    return absolute


def store(root: Path, path: Path, value: dict | str) -> None:
    path = safe(root, path)
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(value, indent=2, ensure_ascii=False) + "\n" if isinstance(value, dict) else value
    descriptor, name = tempfile.mkstemp(prefix=".mdd-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def exclusive(root: Path, name: str) -> Iterator[None]:
    path = safe(root, root / "memory" / f".{name}.lock")
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as exc:
        raise ValueError(f"Another {name} operation is active") from exc
    os.close(descriptor)
    try:
        yield
    finally:
        path.unlink()

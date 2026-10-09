"""Contained, atomic filesystem operations; no traversal through links."""

import os
import tempfile
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path


def contained(root: Path, path: Path) -> Path:
    root = root.resolve()
    absolute = Path(os.path.abspath(path))
    # Windows may expose the same directory through its 8.3 alias (RUNNER~1).
    # Compare canonical paths; retain the supplied chain for link inspection.
    if not absolute.resolve().is_relative_to(root):
        raise ValueError(f"Path escapes project: {path}")
    for node in (absolute, *absolute.parents):
        if node.resolve() == root:
            break
        if node.is_symlink() or getattr(os.path, "isjunction", lambda _: False)(node):
            raise ValueError(f"Linked path is not writable: {node}")
    return absolute


def write(root: Path, path: Path, content: str | bytes) -> None:
    path = contained(root, path)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = content.encode("utf-8") if isinstance(content, str) else content
    fd, name = tempfile.mkstemp(prefix=".mdd-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def lock(root: Path) -> Iterator[None]:
    """Exclusive cooperative lock. Stale locks require explicit operator removal."""
    root = root.resolve()
    path = contained(root, root / "memory/.mdd.lock")
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as exc:
        raise ValueError("Another MDD mutation owns memory/.mdd.lock") from exc
    try:
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        yield
    finally:
        path.unlink()

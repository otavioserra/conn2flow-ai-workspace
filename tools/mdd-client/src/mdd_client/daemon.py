"""Foreground asynchronous service suitable for OS service managers."""

import asyncio
import json
from collections.abc import Callable
from pathlib import Path

from .memory import status


async def watch(
    root: Path,
    interval: float = 30,
    once: bool = False,
    emit: Callable[[dict], None] = print,
    stop: asyncio.Event | None = None,
) -> None:
    if interval < 0.1:
        raise ValueError("Interval must be at least 0.1 seconds")
    stop = stop or asyncio.Event()
    last = None
    while not stop.is_set():
        health = await asyncio.to_thread(status, root)
        signature = json.dumps(health, sort_keys=True)
        if signature != last:
            emit(health)
            last = signature
        if once:
            return
        try:
            await asyncio.wait_for(stop.wait(), timeout=interval)
        except TimeoutError:
            pass

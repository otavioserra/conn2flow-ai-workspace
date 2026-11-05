"""Measure incremental engine work independently of Python/Typer startup."""
import json
import sys
from pathlib import Path
from time import perf_counter

from mdd_client.db import SQLiteMDDDriver, sync

repo=Path(sys.argv[1]).resolve()
with SQLiteMDDDriver(repo/'memory/.mdd.sqlite') as driver:
    start=perf_counter()
    result=sync(repo,driver)
    print(json.dumps({**result,'engine_ms':round((perf_counter()-start)*1000,2)}))

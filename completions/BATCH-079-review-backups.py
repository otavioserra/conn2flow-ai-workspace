"""Independent read-only verification of BATCH-079 ignored-file archives."""
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parent
results = []
for row in json.loads((root / 'BATCH-079-preserved-ignored.json').read_text()):
    archive = Path(row['archive'])
    manifest = json.loads(archive.with_name(archive.stem + '-manifest.json').read_text())
    assert hashlib.sha256(archive.read_bytes()).hexdigest() == row['archive_sha256']
    with zipfile.ZipFile(archive) as saved:
        assert saved.testzip() is None
        assert set(saved.namelist()) == set(manifest)
        for name, expected in manifest.items():
            assert hashlib.sha256(saved.read(name)).hexdigest() == expected
    assert len(manifest) == row['ignored_files_preserved']
    results.append({'worktree': row['worktree'], 'verified_files': len(manifest), 'status': 'PASS'})
print(json.dumps(results))

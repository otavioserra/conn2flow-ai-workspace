"""Preserve ignored physical files of the two clean integrated cleanup candidates."""
from pathlib import Path
import hashlib
import json
import os
import stat
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT.parent.resolve()
CORE = BASE / 'conn2flow'

def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args])

private = CORE / '.git/batch079-preserved'
private.mkdir(exist_ok=True)
rows = []
for name in ['conn2flow-req277', 'conn2flow-req284']:
    target = BASE / name
    assert target.parent.resolve() == BASE
    assert not git(target, 'status', '--porcelain=v1', '--untracked-files=all').strip()
    subprocess.run(['git', '-C', str(CORE), 'merge-base', '--is-ancestor', git(target, 'rev-parse', 'HEAD').decode().strip(), 'main'], check=True)
    ignored = git(target, '-c', 'core.quotepath=false', 'ls-files', '--others', '--ignored', '--exclude-standard', '-z').decode('utf-8').split('\0')
    archive = private / (name + '.zip')
    assert not archive.exists(), 'Do not overwrite earlier backups'
    hashes = {}
    with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED) as output:
        for relative in ignored:
            if not relative:
                continue
            file = target / relative
            linked = False
            for parent in [file, *file.parents]:
                if parent == target:
                    break
                if parent.lstat().st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
                    linked = True
                    break
            if linked:
                continue
            assert file.resolve().is_relative_to(target.resolve())
            data = file.read_bytes()
            hashes[relative] = hashlib.sha256(data).hexdigest()
            output.writestr(relative, data)
    with zipfile.ZipFile(archive) as verify:
        assert verify.testzip() is None
        assert set(verify.namelist()) == set(hashes)
        for relative, sha in hashes.items():
            assert hashlib.sha256(verify.read(relative)).hexdigest() == sha
    (private / (name + '-manifest.json')).write_text(json.dumps(hashes, indent=2), encoding='utf-8')
    rows.append({'worktree': name, 'head': git(target, 'rev-parse', 'HEAD').decode().strip(),
                 'ignored_files_preserved': len(hashes), 'archive': str(archive),
                 'archive_sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'verified': True})
    print(name, 'ignored files preserved and verified:', len(hashes), flush=True)
(ROOT / 'completions/BATCH-079-preserved-ignored.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')

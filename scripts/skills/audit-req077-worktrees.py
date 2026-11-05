"""Read-only inventory of the seventeen explicitly authorized cleanup targets."""
import json
import os
from pathlib import Path
import stat
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT.parent.resolve()
TARGETS = {
    'conn2flow': ['covers-267', 'covers-267-v31', 'lab219', 'req203', 'req223', 'req224', 'req225', 'req232', 'req256', 'req277', 'req284'],
    'conn2flow-site': ['covers-123', 'covers-123-v31', 'req077', 'req108', 'req221', 'req225'],
}

def git(repo, *args):
    p = subprocess.run(['git', '-C', str(repo), *args], capture_output=True, encoding='utf-8', errors='replace')
    return {'code': p.returncode, 'stdout': p.stdout.strip(), 'stderr': p.stderr.strip()}

def inventory(path):
    links, files, size = [], 0, 0
    pending = [path]
    while pending:
        current = pending.pop()
        for entry in os.scandir(current):
            info = entry.stat(follow_symlinks=False)
            if info.st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT:
                links.append({'path': entry.path, 'target': os.readlink(entry.path)})
            elif entry.is_dir(follow_symlinks=False):
                pending.append(Path(entry.path))
            else:
                files += 1
                size += info.st_size
    return {'reparse_points': links, 'files': files, 'bytes': size}

rows = []
for repo, suffixes in TARGETS.items():
    registry = git(BASE / repo, 'worktree', 'list', '--porcelain')['stdout']
    for suffix in suffixes:
        target = BASE / f'{repo}-{suffix}'
        assert target.parent.resolve() == BASE and target != BASE / repo
        row = {'repo': repo, 'path': str(target), 'exists': target.exists(), 'registered': 'worktree ' + target.as_posix() + '\n' in registry + '\n'}
        if target.exists():
            row.update(inventory(target))
            if row['registered']:
                for label, args in {
                    'head': ('rev-parse', 'HEAD'),
                    'status': ('status', '--porcelain=v1', '--untracked-files=all'),
                    'diff_main': ('diff', '--ignore-space-at-eol', '--name-only', 'main', '--'),
                    'unmerged_commits': ('log', '--oneline', 'main..HEAD'),
                    'ignored': ('ls-files', '--others', '--ignored', '--exclude-standard'),
                }.items():
                    row[label] = git(target, *args)
                row['safe_to_remove'] = all(row[k]['code'] == 0 and not row[k]['stdout'] for k in ['status', 'diff_main', 'unmerged_commits', 'ignored']) and not row['reparse_points']
            else:
                row['safe_to_remove'] = row['files'] == 0 and not row['reparse_points']
        else:
            row['safe_to_remove'] = False
        rows.append(row)
        print(target.name, 'absent' if not row['exists'] else f"files={row['files']} safe={row['safe_to_remove']} links={len(row['reparse_points'])}", flush=True)
(ROOT / 'completions/BATCH-079-worktree-audit.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

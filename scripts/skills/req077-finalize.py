"""Finish REQ-077 instruction propagation and record truthful evidence."""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
policy = (ROOT / 'AGENTS.md').read_text(encoding='utf-8').split('## REQ-077 —')[1]
policy = '## REQ-077 —' + policy
changed = []
for repo in ['conn2flow', 'conn2flow-site', 'lumix', 'transformamp', 'conn2flow-home']:
    base = ROOT.parent / repo
    paths = [base / name for name in ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md']]
    for directory in ['.gemini/rules', '.gemini/agents', '.claude/hooks', '.claude/agents', '.codex/agents']:
        folder = base / directory
        if folder.exists():
            paths.extend(p for p in folder.rglob('*') if p.is_file() and p.suffix in {'.md', '.json', '.ps1', '.sh'})
    for p in paths:
        if not p.exists():
            continue
        raw = p.read_bytes()
        text = raw.decode('utf-8-sig').replace('\r\n', '\n')
        old = text
        count = text.count('project:update-all <')
        if count:
            assert count == text.count('project:update-all <')
            text = text.replace('project:update-all <', 'project:deploy <')
        text = text.replace('ou c2f project:update-all)', 'ou c2f project:deploy <id>)')
        if p.suffix == '.md' and '## REQ-077 —' not in text and (text != old or p.parent == base):
            text = text.rstrip() + '\n\n' + policy
        if text != old:
            newline = '\r\n' if b'\r\n' in raw else '\n'
            p.write_bytes((b'\xef\xbb\xbf' if raw.startswith(b'\xef\xbb\xbf') else b'') + text.replace('\n', newline).encode('utf-8'))
            changed.append(str(p))

p = ROOT / 'memory/process/STARTER-PROMPTS.md'
raw = p.read_bytes()
text = raw.decode('utf-8')
old = 'ou project:sync-core <id> --skip-css seguido de project:sync-db <id> --core-resources;'
assert text.count(old) == 1
text = text.replace(old, '; Core isolado usa seu pipeline;')
p.write_bytes(text.encode('utf-8'))

# The deploy wrapper does not pass skip-css; do not describe its build stages as update-all stages.
for name in ['c2f-executor-agent', 'c2f-project-pipeline-and-tasks', 'c2f-resources-system']:
    p = ROOT / '.gemini/skills' / name / 'SKILL.md'
    raw = p.read_bytes()
    text = raw.decode('utf-8')
    text += '\nNota REQ-077: `--skip-css` refere-se aos comandos que a implementam (`manager:update-all` e à exceção `project:update-all`). O wrapper `ProjectDeployCommand.php` repassa somente projeto e `--contents`; não prescreva essa flag a `project:deploy`.\n'
    p.write_bytes(text.encode('utf-8'))

rows = json.loads((ROOT / 'completions/BATCH-079-worktree-audit.json').read_text(encoding='utf-8'))
summary = []
for row in rows:
    summary.append({'path': row['path'], 'registered': row['registered'], 'files': row.get('files'), 'bytes': row.get('bytes'),
                    'dirty_entries': len(row.get('status', {}).get('stdout', '').splitlines()),
                    'unique_commits': row.get('unmerged_commits', {}).get('stdout', ''),
                    'junctions': row.get('reparse_points', []), 'removed': False,
                    'reason': 'Preservada: conteúdo local/ignorado requer triagem ou autorização de arquivamento; não usar --force.'})
(ROOT / 'completions/BATCH-079-cleanup-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Instruction files updated:', len(changed))

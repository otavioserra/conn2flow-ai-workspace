"""Update current skill catalogs to the approved 46-skill governance contract."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
paths = []
for repo in ['conn2flow-ai-workspace', 'conn2flow', 'conn2flow-site', 'lumix', 'transformamp', 'conn2flow-home']:
    base = ROOT.parent / repo
    paths.extend(base / name for name in ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md'])
paths.extend(p for p in (ROOT / 'templates').rglob('*') if p.name in {'AGENTS.md', 'GEMINI.md', 'CODEX.md', 'copilot-instructions.md'} and 'skills' not in p.parts)
for path in paths:
    if not path.is_file():
        continue
    raw = path.read_bytes()
    text = raw.decode('utf-8-sig')
    old = text
    for pattern in [r'\b\d+ Skills Oficiais\b', r'\b\d+ skills oficiais\b', r'\b\d+ skills(?=\*\*)', r'(?<=contratos das )\d+ skills']:
        matches = list(re.finditer(pattern, text))
        if matches:
            assert len(matches) == len(list(re.finditer(pattern, text)))
            text = re.sub(pattern, lambda match: re.sub(r'^\d+', '46', match.group()), text)
    text = re.sub(r'(Skills Core do Framework \()\d+( Skills\))', r'\g<1>34\2', text)
    text = re.sub(r'(Skills de Governança e Workflow (?:SDD|MDD) \()\d+( Skills\))', r'\g<1>9\2', text)
    for before, after in [('45 skills', '46 skills'), ('45 Skills', '46 Skills'), ('8 de governança', '9 de governança'), ('Workflow MDD (8 Skills)', 'Workflow MDD (9 Skills)')]:
        count = text.count(before)
        if count:
            assert count == text.count(before)
            text = text.replace(before, after)
    if text != old:
        newline = '\r\n' if b'\r\n' in raw else '\n'
        entry = '- `c2f-multilingual-skills-governance`: governança das traduções de skills e hash pairing SHA-256.'
        if entry not in text:
            text = text.rstrip() + newline * 2 + entry + newline
        path.write_bytes((b'\xef\xbb\xbf' if raw.startswith(b'\xef\xbb\xbf') else b'') + text.encode('utf-8'))
        print(path.relative_to(ROOT.parent))

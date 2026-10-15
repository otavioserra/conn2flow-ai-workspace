"""REQ-076 evidence collection and scoped use of the canonical MDD compactor."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT.parent

def git(root, *args):
    result = subprocess.run(['git', '-c', 'core.safecrlf=false', '-C', str(root), *args], capture_output=True)
    return {'exit': result.returncode, 'out': result.stdout.decode('utf-8', 'replace').strip(),
            'err': result.stderr.decode('utf-8', 'replace').strip()}

def save(name, value):
    destination = ROOT / 'completions' / f'BATCH-078-{name}.json'
    # Preserve the initial retention preimages if this evidence collector is
    # invoked again. Validation/status outputs intentionally describe now.
    if name.startswith('compact-') and destination.exists():
        number = 1
        while destination.with_stem(destination.stem + f'-replay-{number:03}').exists():
            number += 1
        destination = destination.with_stem(destination.stem + f'-replay-{number:03}')
    destination.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def tree(path):
    links, size, count = [], 0, 0
    scanpath = '\\\\?\\' + str(path.absolute()) if os.name == 'nt' else str(path)
    for directory, children, names in os.walk(scanpath, followlinks=False):
        for name in children[:]:
            child = Path(directory) / name
            if child.is_symlink() or child.is_junction():
                links.append({'path': str(child), 'target': os.readlink(child)})
                children.remove(name)
        for name in names:
            child = Path(directory) / name
            if child.is_symlink():
                links.append({'path': str(child), 'target': os.readlink(child)})
            else:
                size += child.stat().st_size
                count += 1
    return {'links': links, 'logical_bytes': size, 'files': count}

def inventory():
    result = {}
    for name in ['conn2flow', 'conn2flow-site']:
        root = BASE / name
        records = []
        for block in git(root, 'worktree', 'list', '--porcelain')['out'].split('\n\n'):
            info = dict(line.split(' ', 1) for line in block.splitlines() if ' ' in line)
            path = Path(info['worktree'])
            if path == root:
                continue
            info.update(tree(path))
            info['exclusive'] = git(path, 'rev-list', '--count', 'origin/main..HEAD')
            info['diff'] = git(path, 'diff', '--ignore-cr-at-eol', '--name-only')
            info['cached'] = git(path, 'diff', '--cached', '--ignore-cr-at-eol', '--name-only')
            info['untracked'] = git(path, 'ls-files', '--others', '--exclude-standard')
            records.append(info)
            print(path.name, 'exclusive=', info['exclusive']['out'], 'diff=', len(info['diff']['out'].splitlines()),
                  'cached=', len(info['cached']['out'].splitlines()), 'untracked=', len(info['untracked']['out'].splitlines()),
                  'links=', len(info['links']), flush=True)
        result[name] = records
        save('worktree-inventory', result)
    orphan = BASE / 'conn2flow-site-req077'
    result['orphan'] = {'path': str(orphan), 'exists': orphan.exists(), **(tree(orphan) if orphan.exists() else {})}
    save('worktree-inventory', result)

def compact(name, apply=False):
    from mdd_client import memory
    root = BASE / name
    # REQ-076 explicitly authorizes the ten newest numbered records, even when
    # CURRENT still lists older pending records. Those pointers are relinked by
    # the canonical compactor; their statuses and original bytes stay intact.
    areas = ['implementation'] + (['human-requests'] if name == 'conn2flow' else [])
    if name == 'conn2flow-ai-workspace':
        areas = ['implementation', 'human-requests']
    memory.WINDOWS = tuple(areas)
    keep = set()
    for area in areas:
        candidates = []
        for path in (root / 'memory' / area).glob('*'):
            if path.is_file() and re.fullmatch(r'(?:req|batch)-\d+\.md', path.name, re.I):
                candidates.append(path)
            elif path.is_file():
                memory.INFRA.add(path.name)
        keep.update(sorted(candidates, key=lambda p: int(re.search(r'\d+', p.stem)[0]))[-10:])
    keep.update(p for p in memory.files(root) if 'CHIEF' in p.name.upper() or 'CHEFIA' in p.name.upper())
    memory.protected = lambda _: keep
    original_status = memory.status
    def scoped_status(path):
        health = original_status(path)
        health['oversized'] = [item for item in health['oversized'] if item['path'] == 'memory/PENDENCIAS-HUMANAS.md' and name == 'conn2flow-site']
        return health
    memory.status = scoped_status
    original_retain = memory.retain_history
    def retain(text, filename):
        trimmed = original_retain(text, filename)
        if filename == 'DECISION-LOG.md':
            sections = list(re.finditer(r'^##\s+DEC-(\d+)\b[^\n]*', trimmed, re.M | re.I))
            if len(sections) > 10:
                recent = set(sorted(range(len(sections)), key=lambda i: int(sections[i][1]))[-10:])
                trimmed = trimmed[:sections[0].start()] + ''.join(trimmed[s.start():sections[i + 1].start() if i + 1 < len(sections) else len(trimmed)] for i, s in enumerate(sections) if i in recent)
        return trimmed
    memory.retain_history = retain
    before = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in memory.files(root) if memory.active(p, root / 'memory')}
    plan = memory.compact(root, apply=apply)
    save(f'compact-{name}-' + ('applied' if apply else 'plan'), {'plan': plan, 'before_sha256': before})
    print(json.dumps(plan, ensure_ascii=False, indent=2))

def orphan_check():
    root = BASE / 'conn2flow-site'
    orphan = BASE / 'conn2flow-site-req077'
    reachable = git(root, 'rev-list', '--objects', 'origin/main')
    assert reachable['exit'] == 0
    hashes = {line.split(' ', 1)[0] for line in reachable['out'].splitlines()}
    records = []
    for path in orphan.rglob('*'):
        if path.is_file():
            blob = hashlib.sha1(b'blob ' + str(path.stat().st_size).encode() + b'\0' + path.read_bytes()).hexdigest()
            normalized = git(root, 'hash-object', '--path=' + path.relative_to(orphan).as_posix(), '--', str(path))
            records.append({'path': str(path.relative_to(orphan)), 'blob': blob, 'normalized_blob': normalized['out'],
                            'reachable_main': normalized['exit'] == 0 and normalized['out'] in hashes})
    save('orphan-audit', records)
    print(json.dumps(records, indent=2))

def css_audit():
    root = BASE / 'conn2flow-site'
    manifest = 'gestor/resources/.tailwind-build-manifest.json'
    old = json.loads(git(root, 'show', f'HEAD:{manifest}')['out'])
    new = json.loads((root / manifest).read_text(encoding='utf-8'))
    changes = []
    for key in old['resources'].keys() | new['resources'].keys():
        a, b = old['resources'].get(key, {}), new['resources'].get(key, {})
        if a != b:
            changes.append({'key': key, 'fields': [field for field in a.keys() | b.keys() if a.get(field) != b.get(field)],
                            'sources_before': a.get('sources'), 'sources_after': b.get('sources')})
    changed = git(root, 'diff', '--name-only')['out'].splitlines()
    css = [p for p in changed if p.endswith('.precompiled.css')]
    result = {'changed_css': len(css), 'manifest_changes': changes, 'other_changed': [p for p in changed if p not in css and p != manifest]}
    save('css-audit', result)
    print(json.dumps({'changed_css': len(css), 'manifest_changes': len(changes), 'sample': changes[:2], 'other_changed': result['other_changed']}, indent=2))

def css_restore():
    root = BASE / 'conn2flow-site'
    manifest = 'gestor/resources/.tailwind-build-manifest.json'
    raw = (root / manifest).read_bytes()
    current = json.loads(raw)
    baseline_bytes = subprocess.check_output(['git', '-C', str(root), 'show', f'HEAD:{manifest}'])
    baseline = json.loads(baseline_bytes)
    assert b'conn2flow-req277' in raw and b'conn2flow-req277' not in baseline_bytes
    assert current['resources'].keys() == baseline['resources'].keys()
    for key, entry in current['resources'].items():
        old = baseline['resources'][key]
        assert sorted(s.replace('../../conn2flow-req277/', '../../conn2flow/') for s in entry.get('sources', [])) == sorted(old.get('sources', [])), key
        assert all(entry.get(k) == old.get(k) for k in entry.keys() | old.keys() if k not in {'sources', 'fingerprint', 'built_at', 'output_hash'}), key
    paths = [p for p in git(root, 'diff', '--name-only')['out'].splitlines() if p.endswith('.precompiled.css')]
    allowed = {'gestor/' + e['output'].replace('//', '/') for e in current['resources'].values()}
    assert set(paths) <= allowed
    paths.append(manifest)
    backup = ROOT / 'completions/BATCH-078-site-css-preimage.zip'
    assert not backup.exists(), 'Do not overwrite preimage'
    originals = {p: (root / p).read_bytes() for p in paths}
    restored = {p: subprocess.check_output(['git', '-C', str(root), 'show', f'HEAD:{p}']) for p in paths}
    with zipfile.ZipFile(backup, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        for p, content in originals.items():
            archive.writestr(p, content)
    for p in paths:
        assert (root / p).read_bytes() == originals[p], f'Concurrent edit: {p}'
        (root / p).write_bytes(restored[p])
    save('css-restored', {'preimage': backup.name, 'paths': [{'path': p, 'before_sha256': hashlib.sha256(originals[p]).hexdigest(), 'after_sha256': hashlib.sha256(restored[p]).hexdigest()} for p in paths]})
    print('Restored', len(paths), 'explicitly authorized generated files; preimages retained in', backup.name)

def pending_split():
    from mdd_client import memory
    root = BASE / 'conn2flow-site'
    path = root / 'memory/PENDENCIAS-HUMANAS.md'
    original = next((root / 'memory/archive/original').glob('PENDENCIAS-HUMANAS-*.md'))
    text = original.read_bytes().decode('utf-8')
    sections = list(re.finditer(r'^## .+$', text, re.M))
    plan = json.loads((ROOT / 'completions/BATCH-078-compact-conn2flow-site-applied.json').read_text(encoding='utf-8'))
    moves = {root / p: (root / p).parent / 'archive/original' / Path(p).name for p in plan['plan']['archive']}
    result = text[:sections[0].start()]
    result += '\nManutenção REQ-076 (2026-10-15): estados e tarefas herdados preservados, sem atribuir homologação. Os roteiros adicionais continuam ativos nos documentos vinculados abaixo. [Histórico integral](archive/pendencias-historico.md).\n\n'
    evidence = []
    for i, section in enumerate(sections):
        body = text[section.start():sections[i + 1].start() if i + 1 < len(sections) else len(text)]
        if i < 7:
            result += memory.relink(body, path, path, moves, root)
            continue
        child = root / f'memory/human-pending/pendencia-{i + 1:03}.md'
        child.parent.mkdir(parents=True, exist_ok=True)
        title = section[0][3:].strip()
        header = {'id': f'PENDING-{i + 1:03}', 'title': title, 'status': 'preserved', 'date': '2026-10-15',
                  'author': 'executor', 'target_repo': 'conn2flow-site',
                  'summary_short': 'Roteiro humano preservado integralmente na manutenção autorizada da REQ-076.',
                  'summary_medium': 'Conteúdo herdado; o estado original consta no corpo.\nNenhuma homologação foi atribuída nesta manutenção.'}
        fm = '---\n' + ''.join(k + ': ' + json.dumps(v, ensure_ascii=False) + '\n' for k, v in header.items()) + '---\n\n'
        revised = memory.relink(body, path, child, moves, root)
        # The canonical relinker intentionally leaves cross-repository links
        # alone. Moving this body one level deeper needs an explicit rebase.
        def external_link(match):
            raw = match['target']
            url = urlsplit(raw.strip('<>'))
            if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                return match[0]
            dest = (path.parent / unquote(url.path)).resolve()
            if dest.is_relative_to(root):
                return match[0]
            migrated = Path(str(dest).replace(os.sep + 'sdd' + os.sep, os.sep + 'memory' + os.sep))
            if migrated.exists():
                dest = migrated
            link = Path(os.path.relpath(dest, child.parent)).as_posix()
            if url.fragment:
                link += '#' + url.fragment
            if raw.startswith('<') or ' ' in link:
                link = '<' + link + '>'
            return match['prefix'] + link + match['tail']
        revised = memory.LINK.sub(external_link, revised)
        memory.write(root, child, fm + revised)
        result += section[0] + f'\n\n[Roteiro e estado preservados](human-pending/{child.name}).\n\n'
        evidence.append({'title': title, 'active_path': child.relative_to(root).as_posix(), 'source_sha256': hashlib.sha256(body.encode()).hexdigest(), 'open_tasks': body.count('[ ]')})
    assert len(result.encode('utf-8')) < 25000
    result = result.rstrip() + '\n'
    memory.write(root, path, result)
    history = root / 'memory/archive/pendencias-historico.md'
    history_meta = {'id': 'PENDING-HISTORY-REQ-076', 'title': 'Histórico de pendências da REQ-076', 'status': 'archived',
                    'date': '2026-10-15', 'author': 'executor', 'target_repo': 'conn2flow-site',
                    'summary_short': 'Histórico integral preservado e referência para os roteiros humanos que continuam ativos.',
                    'summary_medium': 'Original preservado byte a byte.\nEstados históricos não foram convertidos em homologação.'}
    history_frontmatter = '---\n' + ''.join(k + ': ' + json.dumps(v, ensure_ascii=False) + '\n' for k, v in history_meta.items()) + '---\n\n'
    memory.write(root, history, history_frontmatter + '# Histórico de pendências — REQ-076\n\n[Original integral](original/' + original.name + ').\n\nO original é preservado byte a byte. Estados históricos não foram reavaliados nem convertidos em homologação. As pendências e roteiros continuam na [entrada ativa](../PENDENCIAS-HUMANAS.md) e nos [documentos ativos](../human-pending/index.md).\n')
    (root / 'memory/human-pending/index.md').touch(exist_ok=True)
    save('pending-split', {'before_bytes': len(text.encode()), 'after_bytes': len(result.encode()), 'original': original.relative_to(root).as_posix(), 'active_sections': evidence})
    print('Pending router:', len(text.encode()), '->', len(result.encode()), 'bytes;', len(evidence), 'full active sections')

def validate():
    from mdd_client import memory
    report = {}
    for name in ['conn2flow', 'conn2flow-site', 'conn2flow-ai-workspace']:
        root = BASE / name
        paths = git(root, 'ls-tree', '-r', '--name-only', 'HEAD')['out'].splitlines()
        baseline_paths = set(paths)
        baseline_dirs = {str(Path(p).parent).replace('\\', '/') for p in paths}
        mdpaths = [p for p in paths if p.startswith('memory/') and p.endswith('.md') and memory.active(root / p, root / 'memory')]
        queries = ''.join('HEAD:' + p + '\n' for p in mdpaths).encode()
        process = subprocess.run(['git', '-C', str(root), 'cat-file', '--batch'], input=queries, capture_output=True, check=True)
        offset, baseline = 0, {}
        for p in mdpaths:
            end = process.stdout.index(b'\n', offset)
            length = int(process.stdout[offset:end].split()[-1])
            baseline[p] = process.stdout[end + 1:end + 1 + length].decode('utf-8', 'replace')
            offset = end + 1 + length + 1
        def targets(path, text):
            for match in list(memory.LINK.finditer(text)) + list(memory.REFERENCE.finditer(text)):
                url = urlsplit(match['target'].strip('<>'))
                if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                    continue
                dest = (path.parent / unquote(url.path)).resolve()
                if dest.is_relative_to(root):
                    yield dest
        old_broken = set()
        for p, text in baseline.items():
            for dest in targets(root / p, text):
                rel = dest.relative_to(root).as_posix()
                if rel not in baseline_paths and rel not in baseline_dirs:
                    old_broken.add(str(dest).lower())
        broken, new_broken = [], []
        for path in memory.files(root):
            if path.suffix != '.md' or not memory.active(path, root / 'memory'):
                continue
            for dest in targets(path, path.read_text(encoding='utf-8')):
                if not dest.exists():
                    item = {'source': path.relative_to(root).as_posix(), 'target': dest.relative_to(root).as_posix()}
                    broken.append(item)
                    if str(dest).lower() not in old_broken:
                        new_broken.append(item)
        counts = {}
        for area, pattern in [('human-requests', r'req-\d+(?:-[^.]+)?\.md'), ('implementation', r'batch-\d+(?:-[^.]+)?\.md')]:
            items = [p.name for p in (root / 'memory' / area).iterdir() if p.is_file() and re.fullmatch(pattern, p.name, re.I)]
            counts[area] = sorted(items)
            assert len(items) <= 10, (name, area, items)
        governance = {}
        for relative in ['human-requests/CURRENT.md', 'validation/VALIDATION-CHECKLIST.md', 'decisions/DECISION-LOG.md', 'PENDENCIAS-HUMANAS.md', '04-memory-engineering-execution.md', 'MEMORIA-ENGENHARIA-EXECUCAO.md']:
            path = root / 'memory' / relative
            if path.exists():
                governance[relative] = {'bytes': path.stat().st_size, 'lines': len(path.read_text(encoding='utf-8').splitlines())}
                assert path.stat().st_size < 50000, (name, relative)
        archived = []
        plan_name = f'BATCH-078-compact-{name}-' + ('plan' if name == 'conn2flow' else 'applied') + '.json'
        plan = json.loads((ROOT / 'completions' / plan_name).read_text(encoding='utf-8'))
        for p in plan['plan']['archive']:
            original = (root / p).parent / 'archive/original' / Path(p).name
            digest = hashlib.sha256(original.read_bytes()).hexdigest()
            baseline_hashes = {k.replace('\\', '/'): v for k, v in plan['before_sha256'].items()}
            assert digest == baseline_hashes[p], (name, p)
            archived.append({'path': p, 'sha256': digest})
        history = {}
        for relative, token in [('validation/VALIDATION-CHECKLIST.md', 'BATCH'), ('decisions/DECISION-LOG.md', 'DEC')]:
            path = root / 'memory' / relative
            sections = re.findall(r'^##\s+' + token + r'-(\d+)\b', path.read_text(encoding='utf-8'), re.M | re.I)
            history[relative] = sections
            if name == 'conn2flow' or token == 'BATCH':
                assert len(sections) <= 10, (name, relative, sections)
        report[name] = {'counts': counts, 'governance': governance, 'history': history, 'archived_verified': archived,
                        'inherited_broken_targets': len(old_broken), 'active_broken_links': broken, 'new_broken_links': new_broken}
        print(name, 'counts', {k: len(v) for k, v in counts.items()}, 'originals', len(archived), 'new broken', len(new_broken), flush=True)
    save('validation', report)
    assert not any(r['new_broken_links'] for r in report.values()), 'New broken links; inspect evidence'
    site = BASE / 'conn2flow-site'
    pending = json.loads((ROOT / 'completions/BATCH-078-pending-split.json').read_text(encoding='utf-8'))
    source = (site / pending['original']).read_bytes().decode('utf-8')
    router = (site / 'memory/PENDENCIAS-HUMANAS.md').read_text(encoding='utf-8')
    original_sections = list(re.finditer(r'^## .+$', source, re.M))
    def content(text):
        return re.sub(r'\r\n?', '\n', memory.LINK.sub(lambda m: m['prefix'] + 'TARGET' + m['tail'], text))
    for i, section in enumerate(original_sections):
        body = source[section.start():original_sections[i + 1].start() if i + 1 < len(original_sections) else len(source)]
        if i < 7:
            assert content(body).strip() in content(router), ('Recent pending content lost', i)
        else:
            child = (site / pending['active_sections'][i - 7]['active_path']).read_text(encoding='utf-8')
            child_body = child.split('\n---\n\n', 1)[1]
            assert content(body) == content(child_body), ('Pending content lost', i)
    current_tasks = router.count('[ ]') + sum((site / item['active_path']).read_text(encoding='utf-8').count('[ ]') for item in pending['active_sections'])
    assert source.count('[ ]') == current_tasks
    save('pending-integrity', {'original_open_tasks': source.count('[ ]'), 'active_open_tasks': current_tasks,
                               'sections_verified': len(original_sections), 'content_preserved_except_link_rebasing': True,
                               'original_sha256': hashlib.sha256((site / pending['original']).read_bytes()).hexdigest()})
    print('Pending body preservation verified:', len(original_sections), 'sections;', current_tasks, 'open tasks')

def final_git():
    evidence = {}
    for name in ['conn2flow', 'conn2flow-site', 'conn2flow-ai-workspace', 'lumix', 'transformamp', 'conn2flow-home']:
        root = BASE / name
        item = {'branch': git(root, 'branch', '--show-current')['out'], 'head': git(root, 'rev-parse', 'HEAD')['out'],
                'remotes': git(root, 'remote')['out'], 'upstream_parity': git(root, 'rev-list', '--left-right', '--count', 'HEAD...@{upstream}'),
                'main_parity': git(root, 'rev-list', '--left-right', '--count', 'main...origin/main'),
                'worktrees': git(root, 'worktree', 'list', '--porcelain')['out']}
        if name in ['conn2flow', 'conn2flow-site']:
            item['dependencies'] = {}
            for relative in ['vendor/autoload.php', 'node_modules/.package-lock.json']:
                path = root / relative
                item['dependencies'][relative] = {'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        evidence[name] = item
    branches = json.loads((ROOT / 'completions/BATCH-078-branches.json').read_text(encoding='utf-8'))
    print('Branches deleted:', sum(b['exit'] == 0 for b in branches), 'preserved:', sum(b['exit'] != 0 for b in branches))
    save('git-final', evidence)
    tests = sorted((ROOT / 'vscode-extension/test').glob('*.test.cjs'))
    result = subprocess.run(['node', '--test', *[str(p) for p in tests]], cwd=ROOT / 'vscode-extension', capture_output=True)
    (ROOT / 'completions/BATCH-078-extension-tests.txt').write_bytes(result.stdout + result.stderr)
    assert result.returncode == 0
    print(result.stdout.decode('utf-8', 'replace')[-220:].encode('ascii', 'replace').decode())

def refresh_site():
    root = BASE / 'conn2flow-site'
    before_stage = git(root, 'diff', '--cached', '--raw')
    result = git(root, 'update-index', '--refresh')
    after_stage = git(root, 'diff', '--cached', '--raw')
    assert before_stage == after_stage, 'Stage changed during stat refresh'
    remaining = git(root, 'status', '--porcelain=v1')['out'].splitlines()
    save('site-stat-refresh', {'exit': result['exit'], 'output': result['out'], 'stage_preserved': True,
                               'remaining_css_status': [line for line in remaining if line.endswith('.precompiled.css')]})
    print('Remaining CSS status:', sum(line.endswith('.precompiled.css') for line in remaining), 'stage preserved')

def checkout_endings():
    root = BASE / 'conn2flow-site'
    stage = git(root, 'diff', '--cached', '--raw')
    status = git(root, 'status', '--porcelain=v1')['out'].splitlines()
    paths = [line[3:] for line in status if line.endswith('.precompiled.css')]
    records = []
    prepared = []
    for p in paths:
        actual = (root / p).read_bytes()
        normalized = git(root, 'hash-object', '--path=' + p, '--', p)
        expected = git(root, 'rev-parse', 'HEAD:' + p)
        assert normalized['exit'] == expected['exit'] == 0 and normalized['out'] == expected['out'], p
        filtered = subprocess.check_output(['git', '-C', str(root), 'cat-file', '--filters', 'HEAD:' + p])
        prepared.append((p, actual, filtered))
    for p, actual, filtered in prepared:
        assert (root / p).read_bytes() == actual, 'Concurrent edit: ' + p
        (root / p).write_bytes(filtered)
        records.append({'path': p, 'before_sha256': hashlib.sha256(actual).hexdigest(),
                        'after_sha256': hashlib.sha256(filtered).hexdigest(), 'head_blob': git(root, 'rev-parse', 'HEAD:' + p)['out']})
    git(root, 'update-index', '--refresh')
    assert git(root, 'diff', '--cached', '--raw') == stage
    remaining = [line for line in git(root, 'status', '--porcelain=v1')['out'].splitlines() if line.endswith('.precompiled.css')]
    save('checkout-endings', {'records': records, 'remaining_css_status': remaining, 'stage_preserved': True})
    print('Git checkout endings applied:', len(records), 'remaining CSS status:', len(remaining))

if __name__ == '__main__':
    if sys.argv[1] == 'inventory':
        inventory()
    elif sys.argv[1] == 'compact':
        compact(sys.argv[2], '--apply' in sys.argv)
    elif sys.argv[1] == 'orphan':
        orphan_check()
    elif sys.argv[1] == 'css-audit':
        css_audit()
    elif sys.argv[1] == 'css-restore':
        css_restore()
    elif sys.argv[1] == 'pending-split':
        pending_split()
    elif sys.argv[1] == 'validate':
        validate()
    elif sys.argv[1] == 'final-git':
        final_git()
    elif sys.argv[1] == 'refresh-site':
        refresh_site()
    elif sys.argv[1] == 'checkout-endings':
        checkout_endings()

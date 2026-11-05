"""Local PT→EN translation draft with immutable code and Markdown structure.

Requires Argos Translate + the pt_en model in an isolated authoring environment;
not a dependency of installers, the synchronizer, or MDD Client.
Review generated English before registering source hashes.
"""
from pathlib import Path
import hashlib
import json
import re
import sys
import tempfile

import argostranslate.translate

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(tempfile.gettempdir()) / 'c2f-req078-english-drafts'
OUT.mkdir(exist_ok=True)
cache_file = OUT / 'segments-v4.json'
cache = json.loads(cache_file.read_text(encoding='utf-8')) if cache_file.exists() else {}
cache = {key: value for key, value in cache.items() if value.strip()}
engine = argostranslate.translate.get_translation_from_codes('pt', 'en')
GLOSSARY = {
    'CONSEQUÊNCIA DE IGNORAR': 'CONSEQUENCE OF IGNORING', 'SKIP APENAS SE': 'SKIP ONLY IF',
    'Gatilho Obrigatório': 'MANDATORY TRIGGER', 'LEIA OBRIGATORIAMENTE': 'MANDATORY READ',
    'LEIA ANTES': 'READ BEFORE', 'banco de dados': 'database', 'Banco de Dados': 'Database',
    'banco': 'database', 'Banco': 'Database', 'bancos': 'databases', 'Bancos': 'Databases',
    'bancárias': 'banking', 'renderização': 'rendering', 'Renderização': 'Rendering',
    'Renderizar': 'Render', 'renderizar': 'render', 'renderiza': 'renders',
    'provedor': 'provider', 'Provedor': 'Provider', 'provedores': 'providers',
    'dublês': 'test doubles', 'Dublê': 'Test double', 'dublê': 'test double',
    'cobrança': 'billing', 'cobranças': 'charges', 'Cobrança': 'Billing',
    'mascare': 'mask', 'mascarar': 'mask', 'mascarados': 'masked',
    'Gestor': 'Gestor', 'homologação': 'human acceptance', 'Homologação': 'Human acceptance',
    'choques': 'clashes', 'Choques': 'Clashes', 'choque': 'clash',
    'Recursos de IA': 'AI Features', 'recursos de IA': 'AI features',
    'cascata': 'cascade', 'em cascata': 'cascading', 'fontes': 'sources',
    'expurgo': 'cleanup', 'Expurgo': 'Cleanup', 'esteira': 'pipeline',
    'saneamento': 'cleanup', 'atualizador': 'updater', 'Atualizador': 'Updater',
    'Chave Natural': 'Natural Key', 'chave natural': 'natural key',
    'projeto': 'project', 'Projeto': 'Project', 'projetos': 'projects', 'Projetos': 'Projects',
    'concorrência': 'concurrency', 'Concorrência': 'Concurrency', 'concorrente': 'concurrent',
    'recurso': 'resource', 'Recurso': 'Resource', 'contagem': 'count', 'exclusão': 'deletion',
    'fonte': 'source', 'Fonte': 'Source', 'masque': 'mask', 'Masque': 'Mask',
    'skills': 'skills', 'skill': 'skill', 'worktrees': 'worktrees', 'worktree': 'worktree',
    'reparse points': 'reparse points', 'IC/CD': 'CI/CD',
    'asserção': 'assertion', 'asserções': 'assertions', 'escape': 'escaping',
    'Retirada': 'Withdrawal', 'retirada': 'withdrawal', 'retiradas': 'withdrawals',
}
PROTECTED = re.compile(r'\*\*[^*\n]+\*\*|`[^`\n]+`|\]\([^\n)]*\)|https?://\S+|\$[A-Za-z_]\w*(?:\[[^\]]*\])?|<[A-Za-z_-]+>|git worktree (?:remove|prune)|\b(?:[a-z][a-z0-9]*_[a-z0-9_]+|(?:project|manager|resources|css|memory|assets):[a-z-]+|[\w/-]+\.(?:php|json|js|css|html|md|ps1|sh|cjs))\b|' + '|'.join(re.escape(term) + r'\b' for term in sorted(GLOSSARY, key=len, reverse=True)))

def prose(value):
    if not value.strip() or re.fullmatch(r'[\W\d_]+', value):
        return value
    if value in cache:
        return cache[value]
    # Argos can drop a whole sentence beginning with an emoji. Keep that prefix
    # outside inference, including the whitespace used by Markdown tables.
    prefix = re.match(r'^(\s*(?:[^\w\s`*]+\s*)+)(?=\w)', value)
    if prefix:
        result = prefix.group(1) + prose(value[len(prefix.group(1)):])
        cache[value] = result
        return result
    tokens = []
    def mask(match):
        token = match.group()
        if token.startswith('**'):
            token = '**' + prose(token[2:-2]) + '**'
        else:
            token = GLOSSARY.get(token, token)
        tokens.append(token)
        return f'ZXQ{len(tokens)-1}XZQ'
    masked = PROTECTED.sub(mask, value)
    translated = engine.translate(masked)
    if not translated.strip():
        raise ValueError(f'Translator dropped prose: {value!r}')
    for i, token in enumerate(tokens):
        marker = f'ZXQ{i}XZQ'
        # Fail closed if the model changed, duplicated, or dropped a code placeholder.
        if translated.count(marker) != 1:
            # Translating individual prose spans is the safe fallback.
            parts = PROTECTED.split(value)
            matches = list(PROTECTED.finditer(value))
            translated = ''.join(prose(part) + (tokens[j] if j < len(matches) else '') for j, part in enumerate(parts))
            break
        translated = translated.replace(marker, token)
    translated = translated.replace('Mandatory Trigger', 'MANDATORY TRIGGER').replace('Mandatory trigger', 'MANDATORY TRIGGER')
    translated = translated.replace('debugate', 'debug').replace('gracious degradation', 'graceful degradation').replace('Gracious degradation', 'Graceful degradation')
    translated = translated.replace('SKIP ONLY IF', 'SKIP ONLY IF').replace('CONSEQUENCE OF IGNORE', 'CONSEQUENCE OF IGNORING')
    cache[value] = translated
    return translated

def document(text):
    lines = text.splitlines()
    result = []
    front = False
    fence = None
    for i, line in enumerate(lines):
        if i == 0 and line == '---':
            front = True
            result.append(line)
            continue
        if front:
            if line == '---':
                front = False
                result.append(line)
            elif line.startswith('description:'):
                import yaml
                description = yaml.safe_load(line)['description']
                result.append('description: ' + json.dumps(prose(description), ensure_ascii=False))
            else:
                result.append(line)
            continue
        stripped = line.lstrip()
        if stripped.startswith(('```', '~~~')):
            kind = stripped[:3]
            fence = None if fence == kind else kind if fence is None else fence
            result.append(line)
            continue
        if fence or not stripped or re.fullmatch(r'[\s|:\-]+', line):
            result.append(line)
            continue
        # Preserve every structural prefix, table separator, code span, link destination.
        prefix = re.match(r'^(\s*(?:>\s*)?(?:#{1,6}\s+|[-*+]\s+(?:\[[ x]\]\s+)?|\d+\.\s+)?)(.*)$', line)
        lead, body = prefix.groups()
        if re.fullmatch(r'\[!\w+\]', body):
            result.append(line)
        elif '|' in body and body.strip().startswith('|'):
            result.append(lead + '|'.join(prose(cell) for cell in body.split('|')))
        else:
            result.append(lead + prose(body))
    assert not fence and not front, 'Unclosed source fence/frontmatter'
    return '\n'.join(result) + '\n'

selected = set(sys.argv[1:])
for source in sorted((ROOT / '.gemini/skills').glob('*/SKILL.md')):
    name = source.parent.name
    if selected and name not in selected:
        continue
    output = OUT / (name + '.md')
    stamp = OUT / (name + '.sha256')
    sha = 'v4-' + hashlib.sha256(source.read_bytes()).hexdigest()
    if output.exists() and stamp.exists() and stamp.read_text() == sha:
        continue
    print('Translating', name, flush=True)
    translated = document(source.read_text(encoding='utf-8'))
    output.write_text(translated, encoding='utf-8')
    stamp.write_text(sha)
    cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Draft complete', name, flush=True)

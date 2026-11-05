"""Publish reviewed REQ-078 English drafts; preserve code and existing translations."""
from pathlib import Path
import hashlib
import json
import re
import tempfile

import yaml

ROOT = Path(__file__).resolve().parents[2]
DRAFTS = Path(tempfile.gettempdir()) / 'c2f-req078-english-drafts'
PREVIOUS = {'c2f-environment-configuration', 'project-validation', 'mdd-memory-gardening'}
DESCRIPTIONS = {
'c2f-agent-visual-inspection': 'MANDATORY READ before visually validating screens, CSS animations, console errors or authenticated Gestor routes in the local test environment. Provides autonomous visual checks.',
'c2f-ai-features': 'Implement and review Conn2Flow Pro AI features: unified providers, credits, modes, data isolation, safe rendering and response validation. Use when integrating AI into product modules.',
'c2f-architect-master': 'Activate at the start of a Master Architect or Chief Engineer session. Establishes high-level governance, backlog management, living documentation, code-editing boundaries and protection against blind codebase scans.',
'c2f-database-operations': 'READ BEFORE SQL queries, CRUD through banco.php or Phinx migrations. Prevents escaping errors, multilingual query failures and production data corruption.',
'c2f-database-testing': 'READ BEFORE writing or running automated database tests with PHPUnit, SQLite or MySQL. Prevents main-database pollution, SQLite/MySQL incompatibilities and hidden regressions.',
'c2f-dev-scripts': 'READ BEFORE running dev-environment scripts or project CLI tools. Prevents incorrect working directories, missing environment variables and execution outside the Docker container.',
'c2f-docker-environment': 'READ BEFORE interacting with Docker containers such as conn2flow-app, mysql or redis. Prevents port conflicts, unsynchronized local data and incompatible host runtimes.',
'c2f-documentation': 'READ BEFORE writing, fixing, migrating or publishing Conn2Flow documentation. Keeps documentation grounded in code, with required frontmatter, pt-br/en pairs and publication through /docs/.',
'c2f-documentation-governance': 'READ BEFORE writing or updating technical documentation, specifications and manuals. Verifies documentation against real source code to prevent drift and misleading future agents.',
'c2f-executor-agent': 'Activate at the start of a Tactical Executor session. Requires visible Live Todo tracking, official resource pipelines, explicit Git paths and no manual copying to test mirrors.',
'c2f-gd-image-safety': 'READ BEFORE resizing, converting or generating thumbnails with PHP GD. Prevents fatal errors from unsupported WebP/AVIF formats, memory exhaustion and corrupted uploads.',
'c2f-gestor-functions': 'READ BEFORE calling gestor.php core functions for layouts, sessions, redirects or components. Prevents unexpected exit(), component scope failures and incorrect session handling.',
'c2f-global-variables': 'READ BEFORE accessing or modifying $_GESTOR, $_CONFIG, $_BANCO or $_ENV. Prevents routing-state overwrites, session-data violations and corrupted AJAX JSON envelopes.',
'c2f-hooks-system': 'READ BEFORE creating, intercepting or dispatching extensibility actions and filters. Prevents missing hooks.json registrations, lost parameters and silent side effects.',
'c2f-html-css-pages-and-components': 'READ BEFORE creating or changing HTML/CSS screens, pages, layouts or components. Keeps authoring inside resources/ so builds and database synchronization include the changes.',
'c2f-interface-v2-architecture': 'READ BEFORE rendering administrative modals, card lists, breadcrumbs or visual components. Preserves mobile layout, reactivity and compatibility with the v2 styling pipeline.',
'c2f-javascript-ajax': 'MANDATORY READ before AJAX calls, fetch requests, multipart uploads or Gestor AJAX backend handlers. Prevents CSRF 403 errors, invalid JSON envelopes and stuck interfaces.',
'c2f-json-resources-sync': 'READ BEFORE editing *Data.json or compiling/synchronizing resources. Prevents invalid checksums, stale database resources and overwritten local changes.',
'c2f-mdd-indexing-and-handoffs': 'Use when creating MDD metadata, rebuilding index.md, changing status or preparing handoffs among Executor, Reviewer, Architect and human. Does not replace normative approval or human acceptance.',
'c2f-modelo-templates': 'READ BEFORE rendering or modifying templates with modelo.php. Follow the actual placeholder, cell and replacement contracts rather than assuming generic template-engine behavior.',
'c2f-module-crud-scaffolding': 'READ BEFORE creating, structuring or refactoring administrative modules and CRUDs. Follows the canonical modulos-grupos pattern, audit history and deterministic synchronization.',
'c2f-module-visual-assets': 'Mandatory guidelines and canonical prompt for module reference images, covers and thumbnails in Conn2Flow and Conn2Flow Site. Use when creating modules or visual assets.',
'c2f-multilingual-system': 'READ BEFORE adding languages, localized routes or multilingual queries. Prevents cross-language content leakage and broken international URLs.',
'c2f-mysql-utf8-emoji-encoding': 'READ BEFORE saving text, posts, JSON or strings containing emoji or special Unicode characters in MySQL. Prevents rejected updates and missing persisted values.',
'c2f-payment-gateways': 'READ BEFORE implementing, integrating or testing payment gateways such as Stripe or PayPal. Requires trusted server-side prices, idempotent webhooks, lazy SDK loading and sandbox or mock tests.',
'c2f-plugin-architecture': 'READ BEFORE creating or packaging Conn2Flow ecosystem plugins. Prevents installation failures, collisions with core tables and incomplete uninstalls.',
'c2f-preview-modals-system': 'READ BEFORE implementing or editing live-preview modals in the editor. Prevents panel-style leakage, iframe rendering failures and Content Security Policy problems.',
'c2f-project-pipeline-and-tasks': 'READ BEFORE synchronizing, compiling, testing or deploying projects and sites. Requires the official proportional pipeline, consistent generated resources and CSS, sequential execution and visible logs.',
'c2f-projects-system': 'READ BEFORE synchronizing, compiling or deploying projects such as conn2flow-site or lumix. Prevents incorrect Core overrides, mixed tenant data and deployment failures.',
'c2f-resources-system': 'READ BEFORE creating or editing native resources such as pages, layouts, components, templates, variables or AI prompts. Keeps builds, bindings, cache versions and deployments consistent.',
'c2f-reviewer-agent': 'Activate at the start of a Technical Reviewer or Quality Auditor session. Requires findings-first review, CSRF checks, variables.json validation, skill integrity and evidence-based reports.',
'c2f-shell-and-windows-traps': 'READ BEFORE Docker, cURL, Python/Node editing scripts or POST requests in Windows/Git Bash. Prevents MSYS path conversion, silent upload failures, quoting errors, PHP concurrency issues and rejected Gestor forms.',
'c2f-system-tasks': 'READ BEFORE configuring background routines, scheduled Cron tasks or asynchronous workers. Prevents infinite loops, blocked system queues and exhausted server resources.',
'c2f-tailwind-css-architecture': 'MANDATORY READ before creating, modifying or migrating Tailwind CSS v4 screens, layouts, pages or components. Prevents cascade conflicts, stale compiled CSS, discarded runtime styles and broken builds.',
'c2f-tailwind-module-migration': 'READ BEFORE migrating a panel module from Fomantic-UI to Tailwind under req-219. Prevents legacy JavaScript breakage and inverted responsive behavior.',
'c2f-variables-system': 'READ BEFORE adding user-facing text, labels, titles, tooltips, errors or alerts in code. Uses the variables system for localization and tenant customization.',
'c2f-widget-development': 'READ BEFORE developing or modifying widgets and their renderers. Preserves scope isolation, unique DOM IDs and public rendering.',
'continue-mdd-batch': 'READ BEFORE resuming a batch already in progress. Preserves completed work, validation checklists and the current batch focus.',
'mdd-workflow': 'READ BEFORE creating or changing memory/ files for process, implementation, validation or decisions. Preserves the dual-agent workflow and governance artifacts.',
'raise-spec-change': 'READ BEFORE changing normative rules, functional requirements or contracts in sdd/SPEC.md. Requires explicit change tracking to preserve SDD governance.',
'review-current-batch': 'READ BEFORE submitting a batch for human approval or opening a pull request. Requires review of functional defects, regressions, specification drift and missing validation.',
'start-mdd-slice': 'READ BEFORE starting a new human request or work batch. Establishes bounded scope, validation criteria and respect for other batches.',
'c2f-multilingual-skills-governance': 'READ when creating, renaming or editing skills, or adding template languages. Keeps reviewed translations paired with source SHA-256 hashes without overwriting translated content.',
}

CORRECTIONS = {
    'human human acceptance': 'human acceptance', 'paper transition': 'role transition',
    'legacy boycotts use sdd/ even authorized migration': 'legacy boilerplates use sdd/ until migration is authorized',
    'legacy boycotts': 'legacy boilerplates', 'executioner': 'Executor', 'APPLICABLE A': 'APPLIES TO',
    'IC/CD': 'CI/CD', 'N Wheel': 'Round N', 'Wheel N': 'Round N',
    'check out': 'check', 'Check out': 'Check', 'inverted bars': 'backslashes',
    'Test Test double': 'Test double', 'workstrees': 'worktrees', 'workstree': 'worktree',
    'git worktree removes': 'git worktree remove', 'mirror points': 'reparse points',
    'repair points': 'reparse points', 'reappoint': 'repoint',
    'expected countdown': 'expected count', 'allowed countdown': 'allowed count',
    'font PT-BR': 'PT-BR source', 'PT-BR font': 'PT-BR source',
    'unwritten warning': 'a warning without overwriting content',
    'unoverwritten warning': 'a warning without overwriting content',
    'Production and human acceptance are not authorised for such maintenance.': 'This maintenance does not authorize production changes or human acceptance.',
    'table declared by the seedless core in the project': 'Core-declared table without a seed in the project',
    'Table declared by the seedless core in the project': 'A Core-declared table without a seed in the project',
    '**Not yet.**': '**No loose HTML**', 'â€”': '—',
    'temporal shareable': 'temporary shareable',
    'Temporary shareable observations below in raw/active/; authorized running files full originals and traceable summaries in raw/archive/.': 'Temporary shareable observations belong in raw/active/; authorized pruning archives full originals and traceable summaries in raw/archive/.',
    'CONSEQUENCE TO INGORATE': 'CONSEQUENCE OF IGNORING', 'Compulsory trigger': 'MANDATORY TRIGGER',
    'Direct surrender': 'Direct rendering', 'direct surrender': 'direct rendering',
    'finishing-first': 'findings-first', 'technical debit': 'technical debt',
    'code dockocks': 'code docblocks', 'typing errors (types)': 'typing errors (typos)',
    'Runflow breaks': 'Execution-flow breaks', 'Sign in to any session': 'Start any session',
    'the change does not play HTML': 'the change does not touch HTML',
    'task lead wire': 'task context', 'artifacts or paper': 'artifacts or role',
    'Rendering secure.': 'Safe rendering.', 'Provider unified.': 'Unified provider.',
    'Billing duplicate, sensitive data exposure and rendering unsafe response.': 'Duplicate billing, exposure of sensitive data and unsafe response rendering.',
    "Modules don't do Direct HTTP to LLM does not duplicate the adapter.": 'Modules must neither call the LLM directly over HTTP nor duplicate the adapter.',
    'Involve the context of the screen between': 'Wrap the screen context between',
    'Before changing the matrix, refer to the active translations.': 'Before changing the matrix, inspect its active translations.',
    'Never automatically update hashes in a normal sync before revision or just to get PASS.': 'Never update hashes automatically during normal sync, before content review, or merely to obtain PASS.',
    'The overwriting protection is still even in drift.': 'Overwrite protection remains active even when drift is detected.',
    'do not create double source authored.': 'do not create a second source of authorship.',
    'Enhancing JavaScript author': 'Minifying authored JavaScript',
    'The compiled dice': 'The compiled data',
    'do not complete memory failure only by HTTP500': 'do not infer a memory failure solely from HTTP 500',
    'do not complete memory failure only by HTTP 500': 'do not infer a memory failure solely from HTTP 500',
    'generic save comes out': 'remove generic caveats',
    'Do not convert empty string failure': 'Do not turn a failure into an empty string',
    'never manages PowerShell list to perform deletion by another shell': 'never enumerate paths in PowerShell and pass deletion to another shell',
    'never manages PowerShell list to run deletion by another shell': 'never enumerate paths in PowerShell and pass deletion to another shell',
    'while there is proprietary process': 'while a process still owns or uses it',
}

SOURCE_LINES = {
    '## 🛠️ Guia de Resolução de Problemas (Troubleshooting)': '## 🛠️ Troubleshooting Guide',
    '## 3. Procedimento por passagem (a rotina)': '## 3. Procedure for each documentation pass',
    '## ⛔ Regra #1: Pipeline ≠ Cópia de Arquivo': '## ⛔ Rule #1: A pipeline is not a file copy',
    '   - Valida OAuth ➔ Extrai ZIP na raiz ➔ Executa Upsert do Banco inline ➔ Limpa temporários ➔ Grava log.': '   - Validate OAuth → Extract ZIP into the root → Run the database upsert inline → Clean temporary files → Write the log.',
    'Ficam sumariamente **excluídas** do sitemap:': 'The following are **excluded** from the sitemap:',
    '## 🛑 Protocolo Findings-First (Estrutura Obrigatória da Revisão)': '## 🛑 Findings-First Protocol (Required Review Structure)',
    '3. **Nível 3: AUTÔNOMO HEADLESS (Background Silencioso / Black-Box)**:': '3. **Level 3: AUTONOMOUS HEADLESS (Silent Background / Black Box)**:',
}

def fenced(text):
    return re.findall(r'^\s*(```|~~~)[^\n]*\n(.*?)^\s*\1\s*$', text, re.M | re.S)

def code_spans(text):
    stripped = re.sub(r'^\s*(```|~~~)[^\n]*\n.*?^\s*\1\s*$', '', text, flags=re.M | re.S)
    return re.findall(r'`([^`\n]+)`', stripped)

english = {}
audit = []
for source in sorted((ROOT / '.gemini/skills').glob('*/SKILL.md')):
    name = source.parent.name
    original = source.read_text(encoding='utf-8')
    if name in PREVIOUS:
        translated = (ROOT / 'templates/en/templates/spec-driven-project-gemini-kit/.gemini/skills' / name / 'SKILL.md').read_text(encoding='utf-8')
    else:
        expected = 'v4-' + hashlib.sha256(source.read_bytes()).hexdigest()
        assert (DRAFTS / (name + '.sha256')).read_text() == expected, f'Source changed since draft: {name}'
        translated = (DRAFTS / (name + '.md')).read_text(encoding='utf-8')
        source_lines, target_lines = original.splitlines(), translated.splitlines()
        assert len(source_lines) == len(target_lines), f'Line alignment changed: {name}'
        for i, line in enumerate(source_lines):
            if line in SOURCE_LINES:
                target_lines[i] = SOURCE_LINES[line]
        translated = '\n'.join(target_lines) + '\n'
        # Corrections apply to prose only: code fences and inline code stay byte-equivalent.
        chunks = re.split(r'(^\s*(?:```|~~~)[^\n]*\n.*?^\s*(?:```|~~~)\s*$|`[^`\n]+`)', translated, flags=re.M | re.S)
        for i in range(0, len(chunks), 2):
            for old, new in CORRECTIONS.items():
                chunks[i] = chunks[i].replace(old, new)
        translated = ''.join(chunks)
        # Trim prose line endings only, preserving literal fenced code bytes.
        chunks = re.split(r'(^\s*(?:```|~~~)[^\n]*\n.*?^\s*(?:```|~~~)\s*$)', translated, flags=re.M | re.S)
        for i in range(0, len(chunks), 2):
            chunks[i] = '\n'.join(line.rstrip() for line in chunks[i].split('\n'))
        translated = ''.join(chunks)
        header = original.split('---', 2)[1]
        header = re.sub(r'^description: .*$', lambda _: 'description: ' + json.dumps(DESCRIPTIONS[name]), header, count=1, flags=re.M)
        translated = '---' + header + '---' + translated.split('---', 2)[2]
        assert fenced(original) == fenced(translated), f'Code fence changed: {name}'
        assert code_spans(original) == code_spans(translated), f'Inline code changed: {name}'
        assert re.findall(r'\$[A-Za-z_]\w*', original) == re.findall(r'\$[A-Za-z_]\w*', translated), f'PHP variable changed: {name}'
    meta = yaml.safe_load(translated.split('---', 2)[1])
    source_meta = yaml.safe_load(original.split('---', 2)[1])
    assert meta['name'] == name, name
    assert meta.get('user-invocable') == source_meta.get('user-invocable')
    assert 'MANDATORY TRIGGER' in translated or 'Mandatory Trigger' in translated or 'Compulsory trigger' in translated
    assert not re.search(r'^#{1,6}\s*$', translated, re.M), f'Empty heading: {name}'
    english[name] = translated
    audit.append({'skill': name, 'previous_translation_preserved': name in PREVIOUS,
                  'code_fences_and_inline_code': 'preserved-legacy' if name in PREVIOUS else 'PASS',
                  'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest()})

# Publish only after every draft has passed preflight; no partial write on validation failure.
written = 0
for kit in (ROOT / 'templates/en/templates').iterdir():
    if not kit.is_dir():
        continue
    for client in ['.gemini', '.claude', '.cursor', '.codex', '.github']:
        folder = kit / client / 'skills'
        if not folder.is_dir():
            continue
        for name, translated in english.items():
            target = folder / name / 'SKILL.md'
            if not target.exists() and not kit.name.startswith('spec-driven-project-'):
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(translated, encoding='utf-8', newline='\n')
            written += 1

registry = {'en': {entry['skill']: {'source_sha256': entry['source_sha256'], 'translated_at': '2026-11-05', 'translator': 'mdd-agent'} for entry in audit}}
(ROOT / 'scripts/skills/translated.json').write_text(json.dumps(registry, indent=2) + '\n', encoding='utf-8')
(ROOT / 'completions/BATCH-080-translation-audit.json').write_text(json.dumps({'skills': len(english), 'copies_written': written, 'checks': audit}, indent=2) + '\n', encoding='utf-8')
print(f'Published {len(english)} English skills into {written} template files')

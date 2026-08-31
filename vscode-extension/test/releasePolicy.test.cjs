const test = require('node:test');
const assert = require('node:assert/strict');

const {
  bumpSemver,
  classifyViewerPermission,
  createReleaseDraftSuggestion,
  evaluateReleaseGate,
  githubRepositoryUrl,
  inspectReleaseDocumentContents,
  inspectReleaseDocumentPaths,
  quoteShellArg,
  replaceReleaseVersionMentions,
  selectWorkflowRun
} = require('../out/releasePolicy.js');

test('calcula patch, minor e major deterministicamente', () => {
  assert.equal(bumpSemver('1.2.3', 'patch'), '1.2.4');
  assert.equal(bumpSemver('1.2.3', 'minor'), '1.3.0');
  assert.equal(bumpSemver('1.2.3', 'major'), '2.0.0');
});

test('atualiza todas as mencoes de versao e tag nos textos editaveis do release', () => {
  const fields = {
    tagMessage: 'Conn2Flow Gestor v2.9.52 / gestor-v2.9.52',
    commitMessage: 'chore(release): publish manager 2.9.52',
    releaseNotes: 'Release 2.9.52\nTag: gestor-v2.9.52\nVersao base: 2.9.51'
  };
  const minor = Object.fromEntries(Object.entries(fields).map(([field, value]) => [
    field,
    replaceReleaseVersionMentions(
      value,
      ['2.9.51', '2.9.52'],
      '2.10.0',
      ['gestor-v2.9.51', 'gestor-v2.9.52'],
      'gestor-v2.10.0'
    )
  ]));

  for (const value of Object.values(minor)) {
    assert.doesNotMatch(value, /2\.9\.(?:51|52)/);
    assert.match(value, /2\.10\.0/);
  }

  const major = replaceReleaseVersionMentions(
    minor.releaseNotes,
    ['2.9.51', '2.10.0'],
    '3.0.0',
    ['gestor-v2.9.51', 'gestor-v2.10.0'],
    'gestor-v3.0.0'
  );
  assert.doesNotMatch(major, /2\.(?:9\.51|10\.0)/);
  assert.match(major, /gestor-v3\.0\.0/);
});

test('webview aplica a reatividade aos tres campos dependentes no change do incremento', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require.resolve('../src/providers/actionFormPanel.ts'), 'utf8');
  const manager = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');
  assert.match(manager, /messageFieldIds:\s*\['tagMessage', 'commitMessage', 'releaseNotes'\]/);
  assert.match(source, /for \(const fieldId of semverPreview\.messageFieldIds\)/);
  assert.match(source, /\[semverPreview\.currentVersion, previousNext\]/);
  assert.match(source, /addEventListener\('change', updateSemverPreview\)/);
});

test('libera somente permissoes capazes de escrever', () => {
  for (const value of ['WRITE', 'MAINTAIN', 'ADMIN']) assert.equal(classifyViewerPermission(value), 'allowed');
  for (const value of ['READ', 'TRIAGE']) assert.equal(classifyViewerPermission(value), 'denied');
  assert.equal(classifyViewerPermission(undefined), 'unknown');
});

test('deriva URL GitHub de HTTPS e SSH sem owner fixo', () => {
  assert.equal(githubRepositoryUrl('https://github.com/acme/repo.git'), 'https://github.com/acme/repo');
  assert.equal(githubRepositoryUrl('git@github.com:acme/repo.git'), 'https://github.com/acme/repo');
});

test('escapa argumentos controlados pelo usuario', () => {
  assert.equal(quoteShellArg("it's", 'bash'), `'it'"'"'s'`);
  assert.equal(quoteShellArg("it's", 'powershell'), `'it''s'`);
});

test('fase de preparacao permanece disponivel com arvore suja e execucao fica bloqueada', () => {
  const gate = evaluateReleaseGate({
    workspaceTrusted: true,
    permission: 'allowed',
    dirtyFiles: ['vscode-extension/src/extension.ts'],
    branch: 'main',
    githubRemote: true,
    tagCollision: false,
    documentationReady: true,
    draftReady: true
  });

  assert.equal(gate.canPrepare, true);
  assert.equal(gate.canExecute, false);
  assert.deepEqual(gate.blockers, ['dirty-tree']);
});

test('fase de execucao exige permissao, arvore limpa, docs e rascunho', () => {
  const ready = evaluateReleaseGate({
    workspaceTrusted: true,
    permission: 'allowed',
    dirtyFiles: [],
    branch: 'main',
    githubRemote: true,
    tagCollision: false,
    documentationReady: true,
    draftReady: true
  });
  assert.equal(ready.canExecute, true);

  const blocked = evaluateReleaseGate({
    workspaceTrusted: true,
    permission: 'unknown',
    dirtyFiles: [],
    branch: 'main',
    githubRemote: true,
    tagCollision: false,
    documentationReady: false,
    draftReady: false
  });
  assert.deepEqual(blocked.blockers, ['permission-unknown', 'documentation-outdated', 'draft-missing']);
});

test('inventario documental exige readmes, changelog e ao menos um workflow yaml', () => {
  const complete = inspectReleaseDocumentPaths([
    'README.md',
    'README-PT-BR.md',
    'CHANGELOG.md',
    '.github/workflows/release-gestor.yml',
    '.github/workflows/ci.yaml'
  ]);
  assert.equal(complete.ready, true);
  assert.equal(complete.workflows.length, 2);

  const incomplete = inspectReleaseDocumentPaths(['README.md', 'CHANGELOG.md']);
  assert.equal(incomplete.ready, false);
  assert.deepEqual(incomplete.missing, ['README-PT-BR.md', '.github/workflows/*.yml']);
});

test('conteudo documental precisa refletir versoes atuais e workflows validos', () => {
  const synchronized = inspectReleaseDocumentContents({
    'README.md': 'Gestor v2.9.51 / instalador-v1.5.6',
    'README-PT-BR.md': 'Gestor v2.9.51 / instalador-v1.5.6',
    'CHANGELOG.md': '## [2.9.51]',
    '.github/workflows/release.yml': 'name: Release\n\non:\n  push:\n'
  }, '2.9.51', '1.5.6');
  assert.deepEqual(synchronized, []);

  const outdated = inspectReleaseDocumentContents({
    'README.md': 'Gestor v2.9.39',
    'README-PT-BR.md': 'Gestor v2.9.39',
    'CHANGELOG.md': '## [2.9.39]',
    '.github/workflows/release.yml': 'jobs: {}'
  }, '2.9.51', '1.5.6');
  assert.deepEqual(outdated, [
    'README:manager-version',
    'README:installer-version',
    'CHANGELOG:manager-version',
    '.github/workflows/release.yml:header'
  ]);
});

test('gera rascunho convencional no workspace sem alterar o repositorio', () => {
  const draft = createReleaseDraftSuggestion(
    'manager',
    '2.9.51',
    'patch',
    ['fix(preview): prevent chained tabs'],
    'BATCH-039'
  );
  assert.equal(draft.nextVersion, '2.9.52');
  assert.equal(draft.tag, 'gestor-v2.9.52');
  assert.equal(draft.commitMessage, 'chore(release): publish manager 2.9.52');
  assert.match(draft.releaseNotes, /BATCH-039/);
});

test('seleciona a run ativa recente e descarta falha obsoleta da mesma tag', () => {
  const triggeredAfter = new Date('2026-08-31T12:00:00.000Z');
  const selected = selectWorkflowRun([
    {
      databaseId: 101,
      headBranch: 'gestor-v2.9.52',
      status: 'completed',
      conclusion: 'failure',
      createdAt: '2026-08-31T11:45:00.000Z'
    },
    {
      databaseId: 103,
      headBranch: 'outra-tag',
      status: 'in_progress',
      conclusion: '',
      createdAt: '2026-08-31T12:00:03.000Z'
    },
    {
      databaseId: 102,
      headBranch: 'gestor-v2.9.52',
      status: 'queued',
      conclusion: '',
      createdAt: '2026-08-31T12:00:02.000Z'
    }
  ], 'gestor-v2.9.52', triggeredAfter);

  assert.equal(selected?.databaseId, 102);
});

test('aceita imediatamente a run mais recente concluida com sucesso', () => {
  const triggeredAfter = new Date('2026-08-31T12:00:00.000Z');
  const selected = selectWorkflowRun([
    {
      databaseId: 201,
      headBranch: 'instalador-v2.0.0',
      status: 'in_progress',
      conclusion: '',
      createdAt: '2026-08-31T12:00:01.000Z'
    },
    {
      databaseId: 202,
      headBranch: 'instalador-v2.0.0',
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-08-31T12:00:05.000Z'
    }
  ], 'instalador-v2.0.0', triggeredAfter);

  assert.equal(selected?.databaseId, 202);
  assert.equal(selected?.conclusion, 'success');
});

test('prioriza a run ativa quando ela e mais recente que um sucesso elegivel', () => {
  const triggeredAfter = new Date('2026-08-31T12:00:00.000Z');
  const selected = selectWorkflowRun([
    {
      databaseId: 211,
      headBranch: 'gestor-v2.9.52',
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-08-31T12:00:01.000Z'
    },
    {
      databaseId: 212,
      headBranch: 'gestor-v2.9.52',
      status: 'in_progress',
      conclusion: null,
      createdAt: '2026-08-31T12:00:04.000Z'
    }
  ], 'gestor-v2.9.52', triggeredAfter);

  assert.equal(selected?.databaseId, 212);
  assert.equal(selected?.status, 'in_progress');
});

test('mantem o polling quando so existem runs anteriores ou falhadas', () => {
  const triggeredAfter = new Date('2026-08-31T12:00:00.000Z');
  const selected = selectWorkflowRun([
    {
      databaseId: 301,
      headBranch: 'gestor-v2.9.52',
      status: 'completed',
      conclusion: 'success',
      createdAt: '2026-08-31T11:59:59.999Z'
    },
    {
      databaseId: 302,
      headBranch: 'gestor-v2.9.52',
      status: 'completed',
      conclusion: 'failure',
      createdAt: '2026-08-31T12:00:01.000Z'
    }
  ], 'gestor-v2.9.52', triggeredAfter);

  assert.equal(selected, undefined);
});

test('integra timestamp, campos do gh e limpeza do rascunho no fluxo de sucesso', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');
  assert.match(source, /const triggeredAfter = new Date\(\);[\s\S]*?await runner\.run\(/);
  assert.match(source, /findWorkflowRun\(root, definition\.workflow, tag, triggeredAfter\)/);
  assert.match(source, /databaseId,headBranch,status,conclusion,createdAt/);
  assert.match(source, /workspaceState\.update\(this\.draftKey\(product\), undefined\)[\s\S]*?onChanged\?\.\(\)[\s\S]*?release\.completed/);
});

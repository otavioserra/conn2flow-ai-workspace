const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_AUTONOMY,
  DEFAULT_SCOPE_ID,
  DEFAULT_TOPOLOGY,
  PREFERENCE_KEYS,
  PREFERENCE_SECTION,
  applyModesToCurrentMarkdown,
  normalizeAutonomy,
  normalizeScopeId,
  normalizeTopology,
  parseModesFromCurrentMarkdown,
  recognizeAutonomy,
  recognizeProjectId,
  recognizeScopeId,
  recognizeTopology,
  resolvePersistedPreference
} = require('../out/workspacePreferencesPolicy.js');

const manifest = require('../package.json');

test('contrato de chaves persistidas espelha o contributes.configuration', () => {
  assert.equal(PREFERENCE_SECTION, 'conn2flow');

  const properties = manifest.contributes.configuration.properties;
  for (const key of Object.values(PREFERENCE_KEYS)) {
    const settingId = `${PREFERENCE_SECTION}.${key}`;
    assert.ok(properties[settingId], `${settingId} deve estar declarado no package.json`);
    assert.equal(properties[settingId].scope, 'window');
  }
});

test('topologia aceita o vocabulário usado nos artefatos SDD', () => {
  // `dupla` é o termo dos req-XXX.md; antes da REQ-049 ele caía no padrão.
  assert.equal(recognizeTopology('dupla'), 'duplo');
  assert.equal(recognizeTopology('`dupla`'), 'duplo');
  assert.equal(recognizeTopology('Duplo'), 'duplo');
  assert.equal(recognizeTopology('tríade'), 'triade');
  assert.equal(recognizeTopology('TRIADE'), 'triade');

  assert.equal(recognizeTopology('quarteto'), undefined);
  assert.equal(recognizeTopology(''), undefined);
  assert.equal(recognizeTopology(undefined), undefined);

  assert.equal(normalizeTopology('quarteto'), DEFAULT_TOPOLOGY);
  assert.equal(normalizeTopology('dupla'), 'duplo');
});

test('autonomia aceita variações acentuadas e abreviadas', () => {
  assert.equal(recognizeAutonomy('supervisionado'), 'supervisionado');
  assert.equal(recognizeAutonomy('`autônomo_monitorado`'), 'autonomo_monitorado');
  assert.equal(recognizeAutonomy('monitorado'), 'autonomo_monitorado');
  assert.equal(recognizeAutonomy('headless'), 'autonomo_headless');

  assert.equal(recognizeAutonomy('turbo'), undefined);
  assert.equal(normalizeAutonomy('turbo'), DEFAULT_AUTONOMY);
});

test('escopo e projeto só aceitam identificadores válidos', () => {
  assert.equal(recognizeScopeId('core'), 'core');
  assert.equal(recognizeScopeId('ai-workspace'), 'ai-workspace');
  assert.equal(recognizeScopeId('project:transformamp'), 'project:transformamp');

  assert.equal(recognizeScopeId('project:'), undefined);
  assert.equal(recognizeScopeId('../etc'), undefined);
  assert.equal(normalizeScopeId('lixo'), DEFAULT_SCOPE_ID);

  assert.equal(recognizeProjectId('conn2flow-site'), 'conn2flow-site');
  assert.equal(recognizeProjectId('a/b'), undefined);
});

test('precedência de leitura: settings vence workspaceState, que vence a inferência', () => {
  assert.equal(
    resolvePersistedPreference(
      { settings: 'duplo', workspaceState: 'triade', inferred: 'triade' },
      recognizeTopology,
      DEFAULT_TOPOLOGY
    ),
    'duplo'
  );

  // Setting ausente ou inválido não pode apagar a escolha legada.
  assert.equal(
    resolvePersistedPreference(
      { settings: '', workspaceState: 'duplo', inferred: 'triade' },
      recognizeTopology,
      DEFAULT_TOPOLOGY
    ),
    'duplo'
  );
  assert.equal(
    resolvePersistedPreference(
      { settings: 'quarteto', workspaceState: 'duplo' },
      recognizeTopology,
      DEFAULT_TOPOLOGY
    ),
    'duplo'
  );

  assert.equal(
    resolvePersistedPreference({ inferred: 'project:lumix' }, recognizeScopeId, DEFAULT_SCOPE_ID),
    'project:lumix'
  );
  assert.equal(resolvePersistedPreference({}, recognizeScopeId, DEFAULT_SCOPE_ID), DEFAULT_SCOPE_ID);
});

test('CURRENT.md real do repositório é lido com a topologia declarada', () => {
  const currentPath = path.resolve(__dirname, '..', '..', 'sdd', 'human-requests', 'CURRENT.md');
  const content = fs.readFileSync(currentPath, 'utf8');
  const parsed = parseModesFromCurrentMarkdown(content);

  assert.ok(parsed.topology, 'CURRENT.md deve declarar uma topologia reconhecível');
  assert.ok(['duplo', 'triade'].includes(parsed.topology));
});

test('sincronização do CURRENT.md atualiza a linha existente sem tocar no resto', () => {
  const before = [
    '# CURRENT ACTIVE REQUEST',
    '',
    '* **Ponteiro Ativo**: [req-049.md](req-049.md)',
    '* **Status**: `APPROVED`',
    '* **Topologia de Agentes**: `dupla`',
    '* **Nível de Autonomia**: `supervisionado`',
    '',
    '## Instrução'
  ].join('\n');

  const after = applyModesToCurrentMarkdown(before, {
    topology: 'triade',
    autonomy: 'autonomo_monitorado'
  });

  assert.ok(after.includes('* **Topologia de Agentes**: `triade`'));
  assert.ok(after.includes('* **Nível de Autonomia**: `autonomo_monitorado`'));
  assert.ok(after.includes('* **Ponteiro Ativo**: [req-049.md](req-049.md)'));
  assert.ok(after.includes('* **Status**: `APPROVED`'));
  assert.equal(after.split('\n').length, before.split('\n').length);

  // Ida e volta: o que foi escrito volta a ser lido com o mesmo valor.
  assert.deepEqual(parseModesFromCurrentMarkdown(after), {
    topology: 'triade',
    autonomy: 'autonomo_monitorado'
  });
});

test('sincronização insere os metadados ausentes logo após o Status', () => {
  const before = ['# CURRENT ACTIVE REQUEST', '', '* **Ponteiro Ativo**: [req-050.md](req-050.md)', '* **Status**: `QUEUED`', ''].join('\n');

  const after = applyModesToCurrentMarkdown(before, {
    topology: 'duplo',
    autonomy: 'autonomo_headless'
  });

  const lines = after.split('\n');
  assert.equal(lines[3], '* **Status**: `QUEUED`');
  assert.equal(lines[4], '* **Topologia de Agentes**: `dupla`');
  assert.equal(lines[5], '* **Nível de Autonomia**: `autonomo_headless`');

  assert.deepEqual(parseModesFromCurrentMarkdown(after), {
    topology: 'duplo',
    autonomy: 'autonomo_headless'
  });
});

test('sincronização preserva o vocabulário `dupla` usado pelo Arquiteto', () => {
  const before = '* **Topologia de Agentes**: `triade`\n';
  const after = applyModesToCurrentMarkdown(before, { topology: 'duplo' });

  assert.equal(after, '* **Topologia de Agentes**: `dupla`\n');
});

test('providers leem e gravam as preferências pelo módulo puro', () => {
  const modes = fs.readFileSync(require.resolve('../src/providers/modesManager.ts'), 'utf8');
  assert.match(modes, /resolvePersistedPreference/);
  assert.match(modes, /PREFERENCE_KEYS\.topology/);
  assert.match(modes, /PREFERENCE_KEYS\.autonomy/);
  assert.match(modes, /applyModesToCurrentMarkdown/);
  assert.match(modes, /config\.update\(key, value, target\)/);

  const scope = fs.readFileSync(require.resolve('../src/providers/sddScopeManager.ts'), 'utf8');
  assert.match(scope, /resolvePersistedPreference/);
  assert.match(scope, /PREFERENCE_KEYS\.scopeId/);

  const projects = fs.readFileSync(require.resolve('../src/providers/projectsManager.ts'), 'utf8');
  assert.match(projects, /PREFERENCE_KEYS\.activeProjectId/);
  assert.match(projects, /persistActiveProjectId/);
});

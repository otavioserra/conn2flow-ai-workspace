const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('hierarquia da árvore separa Controles Principais, SDD, Core, Projetos, Diagnóstico e Documentações', () => {
  const providerFile = path.resolve(__dirname, '../src/providers/conn2flowTreeProvider.ts');
  const content = fs.readFileSync(providerFile, 'utf8');

  // Overview / Controles Principais deve conter os 6 controles globais
  assert.match(content, /overview\.scope/);
  assert.match(content, /overview\.target/);
  assert.match(content, /overview\.language/);
  assert.match(content, /overview\.topology/);
  assert.match(content, /overview\.autonomy/);
  assert.match(content, /agents\.hubWatcherActive/);

  // SDD deve conter as ações operacionais de agentes
  assert.match(content, /agents\.launchClaude/);
  assert.match(content, /agents\.copyPrompt/);
  assert.match(content, /agents\.recordHandoff/);
  assert.match(content, /agents\.prepareReview/);

  // DocsConfig não deve duplicar settings.language
  const docsConfigBlock = content.slice(content.indexOf('const docsConfig = ['), content.indexOf('const result = ['));
  assert.strictEqual(docsConfigBlock.includes('settings.language'), false, 'settings.language não deve ser duplicado em docsConfig');
  assert.ok(docsConfigBlock.includes('docs.panel'));
  assert.ok(docsConfigBlock.includes('docs.architecture'));
});

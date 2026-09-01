const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { en, ptBR } = require('../out/localizationCatalog.js');
const { treeTooltipKeys, treeTooltipKey } = require('../out/treeTooltipPolicy.js');

test('todos os nós nativos da árvore possuem tooltips ricos nos dois idiomas', () => {
  for (const key of treeTooltipKeys) {
    const tooltipKey = treeTooltipKey(key);
    assert.match(en[tooltipKey], /\S.{40,}/, `${tooltipKey} needs a detailed English tooltip`);
    assert.match(ptBR[tooltipKey], /\S.{40,}/, `${tooltipKey} needs a detailed Portuguese tooltip`);
  }
});

test('provider usa MarkdownString e a seção de documentação não contém itens obsoletos', () => {
  const providerPath = path.resolve(__dirname, '../src/providers/conn2flowTreeProvider.ts');
  const source = fs.readFileSync(providerPath, 'utf8');
  const docsConfig = source.slice(source.indexOf('const docsConfig = ['), source.indexOf('const result = ['));

  assert.match(source, /new vscode\.MarkdownString\(tooltipText \|\| label\)/);
  assert.match(source, /treeTooltipKey\(key\)/);
  assert.doesNotMatch(docsConfig, /docs\.marketplace/);
  assert.doesNotMatch(docsConfig, /agents\.selectMode/);
});
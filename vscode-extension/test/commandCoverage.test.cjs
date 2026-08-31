const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const manifest = require('../package.json');

test('comandos da árvore estão registrados e declarados quando públicos', () => {
  const tree = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const extension = fs.readFileSync(require.resolve('../out/extension.js'), 'utf8');
  const treeCommands = new Set([...tree.matchAll(/this\.leaf\([^,]+,\s*'([^']+)'/g)].map(match => match[1]));
  for (const match of tree.matchAll(/this\.releaseExecutionItem\([^,]+,\s*[^,]+,\s*'([^']+)'/g)) {
    treeCommands.add(match[1]);
  }
  treeCommands.add('conn2flow.custom.openFile');
  treeCommands.add('conn2flow.custom.runTerminal');
  const registered = new Set(extension.match(/conn2flow\.[a-zA-Z0-9.]+/g) || []);
  const declared = new Set(manifest.contributes.commands.map(command => command.command));
  const dynamic = new Set(['conn2flow.custom.openFile', 'conn2flow.custom.runTerminal']);

  for (const command of treeCommands) {
    assert.ok(registered.has(command), `${command} is missing from extension.ts`);
    if (!dynamic.has(command)) {
      assert.ok(declared.has(command), `${command} is missing from package.json`);
    }
  }
});

test('visao geral separa topologia e autonomia em comandos exclusivos', () => {
  const tree = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const modes = fs.readFileSync(require.resolve('../src/providers/modesManager.ts'), 'utf8');

  assert.match(tree, /'overview\.topology',\s*'conn2flow\.modes\.selectTopology',\s*'organization'/);
  assert.match(tree, /'overview\.autonomy',\s*'conn2flow\.modes\.selectAutonomy',\s*'shield'/);

  const topologySelector = modes.match(/public static async selectTopology[\s\S]*?\n  }/)?.[0] || '';
  const autonomySelector = modes.match(/public static async selectAutonomy[\s\S]*?\n  }/)?.[0] || '';
  assert.match(topologySelector, /'triade'/);
  assert.match(topologySelector, /'duplo'/);
  assert.doesNotMatch(topologySelector, /autonomo_monitorado|autonomo_headless/);
  assert.match(autonomySelector, /'supervisionado'/);
  assert.match(autonomySelector, /'autonomo_monitorado'/);
  assert.match(autonomySelector, /'autonomo_headless'/);
  assert.doesNotMatch(autonomySelector, /'triade'|'duplo'/);
});

test('execucao bloqueada permanece clicavel e oferece caminhos de resolucao', () => {
  const tree = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const release = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');
  const blockedItem = tree.match(/private releaseExecutionItem[\s\S]*?\n  }/)?.[0] || '';

  assert.match(blockedItem, /vscode\.TreeItemCollapsibleState\.None,\s*command,\s*'lock'/);
  assert.doesNotMatch(blockedItem, /vscode\.TreeItemCollapsibleState\.None,\s*undefined,\s*'lock'/);
  assert.match(release, /showWarningMessage\(\s*message,\s*openPreparation,\s*openSourceControl/);
  assert.match(release, /'conn2flow\.release\.manager'\s*:\s*'conn2flow\.release\.installer'/);
  assert.match(release, /executeCommand\('workbench\.view\.scm'\)/);
  assert.match(release, /await this\.saveDraft\(draft\);\s*\n\s*const diagnostics[\s\S]*?this\.executionGates\.set\(product, diagnostics\.gate\);\s*\n\s*onChanged\?\.\(\);/);
});

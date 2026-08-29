const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const manifest = require('../package.json');

test('comandos da árvore estão registrados e declarados quando públicos', () => {
  const tree = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const extension = fs.readFileSync(require.resolve('../out/extension.js'), 'utf8');
  const treeCommands = new Set([...tree.matchAll(/this\.leaf\([^,]+,\s*'([^']+)'/g)].map(match => match[1]));
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

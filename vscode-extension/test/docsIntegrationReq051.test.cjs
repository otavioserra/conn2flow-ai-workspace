const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('árvore expõe índice, arquitetura e roadmap bilíngues', () => {
  const root = path.resolve(__dirname, '..');
  const provider = fs.readFileSync(path.join(root, 'src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const extension = fs.readFileSync(path.join(root, 'src/extension.ts'), 'utf8');

  for (const key of ['docs.index', 'docs.architecture', 'docs.roadmap']) {
    assert.match(provider, new RegExp(key.replace('.', '\\.')));
  }

  for (const relativePath of [
    'docs/pt-br/README.md',
    'docs/en/README.md',
    'docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md',
    'docs/en/DOUBLE-AGENT-ARCHITECTURE.md',
    'docs/pt-br/ROTEIRO-EVOLUCAO-FUTURA.md',
    'docs/en/FUTURE-EVOLUTION-ROADMAP.md'
  ]) {
    assert.equal(fs.existsSync(path.resolve(root, '..', relativePath)), true, relativePath);
    assert.match(extension, new RegExp(relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseBacklogIndex, parseBacklogFileStatus, hasBacklogStatusDrift } = require('../out/backlogPolicy.js');

test('lê índice, metadados e markdown dentro das células', () => {
  const source = '| [ARCH-001](ARCH-001.md) | Arquitetura | `ICEBOX` | Renomear `x` | Planejar | 2026-08-18 |';
  const [item] = parseBacklogIndex(source);
  assert.equal(item.id, 'ARCH-001');
  assert.equal(item.indexStatus, 'ICEBOX');
  assert.match(item.title, /Renomear/);
});

test('detecta status individual e divergência do índice', () => {
  const item = { id: 'A', fileName: 'a.md', type: 'x', indexStatus: 'COMPLETED', title: 'x', nextAction: 'x', updatedAt: 'x', fileStatus: parseBacklogFileStatus('**Status**: `ICEBOX`') };
  assert.equal(item.fileStatus, 'ICEBOX');
  assert.equal(hasBacklogStatusDrift(item), true);
});

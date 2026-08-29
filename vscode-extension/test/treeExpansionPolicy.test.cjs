const test = require('node:test');
const assert = require('node:assert/strict');

const {
  nextTreeExpansionVersion,
  normalizeTreeExpansionVersion,
  treeSectionId
} = require('../out/treeExpansionPolicy.js');

test('mantem IDs estaveis enquanto o usuario navega manualmente', () => {
  assert.equal(treeSectionId('sdd', 7), treeSectionId('sdd', 7));
  assert.notEqual(treeSectionId('sdd', 7), treeSectionId('core', 7));
});

test('uma acao global gera novos IDs para invalidar o estado visual memorizado', () => {
  const current = 7;
  const next = nextTreeExpansionVersion(current);

  assert.equal(next, 8);
  assert.notEqual(treeSectionId('sdd', current), treeSectionId('sdd', next));
});

test('estado persistido invalido volta para a geracao inicial segura', () => {
  assert.equal(normalizeTreeExpansionVersion(undefined), 0);
  assert.equal(normalizeTreeExpansionVersion(-1), 0);
  assert.equal(normalizeTreeExpansionVersion('4'), 0);
  assert.equal(nextTreeExpansionVersion(undefined), 1);
});

test('contador reinicia com seguranca ao atingir o maior inteiro suportado', () => {
  assert.equal(nextTreeExpansionVersion(Number.MAX_SAFE_INTEGER), 0);
});

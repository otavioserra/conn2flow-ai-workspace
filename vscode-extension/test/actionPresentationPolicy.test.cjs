const test = require('node:test');
const assert = require('node:assert/strict');

const { selectPresentation } = require('../out/actionPresentationPolicy.js');

test('ações sem parâmetros usam execução direta', () => {
  assert.equal(selectPresentation({ fieldCount: 0, impact: 'local' }), 'direct');
});

test('um campo usa controle nativo e três campos usam formulário', () => {
  assert.equal(selectPresentation({ fieldCount: 1, impact: 'local' }), 'quick');
  assert.equal(selectPresentation({ fieldCount: 3, impact: 'local' }), 'form');
});

test('dois campos dependentes permanecem sequenciais', () => {
  assert.equal(
    selectPresentation({ fieldCount: 2, hasDependentFields: true, impact: 'mutating' }),
    'quick'
  );
  assert.equal(
    selectPresentation({ fieldCount: 2, hasDependentFields: false, impact: 'mutating' }),
    'form'
  );
});

test('ações remotas e destrutivas sempre usam formulário em auto', () => {
  assert.equal(selectPresentation({ fieldCount: 1, impact: 'remote' }), 'form');
  assert.equal(selectPresentation({ fieldCount: 0, impact: 'destructive' }), 'form');
});

test('sobrescrita explícita prevalece', () => {
  assert.equal(selectPresentation({ fieldCount: 4, impact: 'local', override: 'quick' }), 'quick');
  assert.equal(selectPresentation({ fieldCount: 1, impact: 'local', override: 'form' }), 'form');
});

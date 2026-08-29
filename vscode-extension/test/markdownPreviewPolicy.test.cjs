const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPreviewCloseReason,
  MPE_VIEW_TYPE,
  normalizePreviewPath
} = require('../out/markdownPreviewPolicy.js');

test('normaliza separadores e caixa para comparação segura no Windows', () => {
  assert.equal(
    normalizePreviewPath('C:/Repo/SDD/CURRENT.md'),
    normalizePreviewPath('c:\\repo\\sdd\\current.md')
  );
});

test('fecha somente a fonte exata do documento solicitado', () => {
  const target = 'C:\\repo\\sdd\\CURRENT.md';

  assert.equal(
    getPreviewCloseReason({ kind: 'text', uriPath: target }, target),
    'target-source'
  );
  assert.equal(
    getPreviewCloseReason({ kind: 'text', uriPath: 'C:\\repo\\docs\\OUTRO.md' }, target),
    undefined
  );
});

test('fecha apenas o preview MPE previamente gerenciado', () => {
  const previous = 'C:\\repo\\docs\\primeiro.md';
  const target = 'C:\\repo\\docs\\segundo.md';

  assert.equal(
    getPreviewCloseReason(
      { kind: 'custom', uriPath: previous, viewType: MPE_VIEW_TYPE },
      target,
      previous
    ),
    'managed-preview'
  );
  assert.equal(
    getPreviewCloseReason(
      { kind: 'custom', uriPath: target, viewType: MPE_VIEW_TYPE },
      target,
      previous
    ),
    undefined
  );
});

test('preserva previews não gerenciados e custom editors de outros tipos', () => {
  const target = 'C:\\repo\\docs\\segundo.md';
  const unrelated = 'C:\\repo\\README.md';

  assert.equal(
    getPreviewCloseReason(
      { kind: 'custom', uriPath: unrelated, viewType: MPE_VIEW_TYPE },
      target,
      'C:\\repo\\docs\\primeiro.md'
    ),
    undefined
  );
  assert.equal(
    getPreviewCloseReason(
      { kind: 'custom', uriPath: unrelated, viewType: 'outro.custom-editor' },
      target,
      unrelated
    ),
    undefined
  );
});

test('preserva abas sem URI e documentos Markdown alheios', () => {
  const target = 'C:\\repo\\sdd\\CURRENT.md';

  assert.equal(getPreviewCloseReason({ kind: 'other' }, target), undefined);
  assert.equal(
    getPreviewCloseReason({ kind: 'text', uriPath: 'C:\\repo\\anotacoes.md' }, target),
    undefined
  );
});

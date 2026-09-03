const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getPreviewCloseReason,
  isTargetMpePreview,
  MPE_VIEW_TYPE,
  normalizePreviewPath,
  runPreviewLifecycle,
  shouldRedirectMarkdownSourceToPreview
} = require('../out/markdownPreviewPolicy.js');

test('normaliza separadores e caixa para comparação segura no Windows', () => {
  assert.equal(
    normalizePreviewPath('C:/Repo/SDD/CURRENT.md'),
    normalizePreviewPath('c:\\repo\\sdd\\current.md')
  );
});

test('redireciona links Markdown do preview gerenciado sem capturar edicao intencional', () => {
  const current = 'C:\\repo\\docs\\atual.md';
  const linked = 'C:\\repo\\docs\\destino.md';

  assert.equal(shouldRedirectMarkdownSourceToPreview(linked, current, 'preview'), true);
  assert.equal(shouldRedirectMarkdownSourceToPreview(current, current, 'preview'), false);
  assert.equal(shouldRedirectMarkdownSourceToPreview(linked, current, 'code'), false);
  assert.equal(shouldRedirectMarkdownSourceToPreview(linked, current, 'preview', true), false);
  assert.equal(shouldRedirectMarkdownSourceToPreview('C:\\repo\\arquivo.ts', current, 'preview'), false);
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

test('reconhece somente o preview MPE do alvo atual para foco', () => {
  const target = 'C:\\repo\\docs\\guia.md';
  assert.equal(isTargetMpePreview({ kind: 'custom', uriPath: target, viewType: MPE_VIEW_TYPE }, target), true);
  assert.equal(isTargetMpePreview({ kind: 'text', uriPath: target }, target), false);
  assert.equal(isTargetMpePreview({ kind: 'custom', uriPath: 'C:\\repo\\docs\\outro.md', viewType: MPE_VIEW_TYPE }, target), false);
});

test('ciclo de preview abre uma unica vez, fecha a fonte e preserva o foco', async () => {
  const calls = [];
  const focused = await runPreviewLifecycle({
    closePreviousManagedPreview: async () => calls.push('close-previous'),
    openPreview: async () => calls.push('open'),
    waitUntilPreviewIsActive: async () => {
      calls.push('focus');
      return true;
    },
    closeTargetSource: async () => calls.push('close-source')
  });

  assert.equal(focused, true);
  assert.deepEqual(calls, ['close-previous', 'open', 'focus', 'close-source']);
  assert.equal(calls.filter(call => call === 'open').length, 1);
});

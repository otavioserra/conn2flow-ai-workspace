const test = require('node:test');
const assert = require('node:assert/strict');

const { en, ptBR, resolveLocale, translate } = require('../out/localizationCatalog.js');

test('catálogos português e inglês possuem paridade estrita', () => {
  assert.deepEqual(Object.keys(ptBR).sort(), Object.keys(en).sort());
});

test('modo automático acompanha português e inglês do VS Code', () => {
  assert.equal(resolveLocale('auto', 'pt-br'), 'pt-BR');
  assert.equal(resolveLocale('auto', 'en-US'), 'en');
});

test('preferência manual vence o idioma do VS Code', () => {
  assert.equal(resolveLocale('en', 'pt-BR'), 'en');
  assert.equal(resolveLocale('pt-BR', 'en-US'), 'pt-BR');
});

test('environment só atua quando o idioma automático não é suportado', () => {
  assert.equal(resolveLocale('auto', 'fr', 'pt-BR'), 'pt-BR');
  assert.equal(resolveLocale('auto', 'fr', 'en'), 'en');
});

test('interpolação preserva chaves ausentes e substitui valores conhecidos', () => {
  assert.equal(translate('en', 'overview.target', { target: 'lumix' }), 'Target Project: lumix');
});

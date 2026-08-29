const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../package.json');
const en = require('../package.nls.json');
const pt = require('../package.nls.pt-br.json');

test('catálogos NLS possuem paridade e cobrem todos os comandos declarados', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(pt).sort());
  for (const command of manifest.contributes.commands) {
    const match = command.title.match(/^%(.+)%$/);
    assert.ok(match, `${command.command} must use an NLS placeholder`);
    assert.equal(typeof en[match[1]], 'string');
    assert.equal(typeof pt[match[1]], 'string');
  }
});

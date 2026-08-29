const test = require('node:test');
const assert = require('node:assert/strict');
const { bumpSemver, classifyViewerPermission, githubRepositoryUrl, quoteShellArg } = require('../out/releasePolicy.js');

test('calcula patch, minor e major determinísticos', () => {
  assert.equal(bumpSemver('1.2.3', 'patch'), '1.2.4');
  assert.equal(bumpSemver('1.2.3', 'minor'), '1.3.0');
  assert.equal(bumpSemver('1.2.3', 'major'), '2.0.0');
});

test('libera somente permissões capazes de escrever', () => {
  for (const value of ['WRITE', 'MAINTAIN', 'ADMIN']) assert.equal(classifyViewerPermission(value), 'allowed');
  for (const value of ['READ', 'TRIAGE']) assert.equal(classifyViewerPermission(value), 'denied');
  assert.equal(classifyViewerPermission(undefined), 'unknown');
});

test('deriva URL GitHub de HTTPS e SSH sem owner fixo', () => {
  assert.equal(githubRepositoryUrl('https://github.com/acme/repo.git'), 'https://github.com/acme/repo');
  assert.equal(githubRepositoryUrl('git@github.com:acme/repo.git'), 'https://github.com/acme/repo');
});

test('escapa argumentos controlados pelo usuário', () => {
  assert.equal(quoteShellArg("it's", 'bash'), `'it'"'"'s'`);
  assert.equal(quoteShellArg("it's", 'powershell'), `'it''s'`);
});

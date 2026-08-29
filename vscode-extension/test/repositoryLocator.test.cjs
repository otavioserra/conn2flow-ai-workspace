const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  buildRepositoryRootCandidates,
  buildRepositorySddCandidates,
  inferScopeIdFromWorkspace
} = require('../out/repositoryLocator.js');

test('não usa o SDD do Core como primeiro candidato do AI Workspace', () => {
  const core = path.resolve('C:/repos/conn2flow');
  const candidates = buildRepositorySddCandidates([core], 'conn2flow-ai-workspace');

  assert.equal(candidates[0], path.resolve('C:/repos/conn2flow-ai-workspace/sdd'));
  assert.ok(!candidates.includes(path.resolve('C:/repos/conn2flow/sdd')));
});

test('resolve raízes irmãs sem retornar o workspace de outro repositório', () => {
  const roots = buildRepositoryRootCandidates(['C:/repos/conn2flow'], 'conn2flow-ai-workspace');
  assert.equal(roots[0], path.resolve('C:/repos/conn2flow-ai-workspace'));
  assert.ok(!roots.includes(path.resolve('C:/repos/conn2flow')));
});

test('usa o SDD do workspace atual somente quando o nome do repositório coincide', () => {
  const aiWorkspace = path.resolve('C:/repos/conn2flow-ai-workspace');
  const candidates = buildRepositorySddCandidates([aiWorkspace], 'conn2flow-ai-workspace');

  assert.equal(candidates[0], path.resolve('C:/repos/conn2flow-ai-workspace/sdd'));
});

test('infere o escopo inicial pelo repositório aberto', () => {
  assert.equal(inferScopeIdFromWorkspace(['C:/repos/conn2flow-ai-workspace']), 'ai-workspace');
  assert.equal(inferScopeIdFromWorkspace(['C:/repos/conn2flow']), 'core');
});

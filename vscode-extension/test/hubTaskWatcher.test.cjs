const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  evaluateTaskEvent,
  evaluateCompletionEvent,
  parseHubPayload
} = require('../out/hubTaskWatcherPolicy.js');

test('HubTaskWatcherPolicy processa eventos de tarefas despachadas quando ativo', () => {
  const taskPayload = {
    taskId: 'task-1788202000000-abcde',
    reqId: 'REQ-042',
    repo: 'conn2flow-ai-workspace',
    status: 'dispatched',
    mode: 'supervised',
    prompt: 'Implementar HubTaskWatcher'
  };

  const activeResult = evaluateTaskEvent(true, taskPayload);
  assert.equal(activeResult.shouldHandle, true);
  assert.equal(activeResult.status, 'dispatched');
  assert.equal(activeResult.reqId, 'REQ-042');

  const runningResult = evaluateTaskEvent(true, { ...taskPayload, status: 'running' });
  assert.equal(runningResult.shouldHandle, false);

  const pausedResult = evaluateTaskEvent(false, taskPayload);
  assert.equal(pausedResult.shouldHandle, false);
});

test('HubTaskWatcherPolicy processa recibos do Executor para acionar revisão', () => {
  const receiptPayload = {
    receiptId: 'rec_1788202000000',
    batchId: 'BATCH-044',
    taskId: 'task-1788202000000-abcde',
    reqId: 'REQ-042',
    role: 'executor',
    status: 'success',
    logs: '100% tests pass'
  };

  const activeResult = evaluateCompletionEvent(true, receiptPayload);
  assert.equal(activeResult.shouldHandle, true);
  assert.equal(activeResult.status, 'success');
  assert.equal(activeResult.role, 'executor');
  assert.equal(activeResult.batchId, 'BATCH-044');

  const reviewerResult = evaluateCompletionEvent(true, { ...receiptPayload, role: 'reviewer' });
  assert.equal(reviewerResult.shouldHandle, false);

  const pausedResult = evaluateCompletionEvent(false, receiptPayload);
  assert.equal(pausedResult.shouldHandle, false);
});

test('HubTaskWatcherPolicy faz parse seguro de payloads', () => {
  const valid = parseHubPayload('{"reqId":"REQ-042","status":"dispatched"}');
  assert.equal(valid.reqId, 'REQ-042');

  const invalid = parseHubPayload('invalido {');
  assert.equal(invalid, undefined);
});

test('HubTaskWatcher provider integra watchers de sistema e status bar', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/hubTaskWatcher.ts'), 'utf8');
  assert.match(source, /createFileSystemWatcher\('\*\*\/tasks\/\*\.json'\)/);
  assert.match(source, /createFileSystemWatcher\('\*\*\/completions\/\*\.json'\)/);
  assert.match(source, /toggle\(onChanged\?: \(\) => void\)/);
  assert.match(source, /setStatusBarMessage/);
});

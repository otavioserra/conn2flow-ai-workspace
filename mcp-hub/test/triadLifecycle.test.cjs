const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { dispatchTask } = require('../dist/tools/dispatchTask.js');
const { reportCompletion } = require('../dist/tools/reportCompletion.js');

test('correlaciona recibos por papel e transiciona a tarefa', async t => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-mcp-triad-'));
  t.after(() => fs.rmSync(workspaceRoot, { recursive: true, force: true }));

  const task = await dispatchTask({
    repo: 'conn2flow-ai-workspace',
    req_id: 'REQ-041',
    prompt: 'Probe E2E',
    mode: 'supervised'
  }, workspaceRoot);

  const executorReceipt = await reportCompletion({
    batch_id: 'BATCH-043',
    task_id: task.taskId,
    req_id: task.reqId,
    role: 'executor',
    status: 'success',
    logs: '48/48 PASS'
  }, workspaceRoot);

  assert.equal(executorReceipt.taskId, task.taskId);
  assert.equal(executorReceipt.reqId, 'REQ-041');
  assert.equal(executorReceipt.role, 'executor');
  assert.equal(executorReceipt.status, 'success');

  const taskAfterCompletion = JSON.parse(
    fs.readFileSync(path.join(workspaceRoot, 'tasks', 'REQ-041.json'), 'utf8')
  );
  assert.equal(taskAfterCompletion.status, 'completed');
  assert.equal(taskAfterCompletion.completedAt, executorReceipt.timestamp);

  const executorReceiptPath = path.join(workspaceRoot, 'completions', 'BATCH-043-executor-receipt.json');
  const executorReceiptBeforeReview = fs.readFileSync(executorReceiptPath, 'utf8');

  const reviewerReceipt = await reportCompletion({
    batch_id: 'BATCH-043',
    task_id: task.taskId,
    req_id: task.reqId,
    role: 'reviewer',
    status: 'success',
    logs: 'APPROVED'
  }, workspaceRoot);

  assert.equal(reviewerReceipt.role, 'reviewer');
  assert.equal(fs.readFileSync(executorReceiptPath, 'utf8'), executorReceiptBeforeReview);
  assert.ok(fs.existsSync(path.join(workspaceRoot, 'completions', 'BATCH-043-reviewer-receipt.json')));
  const taskAfterReview = JSON.parse(
    fs.readFileSync(path.join(workspaceRoot, 'tasks', 'REQ-041.json'), 'utf8')
  );
  assert.equal(taskAfterReview.status, 'completed');
  assert.equal(taskAfterReview.completedAt, executorReceipt.timestamp);

  await assert.rejects(
    reportCompletion({
      batch_id: 'BATCH-043',
      task_id: 'task-1-invalido',
      req_id: 'REQ-041',
      role: 'executor',
      status: 'success',
      logs: 'nao deve gravar'
    }, workspaceRoot),
    /does not match/
  );
});

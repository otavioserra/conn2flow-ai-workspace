const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = path.resolve(__dirname, '..', '..');

test('probe E2E da triade valida despacho, recibos e governanca multi-repositorio', () => {
  const taskPath = path.join(workspaceRoot, 'tasks', 'REQ-041.json');
  assert.ok(fs.existsSync(taskPath), 'tasks/REQ-041.json deve existir');

  const task = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
  assert.equal(task.status, 'completed');
  assert.equal(typeof task.completedAt, 'string');

  const completionsPath = path.join(workspaceRoot, 'completions');
  assert.ok(fs.statSync(completionsPath).isDirectory(), 'completions/ deve ser um diretorio');
  assert.doesNotThrow(
    () => fs.accessSync(completionsPath, fs.constants.W_OK),
    'completions/ deve aceitar a emissao de recibos'
  );

  const receiptPath = path.join(completionsPath, 'BATCH-043-executor-receipt.json');
  assert.ok(fs.existsSync(receiptPath), 'o recibo estruturado do Executor deve existir');
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(receipt.batchId, 'BATCH-043');
  assert.equal(receipt.taskId, task.taskId);
  assert.equal(receipt.reqId, task.reqId);
  assert.equal(receipt.role, 'executor');
  assert.equal(receipt.status, 'success');
  assert.ok(Date.parse(receipt.timestamp) >= Date.parse(task.createdAt));
  assert.equal(task.completedAt, receipt.timestamp);

  const agents = fs.readFileSync(path.join(workspaceRoot, 'AGENTS.md'), 'utf8');
  const gemini = fs.readFileSync(path.join(workspaceRoot, 'GEMINI.md'), 'utf8');
  assert.match(agents, /Identificação de Repositório em Handoffs e Prompts/);
  assert.match(agents, /caminho absoluto da raiz do repositório alvo/);
  assert.match(gemini, /Identificação de Repositório em Prompts para Agentes/);
  assert.match(gemini, /caminho absoluto da raiz do repositório alvo/);
});

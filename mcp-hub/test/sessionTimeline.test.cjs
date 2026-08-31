const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { logSessionEvent } = require('../dist/tools/logSessionEvent.js');

test('registra eventos estruturados na timeline de sessão compartilhada', async t => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-mcp-session-'));
  t.after(() => fs.rmSync(workspaceRoot, { recursive: true, force: true }));

  const event1 = await logSessionEvent({
    batch_id: 'BATCH-044',
    agent_id: 'antigravity-architect',
    role: 'architect',
    summary: 'Handoff formalizado e despachado para a Tríade',
    details: 'REQ-042 aprovada com escopo de watcher e sessões.'
  }, workspaceRoot);

  assert.equal(event1.batchId, 'BATCH-044');
  assert.equal(event1.agentId, 'antigravity-architect');
  assert.equal(event1.role, 'architect');
  assert.equal(event1.sessionFile, 'sdd/sessions/batch-044-stream.md');

  const streamPath = path.join(workspaceRoot, 'sdd', 'sessions', 'batch-044-stream.md');
  assert.ok(fs.existsSync(streamPath), 'O arquivo de stream da sessão deve existir');

  const contentAfterFirst = fs.readFileSync(streamPath, 'utf8');
  assert.match(contentAfterFirst, /# Sessão Compartilhada — BATCH-044/);
  assert.match(contentAfterFirst, /antigravity-architect \(architect\)/);
  assert.match(contentAfterFirst, /Handoff formalizado e despachado/);

  const event2 = await logSessionEvent({
    batch_id: 'BATCH-044',
    agent_id: 'codex-executor',
    role: 'executor',
    summary: 'Iniciada implementação do HubTaskWatcher e componentes'
  }, workspaceRoot);

  assert.equal(event2.agentId, 'codex-executor');
  assert.equal(event2.role, 'executor');

  const contentAfterSecond = fs.readFileSync(streamPath, 'utf8');
  assert.match(contentAfterSecond, /codex-executor \(executor\)/);
  assert.match(contentAfterSecond, /Iniciada implementação do HubTaskWatcher/);

  await assert.rejects(
    logSessionEvent({
      batch_id: 'invalido',
      agent_id: 'agent',
      role: 'executor',
      summary: 'falha'
    }, workspaceRoot),
    /Invalid batch_id/
  );
});

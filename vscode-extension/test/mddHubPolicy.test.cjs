const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const policy = require('../out/mddHubPolicy.js');
const manifest = require('../package.json');
const en = require('../package.nls.json');
const pt = require('../package.nls.pt-br.json');

test('server specs use explicit argv (no shell) and a bounded port', () => {
  const client = policy.buildMddClientSpec('C:/m/.venv-mdd/Scripts/mdd.exe', 'C:/repo', 9000);
  assert.deepEqual(client.args, ['daemon', '--mcp', '--transport', 'sse', '--port', '9000', '--path', 'C:/repo']);
  assert.equal(client.port, 9000);
  assert.equal(client.stdio, false);
  assert.equal(policy.buildMddClientSpec('mdd', '/r', 70000).port, policy.DEFAULT_MDD_PORT);
  assert.equal(policy.normalizePort('abc'), 8765);
  const hub = policy.buildHubSpec('/ws');
  assert.equal(hub.command, 'node');
  assert.equal(hub.args[0], path.join('/ws', 'mcp-hub', 'dist', 'index.js'));
  assert.equal(hub.stdio, true);
});

test('stop kills the Windows process tree and refuses invalid PIDs', () => {
  assert.deepEqual(policy.buildStopCommand(42, 'win32'), { command: 'taskkill', args: ['/PID', '42', '/T', '/F'] });
  assert.deepEqual(policy.buildStopCommand(42, 'linux'), { command: 'kill', args: ['-TERM', '42'] });
  assert.equal(policy.buildStopCommand(0, 'win32'), undefined);
  assert.equal(policy.buildStopCommand(-1, 'win32'), undefined);
});

test('status is RUNNING only with a record, a live PID and (when probed) an open port', () => {
  const record = { pid: 10, port: 8765, startedAt: 'now' };
  assert.equal(policy.resolveServerStatus('mdd-client', record, true, true).state, 'RUNNING');
  assert.equal(policy.resolveServerStatus('mdd-client', record, true, false).state, 'STOPPED');
  assert.equal(policy.resolveServerStatus('mdd-client', record, false, true).state, 'STOPPED');
  assert.equal(policy.resolveServerStatus('conn2flow-hub', undefined, true).state, 'STOPPED');
  assert.equal(policy.describeServerStatus({ id: 'mdd-client', state: 'RUNNING', pid: 10, port: 8765 }), 'RUNNING · PID 10 · 127.0.0.1:8765');
  assert.equal(policy.describeServerStatus({ id: 'conn2flow-hub', state: 'RUNNING', pid: 7 }), 'RUNNING · PID 7');
  assert.equal(policy.describeServerStatus({ id: 'conn2flow-hub', state: 'STOPPED' }), 'STOPPED');
});

test('hub handshake is a valid initialize request and the reply detector tolerates noise', () => {
  const request = JSON.parse(policy.buildHubHandshake());
  assert.equal(request.method, 'initialize');
  assert.equal(request.id, 1);
  const reply = JSON.stringify({ jsonrpc: '2.0', id: 1, result: { serverInfo: { name: 'conn2flow-mcp-hub' } } });
  assert.ok(policy.isHubHandshakeReply(`garbage\n${reply}\n`));
  assert.ok(!policy.isHubHandshakeReply('{"jsonrpc":"2.0","id":2,"result":{}}'));
});

test('real hub dist answers the handshake the view sends', async () => {
  const dist = path.resolve(__dirname, '../../mcp-hub/dist/index.js');
  if (!fs.existsSync(dist)) return;
  const { spawn } = require('node:child_process');
  const child = spawn(process.execPath, [dist], { stdio: ['pipe', 'pipe', 'ignore'] });
  const output = await new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error('timeout')), 5000);
    child.stdout.on('data', chunk => {
      buffer += chunk;
      if (policy.isHubHandshakeReply(buffer)) { clearTimeout(timer); resolve(buffer); }
    });
    child.stdin.write(policy.buildHubHandshake());
  });
  child.stdin.end();
  assert.ok(policy.isHubHandshakeReply(output));
});

test('feedback argv mirrors the mdd CLI contract', () => {
  assert.deepEqual(policy.buildFeedbackListArgs('/m'), ['feedback', 'list', '--json', '--matrix', '/m']);
  assert.deepEqual(policy.buildFeedbackListArgs('/m', true), ['feedback', 'list', '--json', '--matrix', '/m', '--include-github']);
  assert.deepEqual(policy.buildTriageArgs('/m', 'fb-007', 'ACCEPT', '  evidência\n confirmada '),
    ['feedback', 'triage', 'FB-007', '--verdict', 'ACCEPT', '--reason', 'evidência confirmada', '--reviewer', 'curator', '--matrix', '/m', '--json']);
  assert.throws(() => policy.buildTriageArgs('/m', 'GH-1', 'ACCEPT', 'x'), /invalidId/);
  assert.throws(() => policy.buildTriageArgs('/m', 'FB-001', 'MAYBE', 'x'), /invalidVerdict/);
  assert.throws(() => policy.buildTriageArgs('/m', 'FB-001', 'REJECT', '   '), /reasonRequired/);
  assert.deepEqual([...policy.FEEDBACK_VERDICTS], ['ACCEPT', 'NEEDS_EVIDENCE', 'QUARANTINE', 'REJECT', 'LOCAL_ONLY']);
});

test('feedback list parsing groups by verdict (PENDING first) and severity', () => {
  const rows = [
    { id: 'FB-002', verdict: 'PENDING', severity: 'low', skill: 's', repo: 'r', summary_short: 'b', path: 'memory/inbox/feedback/FB-002-b.md', source: 'inbox' },
    { id: 'FB-001', verdict: 'ACCEPT', severity: 'high', skill: 's', repo: 'r', summary_short: 'a', source: 'inbox' },
    { id: 'FB-003', verdict: 'PENDING', severity: 'high', skill: 'c2f-x', repo: 'site', summary_short: 'c', source: 'inbox' },
    { id: 'GH-9', verdict: 'PENDING', title: 'issue', github_issue: 'https://github.com/o/r/issues/9', source: 'github' },
    { title: 'no id' }
  ];
  const records = policy.parseFeedbackList(`warning line\n${JSON.stringify(rows)}\n`);
  assert.equal(records.length, 4);
  const groups = policy.groupFeedback(records);
  assert.deepEqual(groups.map(g => g.verdict), ['PENDING', 'ACCEPT']);
  assert.deepEqual(groups[0].items.map(i => i.id), ['FB-003', 'FB-002', 'GH-9']);
  assert.equal(policy.describeFeedback(groups[0].items[0]), 'high · c2f-x · site');
  assert.ok(policy.canTriage(groups[0].items[0]));
  assert.ok(!policy.canTriage(groups[0].items[2]));
  assert.throws(() => policy.parseFeedbackList('{"not":"array"}'), /JSON array/);
  assert.deepEqual(policy.parseFeedbackList('[]'), []);
});

test('manifest declares the MDD Hub view, commands, menus and localized titles', () => {
  const views = manifest.contributes.views['conn2flow-view-container'].map(view => view.id);
  assert.deepEqual(views, ['conn2flow-explorer', 'conn2flow-mdd-hub']);
  assert.equal(en['view.mddHub'], 'MDD Hub & Skills Control');
  const ids = ['refresh', 'start', 'stop', 'restart', 'triageFeedback', 'openFeedback', 'toggleGithub'].map(name => `conn2flow.mddHub.${name}`);
  const declared = new Set(manifest.contributes.commands.map(command => command.command));
  const extension = fs.readFileSync(path.resolve(__dirname, '../out/extension.js'), 'utf8');
  for (const id of ids) {
    assert.ok(declared.has(id), `${id} not declared`);
    assert.ok(extension.includes(`'${id}'`), `${id} not registered`);
    assert.equal(typeof en[`command.${id}`], 'string');
    assert.equal(typeof pt[`command.${id}`], 'string');
  }
  const context = manifest.contributes.menus['view/item/context'].map(entry => `${entry.command}|${entry.when}`);
  assert.ok(context.some(entry => entry.startsWith('conn2flow.mddHub.start|') && entry.includes('mddHubServer.stopped')));
  assert.ok(context.some(entry => entry.startsWith('conn2flow.mddHub.stop|') && entry.includes('mddHubServer.running')));
  assert.ok(context.some(entry => entry.startsWith('conn2flow.mddHub.triageFeedback|') && entry.includes('mddHubFeedback.triage')));
  assert.equal(manifest.contributes.configuration.properties['conn2flow.mddHub.port'].default, 8765);
});

test('visible labels say MDD while the legacy sdd/ fallback stays wired', () => {
  for (const catalog of [en, pt]) {
    for (const [key, value] of Object.entries(catalog)) {
      assert.doesNotMatch(value, /\bSDD\b/, `${key} still shows SDD`);
    }
  }
  const { en: runtimeEn, ptBR } = require('../out/localizationCatalog.js');
  for (const catalog of [runtimeEn, ptBR]) {
    for (const [key, value] of Object.entries(catalog)) {
      assert.doesNotMatch(value, /\bSDD\b/, `runtime ${key} still shows SDD`);
    }
  }
  const scope = fs.readFileSync(path.resolve(__dirname, '../src/providers/sddScopeManager.ts'), 'utf8');
  assert.match(scope, /'sdd'/, 'legacy sdd/ discovery must remain');
  assert.match(scope, /'memory'/);
});

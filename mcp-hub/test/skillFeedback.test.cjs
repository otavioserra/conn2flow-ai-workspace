const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { McpServer } = require('../dist/server.js');
const { submitSkillFeedback, listSkillFeedback, resolveMddCommand } = require('../dist/tools/skillFeedback.js');

// Fake mdd CLI: echoes its argv as JSON, or fails on demand. No Python, no network.
function fakeCli(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-mcp-feedback-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const script = path.join(dir, 'fake-mdd.cjs');
  fs.writeFileSync(script, [
    "const argv = process.argv.slice(2);",
    "if (argv.includes('rant')) { process.stderr.write('ValueError: Invalid kind: rant'); process.exit(1); }",
    "process.stdout.write('noise\\n' + JSON.stringify({ argv }) + '\\n');"
  ].join('\n'));
  return { dir, command: [process.execPath, script] };
}

test('submit maps arguments to explicit argv and keeps flags safe', async t => {
  const { dir, command } = fakeCli(t);
  const result = await submitSkillFeedback({
    persona: 'executor', skill: 'c2f-persona-executor', kind: 'gap', severity: 'high',
    summary: 'texto; rm -rf /', evidence: 'batch-091.md:10', req: 'REQ-089', github: true
  }, { workspaceRoot: dir, command });
  const argv = result.argv;
  assert.deepEqual(argv.slice(0, 5), ['feedback', 'submit', '--json', '--matrix', path.resolve(dir)]);
  assert.equal(argv[argv.indexOf('--summary') + 1], 'texto; rm -rf /');
  assert.equal(argv[argv.indexOf('--req') + 1], 'REQ-089');
  assert.ok(argv.includes('--github'));
  await assert.rejects(submitSkillFeedback({ persona: 'executor', skill: 's', kind: 'rant', severity: 'low', summary: 'x', evidence: 'y' },
    { workspaceRoot: dir, command }), /Invalid kind/);
  await assert.rejects(submitSkillFeedback({ persona: 'executor', skill: 's', kind: 'gap', severity: 'low', summary: ' ', evidence: 'y' },
    { workspaceRoot: dir, command }), /summary/);
});

test('list forwards filters and resolves the CLI', async t => {
  const { dir, command } = fakeCli(t);
  const { argv } = await listSkillFeedback({ verdict: 'ACCEPT', skill: 'c2f-persona-curator', include_github: true }, { workspaceRoot: dir, command });
  assert.deepEqual(argv, ['feedback', 'list', '--json', '--matrix', path.resolve(dir), '--verdict', 'ACCEPT', '--skill', 'c2f-persona-curator', '--include-github']);
  const previous = process.env.MDD_CLI;
  t.after(() => { if (previous === undefined) delete process.env.MDD_CLI; else process.env.MDD_CLI = previous; });
  process.env.MDD_CLI = JSON.stringify(['python', '-m', 'mdd_client.cli']);
  assert.deepEqual(resolveMddCommand(dir), ['python', '-m', 'mdd_client.cli']);
  delete process.env.MDD_CLI;
  assert.deepEqual(resolveMddCommand(dir), ['mdd']);
});

test('server exposes feedback tools beside the existing ones', async () => {
  const response = await new McpServer().handleRequest({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
  const names = response.result.tools.map(tool => tool.name);
  assert.deepEqual(names, ['c2f_run_command', 'dispatch_task', 'report_completion', 'log_session_event', 'submit_skill_feedback', 'list_skill_feedback']);
});

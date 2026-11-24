const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const manifest = require('../package.json');
const nlsEn = require('../package.nls.json');
const nlsPt = require('../package.nls.pt-br.json');
const { buildRemoteSyncArgs, DEFAULT_REMOTE_MATRIX, parseRemoteSyncReport, remoteSyncDue,
  REMOTE_SKILLS_COMMAND } = require('../out/mddRemoteSyncPolicy.js');
const report = { status: 'PASS', domain: 'generic', revision: 'a'.repeat(40), available: ['a'], updated: [],
  conflicts: [], customized: [], metadata_changed: false };

test('remote skill settings and command are declared for the Hub and localized', () => {
  const properties = manifest.contributes.configuration.properties;
  assert.deepEqual(properties['conn2flow.autoSyncSkills'].enum, ['off', 'notify', 'auto']);
  assert.equal(properties['conn2flow.autoSyncSkills'].default, 'notify');
  assert.equal(properties['conn2flow.autoSyncIntervalHours'].default, 24);
  assert.equal(properties['conn2flow.remoteMatrixUrl'].default, DEFAULT_REMOTE_MATRIX);
  const command = manifest.contributes.commands.find(item => item.command === REMOTE_SKILLS_COMMAND);
  assert.match(command.enablement, /isWorkspaceTrusted/);
  assert.equal(nlsEn['command.' + REMOTE_SKILLS_COMMAND], 'Sync Remote Skills (GitHub)');
  assert.equal(nlsPt['command.' + REMOTE_SKILLS_COMMAND], 'Sincronizar Skills Remotas (GitHub)');
  assert.ok(manifest.contributes.menus['view/title'].some(item => item.command === REMOTE_SKILLS_COMMAND &&
    item.when.includes('conn2flow-mdd-hub')));
});

test('remote skill policy enforces modes and interval and parses the CLI report', () => {
  const elapsed = 24 * 3_600_000;
  assert.equal(remoteSyncDue('off', 24, undefined, elapsed), false);
  assert.equal(remoteSyncDue('notify', 24, 0, elapsed - 1), false);
  assert.equal(remoteSyncDue('notify', 24, 0, elapsed), true);
  assert.equal(remoteSyncDue('auto', 24, undefined, 100), true);
  assert.equal(remoteSyncDue('auto', 24, elapsed, 0), true);
  assert.equal(remoteSyncDue('notify', NaN, 0, elapsed), true);
  assert.deepEqual(buildRemoteSyncArgs('folder with spaces', 'generic', DEFAULT_REMOTE_MATRIX, true),
    ['sync', '--remote', '--check-only', '--json', '--path', 'folder with spaces', '--domain', 'generic',
      '--source-url', DEFAULT_REMOTE_MATRIX]);
  assert.ok(buildRemoteSyncArgs('.', undefined, DEFAULT_REMOTE_MATRIX, false).includes('--apply'));
  assert.deepEqual(parseRemoteSyncReport(JSON.stringify(report)), report);
  assert.throws(() => parseRemoteSyncReport('{"status":"PASS"}'), /Invalid remote skill sync response/);
});

test('remote sync manager honors trust, mode, persisted intervals and manual sync', async t => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'mdd-extension-test-'));
  t.after(() => {
    fs.rmdirSync(path.join(base, '.codex', 'skills'));
    fs.rmdirSync(path.join(base, '.codex'));
    fs.rmdirSync(base);
  });
  fs.mkdirSync(path.join(base, '.codex', 'skills'), { recursive: true });
  const folder = { name: 'workspace', uri: { scheme: 'file', fsPath: base, toString: () => 'file://' + base } };
  const calls = [], notices = [], logs = [], storage = new Map();
  let mode = 'notify';
  let repaint = 0;
  const noopSubscription = () => ({ dispose() {} });
  const api = {
    workspace: { isTrusted: false, workspaceFolders: [folder], onDidGrantWorkspaceTrust: noopSubscription,
      onDidChangeWorkspaceFolders: noopSubscription, onDidChangeConfiguration: noopSubscription,
      getConfiguration: () => ({ get: (key, fallback) => key === 'autoSyncSkills' ? mode : fallback }) },
    window: { setStatusBarMessage: (...args) => notices.push(args),
      withProgress: (_, run) => run() }
  };
  const cli = {
    runMdd: async (args, cwd) => {
      calls.push({ args, cwd });
      return JSON.stringify({ ...report, updated: args.includes('--apply') ? ['a'] : [] });
    },
    log: line => logs.push(line)
  };
  const originalLoad = Module._load;
  let Manager;
  Module._load = function (request, parent, ...rest) {
    if (parent?.filename.endsWith('mddRemoteSyncManager.js')) {
      if (request === 'vscode') return api;
      if (request === './mddHubManager') return { MddHubManager: cli };
      if (request === './localizationManager') return { LocalizationManager: { t: key => key } };
    }
    return originalLoad.call(this, request, parent, ...rest);
  };
  try {
    Manager = require('../out/providers/mddRemoteSyncManager.js').MddRemoteSyncManager;
  } finally {
    Module._load = originalLoad;
  }
  const manager = new Manager({ get: key => storage.get(key), update: async (key, value) => storage.set(key, value) },
    () => repaint++);
  t.after(() => manager.dispose());
  await manager.runManual();
  assert.equal(calls.length, 0);
  api.workspace.isTrusted = true;
  await manager.tick();
  assert.ok(calls[0].args.includes('--check-only'));
  assert.equal(calls[0].cwd, base);
  assert.equal(manager.pendingUpdates(), 1);
  assert.equal(notices.at(-1)[0], 'mddHub.remoteSyncAvailable');
  await manager.tick();
  assert.equal(calls.length, 1);
  mode = 'off';
  await manager.tick();
  assert.equal(calls.length, 1);
  await manager.runManual();
  assert.ok(calls[1].args.includes('--apply'));
  assert.equal(manager.pendingUpdates(), 0);
  assert.equal(notices.at(-1)[0], 'mddHub.remoteSyncResult');
  mode = 'auto';
  await manager.tick();
  assert.ok(calls[2].args.includes('--apply'));
  assert.match(logs.at(-1), /remoteSkillSync/);
  assert.equal(repaint, 3);
  manager.dispose();
  await manager.tick();
  assert.equal(calls.length, 3);
});

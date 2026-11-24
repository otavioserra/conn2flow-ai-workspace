// REQ-093 / BATCH-095: v1.2.1 polish (UTF-8, triage menu, progress, external hub) + ARCH-019 domain picker.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const policy = require('../out/mddHubPolicy.js');
const domains = require('../out/domainPolicy.js');
const manifest = require('../package.json');
const en = require('../package.nls.json');
const pt = require('../package.nls.pt-br.json');
const { en: catalogEn, ptBR: catalogPt } = require('../out/localizationCatalog.js');

const matrix = path.resolve(__dirname, '../..');
const source = file => fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');

test('mdd runs in Python UTF-8 mode without dropping the inherited environment', () => {
  const env = policy.buildMddEnv({ PATH: '/bin', PYTHONIOENCODING: 'cp1252' });
  assert.equal(env.PYTHONUTF8, '1');
  assert.equal(env.PYTHONIOENCODING, 'utf-8');
  assert.equal(env.PATH, '/bin');
  const manager = source('providers/mddHubManager.ts');
  assert.match(manager, /public static runMdd[\s\S]*?env: buildMddEnv\(\)/);
  assert.match(manager, /stdio: \['ignore', fd, fd\], env: buildMddEnv\(\)/);
});

test('UTF-8 env makes a real piped Python print accents intact', t => {
  const python = path.join(matrix, '.venv-mdd', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  if (!fs.existsSync(python)) { t.skip('matrix .venv-mdd not available'); return; }
  const script = "import sys; sys.stdout.write('dele\\u00e7\\u00e3o \\u00e9 \\u2014 ok')";
  const output = execFileSync(python, ['-c', script], { encoding: 'utf8', env: policy.buildMddEnv() });
  assert.equal(output, 'deleção é — ok');
});

test('external conn2flow-hub processes are detected from the process listing', () => {
  assert.ok(policy.isHubCommandLine('"C:\\Program Files\\nodejs\\node.exe" C:\\ws\\mcp-hub\\dist\\index.js'));
  assert.ok(policy.isHubCommandLine('node /home/u/ws/mcp-hub/dist/index.js'));
  assert.ok(!policy.isHubCommandLine('node /ws/other/dist/index.js'));
  assert.ok(!policy.isHubCommandLine('code --open /ws/mcp-hub/dist/index.js'));
  assert.ok(!policy.isHubCommandLine(null));

  const windows = JSON.stringify([
    { ProcessId: 40, CommandLine: '"C:\\nodejs\\node.exe" C:\\ws\\mcp-hub\\dist\\index.js' },
    { ProcessId: 12, CommandLine: 'node.exe C:/ws/mcp-hub/dist/index.js' },
    { ProcessId: 77, CommandLine: null },
    { ProcessId: 90, CommandLine: 'node.exe server.js' }
  ]);
  assert.deepEqual(policy.parseHubProcesses(windows, 'win32'), [12, 40]);
  assert.deepEqual(policy.parseHubProcesses(windows, 'win32', [12]), [40]);
  assert.deepEqual(policy.parseHubProcesses(JSON.stringify({ ProcessId: 5, CommandLine: 'node mcp-hub/dist/index.js' }), 'win32'), [5]);
  assert.deepEqual(policy.parseHubProcesses('', 'win32'), []);
  assert.deepEqual(policy.parseHubProcesses('  101 node /ws/mcp-hub/dist/index.js\n  102 bash\n', 'linux'), [101]);

  const listing = policy.buildProcessListCommand('win32');
  assert.equal(listing.command, 'powershell.exe');
  assert.match(listing.args.at(-1), /Win32_Process[\s\S]*ConvertTo-Json/);
  assert.deepEqual(policy.buildProcessListCommand('linux'), { command: 'ps', args: ['-eo', 'pid=,args='] });
});

test('external hub shows RUNNING (external) and exposes no Start/Stop/Restart', () => {
  const stopped = { id: 'conn2flow-hub', state: 'STOPPED' };
  const external = policy.resolveExternalHubStatus(stopped, [321, 400]);
  assert.deepEqual(external, { id: 'conn2flow-hub', state: 'RUNNING', pid: 321, external: true });
  assert.equal(policy.describeServerStatus(external, 'pt-BR'), 'EM EXECUÇÃO (externo) · PID 321');
  assert.equal(policy.serverContextValue(external), 'mddHubServer.external');
  assert.equal(policy.resolveExternalHubStatus(stopped, []), stopped);
  const own = { id: 'conn2flow-hub', state: 'RUNNING', pid: 9 };
  assert.equal(policy.resolveExternalHubStatus(own, [321]), own);
  assert.equal(policy.serverContextValue(own), 'mddHubServer.running');
  const inline = manifest.contributes.menus['view/item/context'].filter(item => item.when.includes('mddHubServer'));
  assert.ok(inline.every(item => !item.when.includes('mddHubServer.external')));
  assert.match(source('providers/mddHubManager.ts'), /cached\?\.external[\s\S]*mddHub\.externalNotManaged/);
});

test('triage is reachable from the right-click menu as well as inline', () => {
  const menus = manifest.contributes.menus['view/item/context'].filter(item => item.command === 'conn2flow.mddHub.triageFeedback');
  assert.ok(menus.some(item => item.group.startsWith('inline')));
  const context = menus.find(item => !item.group.startsWith('inline'));
  assert.ok(context, 'triage must also be in the context menu');
  assert.match(context.when, /viewItem == mddHubFeedback\.triage/);
});

test('Refresh and Toggle GitHub report progress and completion', () => {
  const extension = source('extension.ts');
  assert.match(extension, /withProgress\(\s*\{ location: \{ viewId: 'conn2flow-mdd-hub' \}/);
  assert.match(extension, /'conn2flow\.mddHub\.refresh'[\s\S]*?withHubProgress[\s\S]*?mddHub\.refreshed/);
  assert.match(extension, /'conn2flow\.mddHub\.toggleGithub'[\s\S]*?githubStateOn[\s\S]*?withHubProgress[\s\S]*?mddHub\.githubToggled/);
  for (const key of ['mddHub.refreshing', 'mddHub.refreshed', 'mddHub.githubToggling', 'mddHub.githubToggled', 'mddHub.serverState.external']) {
    assert.ok(catalogEn[key] && catalogPt[key], key);
  }
});

test('.vscode/mcp.json keeps only the VS Code "servers" key', () => {
  const config = JSON.parse(fs.readFileSync(path.join(matrix, '.vscode/mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(config), ['servers']);
  assert.equal(config.servers['conn2flow-hub'].type, 'stdio');
  assert.match(config.servers['conn2flow-hub'].args[0], /mcp-hub[\\/]dist[\\/]index\.js$/);
});

test('conn2flow.projectDomain is an open string (default auto), never a closed enum', () => {
  const setting = manifest.contributes.configuration.properties['conn2flow.projectDomain'];
  assert.equal(setting.type, 'string');
  assert.equal(setting.default, 'auto');
  assert.equal(setting.enum, undefined);
  assert.ok(new RegExp(setting.pattern).test('laravel') && new RegExp(setting.pattern).test('auto'));
  assert.ok(!new RegExp(setting.pattern).test('Bad Domain'));
  assert.ok(en['config.projectDomain.description'] && pt['config.projectDomain.description']);
  assert.equal(domains.normalizeProjectDomain(' Laravel '), 'laravel');
  assert.equal(domains.normalizeProjectDomain('../x'), 'auto');
  assert.equal(domains.normalizeProjectDomain(undefined), 'auto');
  assert.ok(domains.isConn2FlowDomain('auto') && domains.isConn2FlowDomain('conn2flow'));
  assert.ok(!domains.isConn2FlowDomain('generic') && !domains.isConn2FlowDomain('nextjs'));
});

test('Initialize MDD builds bootstrap argv and a dynamic picker from --list-domains', () => {
  assert.deepEqual(domains.buildListDomainsArgs('/p', '/m'), ['bootstrap', '--list-domains', '--json', '--path', '/p', '--matrix', '/m']);
  assert.deepEqual(domains.buildBootstrapArgs('/p', 'Laravel'), ['bootstrap', '--path', '/p', '--domain', 'laravel', '--json']);
  const catalog = domains.parseDomainList('noise\n' + JSON.stringify({
    domains: [{ id: 'conn2flow', name: 'Conn2Flow', description: 'c', skills_mode: 'all-canonical' },
      { id: 'generic', name: 'Generic', description: 'g', skills_mode: 'core-mdd-only', generate_local_project_skill: true },
      { id: 'nextjs', name: 'Next.js', description: 'added by PR', skills_mode: 'explicit' },
      { id: 'BAD id', name: 'x' }],
    detected: { id: 'nextjs', evidence: ['file:next.config.js'], fallback: false },
    errors: [{ domain: 'broken', error: 'id must match' }]
  }));
  assert.deepEqual(catalog.domains.map(item => item.id), ['conn2flow', 'generic', 'nextjs']);
  assert.equal(catalog.errors[0].domain, 'broken');
  const labels = { auto: d => `auto(${d})`, autoDetail: e => `ev ${e}`, fallback: 'fallback', current: 'current' };
  const items = domains.buildDomainPickItems(catalog, 'nextjs', labels);
  assert.deepEqual(items.map(item => item.domainId), ['auto', 'conn2flow', 'generic', 'nextjs']);
  assert.equal(items[0].description, 'auto(nextjs)');
  assert.equal(items[0].detail, 'ev file:next.config.js');
  assert.deepEqual(items.filter(item => item.picked).map(item => item.domainId), ['nextjs']);
  assert.equal(items[3].description, 'Next.js · current');
  assert.ok(domains.buildDomainPickItems(catalog, 'whatever', labels)[0].picked !== true);
  assert.throws(() => domains.parseDomainList('not json'), /JSON/);

  const summary = domains.parseBootstrapReport(JSON.stringify({
    domain: 'generic', skills: { installed: ['a', 'b'], preserved: ['c'] },
    memory: { created: ['x'], preserved: false }, local_skill: { created: ['.claude/skills/p-project-guide/SKILL.md'] }
  }));
  assert.deepEqual(summary, { domain: 'generic', installed: 2, preserved: 1, memoryCreated: 1, memoryPreserved: false,
    localSkills: ['.claude/skills/p-project-guide/SKILL.md'] });
});

test('Initialize MDD is declared, registered, localized and hides Conn2Flow sections for other domains', () => {
  const command = manifest.contributes.commands.find(item => item.command === 'conn2flow.mdd.initProject');
  assert.ok(command);
  assert.equal(pt['command.conn2flow.mdd.initProject'], 'Inicializar MDD neste Projeto');
  assert.match(fs.readFileSync(path.join(__dirname, '../out/extension.js'), 'utf8'), /conn2flow\.mdd\.initProject/);
  const tree = source('providers/conn2flowTreeProvider.ts');
  assert.match(tree, /this\.leaf\('mdd\.initProject', 'conn2flow\.mdd\.initProject'/);
  assert.match(tree, /isConn2FlowDomain\([\s\S]*?\.\.\.\(conn2flow \? \[[\s\S]*?section\.core[\s\S]*?section\.projects[\s\S]*?section\.diagnostics/);
  const bootstrap = source('providers/mddBootstrapManager.ts');
  assert.match(bootstrap, /buildListDomainsArgs[\s\S]*buildDomainPickItems[\s\S]*buildBootstrapArgs/);
  assert.match(bootstrap, /config\.update\('projectDomain'/);
  assert.equal(catalogPt['mdd.initProject'], '🚀 Inicializar MDD neste Projeto');
});

test('real mdd bootstrap --list-domains feeds the picker (matrix catalog)', t => {
  const mdd = path.join(matrix, '.venv-mdd', process.platform === 'win32' ? 'Scripts/mdd.exe' : 'bin/mdd');
  if (!fs.existsSync(mdd)) { t.skip('matrix .venv-mdd not available'); return; }
  const stdout = execFileSync(mdd, domains.buildListDomainsArgs(matrix, matrix), { encoding: 'utf8', env: policy.buildMddEnv() });
  const catalog = domains.parseDomainList(stdout);
  assert.ok(['conn2flow', 'generic'].every(id => catalog.domains.some(item => item.id === id)));
  assert.equal(catalog.detected.id, 'conn2flow');
  assert.deepEqual(catalog.errors, []);
});

test('release version is consistent in the manifest, lockfile and changelog', () => {
  const lock = require('../package-lock.json');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
  assert.ok(fs.readFileSync(path.join(__dirname, '../CHANGELOG.md'), 'utf8').includes('## ' + manifest.version + ' — '));
});

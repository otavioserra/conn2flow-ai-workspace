const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { collectMarkdownDocuments } = require('../out/documentationSearchPolicy.js');
const { buildVmLogCommand, describeVmConnection, normalizeVmConnection } = require('../out/vmDiagnosticsPolicy.js');
const { nextPatchVersion } = require('../scripts/bump-version.cjs');

test('busca recursiva agrega acervos Markdown sem duplicar caminhos', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-docs-'));
  try {
    fs.mkdirSync(path.join(root, 'nested'));
    fs.writeFileSync(path.join(root, 'guia.md'), '# Guia principal\n', 'utf8');
    fs.writeFileSync(path.join(root, 'nested', 'api.md'), '# Referência da API\n', 'utf8');
    fs.writeFileSync(path.join(root, 'ignored.txt'), 'fora', 'utf8');

    const entries = collectMarkdownDocuments([
      { rootPath: root, label: 'Core docs' },
      { rootPath: root, label: 'Duplicado' }
    ]);

    assert.equal(entries.length, 2);
    assert.deepEqual(entries.map(entry => entry.label), ['Guia principal', 'Referência da API']);
    assert.ok(entries.every(entry => entry.description.startsWith('Core docs ·')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('comando de log VM valida SSH e limita leitura a 100 linhas', () => {
  const connection = normalizeVmConnection({
    user: 'deploy',
    host: '192.0.2.10',
    port: 2222,
    targetPath: '/home/site/conn2flow-gestor/'
  });
  assert.ok(connection);
  assert.equal(describeVmConnection(connection), 'deploy@192.0.2.10:2222');

  const command = buildVmLogCommand(connection, 'php-error.log');
  assert.match(command, /BatchMode=yes/);
  assert.match(command, /tail -n 100/);
  assert.match(command, /\/logs\/php-error\.log/);
  assert.equal(normalizeVmConnection({ user: 'x;whoami', host: 'host', port: 22, targetPath: '/srv/app' }), undefined);
  assert.equal(normalizeVmConnection({ user: '-option', host: 'host', port: 22, targetPath: '/srv/app' }), undefined);
  assert.equal(normalizeVmConnection({ user: 'deploy', host: 'host', port: 22, targetPath: '/srv/../etc' }), undefined);
});

test('notificações rotineiras não usam showInformationMessage', () => {
  const sourceRoot = path.resolve(__dirname, '..', 'src');
  const files = [];
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.name.endsWith('.ts')) files.push(full);
    }
  };
  visit(sourceRoot);

  const joined = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(joined, /showInformationMessage/);
  assert.match(joined, /setStatusBarMessage\([\s\S]*?3000\)/);
});

test('manifesto inicia em 1.1.0 e empacotamento aciona bump patch automático', () => {
  const manifest = require('../package.json');
  const lock = require('../package-lock.json');
  assert.equal(manifest.version, '1.1.0');
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
  assert.equal(nextPatchVersion(manifest.version), '1.1.1');
  assert.match(manifest.scripts.package, /version:bump/);
  assert.match(manifest.scripts['version:bump:dry-run'], /--dry-run/);
});

test('árvore expõe busca técnica e logs remotos, e update-all confirma somente VM local', () => {
  const extension = fs.readFileSync(require.resolve('../src/extension.ts'), 'utf8');
  const tree = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const projects = fs.readFileSync(require.resolve('../src/providers/projectsManager.ts'), 'utf8');

  assert.match(tree, /'docs\.search',\s*'conn2flow\.docs\.search'/);
  assert.match(tree, /'diagnostics\.vmPhpLogs',\s*'conn2flow\.vm\.logsPhp'/);
  assert.match(tree, /'diagnostics\.vmNginxLogs',\s*'conn2flow\.vm\.logsNginx'/);
  assert.match(extension, /conn2flow[\\/]ai-workspace[\\/]pt-br[\\/]docs/);
  assert.match(extension, /remoteConfirmationArgument\(target\)/);
  assert.match(extension, /remoteConfirmationArgument\(projectId\)/);
  assert.match(projects, /isProjectVmLocal\(projectId\) \? ' --confirmar-remoto' : ''/);
});

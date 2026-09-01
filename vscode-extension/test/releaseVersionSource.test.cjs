const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  productVersionCandidates,
  resolveProductVersion,
  PRODUCT_VERSION_SOURCES
} = require('../out/releasePolicy.js');

const GUARD_FILE = 'gestor-instalador/src/InstallerGuard.php';
const INDEX_FILE = 'gestor-instalador/index.php';
const CONFIG_FILE = 'gestor/config.php';

// Recorte fiel de `gestor-instalador/src/InstallerGuard.php` a partir do instalador v2.
const GUARD_V2 = [
  '<?php',
  '',
  'class InstallerGuard',
  '{',
  '    /** Versão corrente do gestor instalador. Fonte única para o index e o runner headless. */',
  "    const VERSION = '2.1.0';",
  '',
  "    const KEY_FILE = 'install-key.txt';",
  '}',
  ''
].join('\n');

// Recorte fiel de `gestor-instalador/index.php` no instalador v2: referencia a constante,
// sem literal na atribuição. É exatamente o formato que quebrava o preflight antes da REQ-045.
const INDEX_V2 = [
  '<?php',
  "require_once __DIR__ . '/src/InstallerGuard.php';",
  '',
  "$_GESTOR_INSTALADOR['versao']\t\t\t\t=\tInstallerGuard::VERSION; // Versão do gestor instalador (2.1.0).",
  ''
].join('\n');

// Formato legado do instalador v1: literal direto na atribuição, sem InstallerGuard.
const INDEX_V1 = [
  '<?php',
  "$_GESTOR_INSTALADOR['versao']\t=\t'1.9.4'; // Versão do gestor instalador.",
  ''
].join('\n');

const CONFIG_MANAGER = [
  '<?php',
  "$_GESTOR['versao']\t=\t'2.10.1';",
  ''
].join('\n');

/** Constrói um leitor de fontes a partir de um mapa arquivo -> conteúdo. */
function readerFor(files) {
  return file => (Object.prototype.hasOwnProperty.call(files, file) ? files[file] : undefined);
}

test('le a versao canonica do instalador em InstallerGuard.php', () => {
  const resolved = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [GUARD_FILE]: GUARD_V2, [INDEX_FILE]: INDEX_V2 })
  );

  assert.equal(resolved.version, '2.1.0');
  assert.equal(resolved.file, GUARD_FILE);
});

test('nao regride quando o index.php apenas referencia InstallerGuard::VERSION', () => {
  // Regressao da REQ-045: sozinho, o index v2 nao carrega literal e o preflight falhava.
  const somenteIndex = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [INDEX_FILE]: INDEX_V2 })
  );

  assert.equal(somenteIndex.version, undefined);
  assert.deepEqual(somenteIndex.candidates, [GUARD_FILE, INDEX_FILE]);

  // Com o guard presente, a mesma arvore resolve normalmente.
  const comGuard = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [GUARD_FILE]: GUARD_V2, [INDEX_FILE]: INDEX_V2 })
  );
  assert.equal(comGuard.version, '2.1.0');
});

test('cai no fallback retrocompativel do index.php quando nao existe InstallerGuard', () => {
  const resolved = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [INDEX_FILE]: INDEX_V1 })
  );

  assert.equal(resolved.version, '1.9.4');
  assert.equal(resolved.file, INDEX_FILE);
});

test('respeita a precedencia do guard sobre o literal legado divergente', () => {
  const resolved = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [GUARD_FILE]: GUARD_V2, [INDEX_FILE]: INDEX_V1 })
  );

  assert.equal(resolved.version, '2.1.0');
  assert.equal(resolved.file, GUARD_FILE);
});

test('degrada para a proxima fonte quando o guard existe sem const VERSION', () => {
  const guardSemVersao = GUARD_V2.replace("    const VERSION = '2.1.0';\n", '');
  const resolved = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.installer,
    readerFor({ [GUARD_FILE]: guardSemVersao, [INDEX_FILE]: INDEX_V1 })
  );

  assert.equal(resolved.version, '1.9.4');
  assert.equal(resolved.file, INDEX_FILE);
});

test('devolve todos os candidatos para a mensagem de preflight quando nada resolve', () => {
  const resolved = resolveProductVersion(PRODUCT_VERSION_SOURCES.installer, () => undefined);

  assert.equal(resolved.version, undefined);
  assert.equal(resolved.file, undefined);
  assert.equal(productVersionCandidates(PRODUCT_VERSION_SOURCES.installer).join(' | '), `${GUARD_FILE} | ${INDEX_FILE}`);
});

test('mantem o gestor lendo a versao em gestor/config.php', () => {
  const resolved = resolveProductVersion(
    PRODUCT_VERSION_SOURCES.manager,
    readerFor({ [CONFIG_FILE]: CONFIG_MANAGER })
  );

  assert.equal(resolved.version, '2.10.1');
  assert.equal(resolved.file, CONFIG_FILE);
  assert.deepEqual(productVersionCandidates(PRODUCT_VERSION_SOURCES.manager), [CONFIG_FILE]);
});

test('resolve a versao contra o InstallerGuard.php real do repositorio Core', t => {
  const coreRoot = path.resolve(__dirname, '..', '..', '..', 'conn2flow');
  const guardPath = path.join(coreRoot, 'gestor-instalador', 'src', 'InstallerGuard.php');
  if (!fs.existsSync(guardPath)) {
    // O repositorio Core nem sempre esta clonado ao lado. O skip fica visivel no relatorio
    // para nao passar por verde silencioso; a cobertura sintetica ja garante o contrato.
    t.skip(`repositorio Core ausente em ${coreRoot}`);
    return;
  }

  const resolved = resolveProductVersion(PRODUCT_VERSION_SOURCES.installer, file => {
    const fullPath = path.join(coreRoot, ...file.split('/'));
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : undefined;
  });

  assert.equal(resolved.file, GUARD_FILE);
  assert.match(String(resolved.version), /^\d+\.\d+\.\d+$/);
  assert.equal(
    resolved.version,
    fs.readFileSync(guardPath, 'utf8').match(/const\s+VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/)[1]
  );
});

test('releaseManager consome as fontes ordenadas em vez do arquivo unico de versao', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');

  assert.match(source, /versionSources:\s*PRODUCT_VERSION_SOURCES\.installer/);
  assert.match(source, /versionSources:\s*PRODUCT_VERSION_SOURCES\.manager/);
  assert.match(source, /resolveProductVersion\(definition\.versionSources, file => this\.readSource\(root, file\)\)/);
  // O par versionFile/versionPattern foi eliminado: era ele que amarrava o preflight ao index.php.
  assert.doesNotMatch(source, /versionFile|versionPattern/);
});

test('preflight e diagnose reportam e exigem as fontes de versao corretas', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');

  assert.match(
    source,
    /release\.preflightFailed',\s*\{[\s\S]*?productVersionCandidates\(definition\.versionSources\)\.join\(' \| '\)/
  );
  assert.match(source, /this\.versionSourcesReady\(root, definition\)/);
  assert.match(source, /definition\.versionSources\.some\(source => typeof this\.readSource\(root, source\.file\) === 'string'\)/);
});

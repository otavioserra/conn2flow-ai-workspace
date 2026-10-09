const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');
const root = process.argv[2];
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'req071-runtime-'));
let activeRoot = sandbox;
const previousLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'vscode') return {};
  if (request === './sddScopeManager') return { SddScopeManager: { getActiveSddRoot: () => activeRoot } };
  if (request === './shellHelper') return { ShellHelper: {} };
  if (request === './localizationManager') return { LocalizationManager: { t: key => key } };
  return previousLoad.apply(this, arguments);
};
try {
  const { GardeningManager } = require(path.join(root, 'vscode-extension/out/providers/gardeningManager.js'));
  assert.equal(GardeningManager.getMemoryHealth().status, 'notFound');
  const legacy = path.join(sandbox, 'MEMORIA-ENGENHARIA-EXECUCAO.md');
  fs.writeFileSync(legacy, '# Legacy\n');
  assert.equal(GardeningManager.getMemoryHealth().filePath, legacy);
  const canonical = path.join(sandbox, '04-memory-engineering-execution.md');
  fs.writeFileSync(canonical, '# Canonical\n');
  assert.equal(GardeningManager.getMemoryHealth().filePath, canonical);
  fs.unlinkSync(legacy);
  assert.equal(GardeningManager.getMemoryHealth().status, 'healthy');
  fs.writeFileSync(canonical, 'x'.repeat(75 * 1024));
  assert.equal(GardeningManager.getMemoryHealth().status, 'critical');
  activeRoot = undefined;
  assert.equal(GardeningManager.getMemoryHealth().status, 'notFound');
  console.log('PASS: missing memory, legacy fallback, canonical precedence, migrated memory, critical threshold, missing scope');
} finally {
  Module._load = previousLoad;
  for (const file of fs.readdirSync(sandbox)) fs.unlinkSync(path.join(sandbox, file));
  fs.rmdirSync(sandbox);
}

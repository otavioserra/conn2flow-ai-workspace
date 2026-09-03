const fs = require('node:fs');
const path = require('node:path');

function nextPatchVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version));
  if (!match) throw new Error(`Invalid semantic version: ${version}`);
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

function bumpVersion({ root = path.resolve(__dirname, '..'), dryRun = false } = {}) {
  const packagePath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const nextVersion = nextPatchVersion(manifest.version);

  if (lock.name !== manifest.name || lock.packages?.['']?.name !== manifest.name) {
    throw new Error('package.json and package-lock.json describe different packages.');
  }

  if (!dryRun) {
    manifest.version = nextVersion;
    lock.version = nextVersion;
    lock.packages[''].version = nextVersion;
    fs.writeFileSync(packagePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  }

  return nextVersion;
}

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const nextVersion = bumpVersion({ dryRun });
  process.stdout.write(`${dryRun ? 'Would bump' : 'Bumped'} extension version to ${nextVersion}\n`);
}

module.exports = { bumpVersion, nextPatchVersion };

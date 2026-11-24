// Publish selected matrix skills from isolated origin/main checkouts.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const matrix = path.resolve(__dirname, '../..');
const catalog = path.join(matrix, '.gemini', 'skills');
const manifest = 'memory/sync-customizations.json';
const satellites = [
  'conn2flow', 'conn2flow-site', 'lumix', 'transformamp', 'conn2flow-home',
  'website-conn2flow', 'conn2flow-app', 'conn2flow-mkt', 'conn2flow-nexus',
];
const skillPath = /^(?:\.gemini|\.claude|\.cursor|\.codex|\.github)\/skills\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(.+)$/;
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const paths = buffer => buffer.toString('utf8').split('\0').filter(Boolean);
const lines = buffer => buffer.toString('utf8').trim().split(/\r?\n/).filter(Boolean);

function run(cwd, command, args, { codes = [0], input } = {}) {
  const result = spawnSync(command, args, {
    cwd, input, windowsHide: true, timeout: 600_000, maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', PYTHONUTF8: '1' },
  });
  if (result.error || !codes.includes(result.status)) {
    const detail = result.error?.message || (result.stderr?.toString().trim() || result.stdout?.toString().trim());
    throw new Error([command, args[0], args[1]].filter(Boolean).join(' ') + ': ' + detail);
  }
  return result;
}

function git(cwd, ...args) {
  return run(cwd, 'git', ['--literal-pathspecs', ...args]).stdout;
}

function gitPaths(cwd, args, files) {
  if (files.length) run(cwd, 'git', ['--literal-pathspecs', ...args, '--pathspec-from-file=-', '--pathspec-file-nul'],
    { input: files.join('\0') + '\0' });
}

function parseArgs(args) {
  const values = new Map();
  const flags = new Set();
  while (args.length) {
    const flag = args.shift();
    if (values.has(flag) || flags.has(flag)) throw new Error('Duplicate option: ' + flag);
    if (['--dry-run', '--apply', '--help'].includes(flag)) flags.add(flag);
    else if (['--repos', '--skills', '--report'].includes(flag) && args.length && !args[0].startsWith('--')) {
      values.set(flag, args.shift());
    } else throw new Error('Invalid option or missing value: ' + flag);
  }
  if (flags.has('--dry-run') && flags.has('--apply')) throw new Error('Choose --dry-run or --apply');
  const skillNames = fs.readdirSync(catalog).filter(name => fs.existsSync(path.join(catalog, name, 'SKILL.md'))).sort();
  const repos = values.has('--repos') ? values.get('--repos').split(',') : satellites;
  const skills = values.has('--skills') ? values.get('--skills').split(',') : skillNames;
  if (repos.some(repo => !satellites.includes(repo))) throw new Error('Unknown satellite in --repos');
  if (skills.some(skill => !skillNames.includes(skill))) throw new Error('Unknown skill in --skills');
  return { apply: flags.has('--apply'), help: flags.has('--help'), repos: [...new Set(repos)],
    skills: [...new Set(skills)].sort(), report: values.get('--report') };
}

function assertNoLinks(worktree) {
  if (process.platform === 'win32') {
    // Walk each directory explicitly, stopping before a reparse point can be traversed.
    const command = "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; try { " +
      "[AppContext]::SetSwitch('Switch.System.IO.UseLegacyPathHandling',$false); " +
      "[AppContext]::SetSwitch('Switch.System.IO.BlockLongPaths',$false); " +
      "$root=[IO.DirectoryInfo]::new(('\\\\?\\'+(Get-Location).Path)); " +
      "$dirs=[Collections.Generic.Stack[IO.DirectoryInfo]]::new(); $dirs.Push($root); " +
      "while ($dirs.Count) { $dir=$dirs.Pop(); " +
      "if ($dir.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw ('Reparse point: '+$dir.FullName) }; " +
      "foreach ($item in $dir.GetFileSystemInfos()) { " +
      "if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw ('Reparse point: '+$item.FullName) }; " +
      "if ($item -is [IO.DirectoryInfo]) { $dirs.Push($item) } } } " +
      "Write-Output 'NO_REPARSE_POINTS' } catch { Write-Error $_; exit 1 }";
    const result = run(worktree, 'powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand',
      Buffer.from(command, 'utf16le').toString('base64')]);
    if (result.stdout.toString().trim() !== 'NO_REPARSE_POINTS') throw new Error('Incomplete reparse-point inventory');
    return;
  }
  const pending = [worktree];
  while (pending.length) {
    const dir = pending.pop();
    if (fs.lstatSync(dir).isSymbolicLink()) throw new Error('Symlink: ' + dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink: ' + file);
      if (entry.isDirectory()) pending.push(file);
    }
  }
}

function sync(worktree, report, selected, apply) {
  fs.rmSync(report, { force: true });
  const result = run(matrix, process.execPath, [
    path.join(__dirname, 'sync-skills.cjs'), '--target', worktree, '--existing-kits',
    '--report', report, ...(apply ? ['--apply'] : []), ...selected,
  ], { codes: [0, 1] });
  if (!fs.existsSync(report)) throw new Error('Canonical sync failed: ' + result.stderr.toString());
  return JSON.parse(fs.readFileSync(report, 'utf8'));
}

function readCustomizations(worktree) {
  const file = path.join(worktree, manifest);
  if (!fs.existsSync(file)) return [];
  return Object.entries(JSON.parse(fs.readFileSync(file, 'utf8'))).map(([relative, entry]) => {
    if (!skillPath.test(relative) || !relative.endsWith('/SKILL.md') ||
        relative.split('/').length !== 4) throw new Error('Invalid customization: ' + relative);
    return { relative, entry, local: fs.readFileSync(path.join(worktree, relative)) };
  });
}

function historicalSeed(name, hash) {
  const relative = '.gemini/skills/' + name + '/SKILL.md';
  for (const commit of lines(git(matrix, 'log', '--format=%H', '--', relative))) {
    const shown = run(matrix, 'git', ['show', commit + ':' + relative], { codes: [0, 128] });
    if (shown.status !== 0) continue;
    const bytes = shown.stdout;
    if (sha256(bytes) === hash) return bytes;
    const crlf = Buffer.from(bytes.toString('utf8').replace(/\r?\n/g, '\r\n'));
    if (sha256(crlf) === hash) return crlf;
  }
  throw new Error('Acknowledged seed absent from matrix history: ' + name + ' (' + hash + ')');
}

function restoreCustomizations(worktree, scratch, selections, aliases, variants) {
  const updated = [];
  for (const { relative, entry, local } of variants) {
    const oldName = relative.split('/')[2];
    const name = Object.hasOwn(aliases, oldName) ? aliases[oldName] : oldName;
    if (!selections.includes(name)) continue;
    const target = relative.split('/').map((part, index) => index === 2 ? name : part).join('/');
    const source = fs.readFileSync(path.join(catalog, name, 'SKILL.md'));
    if (sha256(local) !== entry.local_sha256) throw new Error('Unacknowledged customization edit: ' + relative);
    if (sha256(source) === entry.seed_sha256) continue;
    const base = historicalSeed(oldName, entry.seed_sha256);
    const files = ['local.md', 'base.md', 'upstream.md'].map(file => path.join(scratch, file));
    const normalize = bytes => Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
    try {
      [local, base, source].forEach((bytes, index) => fs.writeFileSync(files[index], normalize(bytes)));
      const merged = git(worktree, 'merge-file', '-p', '--', ...files);
      const result = local.includes(Buffer.from('\r\n'))
        ? Buffer.from(merged.toString('utf8').replace(/\n/g, '\r\n')) : merged;
      fs.writeFileSync(path.join(worktree, target), result);
      const python = path.join(matrix, '.venv-mdd', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
      const cli = fs.existsSync(python) ? [python, '-m', 'mdd_client.cli'] : ['mdd'];
      run(worktree, cli[0], [...cli.slice(1), 'sync', '--customize', target,
        '--matrix', matrix, '--path', worktree, '--local-sha256', sha256(result),
        '--seed-sha256', sha256(source)]);
      updated.push({ path: target, sha256: sha256(result) });
    } finally {
      for (const file of files) fs.rmSync(file, { force: true });
    }
  }
  return updated;
}

function insideSelection(file, selected, aliases) {
  if (file === manifest) return true;
  const name = file.match(skillPath)?.[1];
  return selected.includes(name) || (Object.hasOwn(aliases, name) && selected.includes(aliases[name]));
}

function remoteMain(repo) {
  const value = lines(git(repo, 'ls-remote', '--exit-code', 'origin', 'refs/heads/main'))[0];
  if (!/^[a-f0-9]{40,64}\trefs\/heads\/main$/.test(value || '')) throw new Error('Cannot verify origin/main');
  return value.split('\t')[0];
}

function stage(worktree, base, audit, selected) {
  const tracked = new Set(paths(git(worktree, 'ls-tree', '-r', '--name-only', '-z', base)));
  const modified = paths(git(worktree, 'diff', '--name-only', '-z', 'HEAD'));
  const newFiles = paths(git(worktree, 'ls-files', '-o', '--exclude-standard', '-z'));
  const ignored = paths(git(worktree, 'ls-files', '-o', '-i', '--exclude-standard', '-z'));
  const changed = [...new Set([...modified, ...newFiles, ...ignored])].sort();
  for (const file of changed) {
    if (!insideSelection(file, selected, audit.aliases)) throw new Error('Unexpected changed path: ' + file);
  }
  const successors = new Map();
  for (const file of modified) {
    if (fs.existsSync(path.join(worktree, file))) continue;
    const match = file.match(skillPath);
    const successorName = match && Object.hasOwn(audit.aliases, match[1]) && audit.aliases[match[1]];
    if (!successorName || !selected.includes(successorName)) throw new Error('Unexpected removal: ' + file);
    const successor = file.split('/').map((part, index) => index === 2 ? successorName : part).join('/');
    if (!fs.existsSync(path.join(worktree, successor))) throw new Error('Missing successor: ' + successor);
    successors.set(file, successor);
  }
  const checked = [...new Set([...newFiles, ...ignored, ...successors.values()])];
  const ignoredByGit = new Set(checked.length ? paths(run(worktree, 'git',
    ['check-ignore', '--no-index', '-z', '--stdin'],
    { codes: [0, 1], input: checked.join('\0') + '\0' }).stdout) : []);
  const required = new Set(successors.values());
  for (const file of ignored) {
    if (file === manifest) required.add(file);
    const parent = file.match(/^(.*\/skills\/[^/]+)\/subskills\/.+$/)?.[1];
    if (parent && (tracked.has(parent + '/SKILL.md') || required.has(parent + '/SKILL.md'))) required.add(file);
  }
  const forced = ignored.filter(file => required.has(file));
  const omitted = ignored.filter(file => !required.has(file));
  if (ignored.some(file => !ignoredByGit.has(file))) throw new Error('Inconsistent git check-ignore results');
  gitPaths(worktree, ['-c', 'core.autocrlf=false', 'add', '-u'], modified);
  gitPaths(worktree, ['-c', 'core.autocrlf=false', 'add'], newFiles);
  gitPaths(worktree, ['-c', 'core.autocrlf=false', 'add', '-f'], forced);
  for (const file of omitted) fs.unlinkSync(path.join(worktree, file));
  const tree = new Set(paths(git(worktree, 'ls-files', '-z')));
  for (const [legacy, successor] of successors) {
    if (tree.has(legacy) || !tree.has(successor)) throw new Error('Alias migration missing from index: ' + legacy);
  }
  return { forced, omitted, successors: Object.fromEntries(successors),
    files: paths(git(worktree, 'diff', '--cached', '--name-only', '-z')) };
}

function discardGenerated(worktree, selected, aliases) {
  const changed = paths(git(worktree, 'diff', '--name-only', '-z', 'HEAD'));
  const untracked = paths(git(worktree, 'ls-files', '-o', '-z'));
  if ([...changed, ...untracked].some(file => !insideSelection(file, selected, aliases))) {
    throw new Error('Unexpected paths in worktree; preserved for inspection');
  }
  gitPaths(worktree, ['restore', '--source=HEAD', '--staged', '--worktree'], changed);
  for (const file of untracked) fs.unlinkSync(path.join(worktree, file));
}

function rollout(repo, selected, apply, entry) {
  if (!fs.existsSync(path.join(repo, '.git'))) throw new Error('Satellite checkout missing: ' + repo);
  const resolved = path.resolve(git(repo, 'rev-parse', '--show-toplevel').toString().trim());
  if (resolved !== path.resolve(repo)) throw new Error('Unexpected repository root: ' + resolved);
  if (!lines(git(repo, 'remote')).includes('origin')) {
    Object.assign(entry, { status: 'SKIPPED_NO_ORIGIN', cleaned: true });
    return;
  }

  git(repo, 'fetch', 'origin');
  const base = git(repo, 'rev-parse', 'refs/remotes/origin/main').toString().trim();
  if (remoteMain(repo) !== base) throw new Error('Origin advanced during fetch');
  entry.base = base;
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-rollout-'));
  const worktree = path.join(scratch, 'checkout');
  const branch = 'c2f-rollout/' + path.basename(scratch);
  Object.assign(entry, { worktree, branch });
  let aliases = {};
  let created = false;
  let committed = false;
  try {
    git(repo, '-c', 'core.autocrlf=false', 'worktree', 'add', '-b', branch, worktree, base);
    created = true;
    git(worktree, 'branch', '--set-upstream-to=origin/main', branch);
    if (git(worktree, 'status', '--porcelain=v1', '--ignored', '-z').length) throw new Error('New worktree is not clean');
    const syncReport = path.join(scratch, 'sync.json');
    const preflight = sync(worktree, syncReport, selected, false);
    aliases = preflight.aliases;
    entry.kits = preflight.alvos;
    const variants = readCustomizations(worktree);
    const applied = sync(worktree, syncReport, selected, true);
    entry.customizations = restoreCustomizations(worktree, scratch, selected, aliases, variants);
    const audit = entry.customizations.length ? sync(worktree, syncReport, selected, false) : applied;
    if (!audit.alvos || audit.skills_locais_alteradas.length || audit.divergentes.some(item =>
      selected.includes(item.skill.split('/')[0])) || audit.legacy_skills.some(item => selected.includes(item.newName))) {
      throw new Error('Selected skills failed canonical audit');
    }
    Object.assign(entry, stage(worktree, base, audit, selected));
    for (const item of entry.customizations) {
      if (sha256(git(worktree, 'show', ':' + item.path)) !== item.sha256) throw new Error('Staged customization hash differs: ' + item.path);
    }
    if (!apply || !entry.files.length) {
      entry.status = entry.files.length ? 'DRY_RUN' : 'UP_TO_DATE';
      entry.remote = base;
      return;
    }
    git(repo, 'fetch', 'origin');
    if (git(repo, 'rev-parse', 'refs/remotes/origin/main').toString().trim() !== base || remoteMain(repo) !== base) {
      throw new Error('origin/main advanced before commit');
    }
    const stagedTree = git(worktree, 'write-tree').toString().trim();
    git(worktree, 'commit', '-m', 'chore(mdd): synchronize canonical skills');
    committed = true;
    entry.commit = git(worktree, 'rev-parse', 'HEAD').toString().trim();
    if (git(worktree, 'rev-parse', 'HEAD^').toString().trim() !== base) throw new Error('Unexpected parent');
    if (git(worktree, 'rev-parse', 'HEAD^{tree}').toString().trim() !== stagedTree) {
      throw new Error('Committed content differs from the reviewed index');
    }
    if (remoteMain(repo) !== base) throw new Error('origin/main advanced before push');
    git(worktree, 'push', 'origin', 'refs/heads/' + branch + ':refs/heads/main');
    git(repo, 'fetch', 'origin');
    entry.remote = remoteMain(repo);
    if (entry.remote !== entry.commit) throw new Error('Published SHA could not be confirmed on origin/main');
    entry.status = 'PUBLISHED';
  } finally {
    if (!created) {
      if (fs.readdirSync(scratch).length === 0) fs.rmdirSync(scratch);
    } else if (!committed || entry.status === 'PUBLISHED') {
      const actual = fs.realpathSync(worktree);
      if (path.relative(fs.realpathSync(scratch), actual) !== 'checkout') throw new Error('Unexpected cleanup path: ' + actual);
      assertNoLinks(worktree);
      if (!committed) discardGenerated(worktree, selected, aliases);
      git(repo, 'worktree', 'remove', worktree);
      git(repo, 'branch', '-d', branch);
      git(repo, 'worktree', 'prune');
      const listing = git(repo, 'worktree', 'list', '--porcelain').toString();
      if (fs.existsSync(worktree) || listing.includes('refs/heads/' + branch + '\n')) throw new Error('Temporary worktree remains');
      fs.rmSync(path.join(scratch, 'sync.json'), { force: true });
      fs.rmdirSync(scratch);
      entry.cleaned = true;
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('Usage: node scripts/skills/rollout-satellites.cjs [--dry-run | --apply] [--repos a,b] [--skills a,b] [--report file.json]');
    return;
  }
  const report = { mode: options.apply ? 'apply' : 'dry-run', skills: options.skills, satellites: [] };
  for (const name of options.repos) {
    const repo = path.join(path.dirname(matrix), name);
    const entry = { repo: name, root: repo, cleaned: false };
    report.satellites.push(entry);
    try {
      rollout(repo, options.skills, options.apply, entry);
    } catch (error) {
      Object.assign(entry, { status: 'FAILED', error: error.message });
      process.exitCode = 1;
    }
    console.log(JSON.stringify(entry));
  }
  if (options.report) fs.writeFileSync(path.resolve(options.report), JSON.stringify(report, null, 2) + '\n');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

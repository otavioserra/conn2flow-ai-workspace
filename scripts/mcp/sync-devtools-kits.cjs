// REQ-063 scoped propagation. Run with --apply to write, otherwise audit only.
// Never deletes directories or invokes the broad kit installers.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const repoNames = ['conn2flow-ai-workspace', 'conn2flow', 'conn2flow-site', 'lumix', 'transformamp'];
const kits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const updated = [
  'c2f-agent-visual-inspection', 'c2f-javascript-ajax', 'c2f-tailwind-css-architecture',
  'c2f-interface-v2-architecture', 'c2f-preview-modals-system',
  'c2f-reviewer-agent', 'c2f-shell-and-windows-traps',
];
const server = { command: 'npx', args: ['-y', 'chrome-devtools-mcp@latest', '--allow-unrestricted-paths'] };
const apply = process.argv.includes('--apply');
const canonical = new Map(fs.readdirSync(path.join(root, '.gemini/skills'), { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => [entry.name,
    fs.readFileSync(path.join(root, '.gemini/skills', entry.name, 'SKILL.md'))]));
if (canonical.size !== 41) throw new Error(`Expected 41 canonical skills, found ${canonical.size}`);
const md5 = bytes => crypto.createHash('md5').update(bytes).digest('hex');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.existsSync(file) ? fs.readFileSync(file) : null;
const plans = new Map();
function plan(file, bytes) {
  const previous = read(file);
  const next = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  if (!previous || !previous.equals(next)) plans.set(file, next);
}
function walkFiles(dir) {
  if (!fs.existsSync(dir)) throw new Error(`Missing kit directory: ${dir}`);
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${file}`);
    return entry.isDirectory() ? walkFiles(file) : [file];
  });
}
function configPlan(base, kit) {
  const file = path.join(base, kit === '.claude' ? '.mcp.json' : kit === '.cursor' ? '.cursor/mcp.json'
    : kit === '.github' ? '.vscode/mcp.json' : kit === '.codex' ? '.codex/config.toml' : '.gemini/mcp_config.json');
  const previous = read(file);
  if (kit === '.codex') {
    const body = previous ? previous.toString('utf8') : '';
    const section = '[mcp_servers.chrome-devtools]';
    const block = `${section}\ncommand = "npx"\nargs = ["-y", "chrome-devtools-mcp@latest", "--allow-unrestricted-paths"]\n`;
    const sectionPattern = /^\[mcp_servers\.(?:chrome-devtools|"chrome-devtools"|'chrome-devtools')\][^\r\n]*\r?\n[\s\S]*?(?=^\[|$(?![\s\S]))/m;
    if (sectionPattern.test(body)) {
      // Do not discard custom keys in an existing section on a later run.
      const existing = body.match(sectionPattern)[0];
      if (!/command\s*=\s*"npx"/.test(existing) ||
          !/args\s*=\s*\["-y", "chrome-devtools-mcp@latest", "--allow-unrestricted-paths"\]/.test(existing)) {
        throw new Error(`Existing DevTools TOML differs; inspect before overwriting: ${file}`);
      }
    } else {
      const newline = body.includes('\r\n') ? '\r\n' : '\n';
      plan(file, `${body}${body.endsWith('\n') || !body ? '' : newline}${body ? newline : ''}${block.replace(/\n/g, newline)}`);
    }
    return;
  }
  const config = previous ? JSON.parse(previous.toString('utf8').replace(/^\uFEFF/, '')) : {};
  const key = kit === '.github' ? 'servers' : 'mcpServers';
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error(`Invalid config: ${file}`);
  if (config[key] !== undefined && (!config[key] || typeof config[key] !== 'object' || Array.isArray(config[key]))) {
    throw new Error(`Invalid ${key}: ${file}`);
  }
  config[key] ??= {};
  const value = kit === '.github' ? { type: 'stdio', ...server } : server;
  if (JSON.stringify(config[key]['chrome-devtools']) !== JSON.stringify(value)) {
    config[key]['chrome-devtools'] = value;
    const newline = previous?.includes(Buffer.from('\r\n')) ? '\r\n' : '\n';
    plan(file, `${JSON.stringify(config, null, 2).replace(/\n/g, newline)}${newline}`);
  }
}

const preserved = new Map();
const normalizedFiles = [];
const auditTargets = [];
for (const repo of repoNames) {
  const repoRoot = path.resolve(root, '..', repo);
  if (!fs.existsSync(path.join(repoRoot, '.git'))) throw new Error(`Missing repository: ${repoRoot}`);
  for (const kit of kits) {
    const skillsRoot = path.join(repoRoot, kit, 'skills');
    // Capture every file in local skill folders, not just SKILL.md.
    for (const file of walkFiles(skillsRoot)) {
      const skill = path.relative(skillsRoot, file).split(path.sep)[0];
      if (!canonical.has(skill)) preserved.set(file, sha256(fs.readFileSync(file)));
    }
    auditTargets.push({ repo, kit, skillsRoot });
    for (const name of updated) plan(path.join(skillsRoot, name, 'SKILL.md'), canonical.get(name));
    for (const [name, bytes] of canonical) {
      if (updated.includes(name)) continue;
      const file = path.join(skillsRoot, name, 'SKILL.md');
      const actual = read(file);
      if (actual && !actual.equals(bytes) &&
          actual.toString('utf8').replace(/\r\n/g, '\n') === bytes.toString('utf8').replace(/\r\n/g, '\n')) {
        // Resolve byte parity only when every character of the content is preserved.
        normalizedFiles.push(path.relative(path.dirname(root), file).replace(/\\/g, '/'));
        plan(file, bytes);
      }
    }
    configPlan(repoRoot, kit);
  }
}
const templateTargets = [];
for (const language of ['pt-br', 'en']) {
  const dir = path.join(root, 'templates', language, 'templates');
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
    const base = path.join(dir, entry.name);
    for (const kit of kits) {
      const skillsRoot = path.join(base, kit, 'skills');
      if (!fs.existsSync(skillsRoot)) continue;
      templateTargets.push({ template: `${language}/${entry.name}`, kit, skillsRoot });
      for (const name of updated) plan(path.join(skillsRoot, name, 'SKILL.md'), canonical.get(name));
      configPlan(base, kit);
    }
  }
}

if (apply) {
  // All JSON/TOML and paths were checked before the first write.
  for (const [file, bytes] of plans) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, bytes);
  }
}
const mismatches = [];
let matches = 0;
const perKit = [];
for (const target of auditTargets) {
  let count = 0;
  for (const [name, bytes] of canonical) {
    const file = path.join(target.skillsRoot, name, 'SKILL.md');
    const actual = read(file);
    if (actual && md5(actual) === md5(bytes)) { matches++; count++; }
    else mismatches.push({ repo: target.repo, kit: target.kit, skill: name, missing: !actual });
  }
  perKit.push({ repo: target.repo, kit: target.kit, matched: count, expected: canonical.size });
}
const localChanges = [...preserved].filter(([file, hash]) => !fs.existsSync(file) || sha256(fs.readFileSync(file)) !== hash);
const localFiles = [...preserved].map(([file, hash]) => ({ file: path.relative(path.dirname(root), file).replace(/\\/g, '/'), sha256: hash }));
const templateMismatches = templateTargets.flatMap(target => updated.flatMap(name => {
  const file = path.join(target.skillsRoot, name, 'SKILL.md');
  return md5(fs.readFileSync(file)) === md5(canonical.get(name)) ? [] : [`${target.template}/${target.kit}/${name}`];
}));
const report = {
  batch: 'BATCH-065', timestamp: new Date().toISOString(), mode: apply ? 'apply' : 'audit',
  canonicalSkills: canonical.size, kits: auditTargets.length, expected: canonical.size * auditTargets.length,
  matched: matches, mismatches, perKit,
  canonicalMD5: Object.fromEntries([...canonical].map(([name, bytes]) => [name, md5(bytes)])),
  updatedSkills: updated, templates: templateTargets.length, templateMismatches,
  normalizedLineEndingFiles: normalizedFiles,
  plannedFiles: [...plans.keys()].map(file => path.relative(path.dirname(root), file).replace(/\\/g, '/')),
  preservedLocalFiles: localFiles, localChanges: localChanges.map(([file]) => file),
  status: mismatches.length || localChanges.length || templateMismatches.length || (!apply && plans.size) ? 'FAIL' : 'PASS',
};
const reportArg = process.argv.indexOf('--report');
if (reportArg !== -1) {
  if (!process.argv[reportArg + 1]) throw new Error('--report needs a path');
  fs.writeFileSync(path.resolve(process.argv[reportArg + 1]), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify({ status: report.status, matched: matches, expected: report.expected,
  templates: report.templates, templateMismatches: templateMismatches.length,
  localFilesPreserved: preserved.size, localChanges: localChanges.length, plannedFiles: plans.size, mismatches }));
if (report.status !== 'PASS') process.exitCode = 1;

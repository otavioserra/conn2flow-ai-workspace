// REQ-075: read-only contract check; does not build or deploy the product.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const kits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const names = ['start-mdd-slice', 'continue-mdd-batch', 'mdd-workflow', 'mdd-memory-gardening'];
const oldNames = ['start-sdd-slice', 'continue-sdd-batch', 'sdd-workflow', 'sdd-memory-gardening'];
const repos = ['conn2flow-ai-workspace', 'conn2flow', 'conn2flow-site', 'lumix', 'transformamp', 'conn2flow-home'];
const sources = fs.readdirSync(path.join(root, '.gemini/skills')).filter(name => fs.existsSync(path.join(root, '.gemini/skills', name, 'SKILL.md')));
const errors = [];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (sources.length !== 45) errors.push(`Canonical count: ${sources.length}`);
let checked = 0;
for (const repo of repos) for (const kit of kits) {
  const base = path.join(root, '..', repo, kit, 'skills');
  for (const old of oldNames) if (fs.existsSync(path.join(base, old))) errors.push(`Legacy directory: ${repo}/${kit}/${old}`);
  const count = fs.readdirSync(base).filter(name => fs.existsSync(path.join(base, name, 'SKILL.md')) && sources.includes(name)).length;
  if (count !== 45) errors.push(`Canonical count in ${repo}/${kit}: ${count}`);
  for (const name of sources) {
    const target = path.join(base, name, 'SKILL.md');
    if (hash(target) !== hash(path.join(root, '.gemini/skills', name, 'SKILL.md'))) errors.push(`Different copy: ${target}`);
    checked++;
  }
}
for (const name of names) {
  const text = fs.readFileSync(path.join(root, '.gemini/skills', name, 'SKILL.md'), 'utf8');
  if (!text.includes(`name: ${name}`) || text.includes('sdd/') || oldNames.some(old => text.includes(old))) errors.push(`Unmigrated canonical content: ${name}`);
}
for (const name of ['c2f-executor-agent', 'c2f-project-pipeline-and-tasks', 'c2f-resources-system']) {
  const text = fs.readFileSync(path.join(root, '.gemini/skills', name, 'SKILL.md'), 'utf8');
  for (const required of ['Categoria A', 'Categoria B', 'Categoria C', '--skip-css']) if (!text.includes(required)) errors.push(`Missing ${required}: ${name}`);
}
const result = { status: errors.length ? 'FAIL' : 'PASS', canonical: sources.length, repositories: repos, kits: kits.length, copies_checked: checked, errors };
const reportIndex = process.argv.indexOf('--report');
if (reportIndex >= 0) fs.writeFileSync(path.resolve(process.argv[reportIndex + 1]), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
if (errors.length) process.exitCode = 1;

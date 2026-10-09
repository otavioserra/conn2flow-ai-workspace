// REQ-070: validate local links, bilingual structure, canonical skills and README size.
// node scripts/docs/validate-public-docs.cjs [--root PATH] [--report PATH]
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const root = path.resolve(option('--root') || path.join(__dirname, '../..'));
const topics = [
  ['MDD-FRAMEWORK-SPECIFICATION.md', 'ESPECIFICACAO-FRAMEWORK-MDD.md'],
  ['MDD-PYTHON-ECOSYSTEM-GUIDE.md', 'GUIA-ECOSSISTEMA-PYTHON-MDD.md'],
  ['DOUBLE-AGENT-ARCHITECTURE.md', 'ARQUITETURA-AGENTE-DUPLO.md'],
  ['SKILLS-CATALOG.md', 'CATALOGO-DE-SKILLS.md'],
  ['QUICKSTART-CLI-AND-MCP.md', 'GUIA-RAPIDO-CLI-E-MCP.md'],
  ['VSCODE-DEV-TOOLS-PANEL-GUIDE.md', 'GUIA-PAINEL-DEV-TOOLS-VSCODE.md'],
  ['MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md', 'PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md'],
  ['FUTURE-EVOLUTION-ROADMAP.md', 'ROTEIRO-EVOLUCAO-FUTURA.md'],
  ['VSCODE-MARKETPLACE-PUBLISHING-GUIDE.md', 'GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md'],
  ['README.md', 'README.md']
];
const pairs = [['README.md', 'README-PT-BR.md'], ...topics.map(([a,b]) => ['docs/en/'+a, 'docs/pt-br/'+b])];
const failures = [];
const content = new Map();
const read = file => {
  if (!content.has(file)) {
    try { content.set(file, fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')); }
    catch { failures.push(`Missing file: ${file}`); content.set(file, ''); }
  }
  return content.get(file);
};
const files = [...new Set([...pairs.flat(), 'docs/README.md'])];
const structure = text => {
  let fence = null;
  const result = [];
  for (const line of text.split('\n')) {
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (fence) { if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; }
      else { fence = marker[1]; result.push(`code:${marker[2].trim()}`); }
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^(#{1,6})\s+/);
    if (heading) result.push(`heading:${heading[1].length}`);
    if (/^\|/.test(line)) result.push(`table:${line.replace(/\\\|/g, '').split('|').length - 2}`);
    if (/^\d+\. /.test(line)) result.push('step');
  }
  return {result, unclosedFence: !!fence};
};
const parity = [];
for (const [en, pt] of pairs) {
  const a = structure(read(en)), b = structure(read(pt));
  if (a.unclosedFence || b.unclosedFence) failures.push(`Unclosed fence: ${en} / ${pt}`);
  const same = JSON.stringify(a.result) === JSON.stringify(b.result);
  if (!same) failures.push(`Structural parity: ${en} / ${pt}`);
  parity.push({en, pt, matched: same, elements: a.result.length});
}
let relativeLinks = 0, sourcePaths = 0;
const anchors = text => {
  const seen = new Map(), result = new Set();
  const withoutCode = text.replace(/```[^\n]*\n[\s\S]*?```/g, '');
  for (const match of withoutCode.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const slug = match[1].toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
    const count = seen.get(slug) || 0;
    result.add(slug + (count ? '-'+count : '')); seen.set(slug, count+1);
  }
  return result;
};
for (const file of files) {
  const text = read(file);
  if (/file:\/\/\//i.test(text)) failures.push(`Machine-local URI: ${file}`);
  const withoutCode = text.replace(/```[^\n]*\n[\s\S]*?```/g, '');
  for (const match of withoutCode.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
    const href = match[1].replace(/^<|>$/g, '');
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    relativeLinks++;
    const [target, fragment] = href.split('#');
    const dest = path.resolve(root, path.dirname(file), decodeURIComponent(target || path.basename(file)));
    if (!fs.existsSync(dest)) failures.push(`Broken link: ${file} -> ${href}`);
    else if (fragment && dest.endsWith('.md') && !anchors(fs.readFileSync(dest, 'utf8')).has(decodeURIComponent(fragment))) failures.push(`Broken anchor: ${file} -> ${href}`);
  }
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatter) {
    if (!/^verified_at: [a-f0-9]+$/m.test(frontmatter[1])) failures.push(`Verification metadata: ${file}`);
    for (const match of frontmatter[1].matchAll(/^  - (.+)$/gm)) {
      sourcePaths++;
      if (!fs.existsSync(path.resolve(root, path.dirname(file), match[1]))) failures.push(`Missing source: ${file} -> ${match[1]}`);
    }
  } else if (file.startsWith('docs/') && !file.endsWith('README.md')) failures.push(`Missing source metadata: ${file}`);
}
const canonicalDir = path.join(root, '.gemini/skills');
const canonical = fs.existsSync(canonicalDir) ? fs.readdirSync(canonicalDir).filter(id => fs.existsSync(path.join(canonicalDir,id,'SKILL.md'))).sort() : [];
if (canonical.length !== 44) failures.push(`Expected 44 canonical skills; found ${canonical.length}`);
for (const file of ['docs/en/SKILLS-CATALOG.md', 'docs/pt-br/CATALOGO-DE-SKILLS.md']) {
  const ids = [...read(file).matchAll(/^\| \[`([^`]+)`\]/gm)].map(m => m[1]).sort();
  if (JSON.stringify(ids) !== JSON.stringify(canonical)) failures.push(`Catalog differs from canonical set: ${file}`);
}
for (const language of ['en','pt-br']) {
  const dir = path.join(root,'docs',language);
  const actual = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort() : [];
  const expected = topics.map(row => row[language === 'en' ? 0 : 1]).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push(`Language inventory: ${language}`);
}
const readmeBytes = Object.fromEntries(['README.md','README-PT-BR.md'].map(file => [file, Buffer.byteLength(read(file), 'utf8')]));
for (const [file, bytes] of Object.entries(readmeBytes)) if (bytes >= 10*1024) failures.push(`README exceeds 10 KB: ${file} (${bytes})`);
const report = {status: failures.length ? 'FAIL' : 'PASS', files: files.length, pairs: parity, relativeLinks, sourcePaths, canonicalSkills: canonical.length, readmeBytes, failures};
if (option('--report')) fs.writeFileSync(path.resolve(option('--report')), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exitCode = failures.length ? 1 : 0;

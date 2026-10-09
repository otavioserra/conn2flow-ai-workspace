// Propagação e auditoria das skills canônicas (.gemini/skills) para os kits da matriz, os templates
// e os repositórios satélites.
//
//   node scripts/skills/sync-skills.cjs                      audita tudo; não escreve
//   node scripts/skills/sync-skills.cjs --apply a b c        propaga só as skills citadas
//   node scripts/skills/sync-skills.cjs --apply --all        propaga todas
//   ... --report caminho.json                                grava o relatório
//   ... --repos conn2flow,conn2flow-site                     limita os satélites
//   ... --target PATH                                       só os cinco kits de um cliente
//
// Nunca apaga nada e nunca toca em skill que não existe na matriz (skill local de um satélite).
// Skill traduzida num template (lista em translated.json) não é sobrescrita nem comparada: a tradução é
// mantida à mão, e o relatório a lista em `traduzidas`.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const valor = (nome) => { const i = args.indexOf(nome); return i === -1 ? null : args[i + 1]; };
const apply = args.includes('--apply');
const todas = args.includes('--all');
const comValor = new Set(['--report', '--repos', '--target']);
const nomes = args.filter((a, i) => !a.startsWith('--') && !comValor.has(args[i - 1]));
const repos = (valor('--repos') || 'conn2flow-ai-workspace,conn2flow,conn2flow-site,lumix,transformamp').split(',').filter(Boolean);
const kits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const traduzidas = JSON.parse(fs.readFileSync(path.join(__dirname, 'translated.json'), 'utf8'));

const md5 = (bytes) => crypto.createHash('md5').update(bytes).digest('hex');
const ler = (arquivo) => (fs.existsSync(arquivo) ? fs.readFileSync(arquivo) : null);

const canonDir = path.join(root, '.gemini/skills');
const canonical = new Map(fs.readdirSync(canonDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(canonDir, e.name, 'SKILL.md')))
  .map((e) => [e.name, fs.readFileSync(path.join(canonDir, e.name, 'SKILL.md'))]));

const selecionadas = todas ? [...canonical.keys()] : nomes;
for (const nome of selecionadas) if (!canonical.has(nome)) throw new Error(`Skill inexistente na matriz: ${nome}`);
if (apply && !selecionadas.length) throw new Error('--apply precisa de nomes de skill ou de --all');

const alvos = [];
const target = valor('--target') ? path.resolve(valor('--target')) : null;
function validateTarget(destination) {
  if (!target) return;
  const base = fs.realpathSync(target);
  let node = path.resolve(destination);
  while (node !== target) {
    if (fs.existsSync(node)) {
      const real = fs.realpathSync(node);
      const relative = path.relative(base, real);
      if (fs.lstatSync(node).isSymbolicLink() || relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Destino vinculado ou fora do projeto: ${node}`);
      }
    }
    const parent = path.dirname(node);
    if (parent === node) throw new Error('Destino fora do projeto');
    node = parent;
  }
}
// Explicit client destination: never propagate to unrelated satellites or templates.
if (target) {
  // Validate every destination before writing any kit.
  for (const kit of kits) {
    validateTarget(path.join(target, kit, 'skills'));
    validateTarget(path.join(target, kit, 'rules'));
    for (const nome of canonical.keys()) validateTarget(path.join(target, kit, 'skills', nome, 'SKILL.md'));
  }
  for (const kit of kits) {
    const skills = path.join(target, kit, 'skills');
    if (apply) fs.mkdirSync(skills, { recursive: true });
    alvos.push({ onde: `${target}/${kit}`, skills });
  }
}
for (const repo of target ? [] : repos) {
  const raiz = path.resolve(root, '..', repo);
  if (!fs.existsSync(path.join(raiz, '.git'))) { console.error(`aviso: repositório ausente, ignorado: ${repo}`); continue; }
  for (const kit of kits) {
    const skills = path.join(raiz, kit, 'skills');
    if (fs.existsSync(skills)) alvos.push({ onde: `${repo}/${kit}`, skills });
  }
}
for (const idioma of target ? [] : ['pt-br', 'en']) {
  const dir = path.join(root, 'templates', idioma, 'templates');
  if (!fs.existsSync(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    for (const kit of kits) {
      const skills = path.join(dir, e.name, kit, 'skills');
      if (fs.existsSync(skills)) alvos.push({ onde: `templates/${idioma}/${e.name}/${kit}`, skills, template: true, idioma });
    }
  }
}

// Skills locais de cada alvo: ficam fora da propagação e são conferidas ao fim.
const locais = new Map();
for (const alvo of alvos) {
  for (const e of (fs.existsSync(alvo.skills) ? fs.readdirSync(alvo.skills, { withFileTypes: true }) : []).filter((x) => x.isDirectory())) {
    if (canonical.has(e.name)) continue;
    const arquivo = path.join(alvo.skills, e.name, 'SKILL.md');
    if (fs.existsSync(arquivo)) locais.set(arquivo, md5(fs.readFileSync(arquivo)));
  }
}

const escritos = [];
const rulesWritten = [];
const canonicalRules = target && fs.existsSync(path.join(root, '.gemini/rules'))
  ? fs.readdirSync(path.join(root, '.gemini/rules')).filter(name => fs.statSync(path.join(root, '.gemini/rules', name)).isFile()).sort() : [];
if (target) for (const kit of kits) for (const name of canonicalRules) validateTarget(path.join(target, kit, 'rules', name));
if (apply) {
  for (const alvo of alvos) {
    if (alvo.skills === canonDir) continue;
    for (const nome of selecionadas) {
      const destino = path.join(alvo.skills, nome, 'SKILL.md');
      // Template só recebe skill que ele já traz: um kit privado não ganha o catálogo inteiro.
      if (alvo.template && !fs.existsSync(destino)) continue;
      if (alvo.template && (traduzidas[alvo.idioma] || []).includes(nome)) continue;
      const atual = ler(destino);
      if (atual && atual.equals(canonical.get(nome))) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, canonical.get(nome));
      escritos.push(path.relative(path.dirname(root), destino).replace(/\\/g, '/'));
    }
  }
  if (target) for (const kit of kits) for (const name of canonicalRules) {
    const source = fs.readFileSync(path.join(root, '.gemini/rules', name));
    const destination = path.join(target, kit, 'rules', name);
    const current = ler(destination);
    if (current && current.equals(source)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, source);
    rulesWritten.push(destination);
  }
}

let iguais = 0;
let traducoes = 0;
const divergentes = [];
for (const alvo of alvos) {
  for (const [nome, bytes] of canonical) {
    const atual = ler(path.join(alvo.skills, nome, 'SKILL.md'));
    if (!atual) { if (!alvo.template) divergentes.push({ onde: alvo.onde, skill: nome, motivo: 'ausente' }); continue; }
    if (alvo.template && (traduzidas[alvo.idioma] || []).includes(nome)) { traducoes++; continue; }
    if (md5(atual) === md5(bytes)) iguais++;
    else divergentes.push({ onde: alvo.onde, skill: nome, motivo: 'conteúdo diferente' });
  }
}
const locaisAlteradas = [...locais].filter(([arquivo, hash]) => !fs.existsSync(arquivo) || md5(fs.readFileSync(arquivo)) !== hash).map(([arquivo]) => arquivo);
const rulesDivergent = [];
if (target) for (const kit of kits) for (const name of canonicalRules) {
  const current = ler(path.join(target, kit, 'rules', name));
  if (!current || !current.equals(fs.readFileSync(path.join(root, '.gemini/rules', name)))) rulesDivergent.push(`${kit}/rules/${name}`);
}

const relatorio = {
  gerado_em: new Date().toISOString(), modo: apply ? 'apply' : 'audit',
  skills_canonicas: canonical.size, selecionadas, alvos: alvos.length,
  iguais, traduzidas: traducoes, divergentes, escritos, skills_locais_preservadas: locais.size, skills_locais_alteradas: locaisAlteradas,
  md5: Object.fromEntries([...canonical].map(([nome, bytes]) => [nome, md5(bytes)])),
  rules_written: rulesWritten, rules_divergent: rulesDivergent,
  status: divergentes.length || locaisAlteradas.length || rulesDivergent.length ? 'FAIL' : 'PASS',
};
if (valor('--report')) fs.writeFileSync(path.resolve(valor('--report')), `${JSON.stringify(relatorio, null, 2)}\n`);
console.log(JSON.stringify({ status: relatorio.status, alvos: alvos.length, iguais, traduzidas: traducoes, divergentes: divergentes.length,
  escritos: escritos.length, locais: locais.size, locaisAlteradas: locaisAlteradas.length }));
if (divergentes.length) console.log(JSON.stringify(divergentes.slice(0, 12)));
if (relatorio.status !== 'PASS') process.exitCode = 1;

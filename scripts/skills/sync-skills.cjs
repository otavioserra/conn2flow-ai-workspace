// Propagação e auditoria das skills canônicas (.gemini/skills) para os kits da matriz, os templates
// e os repositórios satélites.
//
//   node scripts/skills/sync-skills.cjs                      audita tudo; não escreve
//   node scripts/skills/sync-skills.cjs --apply a b c        propaga só as skills citadas
//   node scripts/skills/sync-skills.cjs --apply --all        propaga todas
//   ... --report caminho.json                                grava o relatório
//   ... --repos conn2flow,conn2flow-site                     limita os satélites
//   ... --target PATH                                       só os cinco kits de um cliente
//   ... --target PATH --existing-kits                       só skills de kits já presentes
//
// Nunca apaga nada e nunca toca em skill que não existe na matriz (skill local de um satélite).
// Traduções registradas por idioma/skill em translated.json nunca são sobrescritas.
// A auditoria compara source_sha256 com a matriz e emite warnings não bloqueantes.
// Após revisão: --update-translation-hash <skill> <idioma> [--translator nome].
// <skill>/subskills/** acompanha a skill-mãe (REQ-088) e entra no hash da tradução.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acknowledgements = require('./skill-customizations.cjs');
const translations = require('./translations.cjs');

const root = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
const valor = (nome) => { const i = args.indexOf(nome); return i === -1 ? null : args[i + 1]; };
const apply = args.includes('--apply');
const todas = args.includes('--all');
const hashUpdate = args.indexOf('--update-translation-hash');
const comValor = new Set(['--report', '--repos', '--target', '--translator']);
const nomes = args.filter((a, i) => !a.startsWith('--') && !comValor.has(args[i - 1]));
const repos = (valor('--repos') || 'conn2flow-ai-workspace,conn2flow,conn2flow-site,lumix,transformamp,conn2flow-home').split(',').filter(Boolean);
const kits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const existingKits = args.includes('--existing-kits');
if (existingKits && !valor('--target')) throw new Error('--existing-kits requires --target');
const translationFile = path.join(__dirname, 'translated.json');
const traduzidas = translations.load(translationFile);
// Legacy name -> canonical name. A legacy folder is moved whole (never copied) when its
// canonical name is selected, so a satellite never ends with both names.
const renamedSkills = {
  'start-sdd-slice': 'start-mdd-slice', 'continue-sdd-batch': 'continue-mdd-batch',
  'sdd-workflow': 'mdd-workflow', 'sdd-memory-gardening': 'mdd-memory-gardening',
  // REQ-088 / ARCH-018: the three role skills become c2f-persona-*.
  'c2f-architect-master': 'c2f-persona-architect', 'c2f-executor-agent': 'c2f-persona-executor',
  'c2f-reviewer-agent': 'c2f-persona-reviewer',
};
const EXPECTED_SKILLS = 48;

const md5 = (bytes) => crypto.createHash('md5').update(bytes).digest('hex');
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const normalize = translations.normalizeLineEndings;
const ler = (arquivo) => (fs.existsSync(arquivo) ? fs.readFileSync(arquivo) : null);

const canonDir = path.join(root, '.gemini/skills');
const canonical = new Map(fs.readdirSync(canonDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(canonDir, e.name, 'SKILL.md')))
  .map((e) => [e.name, fs.readFileSync(path.join(canonDir, e.name, 'SKILL.md'))]));
if (canonical.size !== EXPECTED_SKILLS) throw new Error(`O catálogo canônico deve conter exatamente ${EXPECTED_SKILLS} skills`);

// <skill>/subskills/**: on-demand recipes that travel with their parent skill.
function listFiles(dir, prefix) {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || fs.lstatSync(file).isSymbolicLink()) throw new Error(`Subskill vinculada recusada: ${file}`);
    const relative = `${prefix}/${entry.name}`;
    return entry.isDirectory() ? listFiles(file, relative) : [relative];
  });
}
const subskills = new Map();
for (const nome of canonical.keys()) {
  const dir = path.join(canonDir, nome, 'subskills');
  if (!fs.existsSync(dir)) continue;
  const files = listFiles(dir, 'subskills');
  if (files.length) subskills.set(nome, new Map(files.map((rel) => [rel, fs.readFileSync(path.join(canonDir, nome, rel))])));
}
// A translation covers the skill and its subskills: any subskill change reopens the review.
const translationSources = new Map([...canonical].map(([nome, bytes]) => [nome, !subskills.has(nome) ? bytes
  : Buffer.concat([bytes, ...[...subskills.get(nome)].flatMap(([rel, data]) => [Buffer.from(`\n\0${rel}\n`), data])])]));

// Explicit acknowledgement after content review. Never update hashes during normal sync.
if (hashUpdate >= 0) {
  if (apply || args.includes('--target')) throw new Error('Hash update cannot be combined with sync/apply');
  const skill = args[hashUpdate + 1];
  const language = args[hashUpdate + 2];
  const entry = translations.update(translationFile, traduzidas, translationSources, skill, language, valor('--translator') || 'mdd-agent');
  console.log(JSON.stringify({ status: 'PASS', skill, language, ...entry }));
  process.exit(0);
}
const canonicalLF = new Map([...canonical].map(([nome, bytes]) => [nome, normalize(bytes)]));
const translationDrift = translations.audit(traduzidas, translationSources);
const subskillPaths = (base, nome) => [...(subskills.get(nome) || new Map()).keys()].map((rel) => path.join(base, nome, ...rel.split('/')));
for (const item of translationDrift) console.error(translations.message(item));

const selecionadas = todas ? [...canonical.keys()] : nomes;
for (const nome of selecionadas) if (!canonical.has(nome)) throw new Error(`Skill inexistente na matriz: ${nome}`);
if (apply && !selecionadas.length) throw new Error('--apply precisa de nomes de skill ou de --all');

const alvos = [];
const target = valor('--target') ? path.resolve(valor('--target')) : null;
let customizationStates;
function intentional(destination, local, seed) {
  return acknowledgements.intentional(customizationStates, destination, local, seed, sha256);
}
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
    for (const nome of canonical.keys()) {
      validateTarget(path.join(target, kit, 'skills', nome, 'SKILL.md'));
      for (const file of subskillPaths(path.join(target, kit, 'skills'), nome)) validateTarget(file);
    }
  }
  for (const kit of kits) {
    const skills = path.join(target, kit, 'skills');
    if (existingKits && !fs.existsSync(skills)) continue;
    if (apply) fs.mkdirSync(skills, { recursive: true });
    alvos.push({ onde: `${target}/${kit}`, skills });
  }
}
for (const repo of target ? [] : repos) {
  const raiz = path.resolve(root, '..', repo);
  if (!fs.existsSync(path.join(raiz, '.git'))) { console.error(`aviso: repositório ausente, ignorado: ${repo}`); continue; }
  for (const kit of kits) {
    const skills = path.join(raiz, kit, 'skills');
    if (fs.existsSync(skills) || (apply && todas)) alvos.push({ onde: `${repo}/${kit}`, skills });
  }
}
for (const idioma of target ? [] : fs.readdirSync(path.join(root, 'templates'), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)) {
  const dir = path.join(root, 'templates', idioma, 'templates');
  if (!fs.existsSync(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    for (const kit of kits) {
      const skills = path.join(dir, e.name, kit, 'skills');
      if (fs.existsSync(skills)) alvos.push({ onde: `templates/${idioma}/${e.name}/${kit}`, skills, template: true, idioma,
        fullCatalog: e.name.startsWith('spec-driven-project-') });
    }
  }
}

// Skills locais de cada alvo: ficam fora da propagação e são conferidas ao fim.
// REQ-075/REQ-088: migrate only the named aliases (renamedSkills); preserve complete directories.
// Preflight every move before mutation. Never traverse a junction/symlink or delete a directory.
const migrations = [];
const legacySkills = [];
function safeSkillPath(base, destination) {
  const anchor = path.dirname(path.dirname(base));
  if (fs.lstatSync(anchor).isSymbolicLink()) throw new Error(`Raiz vinculada: ${anchor}`);
  const realBase = fs.realpathSync(anchor);
  let node = destination;
  while (node !== anchor) {
    if (fs.existsSync(node)) {
      const real = fs.realpathSync(node);
      const relative = path.relative(realBase, real);
      if (fs.lstatSync(node).isSymbolicLink() || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error(`Skill vinculada ou fora do kit: ${node}`);
      }
    }
    node = path.dirname(node);
  }
}
for (const alvo of alvos) {
  safeSkillPath(alvo.skills, alvo.skills);
  for (const name of canonical.keys()) {
    safeSkillPath(alvo.skills, path.join(alvo.skills, name, 'SKILL.md'));
    for (const file of subskillPaths(alvo.skills, name)) safeSkillPath(alvo.skills, file);
  }
  if (!fs.existsSync(alvo.skills)) continue;
  for (const [oldName, newName] of Object.entries(renamedSkills)) {
    const source = path.join(alvo.skills, oldName);
    if (!fs.existsSync(source)) continue;
    const destination = path.join(alvo.skills, newName);
    safeSkillPath(alvo.skills, source);
    safeSkillPath(alvo.skills, destination);
    if (fs.existsSync(destination)) throw new Error(`Skills antiga e nova coexistem; inspecione antes de migrar: ${source}`);
    legacySkills.push({ onde: alvo.onde, oldName, newName });
    if (apply && selecionadas.includes(newName)) migrations.push({ source, destination });
  }
}
customizationStates = acknowledgements.loadManifests(alvos, safeSkillPath);
if (apply) acknowledgements.planRenames(customizationStates, renamedSkills, selecionadas);
for (const migration of migrations) fs.renameSync(migration.source, migration.destination);
if (apply) acknowledgements.saveManifests(customizationStates);
const remainingLegacySkills = legacySkills.filter(entry => !apply || !selecionadas.includes(entry.newName));

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
const canonicalRules = target && !existingKits && fs.existsSync(path.join(root, '.gemini/rules'))
  ? fs.readdirSync(path.join(root, '.gemini/rules')).filter(name => fs.statSync(path.join(root, '.gemini/rules', name)).isFile()).sort() : [];
if (target) for (const kit of kits) for (const name of canonicalRules) validateTarget(path.join(target, kit, 'rules', name));
if (apply) {
  for (const alvo of alvos) {
    if (alvo.skills === canonDir) continue;
    for (const nome of selecionadas) {
      const destino = path.join(alvo.skills, nome, 'SKILL.md');
      // Template só recebe skill que ele já traz: um kit privado não ganha o catálogo inteiro.
      if (alvo.template && !alvo.fullCatalog && !fs.existsSync(destino)) continue;
      if (alvo.template && translations.registered(traduzidas, alvo.idioma, nome)) continue;
      const atual = ler(destino);
      if (intentional(destino, atual, canonical.get(nome))) continue;
      if (atual && normalize(atual).equals(canonicalLF.get(nome))) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, canonical.get(nome));
      escritos.push(path.relative(path.dirname(root), destino).replace(/\\/g, '/'));
    }
    // Subskills follow the parent: only where the parent exists and is not a registered translation.
    for (const nome of selecionadas) {
      if (!subskills.has(nome) || !fs.existsSync(path.join(alvo.skills, nome, 'SKILL.md'))) continue;
      if (alvo.template && translations.registered(traduzidas, alvo.idioma, nome)) continue;
      for (const [rel, bytes] of subskills.get(nome)) {
        const destino = path.join(alvo.skills, nome, ...rel.split('/'));
        const atual = ler(destino);
        if (atual && normalize(atual).equals(normalize(bytes))) continue;
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.writeFileSync(destino, bytes);
        escritos.push(path.relative(path.dirname(root), destino).replace(/\\/g, '/'));
      }
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
let subskillsIguais = 0;
let subskillsTraduzidas = 0;
const divergentes = [];
const customizadas = [];
for (const alvo of alvos) {
  for (const [nome, bytes] of canonical) {
    const destination = path.join(alvo.skills, nome, 'SKILL.md');
    const atual = ler(destination);
    if (!atual) {
      if (!alvo.template || alvo.fullCatalog) divergentes.push({ onde: alvo.onde, skill: nome, motivo: 'ausente',
        path: target ? path.relative(target, destination).replace(/\\/g, '/') : destination });
      continue;
    }
    if (alvo.template && translations.registered(traduzidas, alvo.idioma, nome)) { traducoes++; continue; }
    if (normalize(atual).equals(canonicalLF.get(nome))) iguais++;
    else if (intentional(destination, atual, bytes)) customizadas.push({ onde: alvo.onde,
      path: path.relative(path.dirname(path.dirname(alvo.skills)), destination).replace(/\\/g, '/'), skill: nome });
    else divergentes.push({ onde: alvo.onde, skill: nome, motivo: 'conteúdo diferente',
      path: target ? path.relative(target, destination).replace(/\\/g, '/') : destination,
      local_sha256: sha256(atual), seed_sha256: sha256(bytes) });
  }
  // A missing parent is already reported above; a translated parent must carry its translated subskills.
  for (const [nome, files] of subskills) {
    if (!fs.existsSync(path.join(alvo.skills, nome, 'SKILL.md'))) continue;
    const traduzida = alvo.template && translations.registered(traduzidas, alvo.idioma, nome);
    for (const [rel, bytes] of files) {
      const destination = path.join(alvo.skills, nome, ...rel.split('/'));
      const atual = ler(destination);
      const shown = target ? path.relative(target, destination).replace(/\\/g, '/') : destination;
      if (!atual) divergentes.push({ onde: alvo.onde, skill: `${nome}/${rel}`, motivo: 'subskill ausente', path: shown });
      else if (traduzida) subskillsTraduzidas++;
      else if (normalize(atual).equals(normalize(bytes))) subskillsIguais++;
      else divergentes.push({ onde: alvo.onde, skill: `${nome}/${rel}`, motivo: 'subskill diferente', path: shown,
        local_sha256: sha256(atual), seed_sha256: sha256(bytes) });
    }
  }
}
// REQ-091 (REP-011): registered translations are edited by hand in every template kit, so their copies
// must stay identical to each other. Non-blocking: reported as DRIFT_WARNING, never overwritten.
const translationCopies = new Map();
for (const alvo of alvos) {
  if (!alvo.template) continue;
  for (const nome of canonical.keys()) {
    if (!translations.registered(traduzidas, alvo.idioma, nome)) continue;
    const files = [['SKILL.md', path.join(alvo.skills, nome, 'SKILL.md')],
      ...[...(subskills.get(nome) || new Map()).keys()].map((rel) => [rel, path.join(alvo.skills, nome, ...rel.split('/'))])];
    for (const [rel, file] of files) {
      const atual = ler(file);
      if (!atual) continue;
      const key = `${alvo.idioma}\0${nome}\0${rel}`;
      if (!translationCopies.has(key)) translationCopies.set(key, new Map());
      const hash = sha256(normalize(atual));
      const group = translationCopies.get(key);
      if (!group.has(hash)) group.set(hash, []);
      group.get(hash).push(alvo.onde);
    }
  }
}
const translationCopyDivergence = [...translationCopies].filter(([, group]) => group.size > 1).map(([key, group]) => {
  const [language, skill, file] = key.split('\0');
  const variants = [...group].map(([hash, onde]) => ({ sha256: hash, copies: onde.length, onde: onde.sort() }))
    .sort((a, b) => b.copies - a.copies || (a.sha256 < b.sha256 ? -1 : 1));
  return { language, skill, file, variants };
});
for (const item of translationCopyDivergence) {
  const minority = item.variants.slice(1).flatMap((v) => v.onde).join(', ');
  console.error(`[TRANSLATION-COPY-DIVERGENCE] '${item.skill}' (${item.file}) em '${item.language}': ${item.variants.length} versões entre os kits; divergem da maioria: ${minority}`);
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
  iguais, traduzidas: traducoes, divergentes, escritos,
  subskills: Object.fromEntries([...subskills].map(([nome, files]) => [nome, [...files.keys()]])),
  subskills_iguais: subskillsIguais, subskills_traduzidas: subskillsTraduzidas, aliases: renamedSkills, skills_locais_preservadas: locais.size, skills_locais_alteradas: locaisAlteradas,
  md5: Object.fromEntries([...canonical].map(([nome, bytes]) => [nome, md5(bytes)])),
  sha256: Object.fromEntries([...canonical].map(([nome, bytes]) => [nome, sha256(bytes)])), customizadas,
  renamed_skills: migrations, legacy_skills: remainingLegacySkills,
  customizations_migrated: [...customizationStates.values()].flatMap(state => state.migrations),
  rules_written: rulesWritten, rules_divergent: rulesDivergent,
  translation_drift: translationDrift, translation_copy_divergence: translationCopyDivergence,
  status: divergentes.length || locaisAlteradas.length || rulesDivergent.length || remainingLegacySkills.length ? 'FAIL'
    : translationDrift.length || translationCopyDivergence.length ? 'DRIFT_WARNING' : 'PASS',
};
if (valor('--report')) fs.writeFileSync(path.resolve(valor('--report')), `${JSON.stringify(relatorio, null, 2)}\n`);
console.log(JSON.stringify({ status: relatorio.status, alvos: alvos.length, iguais, traduzidas: traducoes, divergentes: divergentes.length,
  escritos: escritos.length, locais: locais.size, locaisAlteradas: locaisAlteradas.length }));
if (divergentes.length) console.log(JSON.stringify(divergentes.slice(0, 12)));
if (relatorio.status === 'FAIL') process.exitCode = 1;

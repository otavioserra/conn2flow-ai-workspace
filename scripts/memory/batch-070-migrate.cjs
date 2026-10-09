// REQ-068 / BATCH-070: migra um satélite de sdd/ para memory/ (MDD).
//
//   node scripts/memory/batch-070-migrate.cjs <repo> "<papel do repositório>"
//
// Faz: git mv sdd memory, tríade fundamental, pastas canônicas, index.md hierárquico e atualização das
// referências sdd/ -> memory/ nos arquivos de instrução. Não faz commit nem sincroniza skills
// (use scripts/skills/sync-skills.cjs) e nunca usa git add.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const matriz = path.resolve(__dirname, '../..');
const [repo, papel] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!repo || (!papel && !process.argv.includes('--refs-only'))) throw new Error('Uso: batch-070-migrate.cjs <repo> "<papel>"');
const raiz = path.resolve(matriz, '..', repo);
const memory = path.join(raiz, 'memory');
const soRefs = process.argv.includes('--refs-only') || process.argv.includes('--reindex-only');
const soReindex = process.argv.includes('--reindex-only');
if (!soRefs) {
if (!fs.existsSync(path.join(raiz, 'sdd'))) throw new Error('sdd/ ausente em ' + repo);
if (fs.existsSync(memory)) throw new Error('memory/ já existe em ' + repo);

execFileSync('git', ['mv', 'sdd', 'memory'], { cwd: raiz, stdio: 'inherit' });
}

const ler = (p) => fs.readFileSync(p, 'utf8');
const gravar = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const hoje = '2026-10-09';

if (!soRefs) {
// --- Tríade -----------------------------------------------------------------------------------
const baselinePath = path.join(memory, '00-baseline-architecture.md');
let anterior = '';
if (fs.existsSync(baselinePath)) {
  anterior = ler(baselinePath);
  gravar(path.join(memory, 'reports/archive/original/baseline-before-mdd.md'), anterior);
}
const topo = fs.readdirSync(raiz, { withFileTypes: true })
  .filter((e) => !['.git', 'node_modules', 'vendor', 'memory'].includes(e.name) && !e.name.startsWith('.'))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((e) => `| ${e.name}${e.isDirectory() ? '/' : ''} | ${e.isDirectory() ? 'Diretório do projeto' : 'Arquivo do projeto'} |`);
const rootAbs = raiz.replace(/\\/g, '/');
let baseline = `# System Master Index — ${repo}

Projeto: ${repo}. Raiz: ${rootAbs}.
Papel: ${papel}.
Fundação MDD adotada pela REQ-068 / BATCH-070 (matriz conn2flow-ai-workspace), ${hoje}. Histórico SDD preservado por git mv.

## Entrada econômica

1. Leia este router, [mecânica](01-general-memory.md) e [política](02-policy.md).
2. Leia [CURRENT](human-requests/CURRENT.md) quando existir e a requisição apontada; confirme aprovação, lote e autonomia.
3. Use o index.md da área antes de carregar documentos extensos. Consulte somente as fontes necessárias ao slice.
4. Confira [README](README.md) e o [índice geral](index.md).

## Mapa do repositório

| Área | Responsabilidade |
| --- | --- |
| memory/ | Governança persistente (MDD): requisições, lotes, decisões, validação, relatórios e índices |
${topo.join('\n')}

## Autoridade e preservação

Código, schemas e configuração vigentes prevalecem sobre memórias históricas. Decisões e contratos aprovados governam requisitos; intake não substitui contrato normativo. A governança canônica vive na matriz conn2flow-ai-workspace; skills canônicas são propagadas por scripts/skills/sync-skills.cjs e skills locais deste repositório são preservadas.
`;
if (anterior) {
  baseline += anterior.length < 22000
    ? `\n## Baseline anterior (preservada)\n\n${anterior.replace(/^#\s+/m, '### ')}`
    : '\n## Baseline anterior\n\nPreservada integralmente em [baseline-before-mdd.md](reports/archive/original/baseline-before-mdd.md).\n';
}
gravar(baselinePath, baseline);
for (const f of ['01-general-memory.md', '02-policy.md']) {
  fs.copyFileSync(path.join(matriz, 'memory', f), path.join(memory, f));
}
const politica = path.join(memory, '02-policy.md');
gravar(politica, ler(politica).replace('Vigência: 2026-10-09, REQ-067 / BATCH-069.', `Vigência: 2026-10-09, REQ-067 / BATCH-069; adotada em ${repo} pela REQ-068 / BATCH-070.`));
}

// --- Pastas canônicas ------------------------------------------------------------------------
const proposito = { backlog: 'Propostas não executáveis', 'change-requests': 'Mudanças de contrato', decisions: 'Decisões aprovadas', handoffs: 'Transferência de execução', 'human-requests': 'Requisições e ponteiro ativo', implementation: 'Lotes e evidências', proxies: 'Referências externas', sessions: 'Resumos de sessão', validation: 'Validação e pareceres', reports: 'Relatórios de agentes', raw: 'Artefatos intermediários', process: 'Runbooks operacionais' };
if (!soRefs) {
for (const nome of ['human-requests', 'implementation', 'decisions', 'validation', 'reports', 'raw']) {
  for (const sufixo of ['', '/archive', '/archive/compacted', '/archive/original']) fs.mkdirSync(path.join(memory, nome + sufixo), { recursive: true });
}
for (const nome of ['backlog', 'change-requests', 'handoffs', 'sessions', 'proxies']) {
  if (fs.existsSync(path.join(memory, nome))) for (const sufixo of ['/archive/compacted', '/archive/original']) fs.mkdirSync(path.join(memory, nome + sufixo), { recursive: true });
}
fs.mkdirSync(path.join(memory, 'raw/active'), { recursive: true });
}

function indexar(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory() && !e.isSymbolicLink()) indexar(path.join(dir, e.name));
  const linhas = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name === 'index.md' || e.isSymbolicLink()) continue;
    const p = path.join(dir, e.name);
    let titulo = e.name;
    let resumo = e.isDirectory() ? 'Nó de navegação' : 'Documento preservado; consultar fonte';
    let status = dir.includes(path.sep + 'archive') ? 'archived' : 'indexed';
    if (e.isFile() && e.name.endsWith('.md')) {
      const s = ler(p);
      titulo = (s.match(/^#\s+(.+)$/m) || [])[1] || titulo;
      const declarado = (s.match(/(?:\*\*Status\*\*|Status)\s*:\s*`?([A-Za-z_-]+)/) || [])[1];
      if (declarado) status = declarado;
      resumo = s.split(/\r?\n/).find((l) => l.trim() && !/^(#|[-*|>`]|---|name:|description:|user-invocable:)/.test(l)) || resumo;
    }
    const cel = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\|/g, ' / ').replace(/[\r\n]/g, ' ').slice(0, 180);
    const id = (e.name.match(/(?:REQ|BATCH|BL|ARCH|DEC|CR|FEAT)-\d+/i) || [])[0] || e.name;
    linhas.push('| ' + [cel(id), cel(titulo), cel(resumo), `[${cel(e.name)}](${encodeURI(e.name) + (e.isDirectory() ? '/index.md' : '')})`, cel(status)].join(' | ') + ' |');
  }
  const rotulo = path.relative(memory, dir).replace(/\\/g, '/') || 'memory';
  gravar(path.join(dir, 'index.md'), `# Index — ${rotulo}\n\n${proposito[rotulo] || 'Navegação hierárquica; leia o resumo antes do documento integral.'}\n\n| ID | Título | Resumo Executivo | Link Relativo | Status |\n| --- | --- | --- | --- | --- |\n${linhas.join('\n')}\n`);
}
if (!soRefs || soReindex) indexar(memory);
if (soReindex) process.exit(0);

// --- Referências nos arquivos de instrução -----------------------------------------------------
const alvos = ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md', 'CODEX.md', '.cursorrules', 'README.md', 'README-PT-BR.md', '.gemini/styleguide.md', '.github/copilot-instructions.md'];
for (const dir of ['.claude/rules', '.cursor/rules', '.gemini/rules', '.gemini/agents', '.github/instructions', '.github/prompts', '.github/hooks', 'memory/scripts/hooks']) {
  const abs = path.join(raiz, dir);
  if (fs.existsSync(abs)) for (const f of fs.readdirSync(abs)) alvos.push(dir + '/' + f);
}
const mudados = [];
for (const rel of alvos) {
  const p = path.join(raiz, rel);
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) continue;
  if (repo === 'conn2flow-app' && /^README/.test(rel)) continue; // README descreve boilerplates com sdd/ real
  const s = ler(p);
  const r = s
    .replace(/(?<![A-Za-z0-9_./-])(?<!docs\/)(?<!boilerplate\/)sdd\//g, 'memory/')
    .replace(/(\.\.?\/)sdd(?=[/)])/g, '$1memory')
    .replace(/(?<=`)sdd(?=`)/g, 'memory')
    .replace(/(?<![\w-])Spec-Driven Development(?![\w-])/g, 'Memory Driven Development (MDD)')
    .replace(/(?<![\w-])SDD(?![\w-])/g, 'MDD');
  if (r !== s) { fs.writeFileSync(p, r); mudados.push(rel); }
}
console.log(JSON.stringify({ repo, referenciasAtualizadas: mudados }, null, 1));

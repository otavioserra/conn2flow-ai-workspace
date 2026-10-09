// REQ-067: materialização e evidências da fundação; executar da raiz da matriz.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const mode = process.argv[2];
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(root,p)), {recursive:true}); fs.writeFileSync(path.join(root,p),s); };
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function files(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isSymbolicLink() ? [] : e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
function localSnapshot() {
  const canon = new Set(fs.readdirSync(path.join(root,'.gemini/skills')));
  const result = {};
  for (const repo of ['lumix','conn2flow-site','transformamp']) for (const kit of ['.gemini','.claude','.cursor','.codex','.github']) {
    const dir = path.resolve(root,'..',repo,kit,'skills');
    for (const e of fs.readdirSync(dir,{withFileTypes:true})) if(e.isDirectory() && !canon.has(e.name)) {
      for(const p of files(path.join(dir,e.name))) result[path.relative(path.dirname(root),p).replace(/\\/g,'/')] = hash(p);
    }
  }
  return result;
}
if(mode === 'snapshot') {
  write('completions/BATCH-069-preservation-before.json', JSON.stringify({locals:localSnapshot(), governance:Object.fromEntries(files(path.join(root,'sdd')).map(p=>[path.relative(path.join(root,'sdd'),p).replace(/\\/g,'/'),hash(p)]))},null,2)+'\n');
  console.log('Snapshot de preservação registrado.');
  process.exit(0);
}
if(!['foundation','indexes'].includes(mode)) throw new Error('Use snapshot, foundation ou indexes');
if(!fs.existsSync(path.join(root,'memory')) || fs.existsSync(path.join(root,'sdd'))) throw new Error('Execute git mv sdd memory primeiro');
if(mode === 'foundation') {
// Preserve integralmente a baseline anterior antes de atualizar o router.
const original = 'memory/reports/archive/original/baseline-before-mdd.md';
if(!fs.existsSync(path.join(root,original))) write(original,fs.readFileSync(path.join(root,'memory/00-baseline-architecture.md')));
write('memory/00-baseline-architecture.md', `# System Master Index — Conn2Flow AI Workspace

Projeto: conn2flow-ai-workspace. Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Fundação MDD aprovada pela REQ-067 / BATCH-069, 2026-10-09.

## Entrada econômica

1. Leia este router, [mecânica](01-general-memory.md) e [política](02-policy.md).
2. Leia [CURRENT](human-requests/CURRENT.md) e a requisição apontada; confirme aprovação, lote e autonomia.
3. Use o index.md da área antes de carregar documentos extensos. Consulte somente fontes necessárias ao slice.
4. Confira [SPEC](SPEC.md), [índice de lotes](implementation/index.md) e [validação](validation/index.md).

## Mapa do código e das fontes

| Área | Responsabilidade | Entrada |
| --- | --- | --- |
| memory/ | Governança persistente da matriz; contratos, episódios, relatórios e índices | [índice](index.md) |
| .gemini/skills/ | Fonte canônica de 44 skills procedurais | [Executor](../.gemini/skills/c2f-executor-agent/SKILL.md) |
| .claude/, .cursor/, .codex/, .github/ | Kits espelhados pelo sincronizador oficial | [sincronizador](../scripts/skills/sync-skills.cjs) |
| templates/pt-br/ e templates/en/ | Kits e boilerplates bilíngues para instalações; legado SDD preservado | [templates](../templates/README.md) |
| scripts/ | Instaladores, sync-back e propagação determinística de skills | [scripts](../scripts/) |
| vscode-extension/ | Extensão Conn2Flow Tools; fontes TypeScript e testes CJS | [package](../vscode-extension/package.json) |
| mcp-hub/ e cli/ | Integração e automação do workspace | [hub](../mcp-hub/) / [CLI](../cli/) |
| completions/ | Recibos e evidências verificáveis | [auditoria do lote](../completions/BATCH-069-skills-audit.json) |

## Limites entre repositórios

A matriz governa kits, memória e ferramentas. O core conn2flow contém gestor/, bibliotecas PHP, recursos e CLI do produto. conn2flow-site é o projeto do site; lumix e transformamp mantêm skills locais. A sincronização de skills alcança 25 kits e 14 templates (39 alvos), sem apagar skills exclusivas ou sobrescrever traduções declaradas.

Somente a matriz migrou para memory/. Satélites, boilerplates e descoberta SDD da extensão permanecem no contrato existente nesta onda. ARCH-010 (Client CLI Daemon) e ARCH-011 (Hub/Watcher) são trabalho futuro, sem implementação neste lote.

## Autoridade e preservação

Código, schemas e configuração vigentes prevalecem sobre memórias históricas. SPEC e decisões aprovadas governam requisitos; intake não substitui contrato normativo. O Executor materializa a fundação explicitamente aprovada, registra evidências e entrega para revisão independente. A [baseline histórica](reports/archive/original/baseline-before-mdd.md) foi preservada integralmente.
`);
write('memory/01-general-memory.md', `# Memory Mechanics & Lifecycle

MDD (Memory Driven Development) organiza memória persistente em quatro camadas. Uma especificação continua normativa; o contexto verificável permite aplicar o contrato vigente sem repetir toda a história.

| Camada | Conteúdo | Localização |
| --- | --- | --- |
| Episódica | Requisições, execução, validações, handoffs, sessões e relatos datados | human-requests/, implementation/, validation/, handoffs/, sessions/, reports/ |
| Semântica / normativa | Arquitetura, SPEC, decisões, política e contratos aprovados | documentos raiz, decisions/, change-requests/ |
| Procedural | Procedimentos reutilizáveis e armadilhas operacionais | .gemini/skills/; process/ como runbooks |
| Raw | Notas de trabalho, observações intermediárias e artefatos livres de modelos | raw/active/; raw/archive/ |

## Ciclo de vida

Captação na sessão → retenção ativa → poda preventiva → arquivamento dual.
Registre origem, data, estado e ligação com requisição/lote. Promova fatos confirmados para episódios; regras recorrentes aprovadas para skills ou contratos. Observações raw nunca têm autoridade normativa por si mesmas.

Na retenção, mantenha a janela ativa e os tetos da [política](02-policy.md). Em 50 KB ou 200 linhas em memória de execução, emita alerta e planeje destilação; a manutenção preserva originais antes de reduzir o ativo. Nunca pode memória saudável só para fechar sessão. O limiar legado de 75 KB / 300 linhas não autoriza exceder o teto ativo MDD de 50 KB.

No arquivamento dual, preserve bytes do original em archive/original/ e escreva síntese em archive/compacted/, com vínculo ao original, procedência e lacunas explícitas. Atualize os índices e repare links na mesma operação. Históricos legados já arquivados permanecem no lugar, indexados, até migração autorizada; não são reescritos em massa.

## Navegação e uso de contexto

Leia index.md primeiro. Escolha por ID, resumo e status; use compacted/ para varredura histórica e original/ para comprovar detalhes. Carregue documentos densos só quando a decisão depender deles. Memória desatualizada é marcada e corrigida com referência ao código, nunca tratada como fato atual.

Raw armazena notas e resultados observáveis úteis ao trabalho, sem credenciais, dados pessoais desnecessários ou transcrição de raciocínio privado. Registre somente sínteses de decisões e evidências compartilháveis. Fechada a frente, promova o sinal útil e arquive os artefatos permitidos.
`);
write('memory/02-policy.md', `# MDD Policy — Governance, Folders & Agent SLAs

Vigência: 2026-10-09, REQ-067 / BATCH-069. Nomes novos de pastas e arquivos estruturais em inglês; conteúdo pode ser multilíngue. IDs, contratos e nomes históricos preservam rastreabilidade.

## Pastas canônicas

| Pasta | Finalidade e regra |
| --- | --- |
| backlog/ | Ideias e épicos; não executáveis até promoção humana |
| change-requests/ | Alterações de contrato, impacto e autorização |
| decisions/ | Decisões normativas datadas; até 10 itens ativos |
| handoffs/ | Transferência com projeto, raiz absoluta, REQ, BATCH, estado e próximo passo |
| human-requests/ | Intake aprovado e CURRENT.md; até 10 requisições ativas |
| implementation/ | Live Todo, entregas e evidências; até 10 lotes ativos |
| reports/ | Auditorias, spikes e diagnósticos; até 10 relatórios ativos |
| proxies/ | Referências de contexto externo com origem e autoridade explícitas |
| sessions/ | Resumos de sessão e pendências rastreáveis |
| validation/ | Checklist técnico, resultados e pareceres; janela de 10 lotes correntes |
| process/ | Runbooks e entrada da Tríade |
| raw/ | Artefatos intermediários; active/ e archive/, sem autoridade normativa |

Cada pasta ativa e nó de arquivo possui index.md com ID, Título, Resumo Executivo em uma linha, Link Relativo e Status. archive/compacted/ mantém sínteses; archive/original/ preserva conteúdo integral. Particione em archive-1/, archive-2/ quando centenas de itens dificultarem a navegação, mantendo índices em cada nó. Não mova arquivos antigos sem autorização e reparo de referências.

## Regra dos 10 e limites

human-requests/, implementation/, decisions/ e reports/ mantêm até 10 itens ativos; índices, README e ponteiros são infraestrutura, não itens. DECISION-LOG, BATCH-INDEX e VALIDATION-CHECKLIST mostram até 10 itens correntes, com história acessível por índice. Arquive o excedente mais antigo preservando documentos e links.

Documentos ativos têm teto preventivo de 50 KB (50 × 1024 bytes); o router 00-baseline-architecture.md fica abaixo de 30 KB. Ao atingir o teto, preserve original e destile ou divida o documento em nós indexados antes de ampliar. Memória de execução também alerta em 200 linhas. Nunca reduza documento saudável por fim de sessão nem altere memória de Chefia sem autorização explícita.

## SLAs da Tríade MDD

| Papel | Entrega e momento | Restrição |
| --- | --- | --- |
| Arquiteto | Antes da execução: contrato, aprovação, escopo, aceite e autonomia; depois do parecer: homologação | Não implementa nem commita código de core/módulos |
| Executor | Na abertura: lê CURRENT e mostra Live Todo; a cada etapa: progresso; antes da entrega: testes, checklist, lote e recibo | Não inventa homologação, altera contrato fora do briefing nem executa produção sem autorização |
| Revisor | Antes da consolidação: findings por gravidade, evidências e parecer independente | Não atribui PASS a verificações não executadas |

Os SLAs são eventos do ciclo, sem duração numérica inventada. Dúvidas de contrato voltam ao Arquiteto; evidências faltantes ficam explícitas. Comunicação contínua e dados verificáveis sustentam monitored.

| Modo MDD | Alias atual | Operação |
| --- | --- | --- |
| supervised | supervisionado | Humano aprova consolidação; execução e testes no escopo aprovado |
| monitored | autonomo_monitorado | Executor progride com Live Todo visível, valida e registra resultados |
| headless | autonomo_headless | Execução assíncrona autorizada, com recibos e condições de parada |

Modo de autonomia não amplia o escopo nem autoriza produção. git add exige caminhos específicos; skills só são propagadas pelo scripts/skills/sync-skills.cjs. Pipelines de recursos executam sequencialmente, com locks e logs. Skills privadas dos satélites são preservadas integralmente.
`);
write('memory/reports/BL-028-site-ai-learnings.md',fs.readFileSync(path.resolve(root,'../conn2flow-site/sdd/backlog/BL-028-relatorio-para-o-ai-workspace.md')));
}
const purposes = {backlog:'Propostas não executáveis', 'change-requests':'Mudanças de contrato',decisions:'Decisões aprovadas',handoffs:'Transferência de execução','human-requests':'Requisições e ponteiro ativo',implementation:'Lotes e evidências',proxies:'Referências externas',sessions:'Resumos de sessão',validation:'Validação e pareceres',reports:'Relatórios de agentes',raw:'Artefatos intermediários',process:'Runbooks operacionais'};
for(const name of Object.keys(purposes)) for(const suffix of ['', '/archive', '/archive/compacted', '/archive/original']) fs.mkdirSync(path.join(root,'memory',name+suffix),{recursive:true});
fs.mkdirSync(path.join(root,'memory/raw/active'),{recursive:true});
// Provisionar índices em TODOS os nós existentes, incluindo históricos legados.
function indexTree(dir) {
  for(const e of fs.readdirSync(dir,{withFileTypes:true})) if(e.isDirectory() && !e.isSymbolicLink()) indexTree(path.join(dir,e.name));
  const rows=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    if(e.name==='index.md' || e.isSymbolicLink()) continue;
    const p=path.join(dir,e.name);
    let title=e.name,summary=e.isDirectory()?'Nó de navegação':'Documento preservado; consultar fonte',status=dir.includes(path.sep+'archive')?'archived':'indexed';
    if(e.isFile() && e.name.endsWith('.md')) {
      const s=fs.readFileSync(p,'utf8');
      title=(s.match(/^#\s+(.+)$/m)||[])[1]||title;
      const declared=(s.match(/(?:\*\*Status\*\*|Status)\s*:\s*`?([A-Za-z_-]+)/)||[])[1];
      if(declared) status=declared;
      summary=s.split(/\r?\n/).find(l=>l.trim() && !/^(#|[-*|>`]|---|name:|description:|user-invocable:)/.test(l))||summary;
    }
    const cell=s=>s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\|/g,' / ').replace(/[\r\n]/g,' ').slice(0,180);
    const id=(e.name.match(/(?:REQ|BATCH|BL|ARCH|DEC|CR|FEAT)-\d+/i)||[])[0]||e.name;
    rows.push('| '+[cell(id),cell(title),cell(summary),`[${cell(e.name)}](${encodeURI(e.name)+(e.isDirectory()?'/index.md':'')})`,cell(status)].join(' | ')+' |');
  }
  const label=path.relative(path.join(root,'memory'),dir).replace(/\\/g,'/')||'memory';
  fs.writeFileSync(path.join(dir,'index.md'),`# Index — ${label}\n\n${purposes[label]||'Navegação hierárquica; leia o resumo antes do documento integral.'}\n\n| ID | Título | Resumo Executivo | Link Relativo | Status |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`);
}
if(mode === 'foundation') {
for(const p of ['AGENTS.md','GEMINI.md']) {
  let s=read(p).replaceAll('sdd/','memory/').replace(/\b43\b/g,'44').replace(/\b33 skills\b/g,'34 skills').replace(/\(33 Skills\)/g,'(34 Skills)').replace(/\b36 skills\b/g,'44 skills').replace(/\bSDD\b/g,'MDD');
  s=s.replace('orientadas a especificações (MDD)','orientadas à memória persistente (MDD — Memory Driven Development)');
  if(p==='AGENTS.md') s=s.replace('- `c2f-agent-visual-inspection`','- `c2f-ai-features`\n- `c2f-agent-visual-inspection`');
  s+='\n## Fundação MDD (Memory Driven Development)\n\nNa matriz, leia memory/00-baseline-architecture.md, memory/01-general-memory.md e memory/02-policy.md; use index.md antes de documentos densos. São quatro camadas: episódica, semântica/normativa, procedural e raw, com arquivamento dual compacted/original. Satélites e boilerplates conservam sdd/ nesta onda. A nova skill c2f-ai-features integra os 8 pilares de IA do Conn2Flow Pro.\n';
  write(p,s);
}
// Repare apenas URLs absolutas da própria matriz, sem mudar referências SDD de satélites.
for(const p of files(path.join(root,'memory')).filter(p=>p.endsWith('.md') && !p.includes(path.sep+'original'+path.sep))) {
  const s=fs.readFileSync(p,'utf8');
  const repaired=s.replace(/(conn2flow-ai-workspace[\\/])sdd[\\/]/gi,'$1memory/');
  if(s!==repaired) fs.writeFileSync(p,repaired);
}
for(const p of ['memory/README.md','memory/process/00-START-HERE.md','memory/process/01-WORKFLOW.md','memory/process/STARTER-PROMPTS.md']) {
  write(p,read(p).replaceAll('sdd/','memory/').replace(/\bSDD\b/g,'MDD'));
}
}
indexTree(path.join(root,'memory'));
console.log('Índices provisionados; histórico preservado.');

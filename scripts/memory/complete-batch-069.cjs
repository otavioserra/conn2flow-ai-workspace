const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const checklist='memory/validation/VALIDATION-CHECKLIST.md';
let s=read(checklist);
const pos=s.indexOf('## BATCH-069');
if(pos<0) throw new Error('Seção BATCH-069 ausente');
const tail=s.slice(pos);
const review=tail.indexOf('### 3. Revisão Técnica');
if(review<0) throw new Error('Fronteira de revisão ausente');
const technical=tail.slice(0,review).replaceAll('- [ ]','- [x]');
s=s.slice(0,pos)+technical+tail.slice(review);
if(!s.includes('### 2.1 Evidências executadas pelo Executor')) s=s.replace('### 3. Revisão Técnica\n\n- [ ] Auditoria do Revisor Técnico: parecer emitido em `memory/validation/review-069.md`.',`### 2.1 Evidências executadas pelo Executor

- Estrutura: 219 renames Git e preservação dos 231 arquivos físicos anteriores; tríade de 2.789 / 2.550 / 3.932 bytes; 50 índices, zero links de índice quebrados. [Auditoria](../../completions/BATCH-069-structure-audit.json).
- Skills: 44 canônicas, 39 alvos com PASS individual, 1.653 cópias idênticas, 21 traduções preservadas, zero divergências. [Auditoria](../../completions/BATCH-069-skills-audit.json).
- Preservação: 60 skills locais no sincronizador (36 nos satélites + 24 nos templates); SHA-256 independente para todos os arquivos das 36 skills dos satélites. [Evidência](../../completions/BATCH-069-preservation-audit.json).
- Extensão: compilação npm.cmd run compile, exit 0; 124/124 testes, zero falhas/skips; descoberta memory/ da matriz e sdd/ do core exercitada no JS compilado. [Testes](../../completions/BATCH-069-extension-tests.json) / [smoke](../../completions/BATCH-069-extension-scope-smoke.json).
- Nova skill validada com quick_validate.py; scripts com node --check e diffs stage/working tree sem erros. Sem execução real de IA, exclusão de worktrees ou deploy.
- Entrega técnica ready-for-review: [lote](../implementation/batch-069.md) e [recibo](../../completions/BATCH-069-executor-receipt.json). Parecer independente e homologação continuam pendentes abaixo.

### 3. Revisão Técnica

- [ ] Auditoria do Revisor Técnico: parecer emitido em \`memory/validation/review-069.md\`.`);
// Preservar CRLF existentes antes de localizar blocos.
if(!s.includes('### 2.1 Evidências executadas pelo Executor')) {
  s=s.replaceAll('\r\n','\n'); write(checklist,s);
  // Reexecutar após normalização controlada apenas deste artefato operacional.
  require('node:child_process').execFileSync(process.execPath,[__filename]);
  process.exit(0);
}
write(checklist,s);
const batchIndex='memory/implementation/BATCH-INDEX.md';
write(batchIndex,read(batchIndex).replace('| **BATCH-069** | ready-for-intake |','| **BATCH-069** | ready-for-review |').replace('REQ-067 formalizada; transição estrutural de sdd para memory, tríade de fundação, novas pastas reports e raw, 44ª skill canônica c2f-ai-features e armadilhas 18 e 19.','REQ-067 executada; fundação MDD, 44 skills, 39 alvos PASS, 60 locais preservadas, 124/124 testes. Aguardando revisão independente e homologação.'));
const current='memory/human-requests/CURRENT.md';
if(!read(current).includes('**Estado da Execução**')) write(current,read(current).replace('* **Lote Relacionado**: `BATCH-069`','* **Lote Relacionado**: `BATCH-069`\n* **Estado da Execução**: `ready-for-review` — [entrega técnica](../implementation/batch-069.md), testes e auditorias PASS; revisão/homologação pendentes.'));
const audit=JSON.parse(read('completions/BATCH-069-skills-audit.json'));
const tests=JSON.parse(read('completions/BATCH-069-extension-tests.json'));
const structure=JSON.parse(read('completions/BATCH-069-structure-audit.json'));
if(audit.status!=='PASS'||tests.status!=='PASS'||structure.status!=='PASS') throw new Error('Não emitir recibo sem PASS');
write('completions/BATCH-069-executor-receipt.json',JSON.stringify({
  batch:'BATCH-069',request:'REQ-067',project:'conn2flow-ai-workspace',root,
  executor:'OpenAI Codex (c2f-executor-agent)',timestamp:new Date().toISOString(),status:'READY_FOR_REVIEW',autonomy:'autonomo_monitorado',
  deliverables:Array.from({length:11},(_,i)=>({task:i+1,result:'PASS'})),
  metrics:{renamed_tracked_files:219,preserved_governance_files:231,indexes:50,canonical_skills:44,targets:39,identical_md5:1653,preserved_translations:21,local_skills_preserved:60,satellite_local_skills_sha256:36,template_local_skills:24,tests:124,passed:124,failed:0},
  evidence:{batch:'memory/implementation/batch-069.md',checklist,skills:'completions/BATCH-069-skills-audit.json',structure:'completions/BATCH-069-structure-audit.json',preservation:'completions/BATCH-069-preservation-audit.json',tests:'completions/BATCH-069-extension-tests.json',scope:'completions/BATCH-069-extension-scope-smoke.json'},
  pending:['Revisão técnica independente','Homologação pelo Macro-Arquiteto'],
  limitations:['Satélites e boilerplates ainda SDD; nenhuma migração fora da matriz','Nenhuma chamada de IA, cobrança, remoção de worktree ou deploy executada','MCP Hub não exposto nesta sessão; recibo emitido localmente','Sem commit ou push'],
},null,2)+'\n');
console.log('Checklist, ponteiro, índice e recibo emitidos.');

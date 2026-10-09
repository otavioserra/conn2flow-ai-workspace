// Vérification reproducível da REQ-067; falha se alguma entrega verificada regredir.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const save=(p,data)=>fs.writeFileSync(path.join(root,p),JSON.stringify(data,null,2)+'\n');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const md5=p=>crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
function files(d) {return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(d,e.name)):[path.join(d,e.name)]);}
const before=load('completions/BATCH-069-preservation-before.json');
const locals=Object.entries(before.locals).map(([p,h])=>({file:p,before_sha256:h,after_sha256:hash(path.resolve(root,'..',p))}));
assert.equal(locals.filter(x=>x.file.endsWith('/SKILL.md')).length,36);
assert.ok(locals.every(x=>x.before_sha256===x.after_sha256),'Skill local alterada');
save('completions/BATCH-069-preservation-audit.json',{status:'PASS',files:locals.length,satellite_skills_sha256:36,all_local_skills_md5:60,note:'O sincronizador oficial conta 36 skills locais nos satélites e 24 nos templates, total 60. Snapshot independente cobre todos os arquivos das 36 skills dos três satélites.',entries:locals});
assert.ok(!fs.existsSync(path.join(root,'sdd')));
const baselineOriginal=path.join(root,'memory/reports/archive/original/baseline-before-mdd.md');
assert.equal(hash(baselineOriginal),before.governance['00-baseline-architecture.md']);
const changed=[];
for(const [p,h] of Object.entries(before.governance)) {
  const dest=path.join(root,'memory',p); assert.ok(fs.existsSync(dest),`Arquivo perdido: ${p}`);
  if(hash(dest)!==h) changed.push(p);
}
const nodes=['backlog','change-requests','decisions','handoffs','human-requests','implementation','proxies','sessions','validation','reports','raw','process'];
for(const n of nodes) for(const s of ['', '/archive','/archive/compacted','/archive/original']) assert.ok(fs.existsSync(path.join(root,'memory',n+s,'index.md')));
assert.ok(fs.existsSync(path.join(root,'memory/raw/active/index.md')));
const sizes={};
for(const p of ['00-baseline-architecture.md','01-general-memory.md','02-policy.md']) {
  sizes[p]=fs.statSync(path.join(root,'memory',p)).size;
  assert.ok(sizes[p]<(p.startsWith('00-')?30:50)*1024);
}
assert.equal(hash(path.join(root,'memory/reports/BL-028-site-ai-learnings.md')),hash(path.resolve(root,'../conn2flow-site/sdd/backlog/BL-028-relatorio-para-o-ai-workspace.md')));
const broken=[];
const indexes=files(path.join(root,'memory')).filter(p=>path.basename(p)==='index.md');
for(const p of indexes) {
  const s=fs.readFileSync(p,'utf8'); assert.ok(s.includes('| ID | Título | Resumo Executivo | Link Relativo | Status |'));
  for(const m of s.matchAll(/\]\(([^)]+)\)/g)) if(!fs.existsSync(path.resolve(path.dirname(p),decodeURI(m[1])))) broken.push({file:path.relative(root,p),link:m[1]});
}
assert.equal(broken.length,0,'Índice com link quebrado');
const staged=spawnSync('git',['diff','--cached','--name-status','--find-renames=100%'],{cwd:root,encoding:'utf8'});
assert.equal(staged.status,0);
const renames=staged.stdout.split(/\r?\n/).filter(l=>l.startsWith('R100\tsdd/'));
const trackedBefore=spawnSync('git',['ls-tree','-r','--name-only','HEAD:sdd'],{cwd:root,encoding:'utf8'});
assert.equal(trackedBefore.status,0);
assert.equal(renames.length,trackedBefore.stdout.trim().split(/\r?\n/).length,'Migração não comprovada no índice Git');
save('completions/BATCH-069-structure-audit.json',{status:'PASS',renamed_tracked_files:renames.length,preserved_files:Object.keys(before.governance).length,documents_updated:changed,foundation_bytes:sizes,indexes:indexes.length,broken_index_links:broken,bl028_sha256:hash(path.join(root,'memory/reports/BL-028-site-ai-learnings.md'))});
// Auditoria por alvo complementa a auditoria oficial agregada.
const official=load('completions/BATCH-069-skills-audit.json');
const translations=load('scripts/skills/translated.json');
assert.equal(official.status,'PASS'); assert.equal(official.skills_canonicas,44); assert.equal(official.alvos,39);
assert.equal(official.skills_locais_preservadas,60); assert.equal(official.skills_locais_alteradas.length,0);
const targets=[];
const kits=['.gemini','.claude','.cursor','.codex','.github'];
for(const repo of ['conn2flow-ai-workspace','conn2flow','conn2flow-site','lumix','transformamp']) for(const kit of kits) targets.push({name:`${repo}/${kit}`,dir:path.resolve(root,'..',repo,kit,'skills')});
for(const lang of ['pt-br','en']) {
  const base=path.join(root,'templates',lang,'templates');
  for(const e of fs.readdirSync(base,{withFileTypes:true}).filter(e=>e.isDirectory())) for(const kit of kits) {
    const dir=path.join(base,e.name,kit,'skills');
    if(fs.existsSync(dir)) targets.push({name:`templates/${lang}/${e.name}/${kit}`,dir,lang});
  }
}
const perTarget=targets.map(t=>{
  let equal=0,translated=0;
  for(const [name,h] of Object.entries(official.md5)) {
    const p=path.join(t.dir,name,'SKILL.md');
    if(t.lang && !fs.existsSync(p)) continue;
    assert.ok(fs.existsSync(p));
    if(t.lang && (translations[t.lang]||[]).includes(name)) {translated++;continue;}
    assert.equal(md5(p),h,`${t.name}/${name}`); equal++;
  }
  return {target:t.name,status:'PASS',equal,translated};
});
assert.equal(perTarget.length,39);
save('completions/BATCH-069-skills-audit.json',{...official,targets:perTarget,local_sha256_evidence:'BATCH-069-preservation-audit.json'});
// Smoke da descoberta real da matriz e dos caminhos SDD antigos, sem instância VS Code.
const sandbox={exports:{}, require:n=>{
  if(n==='vscode') return {workspace:{workspaceFolders:[{uri:{fsPath:root}}]}};
  if(n==='./projectsManager') return {ProjectsManager:{getProjectsList:()=>[]}};
  if(n==='./localizationManager') return {LocalizationManager:{t:k=>k}};
  if(n.startsWith('../')) return require(path.join(root,'vscode-extension/out',n.slice(3)));
  return require(n);
}};
vm.runInNewContext(fs.readFileSync(path.join(root,'vscode-extension/out/providers/sddScopeManager.js'),'utf8'),sandbox);
const scope=sandbox.exports.SddScopeManager;
const available=scope.getAvailableScopes();
assert.equal(available.find(s=>s.id==='ai-workspace').sddPath,path.join(root,'memory'));
assert.equal(available.find(s=>s.id==='core').sddPath,path.resolve(root,'../conn2flow/sdd'));
scope._currentScopeId='ai-workspace';
assert.equal(scope.resolveSddFile('sdd/human-requests/CURRENT.md'),path.join(root,'memory/human-requests/CURRENT.md'));
assert.equal(scope.resolveSddFile('memory/human-requests/CURRENT.md'),path.join(root,'memory/human-requests/CURRENT.md'));
save('completions/BATCH-069-extension-scope-smoke.json',{status:'PASS',matrix_root:'memory',satellite_root:'sdd',legacy_prefix:true,mdd_prefix:true});
const suite=spawnSync(process.execPath,['--test','test/*.test.cjs'],{cwd:path.join(root,'vscode-extension'),encoding:'utf8'});
fs.writeFileSync(path.join(root,'completions/BATCH-069-extension-tests.log'),suite.stdout+suite.stderr);
assert.equal(suite.status,0);
const tests=Number((suite.stdout.match(/(?:ℹ|#) tests (\d+)/)||[])[1]);
const passed=Number((suite.stdout.match(/(?:ℹ|#) pass (\d+)/)||[])[1]);
assert.equal(tests,124); assert.equal(passed,124);
save('completions/BATCH-069-extension-tests.json',{status:'PASS',tests,passed,failed:0,exit_code:suite.status,command:'node --test "test/*.test.cjs"',log:'BATCH-069-extension-tests.log'});
for(const args of [['diff','--check'],['diff','--cached','--check']]) {
  const r=spawnSync('git',args,{cwd:root,encoding:'utf8'}); assert.equal(r.status,0,r.stdout+r.stderr);
}
console.log(JSON.stringify({status:'PASS',renames:renames.length,indexes:indexes.length,targets:perTarget.length,local_skills:60,tests,passed,scope_smoke:'PASS'}));

const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function append(name, heading, body) {
  const p=path.join(root,'.gemini/skills',name,'SKILL.md');
  const s=fs.readFileSync(p,'utf8');
  if(!s.includes(heading)) fs.writeFileSync(p,s.trimEnd()+'\n\n'+heading+'\n\n'+body.trim()+'\n');
}
append('c2f-shell-and-windows-traps','### 18. Junctions e git worktree remove (crítica)',String.raw`
O BL-028 registra perda de vendor e node_modules em 2026-10-08: a remoção de worktrees no Windows atravessou Directory Junctions (mklink /J) e esvaziou destinos na árvore principal. Trate qualquer remoção como insegura até conferir os reparse points e suas referências.

Antes de remover, confirme o caminho absoluto da worktree, que não é árvore principal nem origem do pipeline. Liste junctions com cmd /c "dir /AL <pasta>" (inspecione também nós internos, sem atravessar links). Confira referências de outras worktrees para dentro dela; se houver, preserve/reaponte primeiro. Desfaça cada junction individualmente com cmd /c "rmdir <pasta>\<atalho>" **sem /S**: isso remove apenas o atalho. Use caminhos literais previamente verificados e o CMD de ponta a ponta; nunca gere lista em PowerShell para executar exclusão por outro shell. Confirme que os links saíram, então execute git worktree remove. Nunca use --force para ultrapassar trabalho não integrado. Depois confira o conteúdo de vendor/node_modules nas árvores principais e nas worktrees restantes.

Não crie junction para outra worktree temporária; quando necessária, a referência é para a árvore principal. Confira a rotina de seis passos em sdd-memory-gardening.

### 19. iconv //TRANSLIT não portável no PHP Windows

iconv('UTF-8', 'ASCII//TRANSLIT', $texto) pode substituir acentos por caracteres diferentes, interrogação ou retornar false conforme a plataforma. Para chaves/slugs que exigem determinismo, use tabela associativa explícita com strtr (inclua minúsculas/maiúsculas e o conjunto de caracteres aceito pelo produto), seguida de normalização controlada. Não converta falha em string vazia nem silencie warning. Exercite entrada acentuada em Windows e Linux, caracteres fora do mapa e repetibilidade; não aplique transliteração ao texto de apresentação. Preserve o comportamento de Unicode definido pelo contrato do recurso.
`);
append('sdd-memory-gardening','## MDD: faxina segura de worktrees em seis passos',String.raw`
Esta seção é manutenção de worktrees, independente do gatilho de poda de memória. O nome da skill permanece compatível; memory/ é a raiz MDD da matriz e sdd/ continua nos satélites nesta onda. Não pode memória saudável para fechar lote.

1. Inventarie com git worktree list --porcelain; confirme raízes absolutas, autores/datas, origens em environment.json e no pipeline. Exclua árvore principal e qualquer worktree usada como origem de projeto.
2. Atualize refs com git fetch e confira commits fora de origin/main (git log origin/main..HEAD na worktree), alterações staged/unstaged com git diff --ignore-cr-at-eol e git diff --cached --ignore-cr-at-eol, além de git ls-files --others --exclude-standard. Os três requisitos são cumulativos: zero commits exclusivos, zero alteração real e zero arquivo não rastreado. Não use --force para contornar mudanças; liste trabalho pendente ao humano.
3. No Windows, valide o alvo e inventarie junctions (cmd /c "dir /AL <pasta>") e referências recebidas de outras worktrees. Reaponte dependências antes da remoção; desfaça somente cada junction com cmd /c "rmdir <pasta>\<atalho>" sem /S, seguindo Armadilha 18. Não componha operações de exclusão entre shells.
4. Confirme ausência dos links e execute git worktree remove no caminho literal autorizado. Se Git recusar por sujeira, preserve a árvore e reporte; não use --force, clean, reset nem exclusão recursiva manual.
5. Confira vendor/node_modules das árvores principais e demais worktrees; só então apague branch local integrada com git branch -d (nunca -D) e rode git worktree prune.
6. Registre árvores removidas/preservadas, motivos e integridade dos destinos. Atualize árvore principal com git merge --ff-only origin/main apenas se estiver limpa e a atualização estiver autorizada; divergência exige avaliação, nunca mescla automática de trabalho alheio.

Na governança MDD, aplique o teto ativo de 50 KB da memory/02-policy.md antes de ampliar documento; preserve original e síntese. O CLI legado ai:archive-sdd só deve operar em sdd/ até suportar memory/ explicitamente: não o execute na matriz migrada presumindo compatibilidade.
`);
append('c2f-tailwind-css-architecture','## Hooks em telas de outros módulos (BL-028)',String.raw`
Marcação injetada por hook em tela alheia usa folha própria e classes específicas do componente. Não injete bundle genérico de utilities depois do pacote da página: isso altera a cascata e pode inverter responsivas da hospedeira. Valide a tela anfitriã em desktop/mobile e a ordem real de folhas. CSS próprio continua sendo autoria em resources/, sincronizado pelo pipeline.

Componente renderizado em contexto alheio pode não resolver @[[var]]@ do seu módulo. Nesse caso use marcador #x# substituído explicitamente no PHP com valor obtido no escopo correto via gestor_variaveis; escape conforme o destino (texto/atributo). Não coloque marcador em comentário: a troca pode consumir a primeira ocorrência. Confira que não sobraram marcadores na resposta e não aplique substituição indiscriminada a componentes cujo contrato já resolve variáveis.
`);
append('c2f-tailwind-module-migration','## Escopo main e inicialização tardia por hooks (BL-028)',String.raw`
Leitura de campos/rótulos da tela fica restrita a main, pois o menu de busca também usa label. Não varra todos os labels do document para formar contexto de IA. Se não houver main, aguarde a montagem ou reporte ausência de contexto; não caia para o documento inteiro.

Script incluído por hook pode executar antes de o editor/componentes serem criados. Faça tentativa inicial após DOM pronto e observe main com MutationObserver (childList/subtree); use debounce/intervalo limitado para novas tentativas, sem loop apertado. Inicialização deve ser idempotente, impedir handlers/botões duplicados e desconectar observador/timer quando não forem mais necessários ou ao desmontar tela. Valide com editor criado depois do hook e abertura repetida.

A orientação histórica de duas publicações para JS não se aplica ao pipeline atual: com lock, atualize timestamps dos arquivos versionados alterados e rode project:update-all uma vez por projeto, sequencialmente. Dois projetos com a mesma origem precisam de uma rodada cada.
`);
append('c2f-executor-agent','## Scripts, banco_select e locks (BL-028 / MDD)',String.raw`
Na matriz use memory/human-requests/CURRENT.md e memory/implementation/; leia a tríade raiz e index.md. Nos satélites ainda SDD, use sdd/. Esta seleção precede os exemplos históricos da skill.

Script complexo com regex, barras invertidas ou aspas triplas é escrito em arquivo pela ferramenta de edição e depois executado; não use heredoc do Bash. Para espaço literal sensível em regex, prefira \x20; confira os bytes gravados quando a ferramenta puder normalizar espaços. Use UTF-8 e preserve finais de linha existentes.

banco_select monta campos e depois explode por vírgula; coluna calculada é indexada pela expressão inteira, não pelo alias SQL. Evite expressão com vírgula nessa API e leia a chave real ou um auxiliar/posição compatível, conferindo a implementação de banco.php. Dublê de teste deve reproduzir esse comportamento, sem inventar chave de alias.

Deploy local: adquira lock exclusivo já previsto no ambiente (falha = outra execução; aguarde, não apague lock alheio), atualize timestamps somente dos arquivos versionados alterados quando exigido pelo pipeline, rode project:update-all <projeto> uma vez por projeto, sequencialmente com logs, e libere apenas seu lock em finally. Projetos com origem comum são destinos distintos. Não use cópia manual nem rode pipelines paralelos; registre falhas sem ocultá-las.
`);
append('project-validation','## Respostas de IA e fixtures realistas (BL-028)',String.raw`
Inspecione o pedido enviado e leia a resposta real, não apenas HTTP 200 e contagem de checks. Imprima/registre contexto mascarado e resposta numa evidência de teste restrita, sem contaminar telemetria permanente com texto bruto. Critérios de conteúdo devem ser sustentados pela documentação e pela ação pedida; não exija palavra arbitrária nem proíba frase que esconderia resposta parcial válida.

Fixtures incluem menu fora de main, username com formato de e-mail, rota desconhecida que devolve 200 e editor montado depois do hook. Confira privacidade no payload e na tela, permissões, modos editáveis, conteúdo hostil, ausência de provedor/créditos e timeout. Dublê de banco reproduz chaves de expressões calculadas e separação por vírgula do core.

Crie dados pelo caminho da interface exercitado; limpe no finally, confira que sumiram e registre o resultado, inclusive quando o teste falhar. Imprima o motivo de cada skip (cookie/permissão opcional pode mudar contagens). Abra e examine screenshots. Sem infraestrutura de IA disponível, registre dublês e limitações; não chame esse teste de resposta real homologada.

Relatório inclui: Defeitos achados e corrigidos antes da entrega; O que não foi exercitado; Limites conhecidos.
`);
append('c2f-documentation','## Como usar: termos literais da interface para RAG (BL-028)',String.raw`
Cada tela documentada recebe uma seção padronizada "Como usar" ("How to use" no par inglês). Confira os rótulos reais em resources/ e os handlers atuais antes de escrever. Descreva entrada/rota e permissão, campos obrigatórios/opcionais com seus nomes literais, sequência de botões com seus nomes literais, resultado esperado e recuperação de erro. Mantenha o par de idiomas alinhado e use os termos exibidos naquele idioma.

Não substitua nome visível por coluna SQL nem invente fluxo a partir de manual antigo. O assistente consulta essa seção via RAG: comportamento não documentado não pode ser prometido. Preserve referência técnica separadamente e confira o uso contra a tela real quando o fluxo mudar.
`);
append('sdd-workflow','## MDD, links externos e reserva via git ls-remote (BL-028)',String.raw`
Na matriz conn2flow-ai-workspace, memory/ substitui sdd/; leia 00-baseline-architecture.md, 01-general-memory.md e 02-policy.md e navegue pelos index.md. Os nomes sdd-* das skills e os exemplos de satélites permanecem compatíveis. Não execute ai:archive-sdd sobre memory/ sem suporte explícito no CLI. A ferramenta histórica só arquiva requisições e lotes: o teto de dez decisões/validações exige verificação própria, não se presume pela saída do comando.

CURRENT.md pode apontar para requisição externa: resolva o link contra a origem, identifique repositório/raiz e leia a aprovação lá. Não crie cópia fictícia local nem execute no repo incorreto. Reparadores só reescrevem caminhos internos; links que saem do repositório são classificados e preservados. Se ferramenta legada rejeitar o link externo, registre a incompatibilidade e não remova o ponteiro só para conseguir PASS.

Antes de reservar número novo, consulte refs com git ls-remote --heads origin para todas as branches envolvidas, fetch das refs relevantes e confira a sequência incluindo arquivos arquivados. Código de saída de grep encadeado não prova reserva nem ausência remota. Crie o intake com caminhos explícitos, faça o push autorizado e confira novamente a ref exata via git ls-remote; em rejeição ou movimento concorrente, releia a sequência e resolva a colisão sem force push. ls-remote é verificação, não lock atômico por si só; o push condicionado à ref anterior e a conferência da reserva são a garantia. Nesta entrega REQ-067 já está reservada: não reserve novo número.
`);
// As traduções de templates são mantidas pelo contrato do sincronizador, não copiadas.
for(const lang of ['en']) {
  const base=path.join(root,'templates',lang,'templates');
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(e.name==='SKILL.md' && /[\\/]project-validation[\\/]/.test(p)) {
    let s=fs.readFileSync(p,'utf8');
    if(!s.includes('## AI responses and realistic fixtures (BL-028)')) fs.writeFileSync(p,s.trimEnd()+`\n\n## AI responses and realistic fixtures (BL-028)\n\nInspect the masked request and read the actual response; HTTP 200 and check counts do not prove content quality. Derive assertions from the documented source, avoiding arbitrary keywords or bans on legitimate partial answers. Keep raw generated text out of permanent telemetry.\n\nUse fixtures with navigation outside main, an email-shaped username, an unknown route returning 200, and an editor created after the hook. Exercise permissions, hostile input, missing provider/credits and timeout. Database doubles must reproduce expression keys and comma splitting. Create data through the tested interface, clean it in finally and verify deletion even after failures. Report every skip and inspect screenshots. Without a reachable provider, label mock coverage and the unexercised real path.\n\nReports include defects fixed before delivery, what was not exercised, and known limitations.\n`);
  } else if(e.name==='SKILL.md' && /[\\/]sdd-memory-gardening[\\/]/.test(p)) {
    const s=fs.readFileSync(p,'utf8');
    if(!s.includes('## MDD: safe worktree maintenance')) fs.writeFileSync(p,s.trimEnd()+`\n\n## MDD: safe worktree maintenance\n\nWorktree maintenance is independent of memory pruning. Never prune healthy memory at session end. The matrix uses memory/ and a 50 KB active-document ceiling; satellites still use sdd/. Do not assume ai:archive-sdd supports memory/.\n\n1. Inventory worktrees and absolute roots; protect the main tree and environment/pipeline source trees.\n2. Fetch refs and verify no commits outside origin/main, no real staged or unstaged changes (ignore CR at EOL), and no untracked files. Report pending work; never force removal.\n3. On Windows inspect junctions and incoming links. Validate literal targets first. Use CMD end to end to list links with dir /AL and unlink each junction with rmdir WITHOUT /S. Repoint incoming dependencies first; never compose deletion across shells.\n4. Confirm links are gone, then git worktree remove the verified literal path; preserve trees Git refuses to remove.\n5. Check vendor/node_modules in surviving trees, delete only integrated local branches with git branch -d (never -D), then prune metadata.\n6. Record removed/preserved trees and integrity checks. Fast-forward a clean main tree only when authorized; never merge divergent work automatically.\n`);
  }}};
  walk(base);
}
console.log('Skills canônicas e traduções correlatas atualizadas.');

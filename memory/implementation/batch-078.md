---
id: "BATCH-078"
title: "Limpeza segura do ecossistema"
status: "ready-for-human-review"
date: "2026-10-15"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Inventário Git, arquivamento dual das memórias e auditoria do ecossistema para a REQ-076."
summary_medium: "Execução em autonomia monitorada, preservando alterações e commits não integrados.\nEvidências em completions/BATCH-078-*."
---

# BATCH-078 — REQ-076

Projeto: conn2flow-ai-workspace. Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Topologia: dupla. Autonomia: autonomo_monitorado. Categoria B; sem deploy.

## Live Todo

- [x] 1.1 Core: inventário, remoção de req235 e 51 branches; prune. Onze árvores preservadas pelos critérios abaixo.
- [x] 1.2 Site: inventário e remoção de 40 branches; prune. Cinco árvores e a pasta órfã preservadas pelos critérios abaixo.
- [x] 2.1 Core: onze requisições arquivadas, dez recentes preservadas.
- [x] 2.2 Core: dez lotes arquivados, dez recentes preservados.
- [x] 2.3 Core: dez seções de validação e dez decisões correntes; histórico íntegro.
- [x] 2.4 Core: mdd index executado.
- [x] 3.1 Site: doze lotes arquivados, dez recentes preservados.
- [x] 3.2 Site: pendências abaixo de 25 KB; 42 roteiros adicionais continuam ativos.
- [x] 3.3 Site: 306 CSS e manifesto saneados; seis arquivos de dados alheios preservados.
- [x] 3.4 Site: mdd index executado.
- [x] 4.1 Pull --ff-only: cinco repositórios atualizados; home sem remote, tentativa recusada.
- [x] 4.2 Auditoria das 45 skills: PASS, 44 alvos, zero divergências.
- [x] 4.3 Python 131/131 e extensão 133/133 PASS.
- [x] 4.4 Relatório e evidências persistentes.
- [x] 4.5 Revisão independente: RECOMMEND-APPROVAL em memory/human-reviews/rev-078.md; homologação humana em branco.

## Resultado e evidências

| Área | Antes real | Depois |
| --- | --- | --- |
| Core — requisições numeradas | 21 | 10 |
| Core — lotes numerados | 20 | 10 |
| Site — requisições na raiz | 5 | 5 |
| Site — lotes numerados | 22 | 10 |
| Matriz — lotes numerados | 12, antes de criar BATCH-078 | 10, incluindo BATCH-078 |
| Matriz — requisições | 10 | 10 |
| Site — entrada de pendências | 73.201 bytes | 17.576 bytes |
| Core — decisões correntes | 12 seções | 10 seções |
| Worktrees secundárias | 17 | 16 preservadas, 1 removida |
| Branches locais integradas removidas | 0 | 91 (51 Core, 40 Site) |

O briefing incluía BATCH-INDEX.md nas contagens de lotes. ITERATION-CONTEXT-v2.1.0.md no Site é contexto, não um lote numerado; foi preservado. O critério final é dez arquivos numerados por pasta. A matriz também recebeu a manutenção necessária ao aceite da REQ-076.

Arquivamento executado pela API real de `mdd compact`, com política limitada aos diretórios autorizados e proteção dos dez IDs mais recentes. O compactor padrão protege todo ID citado em CURRENT, incluindo históricos; a execução deste lote aplica a janela explicitamente autorizada sem descartar estados. Reparo de links e originais/sínteses continuam sob o compactor canônico. O contrato normativo e o código do cliente não foram alterados. Um adaptador reconhece seções DEC no histórico do Core que o parser tabular não retinha.

Todos os 36 registros numerados movidos foram verificados por SHA-256 contra as fotografias anteriores. Originais integrais e sínteses ficam em archive/original e archive/compacted. Checklists, índices de lotes e decisões também têm originais integrais. Evidências: [plano inicial Core](../../completions/BATCH-078-compact-conn2flow-plan.json), [segunda poda de decisões](../../completions/BATCH-078-compact-conn2flow-applied.json), [Site](../../completions/BATCH-078-compact-conn2flow-site-applied.json), [matriz](../../completions/BATCH-078-compact-conn2flow-ai-workspace-applied.json) e [validação](../../completions/BATCH-078-validation.json).

A entrada do Site conserva sete blocos recentes completos e liga outros 42 documentos em memory/human-pending, com conteúdo e tarefas herdados. Comparação integral, desconsiderando somente destinos de links rebaseados e CRLF, confirmou os **49 blocos e 156 tarefas abertas** preservados. O histórico integral está ligado por memory/archive/pendencias-historico.md. Não se presumiu que pendências antigas estavam resolvidas. [Medições](../../completions/BATCH-078-pending-split.json), [integridade](../../completions/BATCH-078-pending-integrity.json). Memórias de execução saudáveis e memórias de Chefia não foram podadas.

## Limpeza Git e exceções de preservação

`conn2flow-req235` foi removida sem força, com zero commits exclusivos, diff real, stage ou arquivos não rastreados, sem junctions nem referências recebidas no inventário das árvores. Seus 11.168 arquivos somavam **143.959.905 bytes lógicos** (143,96 MB decimais); isso não mede blocos físicos nem inclui economia de objetos Git. Não foi executado gc. Nenhum byte liberado por branch foi estimado.

| Árvores preservadas | Motivo verificável |
| --- | --- |
| Core covers-267 / covers-267-v31 | 53/54 arquivos com diff real e 4/2 não rastreados |
| Core lab219 / req203 | 414/52 arquivos com diff real |
| Core req223 / req224 | Memória de execução alterada; req223 também tem arquivo não rastreado |
| Core req225 | 11 commits fora de origin/main e 155 arquivos não rastreados |
| Core req232 | 181 arquivos com diff e 5 não rastreados; fornece node_modules a outras árvores |
| Core req243 (branch feat/req-262) | Diff ignorando CRLF vazio; Git recusou worktree remove por modified/untracked. Preservada sem força, junctions recompostas nos mesmos destinos |
| Core req256 / req277 | 5/64 arquivos com diff real; req277 também tem 3 não rastreados |
| Site covers-123 / covers-123-v31 / req108 | 61/393/159 arquivos com diff; covers-v31 também tem 6 não rastreados |
| Site req221 | 50 arquivos não rastreados |
| Site req225 | 2 commits fora de origin/main e 14 arquivos não rastreados |
| Site req077 órfã | 11 arquivos; 9 blobs normalizados alcançáveis de origin/main, 2 HTMLs sem integração comprovada |

Antes das remoções foram inventariadas junctions sem segui-las. Em req243, node_modules e vendor foram desvinculados individualmente por rmdir sem /S; após a recusa do Git, os vínculos foram recriados para seus destinos originais. Os autoloaders e package-locks das árvores principais permanecem acessíveis, com tamanhos conferidos e hashes na evidência final. Nenhuma exclusão recursiva manual, force, reset, clean ou stash.

Quatro branches integradas a main foram recusadas por `git branch -d` devido a divergência em relação ao upstream e foram preservadas: Core feat/req-072 e limpeza; Site feat/req-058 e feature/3d-catalog-responsive-refinement. Branches em worktrees e main foram excluídas da lista de remoção. [Inventário](../../completions/BATCH-078-worktree-inventory.json), [branches e SHAs recuperáveis](../../completions/BATCH-078-branches.json), [órfã](../../completions/BATCH-078-orphan-audit.json), [estado final](../../completions/BATCH-078-git-final.json).

Durante a revisão, a worktree preservada req277 avançou por atividade concorrente: o inventário inicial registra 53d3616671280871668ebe30f781d9ff1412e289; a revisão observou ce2fbc9d6d08f2e0d2d505aa1ef754fbac233334 e depois 4215bde655587ce0c526a9c003993acac0856375 na mesma feat/req-277. O Executor deste lote não executou esses commits nem alterou essa árvore. Inventário e git-final são fotografias datadas da execução, não garantias de imobilidade de outras sessões. A preservação da árvore e de sua branch continua obrigatória; não se repetiu a limpeza sobre trabalho concorrente.

`git fetch origin` e `git pull --ff-only` executados em Core, Site, matriz, lumix e transformamp: Already up to date. main e branch corrente permanecem em paridade com os respectivos remotes. Site continua feat/req-134; lumix continua novo-chat-intelligence. Em home, fetch falhou por ausência de origin e pull por ausência de tracking; nenhuma URL foi inventada. Nenhum merge entre branches de trabalho.

## Saneamento dos derivados do Site

Confirmado no manifesto: fontes de ../../conn2flow/ foram trocadas por ../../conn2flow-req277/, com reordenação equivalente de fontes e mudança de fingerprints, hashes e datas de build. Verificado que chaves e demais campos permaneceram equivalentes. Os 306 CSS modificados e o manifesto foram restaurados byte a byte de HEAD, conforme autorização expressa da requisição, sem recompilar nem publicar. [Auditoria](../../completions/BATCH-078-css-audit.json), [hashes restaurados](../../completions/BATCH-078-css-restored.json) e [preimages recuperáveis](../../completions/BATCH-078-site-css-preimage.zip).

Após a restauração, core.autocrlf=true ainda marcava 324 CSS por diferenças de materialização LF/CRLF, incluindo 18 sem diff de conteúdo inicial. Foram materializados com `git cat-file --filters HEAD:<arquivo>`, após provar em cada caso que o hash normalizado já coincidia com o blob de HEAD. Zero CSS permanecem no status. `update-index --refresh` atualizou somente metadados; o stage antes/depois permaneceu idêntico. Os hashes físicos finais estão na [evidência de checkout](../../completions/BATCH-078-checkout-endings.json); o registro css-restored descreve a etapa anterior em LF.

Permanecem intactas as seis alterações preexistentes em gestor/db/data: AlvosIaData.json, PagesIndexData.json, PaginasData.manifest.json, PaginasData.part-001.json, PaginasData.part-002.json e schema-metadata.json. A working tree do Site contém essas alterações e a manutenção MDD; não é declarada limpa. Restauração de derivados ao HEAD não altera autoria nem versão de recursos.

## Validação e limites

- Skills: **PASS**, 45 canônicas, 44 alvos, 1.903 cópias iguais, 21 traduções, 60 locais preservadas, zero divergências e zero escritas. [Auditoria](../../completions/BATCH-078-skills-audit.json).
- Python: **131 passed**, zero falhas/skips, 118 segundos; um aviso de depreciação Starlette/AnyIO. Comando: .venv-mdd/Scripts/python.exe -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests -q --junitxml=completions/BATCH-078-pytest.xml. [JUnit](../../completions/BATCH-078-pytest.xml).
- Extensão: **133 pass**, zero falhas/skips; node --test com enumeração explícita dos arquivos test/*.test.cjs. [Saída](../../completions/BATCH-078-extension-tests.txt).
- Janela de dez, tamanhos dos arquivos de governança, SHA-256 dos originais e links relativos internos auditados contra HEAD: **zero links novos quebrados**. Quebras herdadas estão discriminadas, sem alegação de saneamento global.
- `git diff --check` nas três raízes alteradas; índices regenerados com mdd index, sem deploy.
- Site ainda usa os nomes legados MEMORIA-ENGENHARIA-CHEFIA/EXECUCAO; não foram renomeados fora do escopo. O diagnóstico healthy global do compactor também considera evidências JSON grandes e outros arquivos fora da manutenção autorizada; não é apresentado como PASS global.
- Sínteses estruturais e partes de archive/compacted geradas pelo compactor canônico usam o fallback legado sem frontmatter. Originais não foram alterados para adicionar metadados; documentos novos de autoria deste lote têm frontmatter. A limitação do gerador não foi corrigida fora deste escopo de manutenção.
- Conteúdo histórico, estados de homologação e instruções herdadas foram mantidos; não foram reavaliados no produto. Sem banco, navegador, produção, CI remota, commit ou push neste lote.
- MCP Hub indisponível nesta sessão; recibo local e revisão por agente independente, sem alegar despacho MCP remoto. Topologia dupla retorna ao Macro-Arquiteto após a revisão explicitamente pedida em 4.5. Somente humano homologa.

## Defeitos encontrados e corrigidos durante a execução

Leitura de caminhos longos no Windows corrigida no coletor sem seguir junctions; fontes equivalentes com ordem diferente aceitas na auditoria do manifesto; seções DEC além do parser tabular podadas com original preservado; quatro links externos do roteiro do Site rebased para a nova profundidade, usando memory no Core quando o destino existe; newline final e codificação de saída do coletor corrigidos. Nenhuma falha de produto foi atribuída sem evidência.

## Revisão e retorno ao Macro-Arquiteto

[REV-078](../human-reviews/rev-078.md): **RECOMMEND-APPROVAL**, sem finding bloqueante ou correção obrigatória. O Revisor conferiu independentemente os 36 originais, 49 blocos/156 tarefas, ancestralidade dos 91 SHAs e 307 preimages. Homologação humana não atribuída. [Recibo](../../completions/BATCH-078-receipt.json) e [handoff completo](../handoffs/batch-078-to-architect.md).

---
id: "BATCH-092"
title: "Fase 3 do ARCH-018: aba MDD Hub & Skills Control na extensão, paridade MCP/docs e modernização SDD→MDD do Core CLI via worktree isolada"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-090"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Aba MDD Hub & Skills Control (servidores + triagem de feedbacks), fila serial no hub, feedback no MCP Python, docs em 48 skills, poda do checklist e ai:archive-memory no Core (6e146f7aa8b6)."
summary_medium: "Categoria B, sem deploy; matriz sem stage/commit/push.\nExtensão 154/154, hub 7/7, pytest 142/142, auditoria/governança/índice PASS; Core publicado em origin/main por fast-forward a partir de worktree isolada, já removida e podada."
---

# BATCH-092 — Fase 3 do ARCH-018

[REQ-090](../../human-requests/archive/req-090.md) · [ARCH-018](../../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada · [Relatório FEAT-017 (REP-012)](../../reports/REP-012-batch092-hub-control-and-core-cli.md)

## Live Todo List

- [x] Ler CURRENT, REQ-090, BATCH-091, REP-011 e o checklist.
- [x] Extensão: aba "MDD Hub & Skills Control" (servidores + feedbacks).
- [x] Extensão: rótulos SDD→MDD com fallback `sdd/` + compile + testes.
- [x] `mcp-hub`: fila serial no stdio + teste + `dist/`.
- [x] `mdd-client`: `submit_skill_feedback`/`list_skill_feedback` no `mdd mcp` + pytest.
- [x] `docs/`: 45 → 48 skills.
- [x] Poda do `VALIDATION-CHECKLIST.md` (10 ativos) e Regra dos 10 em `human-requests/`, `implementation/` e `reports/`.
- [x] Core: worktree isolada → `cli/src/` SDD→MDD + `reports/` + `--status` + testes.
- [x] Core: commit seletivo → fast-forward em `origin/main` → worktree removida e podada.
- [x] Validação da matriz; lote, REP-012, checklist e índices em `ready-for-review`.

## 1. Extensão VS Code — aba "MDD Hub & Skills Control"

Nova view `conn2flow-mdd-hub` no contêiner Conn2Flow. A extensão só orquestra: as regras de feedback ficam no `mdd feedback` e as de tools, no `conn2flow-hub`.

| Arquivo | Papel |
| --- | --- |
| `src/mddHubPolicy.ts` | Política pura e testada: argv dos servidores e do `mdd feedback`, parada por PID (`taskkill /PID <pid> /T /F` no Windows), status (`RUNNING` só com PID vivo e, no MDD Client, porta aberta), handshake MCP do hub, parse/agrupamento dos feedbacks e validação da triagem. |
| `src/providers/mddHubManager.ts` | Processos e comandos. **MDD Client**: `mdd daemon --mcp --transport sse --port <conn2flow.mddHub.port> --path <raiz do escopo>`, destacado, log em `%TEMP%/conn2flow-mdd-hub/`; Start falha se a porta já estiver ocupada e só reporta sucesso depois de a porta abrir (15 s). **Hub**: `node mcp-hub/dist/index.js` em stdio, `RUNNING` só depois de responder ao `initialize`; a stdin fica com a janela (fechar a janela encerra o hub). PIDs no `workspaceState`. Start/Stop/Restart e triagem exigem Workspace Trust. |
| `src/providers/mddHubTreeProvider.ts` | Seções **Servidores** e **Feedbacks & Curadoria** (grupos por veredito, PENDING primeiro, ordem por severidade; itens só do GitHub não são triáveis). Clique abre o `FB-XXX` (ou a Issue). |
| `src/extension.ts`, `package.json`, `package.nls*.json`, `src/localizationCatalog.ts` | 7 comandos `conn2flow.mddHub.*` (refresh, start, stop, restart, triageFeedback, openFeedback, toggleGithub), menus inline por `contextValue`, config `conn2flow.mddHub.port` (8765), 35 chaves i18n en/pt-BR. |

- **Triagem**: QuickPick dos 5 vereditos com descrição + InputBox do motivo obrigatório → `mdd feedback triage FB-XXX --verdict V --reason R --reviewer curator --matrix <matriz> --json` → recarrega a árvore.
- **SDD→MDD**: catálogos NLS e de runtime já estavam em MDD; restavam `releasePolicy.ts` (`SDD:` na nota de release → `MDD:`), o gerador `scripts/generate-package-nls.cjs` (9 textos SDD e os títulos ingleses do `mdd.syncConflicts` e dos 7 comandos novos, que faltavam) e o `README.md` da extensão (que também passou a descrever a aba). IDs `conn2flow.sdd.*`, `sddScopeManager` e a descoberta de `sdd/` foram mantidos de propósito (fallback técnico); um teste trava a ausência de "SDD" nos catálogos e a presença do fallback.
- **Smoke real** (fora do VS Code, com a política compilada): daemon SSE do `mdd` subiu com a porta aberta em 777 ms e `RUNNING · PID 29432 · 127.0.0.1:8799`; `taskkill /T` encerrou os 4 processos da árvore (launcher + Python) e a porta fechou. `mdd feedback list` real da matriz → 3 itens PENDING agrupados e triáveis.
- Não testado: a UI dentro do VS Code (cliques, ícones, menus). Fica para a homologação visual.

## 2. MCP e documentação (REP-011)

| Item | Mudança | Teste |
| --- | --- | --- |
| Fila serial no hub | `startStdio(input, output)` encadeia cada linha numa `Promise` e só começa a próxima depois de escrever a resposta; `processLine` separado; falha vira `-32603` sem travar a fila. `index.ts` inalterado; `dist/` recompilado. README documenta a ordem. | `test/stdioQueue.test.cjs`: requisição 1 lenta (60 ms) e 2 instantânea saem `start:1,end:1,start:2,end:2`; parse error e notificação sem `id`; erro não bloqueia. `npm test` **7/7**. |
| Paridade no MCP Python | `submit_skill_feedback` e `list_skill_feedback` em `mcp_server.py`, delegando a `feedback.submit/list_feedback`. Escopo local confinado ao projeto ligado (`contained`); global usa `matrix`/`MDD_MATRIX`/`find_matrix`, como o CLI; modo só-GitHub preservado. | `test_python_mcp_feedback_tools_match_cli` (IDs, filtros sem caixa, `repo` padrão, triagem refletida, erro de enum como `ToolError`, travessia `../` recusada). `test_mcp.py` passou a esperar 11 tools nos transportes in-process, stdio e SSE. |
| `docs/` | 11 arquivos de 45 para 48 skills (`docs/README.md`, catálogos, READMEs, roteiros, guias Python, arquitetura, playbook). Os catálogos tinham só 47 linhas e 4 links quebrados para `sdd-*`: corrigidos para `mdd-*`, `c2f-multilingual-skills-governance` incluída em Governança (9). | Catálogos com 48 linhas cada e 0 links quebrados. |

## 3. Poda do checklist e Regra dos 10

- **`VALIDATION-CHECKLIST.md`** (31.501 bytes / 342 linhas → ~14 KB): 14 seções homologadas ou concluídas (BATCH-069–075 e 082–088) foram para [validation-069-088.md](../../validation/archive/validation-069-088.md), com o texto preservado e só os 50 links relativos rebaseados. O original byte a byte ficou em `archive/original/VALIDATION-CHECKLIST-b3b8b81070b3.md` (igual ao `HEAD`), com resumo estrutural em `archive/compacted/`. O título com mojibake ("ValidaÃ§Ãµes") foi refeito. Ativos: BATCH-092, os 6 pendentes de homologação (076–081) e 089–091 = **10**. O BATCH-078 ficou ativo porque o próprio arquivo diz `ready-for-human-review`, embora o CURRENT o liste como homologado: ver Pendências.
- **Links**: 0 quebrados no checklist e no arquivo novo, antes e depois.
- **Regra dos 10** com o comando novo do Core (rodado da worktree, antes da publicação):

```sh
php ../_wt-req090-conn2flow/cli/c2f.php ai:archive-memory --repo=. --keep=10 --status=HOMOLOGATED,REVIEWED --verbose
```

| Raiz | Antes | Arquivado | Ativos |
| --- | ---: | --- | ---: |
| `human-requests/` | 11 | `req-083` (HOMOLOGATED) | 10 (077–079 retidos por `APPROVED`, 090 pelo CURRENT) |
| `implementation/` | 11 (com este lote) | `batch-087` (HOMOLOGATED) | 10 (077–081 retidos por status, 092 pelo CURRENT) |
| `reports/` | 11 (com o REP-012) | `REP-007` (REVIEWED) | 10 (REP-002–006, 011, 012 retidos por status) |

- 18 links reescritos em 9 arquivos, todos ligados aos 3 movidos (tabela no log). Hash de todos os `.md` de `memory/` antes e depois: só mudaram os 3 movidos e os 6 arquivos com links para eles. Os 3 `index.md` gerados (destinos `<...>`) ficaram para o `mdd index`, que os regenerou; essa lacuna do comando foi corrigida em seguida no Core (ver §4).
- `04-memory-engineering-execution.md` intacta (abaixo de 50 KB / 200 linhas: saudável, não reescrita).

## 4. Core CLI (`conn2flow`) via worktree isolada

- **Concorrência comprovada**: árvore principal em `feat/req-305-mercadopago-orders-api` com 43 caminhos alterados por outro trabalho, mais 4 worktrees alheias (`conn2flow-req223/224/225/232`). Nenhuma foi tocada.
- **Worktree**: `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req090-conn2flow`, branch `chore/mdd-cli-phase3-req-090`, criada de `origin/main` `bfb9164bd` depois de `git fetch origin`.

| Arquivo | Mudança |
| --- | --- |
| `cli/src/Commands/AiArchiveSddCommand.php` → `AiArchiveMemoryCommand.php` | Nome canônico `ai:archive-memory`; aliases `ai:archive-sdd`, `memory:archive`, `ai:archive`, `sdd:archive`. Governa `reports/` (ordenada pela `date:` do frontmatter, porque `BL-028` e `REP-002` não são comparáveis pelo número). `--folders=A,B`. `--status=A,B`: só esses status podem sair; os demais ficam retidos e ocupam a janela ("held by status (N)" quando passam dela). Status lido do frontmatter ou de uma linha `**Status**:`. **Reescrita só dos links afetados**: documento que não se moveu mantém o texto exato de todo link para arquivo que não se moveu (antes, `./x.md`, `a/../b.md` e a caixa eram normalizados); documento movido também reancora links de pasta (`../scripts/`, barra final preservada; antes ficavam quebrados). Destinos `[x](<alvo>)` dos `index.md` gerados passam a ser reescritos e checados. |
| `Application.php`, `AiPruneMemoriesCommand.php`, `AiSyncCommand.php`, `Support/Docs/DocsBuilder.php`, `Support/Docs/SddSource.php` | Títulos, comentários e avisos SDD → MDD. Chaves `sdd.*` da configuração, IDs `docs-sdd-*` e o prefixo interno `sdd/` (que alimenta os 301) mantidos. Os avisos do `SddSource` agora usam a pasta real (`memory/...`). |
| `ai-workspace/{en,pt-br}/docs/reference/cli/{ai,help}.md` | Referência regenerada a partir do `--help` real; sem isso a renomeação criava 2 erros "Fonte inexistente" no `docs:audit`. |
| `tests/Unit/PHP/MemoryArchiveReq090Test.php` (novo), `MemoryDualReq266Test.php` | 7 testes novos: nome/aliases/help; `reports/` por data; `--folders`; `--status` com pendentes mais antigos e mais novos; contagem retida; só links afetados (com `./`, `..`, caixa, âncora, URL e code span intocados); destinos `<...>` reescritos e gate acusando `<missing.md>`; árvore legada `sdd/` pelo alias. |

| Validação no Core | Resultado |
| --- | --- |
| `phpunit` (testes do arquivador) | **13/13**, 103 asserções |
| `phpunit tests/Unit/PHP` (suíte toda, na worktree) | 1.987 testes; 54 falhas por falta de `vendor/autoload.php` na worktree (subprocessos) e 29 em 7 classes (Dashboard*, CssRegeneracao, Manutencao, OpenSSL). O mesmo filtro no `origin/main` intacto (stash na worktree) deu as mesmas 29: preexistentes do ambiente, não deste lote |
| `php -l` nos arquivos alterados | sem erros |
| `php cli/c2f.php docs:audit` | 0 erros (317 avisos de `verified_at`, os mesmos de antes) |
| `ai:archive-memory --help` e `help` | nome canônico, aliases e opções novas presentes |

- **Commit seletivo** (12 caminhos, sem `git add -A`): `6e146f7aa8b6` `refactor(cli): modernize memory archiver SDD to MDD with reports/ and status selection (REQ-090)`.
- **Publicação**: novo `git fetch origin`; `origin/main` continuava em `bfb9164bd` (ancestral do HEAD, 1 commit à frente). `git push origin chore/mdd-cli-phase3-req-090:main` sem `--force`: `bfb9164bd..6e146f7aa`. Depois do `fetch`, `origin/main` = HEAD = **`6e146f7aa8b63cd3ce69248415b45cb009614d43`**.
- **Limpeza**: `git status` limpo (só `gestor/logs/`, ignorado e gerado pelos testes); `cmd /c dir /AL /S` sem junctions; 0 commits fora de `origin/main`. `git worktree remove` (sem força) → `git branch -d` → `git worktree prune -v` → `git worktree list` só com a principal e as 4 alheias; o diretório não existe mais. A `main` local da árvore principal não foi tocada; ela vai receber o commit quando o dono daquela árvore fizer `pull`.

## 5. Validação na matriz

| Comando | Resultado |
| --- | --- |
| `npm test` em `vscode-extension/` (compila com `tsc`) | **154/154** |
| `npm test` em `mcp-hub/` | **7/7** |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | **142 passed** |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | **PASS**: 19 alvos, 562 iguais, 322 traduzidas, 0 divergências, 24 locais |
| `node scripts/skills/generate-skills-index.cjs --check` | **PASS** (48) |
| `node scripts/skills/audit-mdd-governance.cjs --repos conn2flow-ai-workspace` | **PASS** (48 canônicas, 240 cópias) |
| `mdd index --path .` | índices regenerados (inclui inbox, `reports/` e as pastas `archive/`) |

## 6. Feedbacks emitidos (barramento ARCH-018)

`mdd feedback submit --scope global` na matriz, todos `PENDING`: **FB-001** (`mdd-memory-gardening`, proposal: usar `ai:archive-memory --status` no lugar de scripts ad hoc), **FB-002** (`c2f-shell-and-windows-traps`, learning: `grep -c $'\r'` devolveu 0 para arquivo CRLF), **FB-003** (`c2f-persona-executor`, gap: dois servidores MCP com as mesmas tools). Detalhes no REP-012.

## 7. Fronteiras respeitadas

- Categoria B: nenhum deploy, pipeline de projeto ou build Tailwind.
- Matriz: sem `git add`, commit ou push; `memory/backlog/FEAT-015-…` intacto e fora do stage; `03-` e `04-memory-engineering-*.md` intactas. `req-090.md` e o status do CURRENT ficam com o Arquiteto (o CURRENT só mudou no link do `req-083` arquivado).
- Core: só a worktree temporária foi alterada; a árvore principal e as worktrees alheias ficaram intactas.
- Nenhuma skill canônica `c2f-*` foi editada; as sugestões foram para a inbox.

## 8. Pendências para o Arquiteto

- **Homologação visual da aba** no VS Code (cliques, ícones, menus inline, troca de idioma) e, se aprovada, empacotar um VSIX (a versão segue 1.1.7).
- **Commit/push seletivos da matriz**. Incluir: `vscode-extension/` (`src/` com 3 arquivos novos, `test/mddHubPolicy.test.cjs`, `package*.json`, `README.md`, `scripts/generate-package-nls.cjs` e o `out/`, que é versionado), `mcp-hub/src/server.ts` + `dist/server.*` + `test/stdioQueue.test.cjs` + README, `tools/mdd-client/` (mcp_server + 2 testes), 11 de `docs/`, a poda (`VALIDATION-CHECKLIST.md`, `validation/archive/` novo + README) e as movimentações (`req-083`, `batch-087`, `REP-007` → `archive/`, com remoções), `memory/inbox/feedback/FB-001..003`, índices, BATCH-INDEX, este lote e o REP-012. FEAT-015 fora.
- **BATCH-078**: o arquivo diz `ready-for-human-review`, o CURRENT o lista como homologado. Ficou ativo; decidir e alinhar o status.
- **BATCH-071** no BATCH-INDEX continua `ready-for-review`, embora arquivado há muito; o checklist dele foi arquivado com os demais do bloco 069–075.
- **Triagem** dos FB-001..003 pelo Curador (agora possível pela aba).
- **Rollout** das Fases 0–3 aos satélites em requisição própria; a referência CLI do Core e as skills ainda citam `ai:archive-sdd` (continua funcionando como alias).

## 9. Relatório de Dificuldades e Aprendizados (FEAT-017)

Registrado em [REP-012](../../reports/REP-012-batch092-hub-control-and-core-cli.md).

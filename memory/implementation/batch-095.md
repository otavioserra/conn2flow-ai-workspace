---
id: "BATCH-095"
title: "VSIX v1.2.1, mdd bootstrap com domains/ (ARCH-019 Fase 1), FB-004/FB-007 e 1ª rodada do Optimizer"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-093"
topology: "dupla"
autonomy: "supervisionado"
summary_short: "Extensão v1.2.1 (UTF-8, triagem no menu, progresso, hub externo, domínio do projeto), mdd bootstrap plugável, FB-004/FB-007 e 0 skills OVER."
summary_medium: "Polimento pós-homologação visual da aba MDD Hub, catálogo domains/ com descoberta dinâmica e mdd bootstrap não destrutivo.\nCurador (FB-004, FB-007) e Optimizer (12 subskills PT-BR/EN) com mdd eval 15/15, pytest 162/162 e extensão 166/166."
---

# BATCH-095 — v1.2.1, MDD agnóstico (Fase 1) e 1ª rodada do Optimizer

[REQ-093](../human-requests/req-093.md) · [ARCH-019](../backlog/ARCH-019-framework-agnostic-mdd-universal-installer.md) · Categoria B · Topologia dupla · Autonomia supervisionada.

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`, branch `main`, base local `9ad498b`. Sem deploy, sem satélites, sem stage, commit ou push.

## Live Todo List

- [x] Extensão: UTF-8 em toda chamada `mdd`, triagem no botão direito, progresso em Refresh/Toggle GitHub, `conn2flow-hub` externo.
- [x] `.vscode/mcp.json` só com `servers`.
- [x] Extensão: `conn2flow.projectDomain` aberto e comando "Inicializar MDD neste Projeto" com QuickPick dinâmico.
- [x] `mdd feedback --github` cria a label `skill-feedback` antes da Issue; FB-008 sintético removido.
- [x] `domains/` (README, `generic`, `conn2flow`) e `mdd bootstrap` com testes de domínio customizado e idempotência.
- [x] FB-004 e FB-007 aplicados; 4 skills OVER extraídas para 11 subskills novas (PT-BR/EN); `OVER: 0`.
- [x] 2 cenários novos de `mdd eval` (15/15).
- [x] Índice de skills, sync dos kits/templates, hashes EN e auditoria.
- [x] Release 1.2.1 empacotado.
- [x] Regra dos 10 Ativos.
- [x] Lote, checklist, REP-015 (FEAT-017) e índices.
- [ ] Revisão do Macro-Arquiteto e homologação visual da v1.2.1 pelo operador.

## 1. Extensão VS Code v1.2.1

| Item | Implementação | Prova |
| --- | --- | --- |
| UTF-8 | `buildMddEnv()` (`PYTHONUTF8=1`, `PYTHONIOENCODING=utf-8`) em `MddHubManager.runMdd` e no `spawn` do daemon. A causa: o Python no Windows grava stdout em pipe em cp1252. | Teste real: o `python.exe` da `.venv-mdd` imprime `deleção é — ok` intacto pelo pipe. |
| Triagem no botão direito | `conn2flow.mddHub.triageFeedback` também em `view/item/context` grupo `navigation@2`, mantendo o inline `$(law)`. | Teste de manifesto. |
| Progresso | `withProgress` na própria view (`viewId: conn2flow-mdd-hub`) e na barra de status; mensagem final com a contagem e com o estado ligado/desligado do GitHub. | Teste de fonte. |
| Hub externo | `probe('conn2flow-hub')` lista `node.exe` (`Get-CimInstance Win32_Process`, só leitura) e reconhece `mcp-hub/dist/index.js`, excluindo o PID desta janela. Exibe `RUNNING (externo) · PID n`, sem Start/Stop/Restart; Stop explica que não encerra processo alheio. Falha da listagem vai ao log como "desconhecido", não como zero. | 5 testes de parsing (Windows JSON objeto/array, `CommandLine` nulo, `ps`). |
| `.vscode/mcp.json` | Removida a chave duplicada `mcpServers`; ficou `servers` (`conn2flow-hub` stdio e `chrome-devtools`). | Teste lê o arquivo real. |
| Domínio do projeto | `conn2flow.projectDomain`: `string`, padrão `auto`, `pattern` `^(auto|[a-z0-9][a-z0-9-]{0,63})$`, sem `enum`. Fora de `auto`/`conn2flow`, o Explorer esconde Core, Projetos e Diagnóstico e mantém MDD, Agentes e a aba MDD Hub. | Teste de manifesto e da árvore. |
| Inicializar MDD | Comando `conn2flow.mdd.initProject` (árvore MDD, título da aba MDD Hub e paleta): `mdd bootstrap --list-domains --json` → QuickPick com `auto` (mostrando o que seria detectado e a evidência) + cada domínio de `domains/`, pré-selecionando o valor salvo → `mdd bootstrap --domain <id> --json` com progresso → salva o domínio no workspace. Mensagens só na barra de status (regra existente que proíbe `showInformationMessage`). | Teste com `mdd` real contra a matriz: `auto → conn2flow`, 0 erros. |

Versão 1.2.1 em `package.json`, `package-lock.json` e `CHANGELOG.md`. O script `npm run package` faria novo bump; o pacote foi gerado com `npx.cmd --yes @vscode/vsce package --out conn2flow-tools-1.2.1.vsix`.

- **VSIX**: `vscode-extension/conn2flow-tools-1.2.1.vsix`, 98 arquivos, 238,82 KB, `unzip -t` sem erros, `package.json` interno v1.2.1 com `projectDomain`, `out/domainPolicy.js` e `out/providers/mddBootstrapManager.js` presentes. Coberto pelo `.gitignore` existente.
- **SHA-256** `384dc091a157aeb9d37331f82e7a9aca35a11b3e02b2f193706b24d2d1cad432`.

```powershell
code.cmd --install-extension vscode-extension\conn2flow-tools-1.2.1.vsix --force
```

## 2. `mdd feedback --github` e limpeza do FB-008

`ensure_github_label()` roda `gh label create skill-feedback --color 0E8A16 --description "Automated skill feedback from MDD agents" --force` (com `--repo` quando informado) pelo runner injetável antes do `gh issue create`. Falha da label vira `github_label_error` e não impede a tentativa da Issue. Dois testes novos em `test_feedback.py`.

O arquivo sintético `FB-008-resumo-curto-do-problema.md` (`REQ-999`/`BATCH-999`) foi removido e o índice da inbox regenerado. **Atenção**: o id `FB-008` foi reaproveitado no fim da rodada por um registro real deste lote (`FB-008-sed-i-do-git-bash-converte-o-arquivo-crlf-inteir.md`, ver §7).

## 3. ARCH-019 Fase 1 — `domains/` e `mdd bootstrap`

- [`domains/README.md`](../../domains/README.md): uso, contrato do `domain.json` e passo a passo de PR (exemplo Laravel).
- [`domains/generic/domain.json`](../../domains/generic/domain.json): `core-mdd-only` (5 personas + 9 de governança), guia local `true`, prioridade 0, fallback.
- [`domains/conn2flow/domain.json`](../../domains/conn2flow/domain.json): `all-canonical` (48 skills), detectores `c2f`, `gestor/config.php`, `gestor/` e marcadores em `composer.json`/`environment.json`.
- `tools/mdd-client/src/mdd_client/bootstrap.py` + comando `mdd bootstrap [--path] [--domain auto|<id>] [--list-domains] [--kits gemini,claude,codex,cursor,copilot] [--matrix] [--domains-dir] [--dry-run] [--json]`.
  - Descoberta: todo `domains/*/domain.json` válido; manifesto inválido é reportado em `errors` e ignorado. Nenhum id fixo no código.
  - Detecção: mais acertos de `files`/`dirs`/`markers` vence, `priority` desempata, sem acerto cai em `generic`. Stack rasa na raiz (Node, TypeScript, Python, PHP, Go, Rust, Docker, testes, gerenciador de pacotes, Git) e comandos de validação deduzidos.
  - Escrita (DEC-136): `memory/` completo só quando não existe; memória existente ganha apenas áreas ausentes (ex.: `learnings/`), sem reescrever índices. Skill instalada só se a pasta não tem `SKILL.md`; `rules/mdd.md` e o guia local `<kit>/skills/<projeto>-project-guide/SKILL.md` só se ausentes.
- `tests/test_bootstrap.py`, 8 testes: catálogo real, `--list-domains` com domínio de fixture `laravel` (adicionado só como pasta, provando extensibilidade sem código) e manifesto quebrado, auto-detecção do `laravel` com `extra_skills_dir`, projeto `generic` (Node/TS/pnpm), projeto `conn2flow`, domínio explícito, `--dry-run`, kits inválidos, idempotência byte a byte com edição local preservada e memória legada preservada.
- Execução real: na matriz `auto -> conn2flow (dir:gestor)`; numa pasta vazia, 14 skills por kit + guia local.

## 4. Curador e Optimizer

| Skill | Antes | Depois | Subskills novas (PT-BR/EN, mesmo caminho) |
| --- | ---: | ---: | --- |
| `c2f-shell-and-windows-traps` | 488 | 201 | `cli-e-ssh.md` (7, 8, 9, 17), `scripts-e-caminhos-msys.md` (3, 4, 10, 11, 12), `worktrees-e-junctions.md` (18 + FB-007) |
| `c2f-module-crud-scaffolding` | 437 | 174 | `schema-declarativo.md`, `controller-escrita-e-historico.md` |
| `c2f-javascript-ajax` | 333 | 157 | `fetch-e-formdata.md`, `dispatcher-php.md`, `jquery-legado.md` |
| `c2f-payment-gateways` | 313 | 248 | `paypal-autorizacao-e-captura.md`, `testes-de-gateways.md` |

- As receitas foram movidas sem reescrita (scripts de divisão com asserção de cercas de código pareadas). Cada `SKILL.md` ganhou tabela de subskills e mantém, item a item, as regras críticas: numeração e âncora da Armadilha 18, comandos proibidos, `--form-string`, campos ocultos, execução sequencial, opções AJAX reservadas, `ajax: 'sim'`, captura só no backend, proibição de credenciais de produção.
- **FB-004** (`c2f-multilingual-skills-governance`): sucessor de alias ignorado pelo Git → `git check-ignore --no-index -v`, `git add -f` só do sucessor, `git ls-tree` de `origin/main` × `HEAD` e bloqueio de push sem sucessor.
- **FB-007** (subskill de worktrees): tabela de leitura do `dir /AL` (links, `Arquivo não encontrado` em caminho validado = zero, erro de sintaxe/caminho/acesso = parar), validação `if exist` no mesmo passo e proibição de montar o inventário via `cmd //c` no Git Bash. A sessão CMD única foi mantida (veredito do Curador).
- EN: a mesma divisão foi aplicada às 7 cópias de template (5 no caso da governança), reaproveitando a tradução existente das receitas; os resumos são tradução nova. Cópias idênticas (`translation_copy_divergence: 0`).
- Testes que fixavam o estado anterior da matriz real foram atualizados: `test_eval.py` (exigia shell-traps `OVER`; agora exige 0 OVER e ≥ 15 cenários) e `test_personas_subskills_learnings.py` (1 → 11 subskills).

## 5. Regra dos 10 Ativos

Arquivador oficial do Core, sem worktree e sem tocar na árvore do Core: `git archive 230262177a27 cli` (`origin/main`, contém `AiArchiveMemoryCommand.php`) extraído no scratchpad da sessão e `php <scratch>/cli/c2f.php ai:archive-memory --repo=<matriz> --keep=10 --status=HOMOLOGATED,REVIEWED`, primeiro com `--dry-run` (PHP 8.5.8).

- Arquivados (links reescritos pelo próprio comando): `req-085.md`, `req-086.md`, `batch-089.md`, `batch-090.md`, `REP-009-…`, `REP-010-…`. Janelas: human-requests 10, implementation 10, reports 10.
- Protegidos pelo filtro de status: req-077/078/079, batch-077/078/079/080/081 e o próprio BATCH-095/REP-015.
- O comando encerra com `302 broken relative link(s)` na árvore. Conferido por script: antes do arquivamento havia ~335 links relativos quebrados no `HEAD` e agora há 318; os 8 que citam os arquivos movidos estão nas cópias integrais `validation/archive/original/VALIDATION-CHECKLIST-*.md`, cujos `../reports/…` já não resolviam (byte-preservadas, não reescritas). Nenhuma quebra nova.
- **Não podado**: o `VALIDATION-CHECKLIST.md` (agora 12 seções, `mdd status` → `history_violations: exceeds-10`, já 11 antes do lote). A autorização da REQ-093 cobre só as três pastas; proposta para decisão DEC-136: mover BATCH-090 e BATCH-091 (homologados) para `validation/archive/validation-090-091.md` com o original integral, como na poda da REQ-091.
- `04-memory-engineering-execution.md` intacta.

## 6. Validação local

| Verificação | Resultado |
| --- | --- |
| `npm.cmd run compile` e `npm.cmd test` (`vscode-extension/`) | PASS, 166/166 (154 anteriores + 12 em `test/mddHub121.test.cjs`) |
| VSCE + `unzip -t` + conteúdo do VSIX | PASS, 98 arquivos, SHA-256 acima |
| `node scripts/skills/generate-skills-index.cjs --check` | PASS, 48 skills, 11 arquivos de subskill |
| `node scripts/skills/generate-skills-index.cjs --budget-report` | `OVER: 0`, `NEAR: 3` (`mdd-workflow`, `c2f-project-pipeline-and-tasks`, `c2f-payment-gateways`), `OK: 45` |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | 163 escritas, 0 divergências; `DRIFT_WARNING` só nas 5 skills EN em revisão |
| `--update-translation-hash <skill> en` × 5 | PASS para as 5 skills |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | PASS, 19 alvos, 562 iguais, 322 traduzidas, 0 divergências, 0 drift, 0 `translation_copy_divergence`, 0 escritas |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | 162/162 PASS (135,8 s) |
| `.\.venv-mdd\Scripts\python.exe -m mdd_client.cli eval --matrix .` | EVAL-PASS 15/15 (novos: EVAL-014 FB-004, EVAL-015 FB-007, ambos PT-BR/EN) |
| `mdd index --path .` | índices regenerados |

`mcp-hub` não foi alterado (o contrato `submit_skill_feedback`/`list_skill_feedback` não mudou; a label é criada dentro do `mdd feedback`).

## 7. FEAT-017, feedback e handoff

O [REP-015](../reports/REP-015-batch095-domains-bootstrap-and-optimizer.md) traz o relatório completo. FB emitido nesta rodada: **FB-008** (`c2f-shell-and-windows-traps`, `learning`, `low`, `READY` por recorrência 3): o `sed -i` do Git Bash converte o arquivo CRLF inteiro para LF, medido com `od -c`.

`FEAT-015` continua não rastreada e fora de qualquer stage. `04-memory-engineering-execution.md` não foi tocada.

```text
Ative c2f-persona-architect em conn2flow-ai-workspace, raiz
C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Revise REQ-093 / BATCH-095 (dupla, supervisionado): o diff local,
memory/implementation/batch-095.md, memory/validation/VALIDATION-CHECKLIST.md
e memory/reports/REP-015-batch095-domains-bootstrap-and-optimizer.md.
Confira o VSIX v1.2.1, domains/ + mdd bootstrap, as 11 subskills PT-BR/EN
(OVER: 0, eval 15/15), FB-004/FB-007, o novo FB-008 e o arquivamento da Regra dos 10.
Aguarde a homologação visual da v1.2.1 antes de commitar e publicar na main
(FEAT-015 fora do stage).
```

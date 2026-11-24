---
id: "BATCH-093"
title: "Fase 4 (final) do ARCH-018: Tribunal Anti-Bloat, mdd eval, curadoria FB-001..FB-003 e rollout global via worktree isolada"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-091"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Quarentena por recorrência, --budget-report, divergência de cópias EN, mdd eval (13 cenários), FB-001..003 aplicados e 48 skills publicadas em 7 satélites com worktrees removidas."
summary_medium: "Categoria B, sem deploy; matriz sem stage/commit/push.\nGate 4A 100% PASS (auditoria, índice, pytest 153/153, EVAL-PASS 13/13, hub 7/7); 7/7 satélites em origin/main por fast-forward, 0 worktrees temporárias, home/mkt intocados."
---

# BATCH-093 — Fase 4 (final) do ARCH-018

[REQ-091](../human-requests/req-091.md) · [ARCH-018](../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada · [Relatório FEAT-017 (REP-013)](../reports/REP-013-batch093-anti-bloat-evals-and-global-rollout.md)

## Live Todo List

- [x] Ler CURRENT, REQ-091, ARCH-018, FB-001..003, REP-012 e o ferramental (`feedback.py`, CLI, MCP Python/TS, `sync-skills.cjs`, índice).
- [x] Quarentena por recorrência em `mdd feedback` + `recurrence` no `list` + `--force-ready` (CLI, `mdd mcp`, `conn2flow-hub`) + pytest/npm test.
- [x] `--budget-report` no gerador do índice + aviso `[TRANSLATION-COPY-DIVERGENCE]` no `sync-skills.cjs` + testes.
- [x] `mdd eval` (provider plugável, `deterministic` offline) + 13 cenários + `test_eval.py`.
- [x] Triagem `ACCEPT` e aplicação de FB-001..003 em PT-BR/EN; sync da matriz; hashes EN; índice.
- [x] Gate 4A 100% PASS.
- [x] Auditoria não destrutiva dos 9 satélites.
- [x] 7 worktrees de `origin/main` → sync das 48 skills → customização do Core → commit seletivo → fast-forward em `origin/main`.
- [x] Junctions auditadas, worktrees removidas, branches apagadas, `git worktree prune`.
- [x] Regra dos 10 com `ai:archive-memory`, ARCH-018, checklist, BATCH-INDEX, CURRENT, índices e FEAT-017.

## 1. Tribunal Anti-Bloat (Fase 4A)

**Quarentena por recorrência** (`tools/mdd-client/src/mdd_client/feedback.py`):

- `high` nasce `status: READY`, `verdict: PENDING`. `medium`/`low` na 1ª ocorrência de `(skill, kind)` nascem `status: QUARANTINE`, `verdict: QUARANTINE`; o painel da extensão já agrupa esse veredito.
- **Ocorrência = origem `(repo, batch)`**, conforme ARCH-018 §4 ("lotes distintos"). Repetição no mesmo lote não promove sozinha; registro sem `batch` conta isolado. Inbox e `archive/` contam.
- Na 2ª origem distinta (ou com `--force-ready`), o novo registro nasce `READY` e os irmãos auto-quarentenados da inbox são promovidos (`promoted_by: FB-XXX`) sob o mesmo `memory/.mdd.lock`. Veredito do Curador (`status: TRIAGED`) nunca é alterado.
- `recurrence` sai no `submit --json` e é calculado ao vivo no `list --json` (nunca confiado do disco); coluna nova na tabela do `list`.
- `--force-ready` com paridade nos dois servidores MCP: `mcp_server.py` (`force_ready`) e `mcp-hub/src/{server.ts,tools/skillFeedback.ts}` (+ `dist/` recompilado).
- Registros legados FB-001..003 (`status: PENDING`) continuam legíveis; não reescrevi status por migração.

**Auditor**:

- `node scripts/skills/generate-skills-index.cjs --budget-report [--text]`: somente leitura; JSON com `counts`, `over` e `near` ordenados por razão. Hoje: 4 OVER (`c2f-shell-and-windows-traps` 488/300, `c2f-module-crud-scaffolding` 437/300, `c2f-javascript-ajax` 333/300, `c2f-payment-gateways` 313/300) e 2 NEAR (`mdd-workflow`, `c2f-project-pipeline-and-tasks`).
- `sync-skills.cjs`: agrupa cada tradução registrada (`SKILL.md` e subskills) por idioma e compara as cópias entre os kits de template. Mais de uma versão emite `[TRANSLATION-COPY-DIVERGENCE]` no stderr, preenche `translation_copy_divergence` no relatório e marca `DRIFT_WARNING` (não bloqueante, nunca sobrescreve). Hoje: 0.

## 2. `mdd eval` (Fase 4A)

- Módulo `tools/mdd-client/src/mdd_client/skill_eval.py` e comando `mdd eval [--matrix] [--skill] [--provider deterministic] [--scenarios] [--json]`; exit 1 em `EVAL-FAIL`.
- `Provider` é um `Protocol` (`evaluate(scenario, corpus) -> falhas`); `register_provider()` pluga um juiz LLM futuro sem mudar o runner. `deterministic` é offline, sem rede nem chave.
- O corpus inclui `SKILL.md` + `subskills/` canônicos e, quando o cenário pede `translations`, **todas** as cópias do idioma em `templates/<lang>/templates/*/*/skills/<skill>/`.
- Asserções: `must_include`, `must_match` (regex), `must_not_include`, `must_not_match`, `subskills`, `max_lines`. Chave desconhecida é erro: um erro de digitação não pode enfraquecer o cenário. Métricas de budget por cenário e `budget_attention` no relatório.
- 13 cenários em `tools/mdd-client/evals/skills/` (+ README): `ajaxOpcao` reservadas, `--skip-css` fora do `project:deploy`, limpeza sem `rmdir /S`, junctions na faxina de worktree, broadcast `plataforma_gateways`, `git add -A`, `APP_ENV`, `index.lock` órfão, `ai:archive-memory` (gardening e arquiteto, PT-BR/EN), subskill Mercado Pago (PT-BR/EN), `mdd feedback` + dois MCP (PT-BR/EN) e CRLF por bytes (PT-BR/EN).
- `test_eval.py` (7 testes): suíte real PASS e determinística; fixture que passa e depois falha em cada asserção; cópia de tradução ausente, `max_lines`, regex proibida; filtro `--skill` e validação de cenários (sem asserção, regex inválida, chave desconhecida, tipo errado, ID duplicado); provider plugável; códigos de saída da CLI; `--budget-report` somente leitura.

## 3. Curadoria real FB-001..FB-003

| FB | Skill(s) | Verificação | Aplicação PT-BR/EN |
| --- | --- | --- | --- |
| FB-001 | `mdd-memory-gardening`, `c2f-persona-architect` | `AiArchiveMemoryCommand.php` em `origin/main` `6e146f7aa8b6`: nome, aliases, `--folders`, `--status`, `reports/` por `date:` | Comando canônico `ai:archive-memory` com `--status=HOMOLOGATED,REVIEWED` e alias legado `ai:archive-sdd`; frases "não passe memory ao arquivador legado" e "Do not assume ai:archive-sdd supports memory/" substituídas |
| FB-002 | `c2f-shell-and-windows-traps` §20 | Reproduzido: `grep -c $'\r'` = 0 e `node` = 2 no mesmo arquivo CRLF | One-liner `node` para detectar EOL e regra de montar o padrão sem a quebra de linha final |
| FB-003 | `c2f-persona-executor` | `submit/list_skill_feedback` em `mcp_server.py` e `mcp-hub/src/server.ts`; REP-012 §2 | "Dois servidores MCP, mesmo contrato" (paridade + teste nos dois), PHPUnit em worktree sem `vendor/` com linha de base do `origin/main` e nota da quarentena |

- Triagem pela CLI oficial: `mdd feedback triage FB-00N --verdict ACCEPT --reason "..."` (3×, `status: TRIAGED`, SQLite atualizado).
- EN: 24 cópias (5–7 por skill) editadas por script com asserção de 1 ocorrência por cópia, todas validadas antes da primeira escrita; CRLF preservado.
- `sync-skills.cjs --apply --all --repos conn2flow-ai-workspace`: 40 gravações nos kits/templates da matriz. `--update-translation-hash` em 4 skills EN; `generate-skills-index.cjs` regravado.

## 4. Gate obrigatório da Fase 4A

| Comando | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | **PASS**: 19 alvos, 562 iguais, 322 traduzidas, 0 divergências, 0 drift, 0 legados, 0 divergência de cópias EN |
| `node scripts/skills/generate-skills-index.cjs --check` | **PASS** (48) |
| `.venv-mdd/Scripts/pytest.exe -q tools/mdd-client/tests` | **153/153** (era 142; +3 quarentena, +1 cópias EN, +7 eval) |
| `python -m mdd_client.cli eval --matrix . --json` | **EVAL-PASS 13/13** |
| `npm test` em `mcp-hub` (recompila `dist/`) | **7/7** |
| `ruff check tools/mdd-client/src tools/mdd-client/tests` | All checks passed |

## 5. Rollout global (Fase 4B)

Autorização de worktrees: REQ-091 (concorrência multi-agente nas árvores principais). Raiz: `C:/Users/otavi/OneDrive/Documentos/GIT`. Branch temporária `chore/sync-arch018-req-091`, criada de `origin/main` após `git fetch origin`. Sync com `--apply <48 nomes>` (não `--all`, que criaria kits ausentes), apenas nos kits existentes.

| Satélite | Árvore principal (intocada) | Worktree temporária | Base `origin/main` | Publicado em `origin/main` | Commit | Kits | Limpeza |
| --- | --- | --- | --- | --- | --- | --- | --- |
| conn2flow | `feat/req-305-mercadopago-orders-api`, 43 itens no status | `_wt-req091-conn2flow` | `6e146f7aa8b6` | **`230262177a27`** | 90 arquivos | 5 | removida, branch apagada, podada |
| conn2flow-site | `lab/req-149-156`, 10 | `_wt-req091-conn2flow-site` | `7fa10208a82d` | **`12a83fc5f239`** | 102 | 5 | removida, branch apagada, podada |
| lumix | `main`, 16 | `_wt-req091-lumix` | `29d45932dcaf` | **`60faf3875813`** | 88 | 5 | removida, branch apagada, podada |
| transformamp | `main`, 20 | `_wt-req091-transformamp` | `95a66e468b9e` | **`7f891df71d63`** | 102 | 5 | removida, branch apagada, podada |
| website-conn2flow | `main`, 21 | `_wt-req091-website-conn2flow` | `7a17f6bb3475` | **`84943eaffa1e`** | 102 | 5 | removida, branch apagada, podada |
| conn2flow-app | `main`, 4 | `_wt-req091-conn2flow-app` | `9f2e46155172` | **`e8f6b9497b04`** | 28 | 1 (`.claude`) | removida, branch apagada, podada |
| conn2flow-nexus | `main`, 8 | `_wt-req091-conn2flow-nexus` | `32e75eefc7d1` | **`9534c3207ab5`** | 56 | 2 (`.claude`, `.github`) | removida, branch apagada, podada |
| conn2flow-home | `infra/conn2flow-stack-req013`, 65; **sem `origin`** | — | — | — | — | 5 | não tocado: a cargo do chefe local |
| conn2flow-mkt | `main`, 86; **sem `origin`** | — | — | — | — | 1 (`.gemini`) | não tocado: a cargo do chefe local |

Detalhes verificados:

- **Aliases**: 14–15 pastas migradas por rename em cada satélite (`c2f-architect-master`, `c2f-executor-agent`, `c2f-reviewer-agent` e `sdd-*`); 0 legados restantes; 5 personas nos kits rastreados. Escopo: 100% das mudanças em `.<kit>/skills/` (+ `memory/sync-customizations.json` no Core); skills locais preservadas (`skills_locais_alteradas = 0`); 0 gravações em templates.
- **Duplicata legada (DEC-136, autorizada pelo Operador Humano nesta sessão)**: `sdd-memory-gardening` coexistia com `mdd-memory-gardening` em `conn2flow-app/.claude` e `conn2flow-nexus/{.claude,.github}`, criada pelo sync do BATCH-088, e bloqueava o sync. Era idêntica, com EOL normalizado, à matriz `78c9327`. Removida com `git rm` só nas worktrees (3 cópias).
- **Kits `.claude` com whitelist (`conn2flow`, `lumix`)**: o `.gitignore` ignora `.claude/skills/*` com whitelist; `c2f-architect-master` e `c2f-executor-agent` estavam rastreados. O rename tirou os sucessores do rastreio, e o primeiro commit gravou só a deleção. Detectei antes do push com um verificador (`ls-tree origin/main` × `HEAD`: deleção → sucessor rastreado) e corrigi com `git add -f` dos dois sucessores, sem mexer no `.gitignore`. Esses kits mantêm o mesmo conjunto rastreado de antes, renomeado (2 personas); as demais skills seguem locais por política do repositório. Verificador final: 7/7 OK.
- **Customização do Core**: a semente de `c2f-multilingual-skills-governance` mudou (`6bac1888…` → `1062387d…`), e o sync gravou a semente. A variante é uma linha (`# ⚡ Gatilho Obrigatório` no lugar de `## Gatilho obrigatório`), reaplicada nos 5 kits sobre a semente nova. Reconhecida com 5 chamadas a `mdd sync --customize` (`local_sha256` `8a4e3242f354…` = blob commitado nos 5 kits). Auditoria: PASS com 5 `customizadas`.
- **Avanço concorrente**: antes de cada push, `git fetch origin` e checagem `origin/main == base == HEAD~1`; os 7 seguiram sem avanço. Push `HEAD:main` sem `--force` (fast-forward) e novo fetch confirmando `origin/main == HEAD`.
- **Limpeza**: junctions auditadas no PowerShell (`cmd /c dir /AL /S /B` → "Arquivo não encontrado"; `Get-ChildItem -Attributes ReparsePoint` → 0). Pelo Git Bash a mesma auditoria falhou por aspas, e não contei isso como evidência. `git worktree remove` sem `--force`, `git branch -d` (upstream `origin/main`), `git worktree prune`. `_wt-req091-*` ausentes; `git worktree list` sem entradas da REQ-091; worktrees preexistentes do Core (5) e do Site (2) intocadas; árvores principais com branch e contagem de status idênticas às do início.

## 6. Regra dos 10 e fechamento na matriz

- **Comando oficial sem tocar no Core**: a árvore principal do Core está em `feat/req-305-…` (trabalho de outro agente), sem `6e146f7`. Como o `cli/` do Core tem autoloader próprio e não usa `vendor/`, exportei-o com `git archive 6e146f7aa8b6 cli` para o scratchpad da sessão, sem worktree, e rodei `php <scratch>/cli/c2f.php ai:archive-memory --repo=<matriz> --keep=10 --status=HOMOLOGATED,REVIEWED`, primeiro com `--dry-run`.
- **Arquivados**: `req-084.md` (HOMOLOGATED), `batch-088.md` (HOMOLOGATED) e `REP-008-batch088-skills-rollout.md` (REVIEWED). Os pendentes do `CURRENT.md` (req-077..079, BATCH-077..081), `req-091`, `batch-093` e `REP-013` ficaram na raiz pelo `--status`.
- **Resultado**: 10 ativos em `human-requests/`, `implementation/` e `reports/`. 11 linhas de link reescritas em 10 arquivos, só as afetadas (`CURRENT.md`, `BATCH-INDEX.md`, `req-085..087`, `archive/batch-086.md`, `validation/archive/validation-069-088.md` e índices).
- **Links**: verificador independente com 273 links relativos quebrados antes e depois, lista idêntica (0 novos; os 258 que o comando aponta são órfãos históricos de `archive/original/`). `memory/04-memory-engineering-execution.md` com SHA-256 inalterado.
- **Checklist (DEC-136, autorizado pelo Operador Humano nesta sessão)**: a seção do BATCH-093 levou o `VALIDATION-CHECKLIST.md` a 11 seções, e `mdd status` deu `healthy: false` (`exceeds-10`). Movi só a seção homologada BATCH-089 para [validation-089.md](../validation/archive/validation-089.md), com 2 links rebaseados. O original byte a byte ficou em `archive/original/VALIDATION-CHECKLIST-4ebc09f79d5b.md` (SHA-256 `4ebc09f7…`), com entradas novas em "Validações Arquivadas". Resultado: 10 seções e `mdd status` `healthy: true`. Links: 0 quebrados novos fora do snapshot protegido. Os 43 do snapshot existem por desenho, porque seus links continuam relativos à localização original, como no snapshot da REQ-090.
- **Fechamento**: `CURRENT.md` e `req-091` em `READY_FOR_REVIEW`; BATCH-INDEX, VALIDATION-CHECKLIST (seção BATCH-093) e ARCH-018 (§7, situação das 5 fases, sem `COMPLETED`) atualizados; `mdd index --path .` regenerou os índices.

## 7. Feedbacks emitidos (barramento ARCH-018)

| FB | Skill | Kind / Severity | Status ao nascer |
| --- | --- | --- | --- |
| FB-004 | `c2f-multilingual-skills-governance` | bug / high | `READY` |
| FB-005 | `c2f-multilingual-skills-governance` | gap / medium | `QUARANTINE` (1ª ocorrência) |
| FB-006 | `c2f-multilingual-skills-governance` | proposal / medium | `QUARANTINE` (1ª ocorrência) |
| FB-007 | `c2f-shell-and-windows-traps` | learning / low | `READY` (recorrência 2: FB-002 do BATCH-092) |

## 8. Fronteiras respeitadas

- Categoria B: nenhum deploy, `project:*` ou `manager:*`.
- Matriz sem stage/commit/push; `FEAT-015` fora do stage; `memory/04-memory-engineering-execution.md` intacta.
- Satélites: só worktrees temporárias; árvores principais, `conn2flow-home` e `conn2flow-mkt` não tocados; sem `--force`, `reset --hard` ou `git add -A`/`.` (stage por `--pathspec-from-file` com lista auditada).
- A única remoção (3 cópias legadas) teve confirmação explícita do Operador Humano.

## 9. Pendências para o Arquiteto

- Homologação humana e commit/push seletivos da matriz (incluindo `mcp-hub/dist/`).
- Marcar ARCH-018 como `COMPLETED`. O "Advogado do Diabo" (filtro 4) segue como revisão da persona `c2f-persona-curator`, sem automação nesta fase.
- Triar FB-004..FB-007. FB-004 (high) tem efeito direto em rollouts futuros.
- `mdd-workflow` §171 ainda usa a redação antiga sobre `ai:archive-sdd` em `memory/`; fora do escopo do FB-001.
- As 4 skills OVER do `--budget-report` são candidatas ao `c2f-persona-optimizer`.

## 10. Relatório de Dificuldades e Aprendizados (FEAT-017)

Registrado em [REP-013](../reports/REP-013-batch093-anti-bloat-evals-and-global-rollout.md) (cita FB-004..FB-007). Resumo: (1) alias renomeado para pasta ignorada por `.gitignore` saía do repositório; um verificador de deleção → sucessor pegou antes do push. (2) `--apply --all` cria kits ausentes em satélites. (3) Legado duplicado do BATCH-088 bloqueava o sync. (4) Semente nova desfaz a customização do Core; reaplicar e reconhecer. (5) Auditoria de junctions pelo Git Bash dá falso zero; usar PowerShell. (6) Core sem o comando novo na árvore principal; `git archive` do `cli/` publicado resolveu sem worktree.

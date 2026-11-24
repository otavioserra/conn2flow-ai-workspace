---
id: "BATCH-091"
title: "Fase 2 do ARCH-018: barramento mdd feedback (CLI + MCP conn2flow-hub + GitHub Issues) e conexão das personas (somente matriz)"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-089"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "mdd feedback submit/list/triage com inbox memory/inbox/feedback/, SQLite e GitHub mockável; tools MCP no conn2flow-hub; 4 personas conectadas; REP-010 aplicado; READMEs em 48 skills."
summary_medium: "Categoria B, somente matriz, sem deploy, stage ou commit.\nAuditoria PASS (19 alvos, 0 divergências, 0 drift), governança PASS, índice PASS, pytest 141/141 e npm test do hub 5/5; 4 registros arquivados pela Regra dos 10."
---

# BATCH-091 — Fase 2 do ARCH-018

[REQ-089](../../human-requests/req-089.md) · [ARCH-018](../../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada · [Relatório FEAT-017 (REP-011)](../../reports/REP-011-batch091-feedback-bus-learnings.md)

## Live Todo List

- [x] Ler CURRENT, REQ-089, REP-010, BATCH-090, `mdd-client` (CLI, indexador, banco, MCP Python) e `mcp-hub` (servidor, tools, testes).
- [x] Inbox `memory/inbox/feedback/` com `README.md` e `index.md` (mais `memory/inbox/index.md`).
- [x] `mdd feedback submit/list/triage` com IDs sequenciais, SQLite/FTS5 e `--github` por runner injetável.
- [x] Tools `submit_skill_feedback` e `list_skill_feedback` no `conn2flow-hub`.
- [x] Personas architect, executor, reviewer e curator (PT-BR + 7 cópias EN); nota de ordem do rename; CRLF no `audit-mdd-governance.cjs`; READMEs em 48 skills.
- [x] Regra dos 10: `human-requests/`, `implementation/` e `reports/` com 10 ativos cada.
- [x] Sync, 5 hashes EN, auditoria PASS, governança PASS, índice PASS, pytest 141/141, `npm test` 5/5.
- [x] Lote, REP-011, VALIDATION-CHECKLIST, BATCH-INDEX e índices MDD em `ready-for-review`.

## 1. CLI `mdd feedback` (`tools/mdd-client/src/mdd_client/feedback.py`, `cli.py`)

| Comando | Comportamento |
| --- | --- |
| `mdd feedback submit` | Valida `--persona`, `--kind`, `--severity`, `--scope` e nome da skill; exige `--summary`, `--evidence` e `--skill`. Sob `memory/.mdd.lock`, aloca o próximo `FB-XXX` (contando também `archive/`), grava `FB-XXX-<slug>.md` e regenera os índices da inbox. Indexa no `memory/.mdd.sqlite` só quando o banco existe. `--github` cria Issue com o rótulo `skill-feedback` e grava a URL em `github_issue`. |
| `mdd feedback list` | Filtros `--status`, `--verdict`, `--skill`, `--repo`, `--severity` (sem diferenciar maiúsculas), tabela ou `--json`. `--include-github` soma Issues que ainda não estão na inbox como `GH-<n>`. |
| `mdd feedback triage <id>` | Vereditos `ACCEPT`, `NEEDS_EVIDENCE`, `QUARANTINE`, `REJECT`, `LOCAL_ONLY`. Grava `status: TRIAGED`, `verdict`, `triage_reason`, `triage_reviewer` e `triage_date` pelo `set_metadata` atômico, que também regenera o `index.md`. `LOCAL_ONLY` muda `scope` para `local`. |

- **Raiz**: `--scope global` (padrão) usa `--matrix`, `MDD_MATRIX` ou a matriz localizada pelo `find_matrix`; `--scope local` usa `--path`. Sem matriz acessível e com `--github`, o envio vai só para a Issue.
- **Frontmatter**: os 15 campos da REQ mais `title`, `author` e `target_repo` (o indexador genérico usa esses três). Evidência com várias linhas faz ida e volta pelo YAML com aspas.
- **Índice**: gerado pelo `render` genérico. O `mdd index` sobre a inbox produz o mesmo arquivo, byte a byte (testado). O veredito aparece no `list`, não no `index.md`, que mostra só o `status`.
- **GitHub**: o runner padrão chama `gh` sem shell. Falha do `gh` mantém o registro local, devolve `github_error` e o CLI sai com código 1.

## 2. MCP `conn2flow-hub` (`mcp-hub/src/tools/skillFeedback.ts`, `server.ts`)

- `submit_skill_feedback` e `list_skill_feedback` registradas depois das 4 tools existentes, sem mudar as outras. `dist/` recompilado com `npm run build` (o `dist/` é versionado).
- As duas delegam a `mdd feedback ... --json` com argv explícito. O executável vem de `MDD_CLI` (caminho ou array JSON), depois `.venv-mdd` da matriz, depois `mdd` no `PATH`. A matriz vem de `matrix`, `MDD_MATRIX` ou da raiz do workspace.
- Erros do CLI voltam como `isError` com a mensagem do Python (ex.: `Invalid kind`).
- `mcp-hub/README.md` documenta as duas tools.
- O MCP Python do `mdd-client` (`mdd mcp`) não ganhou as tools; ver REP-011.

## 3. Personas, REP-010 e documentação

| Arquivo | Mudança |
| --- | --- |
| `c2f-persona-architect`, `-executor`, `-reviewer` | "Onde registrar": sugestão universal via `mdd feedback submit` (com o comando completo) ou `submit_skill_feedback`; `--github` sem acesso ao disco da matriz; o REP/ficha de revisão cita os `FB-XXX`. |
| `c2f-persona-curator` | Fonte 1 = `mdd feedback list --verdict PENDING --json` / `list_skill_feedback` (+ `--include-github`); veredito registrado por `mdd feedback triage FB-XXX --verdict ... --reason ...`; envio local via `submit --scope global`. |
| `c2f-multilingual-skills-governance` | Ordem obrigatória: renomear a chave em `translated.json` (e registrar tradução nova) **antes** do primeiro `--apply`. |
| `scripts/skills/audit-mdd-governance.cjs` | Hash após CRLF → LF com `normalizeLineEndings` de `translations.cjs`. |
| `README.md`, `README-PT-BR.md` | 45 → 48 skills (selo, introdução, tabela, estado atual e descrição). |

- PT-BR editado só em `.gemini/skills/` e propagado pelo sync. EN editado na cópia do kit Gemini e replicado byte a byte: 5 kits `spec-driven` para as 5 skills, mais os 2 kits `private-project` para o reviewer (7 cópias com SHA-256 `9f2dc842…`). Antes da edição, o script confirmou que as cópias EN eram idênticas entre si.
- Contagem de linhas das 5 skills inalterada; só os bytes cresceram (índice: architect 9.971, curator 6.127, executor 16.038, reviewer 7.524, governança 6.926).

## 4. Regra dos 10 Ativos

`ai:archive-sdd` do Core (somente leitura sobre o Core, branch `feat/req-305-mercadopago-orders-api`):

```sh
php cli/c2f.php ai:archive-sdd --repo=../conn2flow-ai-workspace --keep=10 --verbose \
  --protect=req-077.md,req-078.md,req-079.md,req-089.md,batch-077.md,batch-078.md,batch-079.md,batch-080.md,batch-081.md,batch-091.md
```

| Raiz | Antes | Arquivados | Ativos depois |
| --- | ---: | --- | --- |
| `human-requests/` | 11 | `req-082` (HOMOLOGATED) | 10 (`req-077`–`079`, `req-083`–`089`) |
| `implementation/` | 11 (com este lote) | `batch-086` (HOMOLOGATED) | 10 (`batch-077`–`081`, `087`–`091`) |
| `reports/` | 12 (com o REP-011) | `BL-028` (consumido pela REQ-067), `REP-001` (`CONCLUÍDO`) | 10 (`REP-002`–`REP-011`) |

- `reports/` não é coberto pelo `ai:archive-sdd`. Movi os dois com script próprio: SHA-256 idêntico antes e depois (`11c99673…`, `89b43550…`; não têm links relativos internos). Links reescritos só em `memory/reports/index.md` (regenerado depois). Menção em texto no `FEAT-017` atualizada para o caminho arquivado.
- **Correção de passagem**: a primeira versão do script normalizou links sem relação em `00-baseline-architecture.md`, `req-078.md` e `req-079.md`. Restaurei os três com `git checkout --` (não tinham outra alteração) e devolvi a barra final de um link no `BATCH-INDEX.md`. Diff por palavras conferido: só ficaram os alvos dos 4 arquivos arquivados.
- **Órfãos**: 176 links relativos quebrados em `memory/` antes, 176 depois (mesmo conjunto, checker próprio). Os 170 que o comando do Core relata são os preexistentes do REP-010.
- `04-memory-engineering-execution.md` intacta: 10.329 bytes, SHA-256 `686e0495…`. Memória de execução abaixo de 50 KB / 200 linhas: saudável, não reescrita.

## 5. Validação

| Comando | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | 47 gravações, 0 divergências ([apply](../../../completions/BATCH-091-skills-apply.json)) |
| `--update-translation-hash <skill> en --translator mdd-agent` | 5 skills: architect, executor, reviewer, curator, `c2f-multilingual-skills-governance` |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | **PASS**: 19 alvos, 562 iguais, 322 traduzidas, 0 divergências, 0 drift, 24 skills locais preservadas |
| `node scripts/skills/audit-mdd-governance.cjs --repos conn2flow-ai-workspace` | **PASS**: 48 canônicas, 240 cópias ([relatório](../../../completions/BATCH-091-governance-audit.json)) |
| `node scripts/skills/generate-skills-index.cjs --check` | **PASS** (48 skills) |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | **141 passed** (130 anteriores + 11 em `test_feedback.py`) |
| `npm test` em `mcp-hub/` | **5/5** (2 anteriores + 3 em `skillFeedback.test.cjs`) |
| `ruff check` nos arquivos Python novos/alterados | sem achados |
| `mdd index --path .` | índices regenerados; `inbox/` no índice raiz |

Testes novos (`test_feedback.py`): IDs sequenciais com acentos no slug e reserva de números arquivados; índice estável sob `mdd index`; validação dos enums, da evidência e do nome da skill; evidência multilinha; filtros; triagem com todos os erros; SQLite só quando presente, com busca FTS e veredito atualizado; GitHub mockado (create, list, dedupe, modo só-GitHub, falha do `gh`); resolução de escopo; CLI `--json`; hub ponta a ponta (node → `dist/index.js` → CLI Python real, com erro de enum como `isError`); auditoria de governança ignorando CRLF e acusando diferença real. `skillFeedback.test.cjs`: mapeamento de argv sem shell, propagação de erro, filtros, resolução do CLI e lista de tools.

## 6. Fronteiras respeitadas

- Somente a matriz foi alterada; nenhum satélite tocado. O Core foi usado só para rodar o `ai:archive-sdd` sobre a matriz; as alterações locais preexistentes do Core ficaram intocadas.
- Categoria B: nenhum deploy. Sem `git add`, commit ou push. `memory/backlog/FEAT-015-…` intacto e fora do stage.
- Nenhum `FB-XXX` de exemplo gravado na inbox da matriz (só `README.md` e `index.md`).
- `memory/03-memory-engineering-chief.md` e `04-memory-engineering-execution.md` sem alteração. `CURRENT.md`, `req-083`/`085`/`086`, `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `archive/batch-084.md` e `REP-007` foram alterados pelo arquivador só nos alvos de link (`req-082`/`batch-086` → `archive/`). `req-089.md` e o status do CURRENT ficam com o Arquiteto.

## 7. Pendências para o Arquiteto

- **`docs/` ainda diz 45 skills** em 10 arquivos (`docs/en` e `docs/pt-br`: catálogo, README, roteiros, guia Python, playbook). A REQ pedia só os `README*.md`.
- **MCP Python do `mdd-client`**: decidir se `mdd mcp` também expõe as tools de feedback.
- **Concorrência no stdio do hub** (REP-011): fila serial ou documentação.
- **`VALIDATION-CHECKLIST.md`** com ~340 linhas / ~31 KB; poda pendente desde o BATCH-090.
- **Rollout consolidado** das Fases 0+1+2 aos satélites, homologação humana e commit/push seletivos na `main`. Ao commitar, incluir as remoções (`req-082`, `batch-086`, `BL-028`, `REP-001`) e as adições em `archive/`, mais `mcp-hub/dist/tools/skillFeedback.*`.

## 8. Relatório de Dificuldades e Aprendizados (FEAT-017)

Registrado em [REP-011](../../reports/REP-011-batch091-feedback-bus-learnings.md): dois servidores MCP, concorrência no stdio do hub, 7 cópias EN (não 5), `reports/` fora do `ai:archive-sdd` e a correção do script de links, e o heredoc que quebrou um teste.

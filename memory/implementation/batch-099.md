---
id: "BATCH-099"
title: "Regra de dist/, css:rebuild e assets:publish por modo de deploy (Lab/SSH vs HTTP-only) e alinhamento REQ-306"
status: "HOMOLOGATED"
date: "2026-11-26"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-097"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Skills c2f-project-pipeline-and-tasks e c2f-persona-executor (PT-BR + EN) diferenciam Lab/SSH de HTTP-only, tratam 404 em dist/.manifest.json como fallback arquivo-estatico e refletem a REQ-306; EVAL-017 e rollout em 7 satélites."
summary_medium: "Inserida a subseção de dist/ na skill de pipeline e o bloco curto no executor, com traduções EN replicadas nos 6 kits e hash pairing reconhecido. Gates locais PASS e rollout aplicado nos 7 satélites com origin."
---

# BATCH-099 — REQ-097

[Requisição](../human-requests/req-097.md) · [BATCH-098](batch-098.md) · [Checklist](../validation/archive/validation-099.md#batch-099--req-097-2026-11-26)

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Topologia dupla, autonomia supervisionada, Categoria B (sem deploy no Lab).

## Live Todo List

- [x] Atualizar `c2f-project-pipeline-and-tasks` e `c2f-persona-executor` em PT-BR.
- [x] Atualizar as traduções EN (6 kits) e reconhecer `source_sha256`.
- [x] Sync, auditoria, índice e `--budget-report`.
- [x] Criar `EVAL-017`, rodar `mdd eval` e `pytest`.
- [x] Higiene MDD (`ai:archive-memory`, `mdd index`, `mdd status`).
- [x] Rollout nos satélites com `origin`.
- [x] Registrar evidências e handoff.

## Evidências

| Verificação | Resultado |
| --- | --- |
| Skills | `c2f-project-pipeline-and-tasks` 265/300 (NEAR, antes 254); `c2f-persona-executor` 157/200 (OK, antes 155). |
| `sync-skills.cjs --repos conn2flow-ai-workspace` | PASS, 0 divergentes, sem `TRANSLATION-COPY-DIVERGENCE` após replicar o EN nos 6 kits. Relatório em `completions/skills-audit.json`. |
| `generate-skills-index.cjs --check` / `--budget-report` | PASS / `OVER: 0` (NEAR: mdd-workflow, c2f-project-pipeline-and-tasks, c2f-payment-gateways). |
| `mdd eval --matrix .` | `EVAL-PASS` com `EVAL-017` PASS. |
| `pytest` com cobertura | 222 passed, 96,21% (gate 95%). |
| Higiene | `ai:archive-memory` moveu `req-090.md` e `batch-094.md` para `archive/`; a seção BATCH-095 do checklist foi movida para `memory/validation/archive/validation-095.md` (limite de 10 seções); `mdd status --json` com `healthy: true` e janelas 10/10/10. `04-memory-engineering-execution.md` com 57 linhas, só com links reescritos. |

## Rollout (`rollout-satellites.cjs --apply`, relatório `completions/rollout-req097.json`)

| Satélite | Status | SHA em `origin/main` |
| --- | --- | --- |
| conn2flow | PUBLISHED | `282d231a19d31d185e3e3e296e752beba01e5cbb` |
| conn2flow-site | PUBLISHED | `22aa0c0ed1347e7451fa238d257b55acec115dec` |
| lumix | PUBLISHED | `7c642d784aa874daa45bcb30161644e0ca9316f8` |
| transformamp | PUBLISHED | `61d3d865fd36b504af02dee504d89b3a4ff8fab8` |
| website-conn2flow | PUBLISHED | `1e2c68d1e4b4d1a50ec8874c841ee645b9f3062a` |
| conn2flow-app | PUBLISHED | `5c02ac14229e0df06864afa35ffe836bbb578365` |
| conn2flow-nexus | PUBLISHED | `aa99602049a6e2cec4ae42c5e3c4c23dfbac437d` |
| conn2flow-home | SKIPPED_NO_ORIGIN (preservado) | — |
| conn2flow-mkt | SKIPPED_NO_ORIGIN (preservado) | — |

O dry-run não registrou customizações a preservar. Todas as worktrees temporárias foram limpas (`cleaned: true`) e `git worktree list` mostra só a matriz. Nenhum commit nem push foi feito na matriz.

## Relatório de Dificuldades e Aprendizados (FEAT-017)

- **Cobertura do EVAL-017:** o motor `mdd eval` associa um cenário a uma única skill. O EVAL-017 cobre `c2f-project-pipeline-and-tasks`; o bloco de `c2f-persona-executor` não tem asserção automática. Cobrir as duas exigiria um 18º cenário, o que contraria a meta 17/17. Decisão pendente do Arquiteto.
- **Cópias EN:** `sync-skills --apply` não propaga a edição EN do kit Gemini para os demais; foi preciso replicar manualmente nos 6 kits (senão `TRANSLATION-COPY-DIVERGENCE`).
- **EOL:** `c2f-project-pipeline-and-tasks` ficou com 2 linhas LF em arquivo CRLF após a primeira inserção; normalizei para CRLF e refiz o sync e os hashes.
- **`--repair-links`:** terminou com `ERROR 20 broken relative link(s)` apontando para `memory/validation/archive/original/VALIDATION-CHECKLIST-*.md`. Não investiguei a origem (provavelmente links já existentes no arquivo dual). `mdd status` ficou `healthy: true`. Pendente de revisão.
- **Janela ativa:** ao criar este `batch-099.md`, `memory/implementation/` passa a ter 11 arquivos ativos; o arquivamento só se aplica a lotes `HOMOLOGATED`.

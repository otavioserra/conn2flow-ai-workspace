---
id: "BATCH-100"
title: "Saneamento de links em memory/validation/archive/ e EVAL-018 para c2f-persona-executor"
status: "HOMOLOGATED"
date: "2026-11-26"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-098"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Corrige 4 links em validation-095.md e 20 em archive/original, cria EVAL-018 (18/18 EVAL-PASS) e fecha gates locais sem rollout."
summary_medium: "Zera os links relativos quebrados do arquivo de validação (ai:archive-memory --dry-run exit 0), arquiva req-091 pela Regra dos 10 e cria EVAL-018 protegendo a regra HTTP-only/dist/ em c2f-persona-executor (PT-BR + EN). Categoria B, sem deploy e sem rollout."
---

# BATCH-100 — REQ-098

[Requisição](../human-requests/req-098.md) · [BATCH-099](batch-099.md) · [Checklist](../validation/VALIDATION-CHECKLIST.md#batch-100--req-098-2026-11-26)

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Topologia dupla, autonomia supervisionada, Categoria B (sem deploy no Lab, sem rollout, sem commit/push).

## Live Todo List

- [x] Corrigir 4 links em `validation-095.md`.
- [x] Sanear 20 links em `archive/original/VALIDATION-CHECKLIST-*.md`.
- [x] Criar `EVAL-018` e rodar `mdd eval`.
- [x] Higiene da Regra dos 10 (`req-091.md` arquivada com `--repair-links`).
- [x] Gates locais (`sync-skills`, índice, budget, `pytest`, `mdd index/status`).
- [x] Registrar evidências, FEAT-017 e handoff.

## Evidências

| Verificação | Resultado |
| --- | --- |
| `validation-095.md` | 4 links corrigidos com mais um nível `../`. |
| `archive/original/VALIDATION-CHECKLIST-*.md` | 20 links `<archive/compacted/...>` e `<archive/original/...>` reescritos para `<../compacted/...>` e `<./...>`; só o caminho mudou, texto histórico intacto. |
| Links residuais | `BATCH-INDEX-fe51f34e6321.md` (`archive/` para `../`) e `batch-096.md` (link do VSIX local ignorado pelo Git virou código inline). |
| `ai:archive-memory --dry-run` | exit 0, sem links quebrados, sem arquivos pendentes. |
| `mdd eval --matrix .` | `EVAL-PASS` 18/18; `EVAL-018` PASS (`c2f-persona-executor` 157/200). |
| `sync-skills.cjs` | PASS, 0 divergentes. |
| `generate-skills-index.cjs --check` / `--budget-report` | PASS / `OVER: 0`. |
| `pytest` com cobertura | 222 passed, 96,21% (gate 95%). |
| `04-memory-engineering-execution.md` | Intacta. |
| Regra dos 10 | `req-091.md` e `batch-095.md` arquivados; seção BATCH-099 do checklist movida para `validation/archive/validation-099.md`. `mdd status --json` `healthy: true`. |

## FEAT-017 — Dificuldades e aprendizados

- O `--dry-run` do `ai:archive-memory` só listou os links quebrados depois que a janela da Regra dos 10 ficou limpa. Os 24 da requisição eram na verdade 24 detectados por varredura própria; ao arquivar `req-091`, o comando revelou mais 2 (BATCH-INDEX original e `batch-096.md`), corrigidos.
- `--repair-links` não reancora links já quebrados; a correção foi manual e cirúrgica.
- Preservar o fim de linha original nos snapshots (`ReadAllText`/`WriteAllText` UTF-8 sem BOM).
- Sugestão: o `--dry-run` deveria reportar links quebrados independentemente da janela.

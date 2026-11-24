---
id: "BATCH-086"
title: "Governança operacional de três skills e Regra dos 10 Ativos"
status: "HOMOLOGATED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-084"
topology: "dupla"
autonomy: "supervisionado"
summary_short: "Atualiza três skills bilíngues e arquiva 12 registros com reescrita de links na matriz."
summary_medium: "Sincronização e hashes das traduções com auditoria PASS e 119 testes aprovados.\nDez requisições e dez lotes ativos. Links históricos em documentos protegidos seguem para revisão."
---

# BATCH-086 — Governança operacional das skills e Regra dos 10 Ativos

[REQ-084](../../human-requests/archive/req-084.md) · Categoria B · Topologia dupla · Autonomia supervisionada

## Live Todo List

- [x] Documentar a remoção de worktrees com junctions em CMD, em PT-BR e EN.
- [x] Documentar a seleção de entradas de `*Data.json` com validação do arquivo e do blob no stage, em PT-BR e EN.
- [x] Documentar a conferência de `main` e `origin/main` após fast-forward aprovado, em PT-BR e EN.
- [x] Sincronizar os cinco kits da matriz e os templates PT-BR/EN, reconhecer os três hashes e validar.
- [x] Reter dez requisições e dez lotes, reescrever os links afetados e regenerar os índices.
- [x] Registrar evidências, relatório FEAT-017 e handoff supervisionado.

## Evidências técnicas

| Verificação | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | 31 cópias atualizadas. Três avisos de drift esperados enquanto o registro EN ainda referenciava os hashes anteriores. |
| `--update-translation-hash <skill> en --translator mdd-agent` | Três entradas atualizadas. Conferência independente do SHA-256 sobre LF e das cópias locais dos cinco kits. |
| Auditoria da matriz | **PASS**, 19 alvos, 542 cópias alinhadas à fonte, 312 traduções protegidas, 0 divergências, 0 drift. [JSON da auditoria](../../../completions/skills-audit.json). |
| `pytest -q tools/mdd-client/tests` | **119 aprovados em 50,44 s**, após estabilizar o registro de hashes. |
| Paridade PT-BR/EN | Todos os templates EN pertinentes conferidos por skill (7 worktree, 7 JSON, 5 Executor). Os cinco blocos de CMD coincidem entre os idiomas. |

Os três espelhos de `.cursor/skills/` na raiz estão sincronizados no checkout local e são ignorados por `.gitignore`. O template Cursor faz parte do diff rastreável.

## Regra dos 10 Ativos

| Raiz | Inventário | Movimento para `archive/` | Ativos após o lote |
| --- | --- | --- | --- |
| `human-requests/` | 14 requisições numeradas | `req-071.md` a `req-074.md` | `req-075.md` a `req-084.md` |
| `implementation/` | 17 lotes antes deste lote | `batch-069.md` a `batch-076.md` | `batch-077.md` a `batch-086.md` |

A prévia verificou destinos e colisões. A aplicação reescreveu 65 links válidos afetados por movimento da origem ou do destino e reparou 33 links históricos com destino local identificável. Os índices derivados foram regenerados após os movimentos. Os dois guias do ecossistema Python também tiveram seus links para o BATCH-071 ajustados.

A varredura de destinos relativos em Markdown encontrou zero links órfãos introduzidos pelo lote. A meta global de zero continua pendente: 166 ocorrências preexistentes foram preservadas, sendo 164 em 11 snapshots `archive/original/` e duas em `04-memory-engineering-execution.md`. O arquivo de execução está saudável, com 10.329 bytes e 57 linhas, e seu SHA-256 permanece igual ao inicial. [Detalhamento no REP-007](../../reports/archive/REP-007-batch086-skills-and-memory-links.md).

## Handoff supervisionado

```text
Arquiteto Master, revise REQ-084 / BATCH-086 no conn2flow-ai-workspace.
Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
Topologia dupla, autonomia supervisionada, Categoria B. Estado técnico: ready-for-review.
Escopo: três skills PT-BR/EN, hashes, kits e Regra dos 10 Ativos na matriz.
Evidências: memory/implementation/batch-086.md, memory/validation/VALIDATION-CHECKLIST.md,
memory/reports/REP-007-batch086-skills-and-memory-links.md e completions/skills-audit.json.
Auditoria PASS com zero divergências e drift. Pytest 119/119. Stage vazio.
Revise o diff e encaminhe ao humano a decisão sobre os 166 links preexistentes
em documentos protegidos antes de dar por atendido o critério global de zero órfãos.
A próxima transição depende do humano. Entrega local, sem commit, push, deploy ou propagação.
```

---
id: "FB-006"
title: "FB-006 — Sync parcial criou mdd-memory-gardening ao lado do legado sdd-memory-gardening e o sync seguinte recusa rodar"
status: "TRIAGED"
verdict: "QUARANTINE"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-091"
batch: "BATCH-093"
persona: "executor"
skill: "c2f-multilingual-skills-governance"
kind: "proposal"
severity: "medium"
scope: "global"
recurrence: "1"
evidence: "conn2flow-app 9f2e461 e conn2flow-nexus 32e75ee (BATCH-088) criaram mdd-memory-gardening sem migrar o legado; BATCH-093: Error 'Skills antiga e nova coexistem'; legado = matriz 78c9327 com EOL normalizado; removido com autorização DEC-136"
summary_short: "Sync parcial criou mdd-memory-gardening ao lado do legado sdd-memory-gardening e o sync seguinte recusa rodar"
github_issue: ""
triage_reason: "Commits 9f2e461 e 32e75ee criaram o canônico no BATCH-088, e BATCH-093 detectou a mesma coexistência. O sync atual já migra o alias selecionado e barra a coexistência. Uma ocorrência independente documentada. Eventual orientação diagnóstica deve preservar os dois diretórios até autorização de retirada conforme DEC-136."
triage_reviewer: "curator"
triage_date: "2026-11-24"
---

# FB-006 — Sync parcial criou mdd-memory-gardening ao lado do legado sdd-memory-gardening e o sync seguinte recusa rodar

* **Skill**: `c2f-multilingual-skills-governance` · **Kind**: `proposal` · **Severity**: `medium` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-091 BATCH-093 (persona `executor`)

## Evidence

conn2flow-app 9f2e461 e conn2flow-nexus 32e75ee (BATCH-088) criaram mdd-memory-gardening sem migrar o legado; BATCH-093: Error 'Skills antiga e nova coexistem'; legado = matriz 78c9327 com EOL normalizado; removido com autorização DEC-136

## Proposal

Quando o legado coexistente for idêntico (EOL normalizado) a um blob histórico da matriz, o relatório deve dizer isso e sugerir a remoção com confirmação humana; e o --apply seletivo de uma skill canônica com alias deve migrar o legado em vez de criar a pasta nova.

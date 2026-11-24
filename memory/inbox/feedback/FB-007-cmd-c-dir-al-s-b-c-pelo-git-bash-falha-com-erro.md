---
id: "FB-007"
title: "FB-007 — cmd //c \"dir /AL /S /B \\\"C:\\...\\\"\" pelo Git Bash falha com erro de sintaxe e parece 0 junctions"
status: "READY"
verdict: "PENDING"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-091"
batch: "BATCH-093"
persona: "executor"
skill: "c2f-shell-and-windows-traps"
kind: "learning"
severity: "low"
scope: "global"
recurrence: "2"
evidence: "BATCH-093: 7 auditorias de junction devolveram 'A sintaxe do nome do arquivo... está incorreta'; via PowerShell (cmd /c + Get-ChildItem -Attributes ReparsePoint) a mesma auditoria deu 'Arquivo não encontrado' = 0 links"
summary_short: "cmd //c \"dir /AL /S /B \\\"C:\\...\\\"\" pelo Git Bash falha com erro de sintaxe e parece 0 junctions"
github_issue: ""
---

# FB-007 — cmd //c "dir /AL /S /B \"C:\...\"" pelo Git Bash falha com erro de sintaxe e parece 0 junctions

* **Skill**: `c2f-shell-and-windows-traps` · **Kind**: `learning` · **Severity**: `low` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-091 BATCH-093 (persona `executor`)

## Evidence

BATCH-093: 7 auditorias de junction devolveram 'A sintaxe do nome do arquivo... está incorreta'; via PowerShell (cmd /c + Get-ChildItem -Attributes ReparsePoint) a mesma auditoria deu 'Arquivo não encontrado' = 0 links

## Proposal

Na Armadilha 18/limpeza de worktree: rodar a auditoria de junctions no PowerShell e tratar 'Arquivo não encontrado' como zero; nunca contar linhas de uma saída de erro como zero links.

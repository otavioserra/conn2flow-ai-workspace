---
id: "FB-002"
title: "FB-002 — grep -c $'\\r' no Git Bash da ferramenta devolveu 0 para arquivo CRLF; detectar EOL com node"
status: "TRIAGED"
verdict: "ACCEPT"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-090"
batch: "BATCH-092"
persona: "executor"
skill: "c2f-shell-and-windows-traps"
kind: "learning"
severity: "low"
scope: "global"
evidence: "conn2flow cli/src/Console/Application.php: grep -c retornou 0, node mostrou '\\r\\n'; patch com '\\n' no padrão falhou com 0 ocorrências"
summary_short: "grep -c $'\\r' no Git Bash da ferramenta devolveu 0 para arquivo CRLF; detectar EOL com node"
github_issue: ""
triage_reason: "Reproduzido no BATCH-093: grep -c $'\\r' devolveu 0 num arquivo CRLF e o one-liner node devolveu 2. Aplicado em c2f-shell-and-windows-traps §20 PT-BR/EN (REQ-091/BATCH-093)."
triage_reviewer: "curator"
triage_date: "2026-11-24"
---

# FB-002 — grep -c $'\r' no Git Bash da ferramenta devolveu 0 para arquivo CRLF; detectar EOL com node

* **Skill**: `c2f-shell-and-windows-traps` · **Kind**: `learning` · **Severity**: `low` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-090 BATCH-092 (persona `executor`)

## Evidence

conn2flow cli/src/Console/Application.php: grep -c retornou 0, node mostrou '\r\n'; patch com '\n' no padrão falhou com 0 ocorrências

## Proposal

Na seção de EOL: detectar CRLF com node -e (readFileSync + includes('\r\n')) antes de patch e montar padrões sem quebra de linha final.

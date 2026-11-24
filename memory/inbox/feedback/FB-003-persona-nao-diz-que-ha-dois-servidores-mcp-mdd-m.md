---
id: "FB-003"
title: "FB-003 — Persona não diz que há dois servidores MCP (mdd mcp Python e conn2flow-hub) nem quando mexer em cada um"
status: "TRIAGED"
verdict: "ACCEPT"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-090"
batch: "BATCH-092"
persona: "executor"
skill: "c2f-persona-executor"
kind: "gap"
severity: "low"
scope: "global"
evidence: "REP-011 §2; BATCH-092: submit/list_skill_feedback agora em mcp-hub/src/server.ts e tools/mdd-client/src/mdd_client/mcp_server.py (pytest test_mcp.py 12/12)"
summary_short: "Persona não diz que há dois servidores MCP (mdd mcp Python e conn2flow-hub) nem quando mexer em cada um"
github_issue: ""
triage_reason: "Verificado: submit/list_skill_feedback existem em mcp_server.py e mcp-hub/src/server.ts; REP-012 §2 mede a linha de base PHPUnit no origin/main. Aplicado em c2f-persona-executor PT-BR/EN (REQ-091/BATCH-093)."
triage_reviewer: "curator"
triage_date: "2026-11-24"
---

# FB-003 — Persona não diz que há dois servidores MCP (mdd mcp Python e conn2flow-hub) nem quando mexer em cada um

* **Skill**: `c2f-persona-executor` · **Kind**: `gap` · **Severity**: `low` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-090 BATCH-092 (persona `executor`)

## Evidence

REP-011 §2; BATCH-092: submit/list_skill_feedback agora em mcp-hub/src/server.ts e tools/mdd-client/src/mdd_client/mcp_server.py (pytest test_mcp.py 12/12)

## Proposal

Em 'Onde registrar': citar as duas superfícies com a mesma tool e dizer que mudança de contrato de tool exige paridade e teste nos dois.

---
id: "FB-004"
title: "FB-004 — Alias renomeado para pasta coberta por .gitignore sai do repositório: o commit grava só a deleção"
status: "READY"
verdict: "PENDING"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-091"
batch: "BATCH-093"
persona: "executor"
skill: "c2f-multilingual-skills-governance"
kind: "bug"
severity: "high"
scope: "global"
recurrence: "1"
evidence: "BATCH-093: conn2flow e lumix ignoram .claude/skills/* com whitelist; c2f-architect-master e c2f-executor-agent rastreados viraram c2f-persona-* ignorados; verify_commits.py acusou e git add -f dos sucessores corrigiu (commits 230262177 e 60faf38)"
summary_short: "Alias renomeado para pasta coberta por .gitignore sai do repositório: o commit grava só a deleção"
github_issue: ""
---

# FB-004 — Alias renomeado para pasta coberta por .gitignore sai do repositório: o commit grava só a deleção

* **Skill**: `c2f-multilingual-skills-governance` · **Kind**: `bug` · **Severity**: `high` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-091 BATCH-093 (persona `executor`)

## Evidence

BATCH-093: conn2flow e lumix ignoram .claude/skills/* com whitelist; c2f-architect-master e c2f-executor-agent rastreados viraram c2f-persona-* ignorados; verify_commits.py acusou e git add -f dos sucessores corrigiu (commits 230262177 e 60faf38)

## Proposal

Na seção de aliases: antes de commitar o rollout, comparar git ls-tree de origin/main e HEAD por kit e mapear cada deleção a um sucessor rastreado; sucessor ignorado exige git add -f (sem mexer no .gitignore). Idealmente o sync-skills.cjs avisa quando o destino do rename é ignorado (git check-ignore).

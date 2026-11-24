---
id: "FB-004"
title: "FB-004 — Alias renomeado para pasta coberta por .gitignore sai do repositório: o commit grava só a deleção"
status: "TRIAGED"
verdict: "ACCEPT"
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
triage_reason: "BATCH-093 e commits 230262177/60faf38 comprovam perda silenciosa do sucessor rastreado antes da correção. O rename do sync não valida o ignore do Git. Cabe na seção de aliases (64/200 linhas): verificar o destino com git check-ignore --no-index e confirmar que cada legado removido tem sucessor no commit antes do push. Stage forçado apenas para o caminho do sucessor deliberadamente versionado."
triage_reviewer: "curator"
triage_date: "2026-11-24"
---

# FB-004 — Alias renomeado para pasta coberta por .gitignore sai do repositório: o commit grava só a deleção

* **Skill**: `c2f-multilingual-skills-governance` · **Kind**: `bug` · **Severity**: `high` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-091 BATCH-093 (persona `executor`)

## Evidence

BATCH-093: conn2flow e lumix ignoram .claude/skills/* com whitelist; c2f-architect-master e c2f-executor-agent rastreados viraram c2f-persona-* ignorados; verify_commits.py acusou e git add -f dos sucessores corrigiu (commits 230262177 e 60faf38)

## Proposal

Na seção de aliases: antes de commitar o rollout, comparar git ls-tree de origin/main e HEAD por kit e mapear cada deleção a um sucessor rastreado; sucessor ignorado exige git add -f (sem mexer no .gitignore). Idealmente o sync-skills.cjs avisa quando o destino do rename é ignorado (git check-ignore).

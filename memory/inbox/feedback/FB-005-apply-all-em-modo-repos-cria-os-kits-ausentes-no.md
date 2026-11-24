---
id: "FB-005"
title: "FB-005 — --apply --all em modo --repos cria os kits ausentes no satélite; para só os kits existentes passe os 48 nomes"
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
kind: "gap"
severity: "medium"
scope: "global"
recurrence: "1"
evidence: "scripts/skills/sync-skills.cjs: if (fs.existsSync(skills) || (apply && todas)); conn2flow-app só tem .claude e conn2flow-nexus .claude/.github; BATCH-093 usou --apply <48 nomes>"
summary_short: "--apply --all em modo --repos cria os kits ausentes no satélite; para só os kits existentes passe os 48 nomes"
github_issue: ""
triage_reason: "O ramo --repos de sync-skills.cjs inclui kits ausentes quando apply && todas. Uma origem (BATCH-093), sem perda constatada. Na próxima ocorrência, corrigir a frase sobre alvos na seção existente, sem fixar a contagem de skills e sem modificar o comportamento do sync."
triage_reviewer: "curator"
triage_date: "2026-11-24"
---

# FB-005 — --apply --all em modo --repos cria os kits ausentes no satélite; para só os kits existentes passe os 48 nomes

* **Skill**: `c2f-multilingual-skills-governance` · **Kind**: `gap` · **Severity**: `medium` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-091 BATCH-093 (persona `executor`)

## Evidence

scripts/skills/sync-skills.cjs: if (fs.existsSync(skills) || (apply && todas)); conn2flow-app só tem .claude e conn2flow-nexus .claude/.github; BATCH-093 usou --apply <48 nomes>

## Proposal

Documentar na seção de escrita seletiva que --all cria .gemini/.cursor/.codex/.github ausentes e que rollout sem novos kits usa a lista explícita de nomes.

---
id: "FB-001"
title: "FB-001 — Trocar scripts ad hoc de arquivamento por ai:archive-memory --status=HOMOLOGATED,REVIEWED (cobre reports/ e links <...>)"
status: "PENDING"
verdict: "PENDING"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
repo: "conn2flow-ai-workspace"
request: "REQ-090"
batch: "BATCH-092"
persona: "executor"
skill: "mdd-memory-gardening"
kind: "proposal"
severity: "medium"
scope: "global"
evidence: "Core 6e146f7aa8b6 (cli/src/Commands/AiArchiveMemoryCommand.php, tests/Unit/PHP/MemoryArchiveReq090Test.php 13/13); BATCH-092: 3 arquivados, 18 links reescritos, 0 links alheios alterados"
summary_short: "Trocar scripts ad hoc de arquivamento por ai:archive-memory --status=HOMOLOGATED,REVIEWED (cobre reports/ e links <...>)"
github_issue: ""
---

# FB-001 — Trocar scripts ad hoc de arquivamento por ai:archive-memory --status=HOMOLOGATED,REVIEWED (cobre reports/ e links <...>)

* **Skill**: `mdd-memory-gardening` · **Kind**: `proposal` · **Severity**: `medium` · **Scope**: `global`
* **Origin**: `conn2flow-ai-workspace` REQ-090 BATCH-092 (persona `executor`)

## Evidence

Core 6e146f7aa8b6 (cli/src/Commands/AiArchiveMemoryCommand.php, tests/Unit/PHP/MemoryArchiveReq090Test.php 13/13); BATCH-092: 3 arquivados, 18 links reescritos, 0 links alheios alterados

## Proposal

mdd-memory-gardening e c2f-persona-architect §5: citar ai:archive-memory como canônico (alias ai:archive-sdd), --status para não selecionar pendentes por ordem numérica, --folders, e reports/ ordenado por date: do frontmatter.

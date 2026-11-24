# Evolving Learnings Memory (`memory/learnings/`)

Verified learnings from this repository, distilled by the AI from real work. Check this folder before a new task so that an already-solved mistake is not repeated.

## Flow

1. **`memory/raw/active/`**: raw observation recorded during the batch, with no normative authority.
2. **`memory/learnings/LRN-XXX-<slug>.md`**: verified learning, with root cause, evidence and anti-pattern. Distillation is done by `c2f-persona-curator` in local scope.
3. **Project local skills**: when a learning becomes a recurring rule of the project's domain, it can become a local skill with the project's own prefix (never `c2f-*`). `sync-skills.cjs` preserves local skills.
4. **Feedback to the matrix**: only what applies to any Conn2Flow project goes up to `conn2flow-ai-workspace`, without client, server or private data names.

## Learning format

```markdown
---
id: "LRN-001"
title: "Short learning title"
status: "active"
date: "YYYY-MM-DD"
author: "executor"
summary_short: "One sentence with what to learn."
---

# LRN-001 — Short learning title

## Root cause
## Evidence
File/line, command, measurement or test that proves it.
## Anti-pattern / How to avoid
## Origin
Batch, report or `raw/active/` observation it came from.
```

## Rules

- Without evidence it is not a learning: the observation stays in `raw/active/`.
- Do not delete learnings. Superseded ones get `status: "superseded"` and point to the replacement.
- Compaction uses the dual pattern: `archive/original/` keeps the original bytes and `archive/compacted/` keeps the traceable summary.
- Regenerate the index with `mdd index` after creating or changing a learning.

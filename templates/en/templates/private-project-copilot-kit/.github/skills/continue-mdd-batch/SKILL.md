---
name: continue-mdd-batch
description: "READ BEFORE resuming a batch already in progress. Preserves completed work, validation checklists and the current batch focus."
user-invocable: true
---

# Batch continuity MDD

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Continue or resume an MDD batch in progress (`in-progress`), either after pause in conversation or in new session.
- **SKIP ONLY IF**: Start of a new demand from scratch (where the correct command is `/start-mdd-slice`).
- **CONSEQUENCE OF IGNORING**: Loss of the task context, unnecessary re-execution of already validated steps and conflict in validation checklists.

---

Treat `$ARGUMENTS` as the operational delta since the last round.

## Before continuing

1. First reread the artifacts or files explicitly cited in the delta.
2. Reread `memory/implementation/BATCH-INDEX.md`, the current batch and `memory/validation/VALIDATION-CHECKLIST.md`.
3. If the delta changes requirement, reload `mdd-workflow` and move to change request before rewriting numbered sdd.
4. If the delta is just round feedback, keep numbered normative documents stable.

## Current Delta

$ARGUMENTS

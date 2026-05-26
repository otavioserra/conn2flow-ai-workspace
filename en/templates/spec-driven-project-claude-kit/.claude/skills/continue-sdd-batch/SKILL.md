---
name: continue-sdd-batch
description: Resumes an in-progress SDD batch. Use when there is a new operational delta, human changes in SDD artifacts or batches, or when the same round should continue without restarting classification.
disable-model-invocation: true
argument-hint: "[operational-delta]"
---

# Continue SDD batch

Treat `$ARGUMENTS` as the operational delta since the last round.

## Before continuing

1. Reread the artifacts or files explicitly cited in the delta first.
2. Reread `sdd/implementation/BATCH-INDEX.md`, the current batch, and `sdd/validation/VALIDATION-CHECKLIST.md`.
3. If the delta changes the requirement, reload `sdd-workflow` and move to a change request before rewriting a numbered SDD file.
4. If the delta is only round feedback, keep numbered SDD files stable.

## Current delta

$ARGUMENTS
---
name: start-sdd-slice
description: Starts a new round in an SDD repository. Use when the request is new, comes from sdd/human-requests, or has not yet been classified between change request, implementation, review, or validation.
disable-model-invocation: true
argument-hint: "[request]"
---

# Start SDD slice

Treat `$ARGUMENTS` as the new request to classify and execute.

## Before acting

1. Load `sdd-workflow`.
2. Identify the most concrete anchor for the task: SDD file, batch, review, validation, decision, code file, or `sdd/human-requests/`.
3. Read the minimum initial context: `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the current batch, `sdd/validation/VALIDATION-CHECKLIST.md`, and `sdd/decisions/DECISION-LOG.md`.
4. If the input comes from `sdd/human-requests/`, read that intake first.

## Execution rule

1. Classify early: change request, implementation, review, or validation.
2. Edit numbered SDD files only when the requirement, contract, acceptance, or decision really changes.
3. Implement the smallest approved slice.
4. Validate early with the smallest check capable of falsifying the current batch.

## Current request

$ARGUMENTS
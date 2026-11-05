---
name: start-mdd-slice
description: "READ BEFORE starting a new human request or work batch. Establishes bounded scope, validation criteria and respect for other batches."
user-invocable: true
---

# Start of slice MDD

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Receive a new human request in `memory/human-requests/` or open a new `BATCH-XXX.md` in `memory/implementation/`.
- **SKIP ONLY IF**: Batch has already been started before (where the correct command is `/continue-mdd-batch`).
- **CONSEQUENCE OF IGNORING**: Execution without atomic planning, mixing responsibilities between multiple lots and lack of clear acceptance criteria.

---

Treat `$ARGUMENTS` as the new demand to be sorted and executed.

## Before you act

1. Load `mdd-workflow`.
2. Identify the most concrete anchor of the task: sdd, batch, review, validation, decision, code file or `memory/human-requests/`.
3. Read the initial minimum context: `memory/README.md`, `memory/process/00-START-HERE.md`, `memory/process/01-WORKFLOW.md`, `memory/implementation/BATCH-INDEX.md`, the current batch, `memory/validation/VALIDATION-CHECKLIST.md` and `memory/decisions/DECISION-LOG.md`.
4. If the entry comes from `memory/human-requests/`, first read this entry.

## Implementing rule

1. Rate early: change request, implementation, review or validation.
2. Edit normative documents numbered only when required, contract, accepted or decision actually change.
3. Implement the lowest approved slice.
4. Validate early with the smallest check capable of falsifying the current batch.

## Current demand

$ARGUMENTS

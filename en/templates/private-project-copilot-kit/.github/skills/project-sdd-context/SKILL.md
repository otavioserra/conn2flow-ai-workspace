---
name: project-sdd-context
description: 'Use when the task is anchored in a project scope inside project/ that already has 00-START-HERE.md, 01-WORKFLOW.md, a spec, batches, and a validation checklist. It helps operate local SDD without trying to convert the entire repository.'
user-invocable: false
---

# Local SDD in a private project

This skill exists for workstreams inside `project/` that already operate with spec, batch, review, decision, and validation artifacts, even if the entire repository is not SDD.

## When to use

- task anchored in `project/<workstream>/`
- reading or editing a spec, batch, review, decision, change request, or validation artifact
- code implementation that depends on an existing batch or checklist in that workstream

## Procedure

1. Confirm through the [local scope checklist](./references/escopo-local.md) whether that workstream really operates in SDD.
2. If the task points to `project/<workstream>/human-requests/*.md` or to the `human-requests/` folder, read that human intake first. When only the folder is given, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
3. Reread `00-START-HERE.md`, `01-WORKFLOW.md`, the main spec, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md` before proposing code.
4. Treat `human-requests/` as non-normative input and `antigo/` only as historical material, never as the current source of truth.
5. Edit the main spec only when the requirement, acceptance, or structural decision changes.
6. Use reviews, change-requests, decisions, implementation, and validation for the rest of the incremental work.
7. If the workstream does not have those artifacts, return to the normal private-project flow and do not try to retrofit SDD to the entire repository inside the same task.

## Expected output

- local scope recognized correctly
- current batch and validation used as the operational anchor
- no unnecessary rewrite of the main spec
- no broad SDD retrofit outside the workstream that already uses this model
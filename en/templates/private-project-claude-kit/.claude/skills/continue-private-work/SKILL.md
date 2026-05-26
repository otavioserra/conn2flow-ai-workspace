---
description: Resumes an in-progress request in a Conn2Flow private project. Use when there is new operational delta, manually changed files, or a scope change in the middle of execution.
disable-model-invocation: true
argument-hint: "[what-changed-since-the-last-round]"
---

# Private project continuation

Treat `$ARGUMENTS` as the operational delta since the last round.

## Before continuing

1. Reread first the files, folders, or artifacts explicitly cited in the delta.
2. If the task remains anchored in a local SDD scope inside `project/`, reread `00-START-HERE.md`, `01-WORKFLOW.md`, the main spec, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md` before editing.
3. If the delta changes the split between private and core, reload `private-project-context`.
4. If the delta touches a gestor module, reload `gestor-module-integration`.

## Execution rule

- Do not restart broad exploration without need.
- Continue from the smallest set of files that actually changed.
- Validate early again if the delta affects the implementation or the validation premise.

## Current delta

$ARGUMENTS
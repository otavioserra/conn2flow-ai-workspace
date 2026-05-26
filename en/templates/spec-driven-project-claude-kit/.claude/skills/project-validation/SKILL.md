---
name: project-validation
description: Use when the task requires local validation of the current slice in an SDD repository. It helps choose the smallest executable check before expanding scope.
user-invocable: false
---

# Project validation

Use this skill when the task requires validation of the current batch.

## Procedure

1. Start with the smallest check capable of falsifying the current slice.
2. Prefer validation aligned with the batch and the validation checklist before running larger suites.
3. Register evidence and pending items in the correct artifact.
4. If the repository has project-specific test, lint, build, or Docker commands, adapt this skill to the real project.
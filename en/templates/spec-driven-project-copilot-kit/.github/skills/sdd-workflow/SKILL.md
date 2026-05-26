---
name: sdd-workflow
description: Use when the repository follows Spec-Driven Development and the task touches numbered SDD files, batches, reviews, validation, decisions, or change requests.
user-invocable: false
---

# SDD workflow

Use this skill when the project is driven by versioned SDD artifacts.

## Minimum initial reading

Start with `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the current batch, `sdd/validation/VALIDATION-CHECKLIST.md`, and `sdd/decisions/DECISION-LOG.md`.

If the task points to `sdd/human-requests/*.md` or to the `sdd/human-requests/` folder, read that human intake first. When only the folder is provided, use this deterministic order:

1. `CURRENT.md`
2. `README.md`
3. the most recent `.md` file

Then read only the numbered SDD files and code files that control the current slice.

## Request classification

1. Requirement or contract change:
   - register it in `sdd/change-requests/`
   - assess impact on numbered SDD files, decisions, batches, and validation
2. Review feedback without normative change:
   - register it in `sdd/reviews/`
   - keep numbered SDD files stable
3. Incremental implementation:
   - check the current batch in `sdd/implementation/`
   - implement the smallest approved slice
   - validate and update `sdd/validation/` when needed
4. Validation or spec drift check:
   - start with the smallest automated check
   - register evidence and pending items in the correct artifacts

## Golden rules

- Numbered SDD files are the normative source of truth.
- `sdd/human-requests/` is never normative; it only feeds change requests, reviews, batches, decisions, or validation.
- Do not rewrite numbered SDD files for small review comments.
- Do not open the next batch before the current one is stable and reviewable.
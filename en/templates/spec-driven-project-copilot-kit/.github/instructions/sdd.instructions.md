---
name: 'Spec-Driven SDD'
description: 'Use when editing SDD, reviews, batches, decisions, validation, or change requests in SDD repositories.'
applyTo: 'sdd/**/*.md'
---

- Numbered SDD files are the normative source of truth.
- Treat `sdd/human-requests/` only as non-normative human intake; any consolidation should go to `change-requests/`, `reviews/`, `implementation/`, `validation/`, `decisions/`, or approved numbered SDD files.
- Use `sdd/change-requests/` for requirement changes, `sdd/reviews/` for round feedback, `sdd/implementation/` for batches, `sdd/validation/` for evidence, and `sdd/decisions/` for rationale.
- Do not rewrite numbered SDD files for review comments that do not change the requirement.
- At the start of every session, read `sdd/ENGINEERING-MEMORY-CHIEF.md` and `sdd/ENGINEERING-MEMORY-EXECUTION.md` to align context.
- At the end of every task, update `sdd/ENGINEERING-MEMORY-EXECUTION.md` with learnings, resolved bugs, and environment quirks. Never modify `sdd/ENGINEERING-MEMORY-CHIEF.md` without explicit instruction from the human user.
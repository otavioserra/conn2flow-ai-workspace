---
paths:
  - "sdd/**/*.md"
---

# SDD Artifact Rules

- Numbered SDD files are the normative source of truth.
- Treat `sdd/human-requests/` only as non-normative human intake; any consolidation should go to `change-requests/`, `reviews/`, `implementation/`, `validation/`, `decisions/`, or approved numbered SDD files.
- Use `sdd/change-requests/` for requirement changes, `sdd/reviews/` for round feedback, `sdd/implementation/` for batches, `sdd/validation/` for evidence, and `sdd/decisions/` for rationale.
- Do not rewrite numbered SDD files for review comments that do not change the requirement.
# SDD Governance for [PROJECT-NAME]

This directory defines the local Spec-Driven Development governance for the project.

## Minimum normative order

1. `sdd/README.md`
2. `sdd/00-baseline-architecture.md`
3. `sdd/SPEC.md`
4. `sdd/process/00-START-HERE.md`
5. `sdd/process/01-WORKFLOW.md`
6. `sdd/implementation/BATCH-INDEX.md`
7. `sdd/validation/VALIDATION-CHECKLIST.md`
8. `sdd/decisions/DECISION-LOG.md`

## Golden rules

- `sdd/human-requests/` is non-normative human intake.
- The executor may update operational artifacts such as `implementation/` and `validation/`.
- Normative changes should be consolidated into `SPEC.md`, the baseline, or other numbered SDD files only when the requirement really changes.
- Each round should pursue the smallest plausible batch and the cheapest validation capable of falsifying the current slice.

## Initial state

- `BATCH-000`: SDD boilerplate installed.
- `BATCH-001`: first functional batch waiting for classification.
- Active pointer: `sdd/human-requests/CURRENT.md`.
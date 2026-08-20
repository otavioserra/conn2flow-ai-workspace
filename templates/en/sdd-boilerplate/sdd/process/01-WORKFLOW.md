# 01 Workflow

## Goal

Create a predictable loop between human intake, batches, code, validation, and review.

## Recommended flow

1. Read the active intake.
2. Classify the request.
3. Open or continue the correct batch.
4. Implement the smallest approved slice.
5. Validate locally.
6. Record evidence and pending items.

## Editing boundaries

- Normative: `SPEC.md`, baseline, decisions, and other numbered SDD files.
- Operational: `implementation/` and `validation/`.

## Rules

- Do not rewrite normative files for small review feedback.
- Do not open a new batch before stabilizing the current one.
- If the requirement really changes, register that explicitly before expanding the implementation.
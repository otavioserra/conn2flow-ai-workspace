---
name: project-validation
description: "MANDATORY READ before validating code changes or closing an SDD batch. Prevents incomplete tests, regressions in production, and closing batches without verifiable evidence."
user-invocable: false
---

# Project Validation

# ⚡ Mandatory Trigger
- **TRIGGER**: Completing code implementations and preparing technical, automated, or visual test evidence to record in `VALIDATION-CHECKLIST.md`.
- **SKIP ONLY IF**: Purely specification or documentation tasks where no code files were modified.
- **CONSEQUENCE OF IGNORING**: False-positive batch completion, regressions reaching production, and absence of verifiable evidence.

---

Use this skill when a task requires validating the current batch.

## Validation Procedure

1. Start with the smallest check capable of falsifying the current slice.
2. Prioritize validation aligned with the batch and the validation checklist before running full test suites.
3. Log evidence and pending items in `sdd/validation/VALIDATION-CHECKLIST.md`.
4. If the repository provides specific test, lint, build, or Docker commands, use them to collect objective evidence.

---

## 🚫 Anti-Habit Rule: Never Default to "Pending Operator"

- The agent **MUST** execute autonomous inspection tools (`c2f page:inspect`, `c2f auth:cookie`), unit tests (`c2f db:test`), or test suites before considering an item validated.
- Marking checklist items as "awaiting operator visual check" out of convenience is **strictly prohibited**.
- The only acceptable exception is when a feature strictly requires external production infrastructure inaccessible locally (e.g. external payment gateway without sandbox/mock). In these rare cases, the agent must document the exact technical blocker and the partial local tests conducted in `VALIDATION-CHECKLIST.md`.

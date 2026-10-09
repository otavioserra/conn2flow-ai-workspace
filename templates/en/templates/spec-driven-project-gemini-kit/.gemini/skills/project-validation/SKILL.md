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

---

## 🔁 Validation that proves what it claims

- **A test that cannot fail is not evidence.** After writing a check, confirm it fails on the old state: a test that only compares the title passes with a stale body.
- **Exercise the path, not the shortcut.** If the log says `SKIP`, the rule did not run. Force the execution before saying it works.
- **Before and after.** A change that touches data in an environment is validated with a snapshot of the tables before and another after.
- **Name what was not checked.** Inherited text you kept without verifying against the code goes in the report as "kept, not checked".
- **An environment failure is called by its name.** "1 failure, CRLF line endings in the environment, recorded in batch X" instead of "green suite".

## AI responses and realistic fixtures (BL-028)

Inspect the masked request and read the actual response; HTTP 200 and check counts do not prove content quality. Derive assertions from the documented source, avoiding arbitrary keywords or bans on legitimate partial answers. Keep raw generated text out of permanent telemetry.

Use fixtures with navigation outside main, an email-shaped username, an unknown route returning 200, and an editor created after the hook. Exercise permissions, hostile input, missing provider/credits and timeout. Database doubles must reproduce expression keys and comma splitting. Create data through the tested interface, clean it in finally and verify deletion even after failures. Report every skip and inspect screenshots. Without a reachable provider, label mock coverage and the unexercised real path.

Reports include defects fixed before delivery, what was not exercised, and known limitations.

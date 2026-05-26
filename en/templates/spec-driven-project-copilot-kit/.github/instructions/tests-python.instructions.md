---
name: 'Spec-Driven Python Tests'
description: 'Use when editing Python tests in spec-driven repositories.'
applyTo: 'tests/**/*.py'
---

- Anchor each new test to the numbered SDD file and the active batch.
- Prefer deterministic tests in the smallest slice that proves the contract.
- When there is a batch-focused validation, run that subset before the full suite.
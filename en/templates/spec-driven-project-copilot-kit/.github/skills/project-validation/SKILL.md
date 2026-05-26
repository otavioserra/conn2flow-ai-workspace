---
name: project-validation
description: Use when validating changes in SDD repositories by running the smallest automated check first and stack validation only if needed.
---

# Project validation

Adapt this skill to the project's canonical commands.

## Recommended order

1. Read the validation checklist and the current batch.
2. Run the smallest automated validation consistent with the batch first.
3. Expand to the project's local regression checks.
4. Only then move to stack validation, containers, external services, or smoke flow when the batch really requires it.

## Customize this file per project

- Replace the test commands with the repository's real gates.
- Add stack, healthcheck, and smoke flow commands if the project has that layer.
- Record the canonical validation order here to avoid jumping straight to expensive checks.
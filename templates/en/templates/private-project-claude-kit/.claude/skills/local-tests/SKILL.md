---
name: local-tests
description: Use when the task requires local tests in the Conn2Flow ecosystem after implementing modules, pages, or features.
user-invocable: false
---

# Local tests

Use this skill when the task requires tests to validate the implementation.

## Default order

1. Use the smallest deploy, sync, or publish routine needed to bring the change into the local test environment.
2. Access the test environment only after confirming that the correct files were synchronized.
3. Use logs, database checks, and targeted probes before moving to larger validations.
4. Close the round with a short checklist of executed tests and what remains pending.

## Customize this file per project

- Replace task names, scripts, and URLs with the real equivalents in the repository.
- If the project uses `environment.json`, local Docker, or API-based deploy, document the preferred operational path here.
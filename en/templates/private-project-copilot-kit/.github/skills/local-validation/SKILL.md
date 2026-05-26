---
name: local-validation
description: Use when the task requires local validation in the Conn2Flow ecosystem with Docker, workspace tasks, JWT tokens, Phinx, MySQL, or log reading.
---

# Local validation

Use this skill when the task requires environment synchronization, task execution, logs, migrations, test token generation, or targeted database checks.

## Default order

1. Choose the smallest validation capable of falsifying the change.
2. If the task requires an up-to-date environment, run the appropriate workspace task.
3. If you need to authenticate in gestor, generate or renew the test token.
4. After editing, validate the touched slice first and only then expand scope.
5. Use logs and targeted queries before moving to larger checks.

## Customize this file per project

- Replace container names, tasks, and paths with what exists in the real repository.
- Add here the synchronization, log, database, and authentication commands the team uses every day.
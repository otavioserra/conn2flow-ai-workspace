---
name: c2f-system-tasks
description: "READ BEFORE configuring background routines, scheduled Cron tasks or asynchronous workers. Prevents infinite loops, blocked system queues and exhausted server resources."
user-invocable: false
---

# System Automation Tasks (`c2f-system-tasks`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create or edit scheduled task scripts, cleanup routines/background cleaning or asynchronous Gestor workers.
- **SKIP ONLY IF**: Requests HTTP conventional user-controlled synchronies.
- **CONSEQUENCE OF IGNORING**: Lack of idempotence lock on competing Cron executions, infinite loops, PHP timeout burst and server degradation.

---

See and use **System Automation Tasks** defined in `.vscode/tasks.json`. They encapsulate central Conn2Flow Bash and PHP scripts to accelerate testing, compilation, syncing and deploys:

## 1. Main System Task Groups

* **📦 Docker (Container Management)**:
  - `📦 Docker - Container Status`: `docker ps`
  - `📦 Docker - Apache Logs > Real Time`: `docker logs conn2flow-app --tail 50 --follow`
  - `📦 Docker - PHP Logs > Real Time`: `docker exec conn2flow-app bash -c "tail -f /var/log/php_errors.log"`
  - `📦 Docker - PHP Logs Truncate`: `docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"`

* **🛠️ Manager (Nucle Automation)**:
  - `🛠️ Manager - Update => All - Test Environment`: Runs full sequence (resources database) in the testing environment.
  - `🛠️ Manager - Synchronize => Resources - Local`: Build resources (`atualizacao-dados-recursos.php`).
  - `🛠️ Manager - Create Module`: Run the scaffold new module (`create-new-module.sh`).
  - `🛠️ Manager - GIT Release` / `GIT Commit`: Run the normative release and commit pipelines.

* **🗃️ Projects (Management and Deploy of Projects)**:
  - `🗃️ Projects - Deploy Current Project`: Compact and deploy via API (`deploy-project-v2.sh --contents`).
  - `🗃️ Projects - Deploy Project -> ID`: Deploy directed by project ID.
  - `🗃️ Projects - Recover Current Project`: Server data recovery/pull (`recover-project.sh`).
  - `🗃️ Projects - Sync Core -> ID`: Sync core updates to the project repository.
  - `🗃️ Projects - Update => All - Core & Project`: Full core and project update pipeline.

* **🧩 Plugins (Public/Private Plugin Automation)**:
  - Synchronization, local build, features and releases for plugins under `dev-plugins/plugins/`.

---

## 2. Input Parameters (`inputs`)
- `moduloID`, `projectID`, `contentsChoice` (Yes / No), `commitMsg`, `tagMsg`, `releaseMode` (automatic / manual).

---
name: c2f-docker-environment
description: "READ BEFORE interacting with Docker containers such as conn2flow-app, mysql or redis. Prevents port conflicts, unsynchronized local data and incompatible host runtimes."
user-invocable: false
---

# Docker Conn2Flow Environment (`CONN2FLOW-DOCKER-ENVIRONMENT.md`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Up, down, restart or execute commands within the Docker containers of the development environment.
- **SKIP ONLY IF**: Local native environments without containers or pure documentary tasks.
- **CONSEQUENCE OF IGNORING**: Connection failures with database, incorrect runtime execution (PHP 8.2 vs 8.5) or loss of persistence in local volumes.

---

See and apply the following conventions to operate in the local containerization environment:

## 1. Container Structure

* **Main Container**: `conn2flow-app` (A Apache wheel + PHP 8.x).
* **Doors**: HTTP `80` (locally redirected to `8080` or port configured in docker-compose).

---

## 2. PHP Error Log Inspection

* **View Last 50 Lines of PHP Error**:
  ```bash
  docker exec conn2flow-app bash -c "tail -50 /var/log/php_errors.log"
  ```
* **Track PHP Logs in Real Time**:
  ```bash
  docker exec conn2flow-app bash -c "tail -f /var/log/php_errors.log"
  ```
* **Clear/Trun PHP Error File**:
  ```bash
  docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"
  ```

---

## 3. PHP Command Execution in Container

* **Check PHP Version**:
  ```bash
  docker exec conn2flow-app bash -c "php -v"
  ```
* **Run Linter PHP**:
  ```bash
  docker exec conn2flow-app bash -c "php -l /caminho/do/arquivo.php"
  ```

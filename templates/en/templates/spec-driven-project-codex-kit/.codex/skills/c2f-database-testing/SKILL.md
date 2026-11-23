---
name: c2f-database-testing
description: "READ BEFORE writing or running automated database tests with PHPUnit, SQLite or MySQL. Prevents main-database pollution, SQLite/MySQL incompatibilities and hidden regressions."
user-invocable: false
---

# Isolated tests of database Conn2Flow

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Write, run or debugging unit or integration automated tests that access database tables.
- **SKIP ONLY IF**: Pure unit testing (with complete mocking) or unique JavaScript (Vitest/happy-dom) tests.
- **CONSEQUENCE OF IGNORING**: Tests fail CI/CD due to SQLite/MySQL incompatibility or unduly pollute the local development base `conn2flow_test`.

---

1. Prefer SQLite in memory for pure functions, isolated CRUD and flow with transport/resolvers injection.
2. When MySQL semantics are indispensable, use only the dedicated database `conn2flow_test` in the local container.
3. Never run destructive tests against database development `conn2flow`.
4. Create the required minimum schema, isolate fixtures and remove the database/test tables at the end.
5. Use autorun guards to include controllers directly and inject PDO/configuration instead of relying on full bootstrap.
6. If a test changes manifests or versioned data files, restore only these side effects out of scope and confirm diff.

## Isolating `HookManager` and controlling time

- In PHPUnit `setUp()`, use `ReflectionClass` and its `ReflectionProperty` objects to snapshot and isolate the singleton state the test touches. Reset the static `instance` for a suite that owns the singleton, or isolate just the relevant `loaded` and `filters` entries if the suite shares it. Mark the test event as loaded and install an empty filter list or test doubles to avoid loading or firing real hooks. In `tearDown()`, undo those changes and restore the original singleton state to prevent leakage into other tests.
- Inject SQL execution and a clock so tests can use SQLite in memory and advance time deterministically. `tests/Unit/PHP/ComunicacaoFilaReq304Test.php` illustrates the seams `$_GESTOR['comunicacao-fila-db']` and `$_GESTOR['comunicacao-relogio']`, along with event isolation via Reflection.

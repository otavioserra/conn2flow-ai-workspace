---
name: c2f-project-pipeline-and-tasks
description: "READ BEFORE synchronizing, compiling, testing or deploying projects and sites. Requires the official proportional pipeline, consistent generated resources and CSS, sequential execution and visible logs."
user-invocable: false
---
# Projects Pipeline, Conn2Flow Declarative Authority and Tasks

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Sync Core changes to projects, build resources, test in local environment, or deploy projects/sites.
- **SKIP ONLY IF**: Isolated editing of Core files without need for propagation to projects.
- **CONSEQUENCE OF IGNORING**: Diverging files between Core and projects, `*Data.json` not recompiled, unapplied Phinx migrations, post-deploy hybrid state due to lack of `css:rebuild`, desynchronized database and suppression of PHP warns by improper parallelism.

---

## ⛔ Rule #1: A pipeline is not a file copy

### Build Proportionality Rule — REQ-075 / Core REQ-269

- **Category A — backend without HTML/classes/CSS/sources modified build:** use `./c2f project:deploy <id>` or `./c2f manager:update-all --skip-css` when local synchronization is required. For isolated Core, use the system pipeline. Tailwind's full build is prohibited in this category.
- **Category B — documentation, skills, unit tests and MDD memory:** only local checks/tests; prohibited running deploy pipeline in the Lab.
- **Category C — HTML screens, templates, components, Tailwind classes, CSS or configuration/sources compilation:** complete pipeline without `--skip-css`; Derived CSS needs to match published HTML. Mixed changes with CSS impact belong to C.

`--skip-css` already exists in the Core: the project pipeline passes the flag in steps 2/8 and 4/8 and the CSS jump derived in 7/8; the Tailwind jump system in 2/6 and CSS derived in 5/6. Data/metadata, files, database, JS and publication continue in the other steps. The surgical approach does not replace compilation/synchronization of resources authored by project. Do not make `resources:sync` complete separate to bypass the A economy. The flag does not change permissions, target environment, locks or content verification. The target of <45 seconds is dependent on the environment and requires measurement; in this batch of governance one does not deploy to demonstrate it.

> [!CAUTION]
> It is **strictly prohibited** sync changes between Core and projects using manual file copy (`cp`, `copy`, `Copy-Item`, `xcopy`). This results in:
> - `*Data.json` not recompiled (resources outdated in database)
> - Phinx migrations not applied (difference scheme)
> - Database SQL desynchronized with disk files
> - inconsistent mirror files (`dev-environment/data/sites/...`)
> - **Post-deploy hybrid state** (New HTML served with outdated CSS cache)

### Complete Pipeline for System (Category C / 6 steps):
```bash
./c2f manager:update-all
```
**Sequence checked in ManagerUpdateAllCommand.php**:
1. JavaScript authoring.
2. Resources: compilation of resources and metadata (`c2f resources:sync`).
3. Files: Sync files with the test environment.
4. Database: upsert and migrations.
5. CSS Rebuild: reconstruction of derivative CSS (dismissed in A with `--skip-css`).
6. Publication of assets in `dist/`.

### Standard pipeline for projects (95% of cases):
```bash
./c2f project:deploy <projectID>
```
Deploy publishes project via `deploy-project-v2.sh`. Do not assign to it the eight steps of `project:update-all` or the `--skip-css` flag, which the deploy wrapper does not pass on. Rule #8 describes only the mixed exception Core + project.

> [!IMPORTANT]
> **Prevention of the Post-Deploy Hybrid State**:
> In Category C, `css:rebuild` recalculates derivative CSS (`css_precompiled` and `css_compiled`) from real HTML in database. In Category A, without changing CSS sources, `--skip-css` does not require this step; do not force a separate build. This preserves correspondence between HTML and CSS without unnecessary build.

---

## 🏷️ Rule #2: Declarative Authority of `devProjects.<id>.local`

Before interacting with ANYproject, the agent MUST inspect the field`local`Doprojected`dev-environment/data/environment.json`:

```json
{
  "devProjects": {
    "transformamp": {
      "local": false
    },
    "transformamp-local": {
      "local": true
    }
  }
}
```

|`local` Value|Meaning|Agent Permissions|
|---|---|---|
|`true`|**Local test environment**| ✅ Total freedom: change, test, break, deploy, manipulate database|
|`false`|**Real production environment**| 🔒 Requires explicit authorisation and confirmation from the human operator|

> [!WARNING]
> Projects exist in pairs (e.g. `transformamp` / `transformamp-local`, `snapphoton` / `snapphoton-local`). Reading commands look identical, but **Deploy destination** and **database** are different. Always check `local` before any destructive operation.

---

## 📊 Rule #3: Source of Truth in Runtime

Conn2Flow runtime serves HTML and CSS exclusively from **DATA BANK** (`gestor.php:2782`). The `resources/` directory is read directly only under `DEVELOPMENT_ENV=true`.

**When investigating the behavior of a published page:**
1. **First**: Inspect database (`paginas`, `layouts`, `componentes` tables).
2. **Later**: Compare with `resources/` files to identify divergences.
3. **Never**: Assume that the disk content is what is being served to the visitor.

---

## 🔄 Rule #4: Equivalence Table VS Code Tasks ↔ CLI `c2f`

The tasks defined in `.vscode/tasks.json` are visual shortcuts to the native Core CLI commands:

|VS Code Task|CLI command Equivalent|Description|
|---|---|---|
| 🗃️ Projects - Sync Core → ID|`c2f project:sync-core <id>`|Sync the Color to the project mirror|
| 🗃️ Projects - Update All → ID (mixed batch only)|`c2f project:update-all <id>`|8 steps: JS → Core → DB → Resources → Files → DB → CSS Rebuild → dist; Category The uses --skip-css|
| 🚀 Projects - Deploy Project → ID|`c2f project:deploy <id>`|Deploy from project to target server|
| 📦 Manager - Update All|`c2f manager:update-all`|6 steps: JS → Resources → Files → DB → CSS Rebuild → dist; Category The uses --skip-css|
| 🎨 Tailwind - Sync Resources|`c2f resources:sync`|Build resources and generate `*Data.json`|
| 🧪 Manager - Run Tests|`c2f test:run`|Runs automated test suite|
| 🗄️ DB - Run Migrations|`c2f db:migrate`|Apply migrations Phinx pending|
| 🗄️ DB - Create Migration|`c2f db:create-migration <name>`|Create new Phinx migration|

> [!TIP]
> When documenting procedures or instructions for agents, always refer to **CLI command** (`c2f ...`) instead of the name of the VS Code task. CLI is universal and works in any terminal, IDE or CI/CD pipeline.

---

## ⚡ Rule #5: Exclusive Sequential Execution & Lot Parallelism Prohibition

> [!CAUTION]
> **Strict Prohibition of Parallel Compilation Commands**:
> Heavy compilation commands, database or batch synchronization (`css:rebuild`, `resources:sync`, `project:update-all`, `manager:update-all`, `db:migrate`) **strictly sequentially (one at a time)** should be run in the same environment/container.

**Why parallelism is destructive:**
1. **PHP Process Lock**: Multiple simultaneous processes competing with database and I/O lock the Docker container or leave outstanding connections.
2. **Silent Suppression of Warnings/Notices**: Running heavy commands in background or with redirects that suppress `stderr` hides vital runtime errors.
   - ==References== The `$fontesExtras` error without parameter in the method signature remained invisible for hours in Core because the command ran in background with suppressed buffer — the `tailwind_sources` were never applied and nothing in the terminal accused warning.

**Mandate Guidelines:**
* **Required Foreground**: Always run build commands in direct foreground.
* **Debuffered Output**: Never redirect outputs to discard `stderr` (`2>&1 > /dev/null`). Allow PHP news, warnings and stack tracks to be visible in the terminal immediately for hot fixes.
* **Strict Order**: Wait for a command to end with output code 0 before starting the next one.

---

## 🗑️ Rule #6: Cleanup of Orphan Records in Deploy (`deletar` List)

The database pipeline operates in **upsert** and **does not exclude** lines that were omitted in the sources JSON mode. To remove obsolete pages, blocks or metadata in deploy, explicitly register the natural keys in the `project_tables_config.json` file:

```json
{
  "tabelas": {
    "paginas": {
      "deletar": ["language", "modulo", "id"]
    },
    "publisher_pages": {
      "deletar": ["language", "page_id"]
    }
  }
}
```

### 6.1 Seed Pages (`without_permission`)

For template pages that generate dynamic daughter instances (e.g. product seed`store/<id>/`), **remove**the property`without_permission`of the seed for which:
- The seed itself does not appear on the sitemap (it is not a real public page).
- Only public daughter pages generated from the seed appear on the sitemap.

---

## 🧠 Rule #7: Deploy Memory Blow Diagnosis via API

The `/_api/project/update` endpoint performs database synchronization with `SELECT *` and `fetchAll`. In projects with hundreds of pages, a standard 128 MB `memory_limit` burst can occur, generating HTTP 500 without a descriptive body.

### Mandatory Diagnosis

In front of HTTP 500 on the API:

1. Inspect session log and then access log from Nginx ( HTTP code, bytes and time).
2. Correlate `conn2flow-gestor/logs/php-error.log` at the same time; seek `Allowed memory size of ... bytes exhausted` only as a hypothesis to confirm.
3. Check database SQL after logs. The Core endpoint was set to invoke `api_memoria_minima('1024M')`; do not infer a memory failure solely from HTTP 500.

```bash
# Via SSH — verificar últimas linhas do log de erro
ssh usuario@host "tail -50 /path/to/conn2flow-gestor/logs/php-error.log"
```

> [!TIP]
> If the burst persists, consider increasing `memory_limit` in `.htaccess` or `php.ini` from the server, or optimizing sync query to use cursors instead of `fetchAll`.

---

## 🧭 Rule #8: Mixed exception Core + project — `project:update-all <id>` (8 steps)

The sequence of `ProjectUpdateAllCommand.php` has **eight** steps. Use this list when reading the log:

1. Minifying authored JavaScript
2. Syncing Core
3. Updating Database (core data)
4. Syncing Resources (project compilation: Tailwind by resource and `*Data.json`)
5. Syncing Files
6. Database Final Validation (project data)
7. Regenerating derived CSS
8. Publishing static assets in `dist/`

To run only the project compilation: `c2f project:sync-resources <id>`.

---

## 🔎 Rule #9: Output 0 does not prove that content has arrived

Real case (2026-10-01): Pipeline with 0, `publisher_pages` output with 76 updates and `paginas` with zero. The recording of `PaginasData.json` had failed silently (file locked in a synchronized folder). The core began to interrupt the compilation in this case, but the conference remains mandatory.

After publishing a content change, check **three points** in this order:

1. **The compiled data**: `grep` of new text in `gestor/db/data/PaginasData.json` of project. The resource (`resources/.../pagina.html`) file is not enough.
2. **The database log**: the `SYNC_FIM tabela=<tabela> +i ~u =s` line of step 5. `~0` in a table you changed is a problem sign.
3. **The page in the air**: the new text in HTTP response. Test that only compares the title does not perceive an ancient body.

`SKIP_NO_CHECKSUM_CHANGE tabela=<t>` means the table was not even compared. To exercise a synchronization rule that changed:

```bash
bash ai-workspace/en/scripts/dev-environment/updates-manager-database.sh --project <id> --tables <tabela> --force-all
```

---

## 🚦 Rule #10: One deploy at a time in the same environment

The SSH pipeline has no lock. Two agents publishing in the same environment generate 500/503 passenger responses and false validations.

- Before publishing and before validating, check if the environment is idle: date of modification of the `logs/atualizacoes-bd-<data>.log` log and the `resources/` folder in the destination. Less than two minutes: wait.
- Intermittent 500/503 failure on a route that responded 200 is, first of all, a deploy sign concurrent. Repeat with the idle environment before investigating the code.
- Tree shared with batch of other agent in progress is not pipeline origin: his unfinished work goes along. Preserve the origin and coordinate the agents; a worktree is only admitted with proven concurrency, human registration and consultation in case of doubt.

---

## 🧱 Rule #11: Synchronizer data rules

- `insert_only` is valid for `pk` and `natural_key` strategies. When changing the strategy of a table in the contract, check that the protections exist in the new branch of `sincronizarTabela()`.
- **Withdrawal per owner (DEC-136)**: What the owner stops delivering turns clash `retirado`, maintained until human confirmation. With withdrawal confirmed, tables without `status` undergo physical DELETE and require dump for recovery. Source incomplete generates undue withdrawals for analysis; never publish or confirm these withdrawals automatically.
- **Compilation of project uses the seeds of project.** Table declared by seedless core in project is skipped (`DYNAMIC_SKIP_PROJETO_SEM_SEMENTE`).
- The project pipeline runs **no backup** from the tables. Before validating data rule in an environment, photograph the tables involved (a read query saved in file) and compare later.

Author note: in the surgical route Core/database, --core-resources preserves the owner of Core seeds. Data and own resources of project require your specific synchronization; do not use this flag to transfer authorship.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

## REP-002 — manifest and diagnostic

`project:sync-core` and `sync-files` in the Lab record out of the manifest and can produce fake clashes. Prefer deploy/release; mass reconciliation requires simulation and human authorisation. Do not use this route as a routine shortcut.
“<etapa> failed” is HTTP failure: session log → Nginx access log (code and bytes) → `php-error.log` on time → database SQL. Chance of timeout/memory/session requires evidence.

Note REQ-077: `--skip-css` refers to the commands that implement it (`manager:update-all` and the exception `project:update-all`). The `ProjectDeployCommand.php` wrapper passes only project and `--contents`; do not prescribe this flag to `project:deploy`.

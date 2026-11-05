---
name: c2f-hooks-system
description: "READ BEFORE creating, intercepting or dispatching extensibility actions and filters. Prevents missing hooks.json registrations, lost parameters and silent side effects."
user-invocable: false
---

# Conn2Flow Hooks System (`gestor/bibliotecas/hooks.php`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create or consume extension points via `hook_do_action()` or `hook_apply_filters()`, or register handlers in `hooks.json` / `project/hooks/`.
- **SKIP ONLY IF**: Closed internal code of a module without needing interoperability with other modules or plugins.
- **CONSEQUENCE OF IGNORING**: Filters silently ignored for lack of registration in `hooks.json`, filter return corruption or improper monolithic coupling.

---

See and apply the following conventions when working with the Actions and Filters system in Conn2Flow:

## 1. Central Concept: Actions vs. Filters

* **Actions (`hook_do_action`)**: Used for side effects (logs, notifications, widgets). There's no return.
  ```php
  hook_do_action('admin-paginas', 'adicionar.banco', $id, $dados);
  ```
* **Filters (`hook_apply_filters`)**: Used for data transformation. Returns the modified value.
  ```php
  $titulo = hook_apply_filters('admin-paginas', 'titulo.salvar', $titulo_bruto);
  ```
* **Previous Checks**: `hook_has_actions('namespace', 'evento')` and `hook_has_filters('namespace', 'evento')`.

---

## 2. Native Interface Events (`interface.php`)

The platform fires automatic hooks for modules using the standard interface system:
* `adicionar.pre-banco`, `adicionar.banco` (`$id`, `$dados`), `adicionar.parametros`, `adicionar.pagina`.
* `editar.pre-banco`, `editar.banco` (`$id`, `$dados`), `editar.parametros`, `editar.pagina`.
* `excluir.banco` (`$id`), `status.banco` (`$id`, `$novoStatus`), `clonar.banco` (`$id`, `$dados`).

---

## 3. Record of Hooks via JSON (Source Only of Truth)

**Never enter directly into the `hooks` table** — the table is overwritten by `atualizacoes_hooks_sincronizar()` synchronization.

### A. In Modules (`modulos/<modulo>/<modulo>.json`):
```json
{
    "hooks": {
        "controllers": {
            "admin-paginas": "meu-modulo.hooks.php"
        },
        "actions": {
            "admin-paginas": {
                "adicionar.banco": {
                    "callback": "meu_modulo_page_added_hook",
                    "prioridade": 5,
                    "habilitado": 1
                }
            }
        },
        "filters": {}
    }
}
```

### B. In Project (`project/hooks/hooks.json`):
```json
{
    "controllers": {
        "admin-paginas": "admin-paginas.hooks.php"
    },
    "actions": {
        "admin-paginas": {
            "adicionar.pagina": "projeto_page_added_hook"
        }
    },
    "filters": {}
}
```

---

## 4. PHP Controller Structure (Callbacks)

* Project: `project/hooks/controllers/<namespace>.hooks.php`.
* In Modules: `modulos/<modulo>/<modulo>.hooks.php`.

Example of callback:
```php
function meu_modulo_page_added_hook(string $id, array $dados = []): void {
    global $_GESTOR;
    // Lógica do hook sem alterar o módulo emissor
}
```

---

## 5. Good Practice
* **Impotent Synchronization**: Run `atualizacoes_hooks_sincronizar()` (or via deploy tasks) to apply JSON changes to database.
* **Temporary Deactivation**: Use `"habilitado": 0` in JSON to disable a hook without removing the log.
* **Wildcard `*`**: Use `*` in the namespace to register global listeners in any module.

---

## 6. Dedicated Command Deploy and Hooks Sync

### 6.1 Synchronization Automatic on Deploy Pipeline

- The `hooks` table of the database is automatically synchronized during the database (`atualizacoes-banco-de-dados.php`) step performed by:
  - `./c2f project:deploy <projeto-id>` (full pipeline of a project)
  - `./c2f manager:update-all` (full pipeline of all projects)
- The `atualizacoes_hooks_sincronizar()` function is called internally, reading all `hooks.json` modules and project, and recreating the `hooks` table with updated records.
- **Guaranteed Impotence**: Synchronisation is idempotent — performing multiple times produces the same result. The table is reconstructed from the JSONs, which are the source of truth.

### 6.2 Command Dedicated `c2f project:sync-hooks <projeto-id>`

- To update **without running the complete pipeline** hooks (no migrations, no CSS rebuild, no resources:sync), use:
```bash
./c2f project:sync-hooks <projeto-id>
```
- This command was implemented in REQ-174/BATCH-179 specifically to allow isolated hook updates during development.
- **Main Use Case**: After editing a `hooks.json` module or project, run only `project:sync-hooks` to reflect changes in database without the full pipeline overhead.
- **Quick Check**: After syncing, confirm on database:
```sql
SELECT * FROM hooks WHERE namespace = 'meu-modulo' ORDER BY prioridade;
```

> [!IMPORTANT]
> Never enter or update records directly into the `hooks` table via SQL. The table is **overwritten in full** at each synchronization. Manual changes will be lost in the next deploy.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

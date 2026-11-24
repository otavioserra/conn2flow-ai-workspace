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

---

## 7. Multi-Provider Broadcast Hooks (`plataforma_gateways`)

`plataforma_gateways_disparar_hook()` (`gestor/controladores/plataforma-gateways/plataforma-gateways.php`) reads `hooks.plataforma_gateways` from each active module's JSON, includes the referenced file and calls `<module_id_with_underscores>_plataforma_gateways()` with `['gateway' => ..., 'action' => ..., 'data' => ...]`. On the legacy route (`/_gateways/{gateway}/{endpoint}`) there is no target module: the event is **broadcast to every module**, in sequence, until one of them returns `processed => true`.

- **Guard at the top**: the listener checks whether the gateway and action belong to its module and returns immediately otherwise.
- **Never end the request for someone else's event**: no `echo`, `header()`, `http_response_code()`, `exit` or `die` when the gateway is not yours. Doing so breaks the loop and blocks every other module in the queue. The HTTP response is emitted by the `plataforma-gateways` controller.
- **Return `processed => true` only when you handled the event**. That return ends the broadcast and is used to acknowledge the webhook. When no module returns `processed`, the Core answers `503` so the provider redelivers (`401` when the reason is an invalid signature).

```php
function meu_modulo_plataforma_gateways(array $params) {
    $gateway = $params['gateway'] ?? '';
    if ($gateway !== 'mercadopago') return null; // another gateway's event: let the queue continue

    if (($params['action'] ?? '') === 'webhook') {
        // ... handle the event already validated by the Core ...
        return ['processed' => true];
    }
    return null;
}
```

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- For project-only changes, use `./c2f project:deploy <id>`; in that routine `project:update-all` is forbidden. To sync and validate Core changes in a project Lab (`local: true`), use `./c2f project:update-all <id>` both in mixed batches and in Core-only batches. To update the isolated system/manager, use `./c2f manager:update-all`. In Category A, add `--skip-css` to the update-all commands; `project:deploy` does not accept that flag.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

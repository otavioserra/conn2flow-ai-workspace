---
name: c2f-database-operations
description: "READ BEFORE SQL queries, CRUD through banco.php or Phinx migrations. Prevents escaping errors, multilingual query failures and production data corruption."
user-invocable: false
---

# Database and Migration operations (`banco.php` / Phinx)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create or modify SQL queries, CRUD operations (`banco_select`, `banco_insert_name`, `banco_update`, `banco_delete`) or migrations from database with Phinx.
- **SKIP ONLY IF**: Purely frontend/CSS task without any interaction with database.
- **CONSEQUENCE OF IGNORING**: Silent escaping (`banco_escape_field`), multi-language breach of queries due to lack of `language` or integrity/snapshot error in edits.

---

See and apply the following conventions when performing selections, insertions, edits, deletions and migrations in Conn2Flow:

## 1. CRUD operations (`gestor/bibliotecas/banco.php`)

* **Multiple Selection (`banco_select_name`)**:
  ```php
  $registros = banco_select_name(
      banco_campos_virgulas(['campo1', 'campo2']),
      'nome_da_tabela',
      "WHERE status='A' ORDER BY nome ASC"
  );
  if ($registros) {
      foreach ($registros as $item) {
          $campo1 = $item['campo1'];
      }
  }
  ```

* **Unique Selection (`banco_select`)**:
  ```php
  $linha = banco_select([
      'unico' => true,
      'tabela' => 'nome_da_tabela',
      'campos' => ['campo1', 'campo2'],
      'extra' => "WHERE id='meu-id' AND status='A'"
  ]);
  ```

* **Data Insertion (`banco_insert_name`)**:
  ```php
  $campos = null;
  $campos[] = ['campo_nome', 'valor_texto', false]; // Texto (com aspas)
  if (isset($_REQUEST['post_nome'])) {
      $campos[] = ['campo_nome2', banco_escape_field($_REQUEST['post_nome']), false]; // Escape seguro
  }
  $campos[] = ['data_criacao', 'NOW()', true]; // Sem aspas simples (função MySQL/numérico)

  banco_insert_name($campos, 'nome_da_tabela');
  ```

* **Data Editing (`banco_update` / `banco_update_campo`)**:
  - Integrity check before editing: `banco_select_campos_antes_iniciar(...)`.
  - Direct field editing:
    ```php
    banco_update_campo('status', 'I');       // Com aspas simples (texto)
    banco_update_campo('versao', 2, true);   // Sem aspas simples (numérico/função)
    banco_update_executar('tabela', "WHERE id='id-alvo'");
    ```

* **Data Deletion (`banco_delete`)**:
  ```php
  banco_delete('nome_da_tabela', "WHERE id='id-alvo'");
  ```

---

## 2. Phinx Migrations (`Phinx\Migration\AbstractMigration`)

* **File Nomenclature**: `YYYYMMDDHHIISS_create_nome_table.php` (e.g. `20260502100001_create_skeleton_table.php`).
* **Table Standard Structure Conn2Flow**:
  ```php
  <?php
  declare(strict_types=1);

  use Phinx\Migration\AbstractMigration;

  final class CreateSkeletonTable extends AbstractMigration
  {
      public function change(): void
      {
          $table = $this->table('skeleton', ['id' => 'id_skeleton']);
          
          $table
              // Vínculo de usuário
              ->addColumn('id_usuarios', 'integer', ['null' => true, 'signed' => false, 'default' => 1])
              
              // Identificação do registro
              ->addColumn('id', 'string', ['limit' => 255, 'null' => false, 'comment' => 'ID textual'])
              ->addColumn('nome', 'string', ['limit' => 255, 'null' => false, 'comment' => 'Nome exibido'])
              
              // Campos padrões de governança
              ->addColumn('language', 'string', ['limit' => 10, 'null' => false, 'default' => 'pt-br'])
              ->addColumn('status', 'char', ['limit' => 1, 'null' => false, 'default' => 'A', 'comment' => 'A=Ativo, I=Inativo, E=Excluído'])
              ->addColumn('versao', 'integer', ['null' => false, 'default' => 1])
              ->addColumn('data_criacao', 'datetime', ['null' => false, 'default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('data_modificacao', 'datetime', ['null' => false, 'default' => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'])
              
              // Índices
              ->addIndex(['id', 'language'], ['unique' => true])
              ->addIndex(['language'])
              
              ->create();
      }
  }
  ```

---

## 3. Concurrency and Atomic Patch on JSON (`JSON_MERGE_PATCH`)

### 3.1 Integral Rewriting Prohibition of JSON Fields in Competing Contexts

- In scenarios with competing writing (e.g. payment gateway webhook vs. user submission of form), **NEVER** read-modify-rewrite entire JSON columns like `fields_values`.
- This causes **race conditions** where one writer overwrites each other's changes.
- Example of the **WRONG** pattern:
```php
// ❌ ERRADO — Race condition entre webhook e formulário
$dados = json_decode(banco_select(...), true);
$dados['status_pagamento'] = 'pago';
banco_update_campo('fields_values', json_encode($dados));
```

### 3.2 Use `JSON_MERGE_PATCH` Mandate (MariaDB 11.8+ / MySQL 8+)

- Use `JSON_MERGE_PATCH()` for atomic partial updates:
```php
// ✅ CORRETO — Patch atômico sem race condition
$patch = json_encode(['status_pagamento' => 'pago']);
banco_update_campo('fields_values', "JSON_MERGE_PATCH(fields_values, '$patch')", true);
banco_update_executar('tabela', "WHERE id='id-alvo'");
```

- The `true` parameter (without quotation marks) is **CRITICAL** because `JSON_MERGE_PATCH()` is an SQL function.

### 3.3 `null` trap in `JSON_MERGE_PATCH` (RFC 7396)

- According to RFC 7396, a `null` value in the **Remove the key** patch of the target object.
- This means that `{"campo": null}` will **DELET** `campo` from JSON, NOT set as null.
- **Mandate Validation**: Always validate with `JSON_VALID()` before you merge:
```php
// ✅ Validação defensiva antes do merge
$patch = json_encode($dados_parciais);
if ($patch !== null && $patch !== 'null') {
    $sql = "UPDATE tabela SET fields_values = JSON_MERGE_PATCH(fields_values, '" . banco_escape_field($patch) . "') WHERE id='$id' AND JSON_VALID(fields_values)";
}
```

- **Prevention of Corruption by NULL SQL**: If the column itself is SQL `NULL` (not JSON `null`), `JSON_MERGE_PATCH(NULL, ...)` returns `NULL`. Always ensure that the column has a valid JSON default (`'{}'`):
```sql
ALTER TABLE tabela MODIFY fields_values JSON NOT NULL DEFAULT '{}';
```

---

## 4. Phinx Renumbered Migration Cleanup

### 4.1 Problem: Duplicate Migration Error

Pipeline file synchronization (`project:update-all`) operates on **additive mode** and **does not remove** missing files at source. When a Phinx migration is renumbered (e.g. to resolve timestamp conflict with another agent), the file with the old name remains in the destination directory.

```
❌ Phinx aborta com erro fatal:
"Duplicate migration - 20260915120000_create_orders_table has the same version as 20260915120000"
```

### 4.2 Normative Directive

By renumbering a Phinx migration to resolve timestamp conflict:

1. **After explicit confirmation of the human, remove manually** the file with the old name of the destination directory (`gestor/db/migrations/` in remote environment or mirror) **before** to run the pipeline.
2. In remote environments, use SSH to delete:
```bash
ssh usuario@host "rm /path/to/gestor/db/migrations/YYYYMMDDHHIISS_old_name.php"
```
3. In the local mirror:
```bash
rm dev-environment/data/sites/localhost/<site>/gestor/db/migrations/YYYYMMDDHHIISS_old_name.php
```

### 4.3 Rules of Dispatch between Agents

In timestamp collisions between migrations created by competing agents, the tie-breaker rule determines that each **renumber migration itself** agent for a more recent timestamp (never that of the other agent).

> [!WARNING]
> The `Duplicate migration` error is **fatal** — Phinx stops all migration execution, preventing subsequent migrations from being applied. Manual cleaning is mandatory.

---

## 5. Data synchronization in the deploy: what protects and what erases

Deploy is not only `INSERT`/`UPDATE`: Synchronizer applies rules of contract `schema-metadata.json`, and miss one of them changes actual data of an installation.

|Rule|Effect|
| --- | --- |
|`insert_only: true`|The record that already exists is never updated. It is what protects `usuarios`: without this, the seed rewrote login, e-mail and administrator password|
|`preserve_on_user_modified`|Listed fields are not overwritten when `user_modified=1`|
|`strategy` (`pk` or `natural_key`)|Define the branch of `sincronizarTabela()`. All protection must exist in both.|
|Withdrawal per owner|Withdrawal turns clash pending; only human confirmation allows deactivation or DELETE (DEC-136)|

### Working rules

- **Seed is not given from installation.** What the seed creates is the initial state. Everything the operator changes then has to survive a deploy.
- **Synchronization log cannot bring a secret.** Password column, token or key is masked before going to log.
- **Shoot first.** Reading query of identity tables and permission before and after validating a data rule in an environment; `diff` of the two results.
- **Test both branches.** New rule in sync has `strategy: pk` test and `strategy: natural_key` test.
- **MariaDB and MySQL differ**: `CAST(... AS JSON)` breaks in MariaDB; `JSON_QUERY` does not exist in MySQL. Use `JSON_EXTRACT(x, '$')` and test both.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

## Rep-002 — Physical and Unicode withdrawal

DEC-136: keep records by default; `status='D'` and `DELETE` require human confirmation. Check schema and `RECURSOS_RETIRADA ... removidos=` before proposing repair. Tables without column `status`, such as `variaveis`, suffer physical DELETE when withdrawal is confirmed: there is no logical reactivation. Validate the previous dump, restore in auxiliary database, compare PKs/status/absences and simulate before applying the authorized repair.
clashes diff tables and columns (`atualizacoes_choques.diff`) should use `utf8mb4`, including connection, to preserve emojis and avoid INSERT rejected in MariaDB. Check recording return; do not mute errors.

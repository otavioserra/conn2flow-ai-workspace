# CURRENT HANDOFF — BATCH-055 / REQ-053

* **De:** Macro-Arquiteto (Antigravity)
* **Para:** Executor Tático (Claude Code / VS Code / Codex)
* **Status:** `READY_FOR_EXECUTION`
* **Data:** 2026-09-03
* **Repositório Principal:** `conn2flow-ai-workspace` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Repositório Core:** `conn2flow` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`)

---

## 🎯 Instruções para o Executor

Implementar a requisição **`REQ-053`** detalhada em [sdd/human-requests/req-053.md](../human-requests/req-053.md):

### 1. Extensão VS Code (`vscode-extension/`):
- Em `src/vmDiagnosticsPolicy.ts`:
  * No método `buildVmLogCommand`: incluir `sudo` na chamada de cauda (`sudo tail -n 100 -- '${remoteLog}'`), pois os logs `php-error.log` (mode 640 de admin) e `nginx-error.log` (em `/var/log/nginx/`) exigem privilégio de leitura.
  * Atualizar os testes unitários de `vmDiagnosticsPolicy.test.cjs` e rodar `npm test`.

### 2. Core CLI (`conn2flow`):
- Em `cli/src/Commands/CssRebuildCommand.php`:
  * No método `regenerarViaSsh()`: em vez de invocar `./c2f` (que não existe nas raízes web de Gestores implantados), invocar diretamente o script PHP canônico da instalação remota:
    ```php
    $argv = [
        'php',
        'controladores/agents/arquitetura/css-regenerar.php',
        '--gestor=.',
    ];
    ```
    (Exatamente da mesma forma que `CssAuditCommand.php` já faz com sucesso para `css-auditoria.php`).
- Em `gestor/controladores/agents/arquitetura/tailwind-recursos.php`:
  * Em `tailwind_recursos_resolver_command()`: caso `$localCandidates` esteja vazio, testar se `tailwindcss` existe no PATH do sistema (`which tailwindcss`) antes de falhar.
  * Em `css-regenerar.php`: permitir a resolução de `@import "tailwindcss/utilities.css"` em ambientes sem `node_modules` local, detectando `NODE_PATH` global (`/opt/node-v22.22.3-linux-x64/lib/node_modules`).
- Em `tests/Unit/PHP/ProjectSshPublicPathReq050Test.php`:
  * Corrigir a portabilidade de asserções entre Windows e Linux (onde `escapeshellarg()` escapa aspas internas como `'\''`), fazendo com que o CI do GitHub Actions (Ubuntu) passe 100% verde no workflow de release.

### 3. Validação e Handoff:
- Executar `npm test` em `vscode-extension/`.
- Executar testes PHPUnit no Core CLI.
- Executar `c2f project:update-all conn2flow-site-local` e validar que a etapa 6/8 conclui sem o erro `./c2f: command not found`.
- Emitir recibo em `completions/BATCH-055-executor-receipt.json`.

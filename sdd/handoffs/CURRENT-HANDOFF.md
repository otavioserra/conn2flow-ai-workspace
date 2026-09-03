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

### 2. Core CLI e Scripts (`conn2flow`):
- Em `ai-workspace/en/scripts/projects/sync-core-to-project.sh`:
  * Sincronizar o executável `c2f` e a pasta `cli/` para a instalação remota quando `deploy_mode: "ssh"` (ou projeto mestre `conn2flow-site`), permitindo que a VM tenha o CLI completo na raiz do Gestor.
- Em `cli/src/Commands/CssRebuildCommand.php`:
  * No método `regenerarViaSsh()`: implementar estratégia inteligente de **duplo modo**:
    1. Se o binário `./c2f` ou `c2f` existir no destino remoto, executa via CLI (`./c2f css:rebuild`).
    2. Caso contrário, executa o fallback chamando diretamente `php controladores/agents/arquitetura/css-regenerar.php --gestor=.`.
- Em `gestor/controladores/agents/arquitetura/tailwind-recursos.php`:
  * Em `tailwind_recursos_resolver_command()`: caso `$localCandidates` esteja vazio, testar se `tailwindcss` existe no PATH do sistema (`which tailwindcss`) antes de falhar.
  * Em `css-regenerar.php`: permitir a resolução de `@import "tailwindcss/utilities.css"` em ambientes sem `node_modules` local, detectando `NODE_PATH` global (`/opt/node-v22.22.3-linux-x64/lib/node_modules`).
- Em `tests/Unit/PHP/ProjectSshPublicPathReq050Test.php`:
  * Corrigir a portabilidade de asserções entre Windows e Linux (onde `escapeshellarg()` escapa aspas internas como `'\''`), fazendo com que o CI do GitHub Actions (Ubuntu) passe 100% verde no workflow de release.
- Em `dev-environment/data/environment.json`:
  * Assegurar que `snapphoton-local` e `conn2flow-site-local` usem `"ssh_host": "lab.conn2flow.local"`.

### 3. Validação e Handoff:
- Executar `npm test` em `vscode-extension/`.
- Executar testes PHPUnit no Core CLI.
- Executar `c2f project:update-all conn2flow-site-local` e validar que a etapa 6/8 conclui com sucesso.
- Emitir recibo em `completions/BATCH-055-executor-receipt.json`.

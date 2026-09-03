# CURRENT HANDOFF — BATCH-054 / REQ-052

* **De:** Macro-Arquiteto (Antigravity)
* **Para:** Executor Tático (Claude Code / VS Code / Codex)
* **Status:** `READY_FOR_EXECUTION`
* **Data:** 2026-09-03
* **Repositório Principal:** `conn2flow-ai-workspace` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Repositório Core:** `conn2flow` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`)

---

## 🎯 Instruções para o Executor

Implementar a requisição **`REQ-052`** detalhada em [sdd/human-requests/req-052.md](../human-requests/req-052.md):

### 1. Core CLI (`conn2flow`):
- `CssAuditCommand.php`: adicionar resolução SSH para projetos `deploy_mode: "ssh"`, delegando a auditoria via SSH na VM e devolvendo a saída sem exigir `.env` local.
- `ProjectUpdateAllCommand.php`: para projetos onde `local: true` e `deploy_mode: "ssh"`, permitir que a etapa 6/8 (`css:rebuild`) passe `--confirmar-remoto` automaticamente.
- Versionar `.tailwind-build-manifest.json` com os 237 recursos em cache.

### 2. Extensão VS Code (`conn2flow-ai-workspace/vscode-extension`):
- `commandRunner.ts` e afins: substituir `vscode.window.showInformationMessage` para operações de rotina (prompt copiado, conclusão simples) por `vscode.window.setStatusBarMessage(..., 3000)`. Manter pop-ups exclusivamente para erros, avisos e confirmações críticas.
- `extension.ts`:
  * No `updateAllTarget` e `updateAllWithSelect`: passar `--confirmar-remoto` se `ProjectsManager.isTargetVm()`.
  * Na barra de status: reexecutar `updateStatusBar()` em eventos de troca de projeto ou settings; se o projeto for VM, exibir `$(vm) Conn2Flow VM` e fornecer atalho de logs.
  * No menu Diagnóstico: adicionar ações para ler logs da VM (`php-error.log`, `nginx-error.log`).
  * Adicionar comando de busca rápida `conn2flow.docs.search` indexando `ai-workspace/pt-br/docs`.
  * No preview Markdown: preservar modo preview em links clicados internamente.
- `package.json`:
  * Atualizar versão para `1.1.0`.
  * Adicionar script de version bump para novos empacotamentos.

### 3. Validação e Handoff:
- Executar `npm test` em `vscode-extension/` (assegurando 100% verde).
- Executar testes PHPUnit no Core CLI.
- Executar `php cli/c2f.php ai:sync`.
- Emitir recibo em `completions/BATCH-054-executor-receipt.json`.

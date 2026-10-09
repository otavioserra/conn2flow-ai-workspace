# BATCH-044 — Watcher Autônomo na Extensão, Sessão Compartilhada e Usabilidade de Release

## Estado

- **Requisição:** REQ-042
- **Status:** `ready-for-review`
- **Modo:** `supervisionado` / `autonomo_monitorado`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`

## Live Todo List

- [x] Inicializar rastreamento do lote BATCH-044 e estrutura de sessões.
- [x] Implementar tool `log_session_event` no MCP Hub e criar diretório `sdd/sessions/`.
- [x] Implementar `HubTaskWatcher` na extensão VS Code com toggle de Ativo/Pausado na árvore.
- [x] Implementar botão "Salvar e Executar Release" em `actionFormPanel.ts` integrado ao `releaseManager.ts`.
- [x] Adicionar feedback visual imediato de loading (Status Bar / Progress) nos comandos da extensão.
- [x] Adicionar e atualizar suíte de testes automatizados (`npm test` no MCP Hub e extensão).
- [x] Emitir evento de sessão e recibo estruturado de conclusão do Executor.

## Evidências

- **HubTaskWatcher**: Serviço implementado em `vscode-extension/src/providers/hubTaskWatcher.ts` com política isolada em `vscode-extension/src/hubTaskWatcherPolicy.ts` e toggle de árvore na seção Agents.
- **Sessão Compartilhada**: Tool MCP `log_session_event` implementada no MCP Hub e timeline iniciada em `sdd/sessions/batch-044-stream.md`.
- **Feedback Visual Instantâneo**: `setStatusBarMessage` com `$(sync~spin)` ativado em carregamentos e preparações.
- **Salvar e Executar Release**: Botão primário integrado no formulário `actionFormPanel.ts` disparando esteira direta via `releaseManager.ts`.
- **Testes Automatizados**:
  - `npm test` em `vscode-extension/`: 53/53 testes PASS (0 falhas).
  - `npm test` em `mcp-hub/`: 2/2 testes PASS (0 falhas).
- **Recibo MCP**: `completions/BATCH-044-executor-receipt.json` emitido com status `success`.

## Próximo Passo

- Revisor Técnico realizar a auditoria independente (`sdd/validation/review-044.md`).

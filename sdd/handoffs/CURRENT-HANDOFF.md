# Handoff do Macro-Arquiteto — REQ-042 / BATCH-044

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Claude Code)
* **Data**: 2026-08-31
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: [req-042.md](../human-requests/req-042.md)
* **Topologia**: `triade`
* **Autonomia**: `supervisionado` / `autonomo_monitorado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-042** implementa a esteira autônoma e de usabilidade do Conn2Flow:

### 1. Watcher Autônomo da Tríade na Extensão (`src/providers/hubTaskWatcher.ts`)
- Implementar o serviço `HubTaskWatcher` na extensão do VS Code escutando a pasta `tasks/` e `completions/` via `vscode.workspace.createFileSystemWatcher`.
- Adicionar item de controle na barra lateral da árvore do Conn2Flow para alternar entre `Ativo` e `Pausado`.
- Ao receber nova tarefa despachada, exibir notificação transitória na Status Bar (`$(sync~spin)`).

### 2. Sessão Compartilhada de Lote (`sdd/sessions/batch-YYY-stream.md`) & Identidade de Agentes
- Criar o diretório `sdd/sessions/`.
- No `mcp-hub`, implementar a tool `log_session_event(batch_id, agent_id, role, summary)` que faz append estruturado na timeline da sessão.

### 3. Feedback Visual de Loading Instantâneo
- Nos comandos assíncronos da extensão (`conn2flowTreeProvider.ts`, `releaseManager.ts`, `extension.ts`), envolver o início da execução com feedback visual imediato (`vscode.window.withProgress` ou atualização da Status Bar com `$(sync~spin)`).

### 4. Botão "Salvar e Executar Release" no Formulário de Preparação
- Em `vscode-extension/src/providers/actionFormPanel.ts`:
  * Adicionar o botão primário `"Salvar e Executar Release"` no rodapé do formulário.
  * Ao ser clicado, submeter com `{ type: 'submit', action: 'save_and_execute', values }`.
- Em `vscode-extension/src/providers/releaseManager.ts`:
  * Tratar a ação `save_and_execute`: salvar o rascunho em `workspaceState` e disparar imediatamente `this.execute(product, onChanged)`.

### 5. Testes Automatizados
- Adicionar testes cobrindo a ação de "Salvar e Executar" e a detecção de eventos no watcher.
- Rodar `npm test` em `vscode-extension/` (garantir que todos os testes passem).

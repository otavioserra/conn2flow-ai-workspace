# Handoff do Macro-Arquiteto — REQ-039 / BATCH-041

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / VS Code Extension)
* **Data**: 2026-08-31
* **Requisição Ativa**: [req-039.md](../human-requests/req-039.md)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-039** foi aberta para resolver o problema de monitoramento do GitHub Actions após o disparo do release no VS Code:

### 1. Problema Diagnosticado
No arquivo `vscode-extension/src/providers/releaseManager.ts`:
- O método `findWorkflowRun(root, workflow, tag)` executa `gh run list --workflow <workflow> --json databaseId,headBranch --limit 20` e pega a primeira run com `headBranch === tag`.
- Se houve uma execução anterior com falha para essa mesma tag, o `gh run list` retorna a execução antiga com falha.
- Em seguida, o VS Code dispara `gh run watch <run-antiga-com-falha> --exit-status`, que falha imediatamente com o erro:
  `Run Release Gestor (...) has already completed with 'failure'`.
- Por conta disso, a extensão aborta na linha 372 (`if (!workflow.succeeded) return;`), **sem limpar o rascunho de release** e sem mostrar a notificação de sucesso para o usuário, mesmo que a run atual tenha sido iniciada com sucesso.

### 2. Implementação Solicitada
1. **Em `releaseManager.ts`**:
   - Ajustar a assinatura ou chamador para guardar o momento do disparo: `const triggeredAfter = new Date();` antes do comando de release ser chamado.
   - No método `findWorkflowRun`:
     * Chamar `gh run list` solicitando os campos adicionais: `databaseId,headBranch,status,conclusion,createdAt`.
     * Filtrar itens onde `item.headBranch === tag`.
     * Descartar runs cujo `createdAt` seja nitidamente anterior ao momento do disparo, ou cujo `status === 'completed'` e `conclusion === 'failure'`.
     * Priorizar runs cujo `status === 'in_progress'` ou `status === 'queued'`.
     * Se a run mais recente já estiver com `status === 'completed'` e `conclusion === 'success'`, retornar diretamente sem travar.
     * Continuar nas tentativas de polling (`attempt < 20`) aguardando a nova run aparecer.
   - Garantir que, após o watch bem-sucedido (ou caso a run conclua com sucesso), o rascunho seja limpo (`workspaceState.update(this.draftKey(product), undefined)`), a árvore dê refresh e o diálogo de sucesso seja exibido.

2. **Testes Unitários**:
   - Adicionar teste em `test/releasePolicy.test.cjs` para a função/lógica de seleção de workflow run (descarte de runs antigas falhadas e seleção da run correta).
   - Executar `npm test` para garantir 100% de aprovação.

3. **Compilação e Instalação**:
   - Compilar o `.vsix` e atualizar a instalação local com:
     `code --install-extension vscode-extension/conn2flow-tools-1.0.0.vsix --force`.

---

## 📝 Protocolo de Execução
1. Renderize a sua Live Todo List (`[ ]` ➔ `[x]`).
2. Implemente a correção.
3. Ao concluir, atualize `CURRENT-HANDOFF.md` e `CURRENT.md` para `READY_FOR_REVIEW` para que o Revisor Técnico faça a auditoria.

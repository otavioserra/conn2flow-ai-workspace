# Handoff do Macro-Arquiteto — REQ-038 / BATCH-040

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / VS Code Extension)
* **Data**: 2026-08-31
* **Requisição Ativa**: [req-038.md](../human-requests/req-038.md)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-038** foi aberta para corrigir dois problemas de UX e reatividade encontrados durante os testes do Humano-no-Loop no VS Code:

### 1. Reatividade Completa no Painel Webview de Preparação (`actionFormPanel.ts`)
- No método `updateSemverPreview` do client-side do formulário:
  * Quando o usuário mudar o select `releaseType` (patch ➔ minor ou major), atualmente apenas `nextVersion` e `tag` são atualizados.
  * O código DEVE atualizar também os campos `tagMessage`, `commitMessage` e `releaseNotes`, substituindo qualquer menção da versão anterior (`currentVersion` ou a versão calculada anteriormente) pela nova versão e nova tag.
  * Exemplo: Se estava `Conn2Flow Gestor v2.9.52`, ao mudar para minor deve virar `Conn2Flow Gestor v2.10.0`.

### 2. Eliminação do Clique Mudo em "Executar Release" (`conn2flowTreeProvider.ts` & `releaseManager.ts`)
- Em `conn2flowTreeProvider.ts`, no método `releaseExecutionItem()`:
  * Atualmente, se `canExecute` for falso, o item é instanciado com `command = undefined`. Isso faz com que o clique do usuário seja ignorado pelo VS Code!
  * **O item DEVE SEMPRE ter o comando registrado** (`conn2flow.release.executeManager` ou `conn2flow.release.executeInstaller`), mesmo quando estiver bloqueado (com o ícone `lock`).
- Em `releaseManager.ts`:
  * No método `execute()`: quando chamado e o gate estiver bloqueado, deve exibir uma notificação clara com `vscode.window.showWarningMessage` listando exatamente quais são os impeditivos (ex: permissão, árvore suja, documentos) e fornecer botões de ação úteis ("Abrir Preparação", "Controle de Código-Fonte").
  * Ao salvar o rascunho em `prepare()`, chamar `refreshAll()` / `onChanged?.()` para atualizar a árvore do VS Code e recalcular o estado de liberação na hora.

### 3. Validação e Testes
- Adicionar testes cobrindo a substituição de templates de mensagens de release e o comportamento do clique bloqueado.
- Rodar `npm test` (garantir 100% PASS).
- Compilar o `.vsix` e atualizar a instalação local com `code --install-extension vscode-extension/conn2flow-tools-1.0.0.vsix --force`.

---

## 📝 Protocolo de Execução
1. Renderize a sua Live Todo List (`[ ]` ➔ `[x]`).
2. Implemente as correções.
3. Ao concluir, atualize `CURRENT-HANDOFF.md` e `CURRENT.md` para `READY_FOR_REVIEW` para que o Revisor Técnico faça a auditoria.

# Handoff do Macro-Arquiteto — REQ-037 / BATCH-039

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Claude Code / VS Code Extension)
* **Data**: 2026-08-31
* **Requisição Ativa**: [req-037.md](../human-requests/req-037.md)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Autonomia**: `supervisionado` (sem commits/pushes amplos não autorizados)

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-037** foi formalizada e aprovada pelo Humano-no-Loop.

Sua missão neste lote (**BATCH-039**) contempla:

1. **Reconciliação de Código (`extension.ts`)**:
   - Restaurar o código íntegro de `vscode-extension/src/extension.ts` que havia sido sobreposto por uma versão legada.
   - Manter os 51 comandos e os gerenciadores (`LocalizationManager`, `BacklogManager`, `ReleaseManager`, `Workspace Trust`).

2. **Estabilização do Preview Markdown**:
   - No modo `preview`, eliminar o acúmulo de abas `TabInputText` (código-fonte dos `.md`) que ficam abertas em segundo plano.
   - Assegurar que apenas a aba de preview ativa receba o foco ao navegar por vários arquivos markdown sequencialmente (ex: Guia do Painel, depois Marketplace, depois CLI).

3. **Release em Duas Fases (Preparar Release x Executar Release)**:
   - **Fase 1 (Preparar)**: Abre o painel mesmo com árvore de trabalho suja, exibindo os diagnósticos (permissão, branch, arquivos alterados) e gerando rascunhos de mensagens no `workspaceState`.
   - **Fase 2 (Executar)**: Permanece estritamente travada/desabilitada até que a árvore de trabalho esteja limpa (`git status --porcelain` vazio).

4. **Sincronização Mandatória de Documentação Pré-Release**:
   - Antes do release, verificar/sincronizar:
     * `README.md` (EN) e `README-PT-BR.md` (PT-BR).
     * `CHANGELOG.md`.
     * Workflows em `.github/workflows/*.yml`.
   - Aplicar `c2f-documentation-governance` e `c2f-multilingual-system`.

5. **Testes e Build**:
   - Adicionar/atualizar testes em `vscode-extension/test/` cobrindo as políticas de preview e release.
   - Executar `npm test` (garantir que passe 100%).
   - Gerar e verificar o pacote VSIX.

---

## 📝 Protocolo Obrigatório de Execução
- Inicie renderizando sua **Live Todo List (`[ ]` ➔ `[x]`)** no chat.
- Ao concluir a implementação, atualize este arquivo `CURRENT-HANDOFF.md` e `sdd/human-requests/CURRENT.md` para `READY_FOR_REVIEW`.
- O Revisor Técnico (`c2f_reviewer`) fará a auditoria findings-first na sequência conforme a topologia Tríade.

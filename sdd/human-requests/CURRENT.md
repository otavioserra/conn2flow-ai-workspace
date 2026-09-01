# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-046.md](req-046.md)
* **Status**: `APPROVED`
* **Lote Relacionado**: `BATCH-048`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-01
* **Lote Anterior Concluído**: [req-045.md](req-045.md) (`BATCH-047`)

## 🎯 Instrução Imediata para o Executor

Implementar a **REQ-046 / BATCH-048** no repositório `conn2flow-ai-workspace`:
1. **Tooltips Ricos (`FEAT-005`)**: Adicionar descrições contextuais ricas de 1 a 2 frases para todos os nós da árvore em `localizationCatalog.ts` e arquivos de manifesto NLS (`pt-br` e `en`), configurando `TreeItem.tooltip = new vscode.MarkdownString(...)`.
2. **Curadoria de Documentação (`FEAT-006`)**:
   - Remover `docs.marketplace` e a duplicata `agents.selectMode` de `Documentações & Configurações`;
   - Atualizar a documentação do Manual Dev Tools v2 (`docs.panel`) com emojis, novos controles, releases e IA.
3. **Testes Unitários**: Criar testes em `vscode-extension/test/` e validar `npm test` (100% verde).
4. **Recibo MCP**: Emitir o recibo `completions/BATCH-048-executor-receipt.json`.

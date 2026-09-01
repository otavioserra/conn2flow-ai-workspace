# CURRENT HANDOFF — REQ-046 / BATCH-048

* **Origem**: Macro-Arquiteto
* **Destino**: Agente Executor (Claude Code / Codex)
* **Data**: 2026-09-01
* **Topologia**: `dupla` (Supervisionado)
* **Repositório Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: `sdd/human-requests/req-046.md`

---

## 🎯 Instruções Técnicas para Execução

1. **Catálogos de Tooltips (`FEAT-005`)**:
   - Atualizar `vscode-extension/src/localizationCatalog.ts`, `vscode-extension/package.nls.json` e `vscode-extension/package.nls.pt-br.json`.
   - Incluir tooltips ricos com Markdown formatado (1 a 2 frases) para todos os comandos das seções `controles`, `sdd`, `core`, `projetos`, `diagnostico` e `docs`.
   - Configurar `TreeItem.tooltip` no `conn2flowTreeProvider.ts` para renderizar `vscode.MarkdownString`.

2. **Limpeza da Árvore e Manual v2 (`FEAT-006`)**:
   - Em `conn2flowTreeProvider.ts` (ou política de nós), remover a exibição de `docs.marketplace` e a duplicata `agents.selectMode` de `Documentações & Configurações`.
   - Atualizar a documentação apontada por `docs.panel` (Manual Dev Tools) para a versão v2, incluindo a árvore reorganizada com emojis, novos comandos de release e painéis de IA.

3. **Validação e Testes**:
   - Rodar `npm test` em `vscode-extension/`.
   - Gerar o VSIX (`npx @vscode/vsce package --no-dependencies`) e emitir o recibo MCP `completions/BATCH-048-executor-receipt.json`.

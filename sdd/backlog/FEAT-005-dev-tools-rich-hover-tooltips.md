# FEAT-005 — Tooltips Ricos e Explicativos na Árvore Dev Tools

* **Status**: `COMPLETED`
* **Tipo**: Usabilidade / Interface / DX
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Data de Conclusão**: 2026-09-01 (BATCH-048)

* **Repositório Alvo**: `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Atualmente, ao passar o mouse sobre os nós e comandos da árvore do `conn2flow-dev-tools`, o tooltip do VS Code exibe apenas o título básico do item, sem contexto adicional.

Para novos desenvolvedores e operadores do ecossistema, ter uma explicação contextual imediata na interface reduz a necessidade de consultar documentações externas e evita erros operacionais.

---

## 📋 Escopo Proposto

1. **Catálogo de Tooltips Bilíngue**:
   - Adicionar chaves de descrição/tooltip em `localizationCatalog.ts`, `package.nls.json` e `package.nls.pt-br.json` para todos os itens das seções:
     * `🎛️ Controles Principais`
     * `📐 SDD & Planejamento`
     * `⚡ Core & Releases`
     * `📁 Projetos Satélites`
     * `🩺 Diagnóstico & Infraestrutura`
     * `📚 Documentações & Configurações`
2. **Implementação no `Conn2FlowTreeProvider`**:
   - Configurar `TreeItem.tooltip` usando `vscode.MarkdownString` com 1 a 2 frases explicativas ricas sobre o propósito, quando acionar e eventuais cuidados.
3. **Testes Unitários**:
   - Garantir que todos os nós possuem tooltips preenchidos e válidos em `pt-BR` e `en`.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

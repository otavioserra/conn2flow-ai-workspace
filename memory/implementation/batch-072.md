# BATCH-072 — Revamp da Documentação Pública: Modernização dos READMEs Raiz e Descentralização em `docs/`

- **Projeto**: `conn2flow-ai-workspace`
- **Raiz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-070](../human-requests/req-070.md)
- **Status**: `ready-for-intake`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. Modernização dos READMEs da Raiz**:
  - [ ] 1.1 Redigir o novo `README.md` (Inglês) executivo, com hero section, badges, diagrama Mermaid limpo, quickstart e links para `docs/`
  - [ ] 1.2 Redigir o novo `README-PT-BR.md` (Português) em perfeita paridade com a versão em inglês
  - [ ] 1.3 Adicionar seção com sugestão de descrição e tópicos/tags para o repositório no GitHub
- [ ] **2. Criação das Novas Especificações em `docs/`**:
  - [ ] 2.1 Criar `docs/en/MDD-FRAMEWORK-SPECIFICATION.md` e `docs/pt-br/ESPECIFICACAO-FRAMEWORK-MDD.md` (4 camadas de memória, protocolo de poda, Regra dos 10, teto de 50 KB, hierarquia index.md e dual archive)
  - [ ] 2.2 Criar `docs/en/MDD-PYTHON-ECOSYSTEM-GUIDE.md` e `docs/pt-br/GUIA-ECOSSISTEMA-PYTHON-MDD.md` (MDD Client CLI & Daemon + MDD Hub & Documentation Watcher)
- [ ] **3. Atualização dos Documentos Existentes em `docs/`**:
  - [ ] 3.1 Atualizar `DOUBLE-AGENT-ARCHITECTURE.md` e `ARQUITETURA-AGENTE-DUPLO.md` para a Tríade MDD (Arquiteto, Executor, Revisor)
  - [ ] 3.2 Atualizar `SKILLS-CATALOG.md` e `CATALOGO-DE-SKILLS.md` para as 44 skills canônicas (incluindo `c2f-ai-features` com os 8 pilares)
  - [ ] 3.3 Atualizar `QUICKSTART-CLI-AND-MCP.md` e `GUIA-RAPIDO-CLI-E-MCP.md` com a CLI `mdd` e MCP Hub
  - [ ] 3.4 Atualizar `VSCODE-DEV-TOOLS-PANEL-GUIDE.md` e `GUIA-PAINEL-DEV-TOOLS-VSCODE.md` para v1.1.2 e integração dual
  - [ ] 3.5 Atualizar os índices `docs/en/README.md` e `docs/pt-br/README.md`
- [ ] **4. Auditoria de Links e Paridade**:
  - [ ] 4.1 Verificar que todos os links relativos entre READMEs raiz e `docs/` são 100% válidos
  - [ ] 4.2 Validar conformidade de formatação Markdown e paridade bilíngue
  - [ ] 4.3 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **Clareza e Concisão**: Os READMEs raiz devem ser limpos, convidativos e fáceis de ler em menos de 3 minutos.
2. **Paridade Estrita EN / PT-BR**: Qualquer conteúdo técnico criado em inglês deve ter seu correspondente fiel em português.
3. **Proibição de `git add .`**: Listar exclusivamente os arquivos adicionados ou modificados ao comitar.

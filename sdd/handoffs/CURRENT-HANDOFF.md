# Handoff do Macro-Arquiteto — REQ-043 / BATCH-045

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Claude Code)
* **Data**: 2026-08-31
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: [req-043.md](../human-requests/req-043.md)
* **Topologia**: `triade`
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-043** reorganiza a ergonomia da árvore de ferramentas no VS Code (`vscode-extension/src/providers/conn2flowTreeProvider.ts`):

### 1. Seção "Controles Principais" (antiga "Visão Geral")
- Renomear `overview` para "Controles Principais" (`overview.mainControls` / `overview.sectionTitle`).
- Conter:
  * Escopo SDD (`overview.scope`)
  * Projeto Alvo (`overview.target`)
  * Idioma (`overview.language`)
  * Topologia de Agentes (`overview.topology`)
  * Nível de Autonomia (`overview.autonomy`)
  * Watcher da Tríade (`agents.hubWatcherActive` / `hubWatcherPaused`)

### 2. Seção "SDD e Planejamento"
- Mover as ações operacionais de agentes para cá:
  * Iniciar Claude / Executor (`agents.launchClaude`)
  * Copiar Prompt do Executor (`agents.copyPrompt`)
  * Registrar Handoff (`agents.recordHandoff`)
  * Submeter para Revisão (`agents.prepareReview`)
- Manter os itens de navegação do SDD (Modo de Visualização, CURRENT.md, SPEC.md, Checklist, Browse Requests, Batches, Backlog, Decisions, Gardening).

### 3. Seção "Documentações e Configurações" (antiga "Agentes e Documentações")
- Renomear para "Documentações e Configurações" (`docs.sectionTitle`).
- Remover itens operacionais que foram para Controles Principais e SDD.
- Manter estritamente os guias e atalhos de settings:
  * Painel Dev Tools (`docs.panel`)
  * Publicação Marketplace (`docs.marketplace`)
  * CLI e Comandos (`docs.cli`)
  * Orquestração SDD (`docs.orchestration`)
  * Arquitetura do Core (`docs.architecture`)
  * Configurações Globais (`agents.selectMode`)

### 4. Sincronização e Testes
- Atualizar catálogos NLS (`package.nls.json`, `package.nls.pt-br.json`, `localizationCatalog.ts`).
- Atualizar e rodar `npm test` em `vscode-extension/` garantindo 100% dos testes verdes.
- Ao concluir, emita o recibo no MCP Hub e atualize para `READY_FOR_REVIEW`.

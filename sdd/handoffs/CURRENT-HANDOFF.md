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

Olá Executor! A **REQ-043** realiza a reorganização ergonômica da árvore do Conn2Flow no VS Code (`vscode-extension/src/providers/conn2flowTreeProvider.ts`).

⚠️ **REGRA DE OURO**: **NENHUM comando existente deve ser removido**. A infraestrutura e todas as opções existentes de Core, Releases, Projetos Satélites, Diagnósticos, SDD e Docs continuam 100% ativas e presentes, apenas reposicionadas de forma mais lógica e limpa.

🎨 **IDENTIDADE VISUAL VIVA**: Todos os rótulos de seções e itens da árvore nos catálogos NLS (`package.nls.json`, `package.nls.pt-br.json`, `localizationCatalog.ts`) devem receber **emojis Unicode coloridos** no início do texto para tornar a árvore super viva, visual e com alto contraste, acabando com a sensação de ícones PB apagados.


### 🌳 Mapa Completo da Nova Estrutura:

#### 1. 🎛️ Seção "Controles Principais" (antiga "Visão Geral")
- Renomear título para "Controles Principais" (`overview.mainControls` / `overview.sectionTitle`).
- Itens:
  1. `overview.scope` (`conn2flow.sdd.selectScope`)
  2. `overview.target` / `overview.noTarget` (`conn2flow.projects.setTarget`)
  3. `overview.language` (`conn2flow.settings.selectLanguage`)
  4. `overview.topology` (`conn2flow.modes.selectTopology`)
  5. `overview.autonomy` (`conn2flow.modes.selectAutonomy`)
  6. `agents.hubWatcherActive` / `agents.hubWatcherPaused` (`conn2flow.hub.toggleWatcher`)

#### 2. 📐 Seção "SDD e Planejamento"
- Ações de Agentes e Operação:
  1. `agents.launchClaude` (`conn2flow.bridge.launchClaudeGoal`)
  2. `agents.copyPrompt` (`conn2flow.bridge.copyPrompt`)
  3. `agents.recordHandoff` (`conn2flow.bridge.recordHandoff`)
  4. `agents.prepareReview` (`conn2flow.bridge.notifyArchitect`)
- Navegação e Gestão SDD (todos os itens mantidos):
  5. `sdd.selectScope` (`conn2flow.sdd.selectScope`)
  6. `sdd.viewMode` (`conn2flow.sdd.toggleViewMode`)
  7. `sdd.openCurrent` (`conn2flow.sdd.openCurrent`)
  8. `sdd.openSpec` (`conn2flow.sdd.openSpec`)
  9. `sdd.openChecklist` (`conn2flow.sdd.openChecklist`)
  10. `sdd.browseRequests` (`conn2flow.sdd.browseRequests`)
  11. `sdd.browseBatches` (`conn2flow.sdd.browseBatches`)
  12. `sdd.browseBacklog` (`conn2flow.sdd.browseBacklog`)
  13. `sdd.browseDecisions` (`conn2flow.sdd.browseDecisions`)
  14. `sdd.browseHandoffs` (`conn2flow.sdd.browseHandoffs`)
  15. `sdd.autoGardening` (`conn2flow.sdd.toggleAutoGardening`)
  16. `sdd.runGardening` (`conn2flow.sdd.runGardening`)
  17. `sdd.createGardening` (`conn2flow.sdd.createGardeningRequest`)

#### 3. ⚡ Seção "Core e Releases" (100% dos itens mantidos)
  1. `core.updateAll` (`conn2flow.manager.updateAll`)
  2. `core.syncResources` (`conn2flow.manager.syncResources`)
  3. `core.cssRebuild` (se target ativo) (`conn2flow.manager.cssRebuild`)
  4. `core.cssAudit` (se target ativo) (`conn2flow.manager.cssAudit`)
  5. `release.verify` (`conn2flow.release.verifyPermission`)
  6. `release.manager` (`conn2flow.release.manager`)
  7. `release.installer` (`conn2flow.release.installer`)
  8. `release.executeManager` (`conn2flow.release.executeManager`)
  9. `release.executeInstaller` (`conn2flow.release.executeInstaller`)
  10. `release.openActions` (se permitido) (`conn2flow.release.openActions`)

#### 4. 📁 Seção "Projetos Satélites" (100% dos itens mantidos)
  1. `projects.setTarget` (`conn2flow.projects.setTarget`)
  2. `projects.updateAll` (se target) (`conn2flow.projects.updateAllTarget`)
  3. `projects.syncCore` (se target) (`conn2flow.projects.syncCoreTarget`)
  4. `projects.syncFiles` (se target) (`conn2flow.projects.syncFilesTarget`)
  5. `projects.deploy` (se target) (`conn2flow.projects.deployTarget`)
  6. `projects.updateSelect` (`conn2flow.projects.updateAllWithSelect`)
  7. `projects.deploySelect` (`conn2flow.projects.deployOther`)
  8. `projects.scaffold` (`conn2flow.projects.scaffoldNew`)
  9. `projects.register` (`conn2flow.projects.registerExisting`)
  10. `projects.clone` (`conn2flow.projects.cloneMissing`)
  11. `projects.syncTemplate` (`conn2flow.projects.syncTemplate`)

#### 5. 🩺 Seção "Diagnóstico e Infraestrutura" (100% dos itens mantidos)
  1. `diagnostics.dockerStatus` (`conn2flow.docker.status`)
  2. `diagnostics.apacheLogs` (`conn2flow.docker.logsApache`)
  3. `diagnostics.phpLogs` (`conn2flow.docker.logsPhp`)
  4. `diagnostics.truncatePhp` (`conn2flow.docker.truncatePhpLog`)
  5. `diagnostics.aiSync` (`conn2flow.ai.sync`)
  6. `diagnostics.syncAll` (`conn2flow.ai.syncAllRepos`)

#### 6. 📚 Seção "Documentações e Configurações" (antiga "Agentes e Documentações")
- Renomear título para "Documentações e Configurações" (`docs.sectionTitle`).
- Itens:
  1. `docs.panel` (`conn2flow.docs.openDevToolsGuide`)
  2. `docs.marketplace` (`conn2flow.docs.openMarketplaceGuide`)
  3. `docs.cli` (`conn2flow.docs.openDevGuide`)
  4. `docs.orchestration` (`conn2flow.docs.openSddGuide`)
  5. `docs.architecture` (`conn2flow.docs.openArchitectureGuide`)
  6. `agents.selectMode` (`conn2flow.modes.selectMode`)

---

### 🧪 Testes e Validação:
- Atualizar catálogos NLS (`package.nls.json`, `package.nls.pt-br.json`, `localizationCatalog.ts`).
- Rodar `npm test` em `vscode-extension/` (53/53 testes passando).
- Ao concluir, emita o recibo no MCP Hub e atualize para `READY_FOR_REVIEW`.

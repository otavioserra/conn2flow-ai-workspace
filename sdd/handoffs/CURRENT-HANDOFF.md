# Handoff do Macro-Arquiteto — REQ-044 / BATCH-046

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Claude Code)
* **Data**: 2026-09-01
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: [req-044.md](../human-requests/req-044.md)
* **Topologia**: `triade`
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-044** implementa a identificação obrigatória do repositório alvo e raiz absoluta em todos os prompts e pontes de agentes:

### 1. No `AgentBridgeManager` (`vscode-extension/src/providers/agentBridgeManager.ts`)
- Obter o repositório/escopo atual (`repo`), o caminho raiz absoluto do workspace (`root`) e a raiz do SDD (`sddRoot`) usando `SddScopeManager.getActiveSddRoot()` e `SddScopeManager.resolveSddWorkspaceRoot()`.
- Em `copyExecutorPrompt()`:
  * Passar `{ repo, root, sddRoot, request: active.pointer, content: active.content }` para `LocalizationManager.t('agents.executorPrompt', ...)`.
- Em `launchClaudeGoal()`:
  * Passar `{ repo, root, request: reqName }` para `LocalizationManager.t('agents.goalInstruction', ...)`.
- Em `recordTerminalHandoff()`:
  * Incluir `* **Projeto**: ${repo}\n* **Raiz**: ${root}` no cabeçalho inicial do arquivo `CURRENT-HANDOFF.md`.

### 2. Nos Catálogos NLS (`localizationCatalog.ts`, `package.nls.json`, `package.nls.pt-br.json`)
- Atualizar o template `agents.executorPrompt` para conter:
  ```text
  ---
  🏷️ IDENTIFICAÇÃO DO PROJETO ALVO:
  - Projeto: {repo}
  - Caminho Raiz: {root}
  - Raiz SDD: {sddRoot}
  ---

  Você é o Executor SDD do Conn2Flow no repositório {repo} ({root}). Implemente a requisição ativa aprovada [{request}], mantenha a Live Todo List, valide localmente e registre evidências no checklist de validação e no handoff atual. Nunca use staging Git amplo, nunca copie arquivos manualmente para espelhos de teste e nunca execute commit, push, deploy ou release sem autorização humana explícita.

  REQUISIÇÃO ATIVA ({request})

  {content}
  ```
- Atualizar a versão em inglês (`en`) com paridade estrita.
- Atualizar `agents.goalInstruction` nos dois idiomas para incluir `[Projeto: {repo} | Raiz: {root}]`.

### 3. Testes Automatizados
- Criar/atualizar testes em `vscode-extension/test/` (ex: `test/agentBridgePrompts.test.cjs`) verificando que os prompts gerados possuem `{repo}`, `{root}` e `{sddRoot}` devidamente preenchidos e contêm o cabeçalho de identificação.
- Rodar `npm test` em `vscode-extension/` garantindo 100% dos testes verdes.
- Ao concluir, emita o recibo no MCP Hub e atualize para `READY_FOR_REVIEW`.

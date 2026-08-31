# BATCH-045 — Reorganização Ergonômica da Árvore Dev Tools (Controles Principais e Ações SDD)

## Estado

- **Requisição:** REQ-043
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`

## Live Todo List

- [x] Renomear "Visão Geral" para "Controles Principais" (`section.overview`) com todos os 6 controles globais.
- [x] Mover ações de IA ("Iniciar Claude", "Copiar Prompt", "Registrar Handoff", "Submeter Revisão") para a seção "SDD e Planejamento".
- [x] Renomear "Agentes e Documentações" para "Documentações e Configurações" (`section.agents`), eliminando duplicatas (`settings.language`).
- [x] Preservar 100% de todos os comandos existentes em Core e Releases, Projetos Satélites e Diagnósticos.
- [x] Incorporar emojis Unicode coloridos em todos os rótulos dos catálogos NLS (`package.nls.json`, `package.nls.pt-br.json`, `localizationCatalog.ts`).
- [x] Adicionar teste unitário de hierarquia de seções (`test/treeSectionHierarchy.test.cjs`) e validar 100% dos testes (`npm test`).
- [x] Emitir recibo estruturado no MCP Hub com `role: "executor"`, `req_id: "REQ-043"`, `task_id: "task-1788203067202-ho0yv"`.

## Evidências

### Teste 1: Compilação e Suíte de Testes da Extensão
* **Comando**: `npm test` em `vscode-extension/`
* **Resultado**: 54/54 testes passando (0 falhas), com compilação TypeScript limpa.

### Teste 2: Recibo no MCP Hub
* **Recibo**: `completions/BATCH-045-executor-receipt.json` emitido via ferramenta `report_completion` com vínculo estrito à `REQ-043` e papel `executor`.

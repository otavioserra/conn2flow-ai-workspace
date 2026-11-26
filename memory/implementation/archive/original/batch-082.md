---
id: "BATCH-082"
type: "batch"
status: "complete"
request: "REQ-080"
updated: "2026-11-18"
title: "Saneamento de Choques por Projeto, Editor Isolado de Dados do Projeto e Instalação Local do VSIX"
---

# BATCH-082: Saneamento de Choques por Projeto, Editor Isolado de Dados do Projeto e Instalação Local do VSIX

- **Requisição Vinculada**: [req-080.md](../../../human-requests/archive/req-080.md)
- **Topologia / Autonomia**: `dupla` / `supervisionado` (ciclo iterativo com o Operador Humano)
- **Status**: `complete` — homologado na prática pelo Operador Humano em 2026-11-18; release `1.1.7` pronto para publicação manual no Marketplace
- **Data de Abertura**: 2026-11-18

---

## Checklist de Execução (`BATCH-082`)

- [x] **1. Saneamento de "Choques de entregas"** (`vscode-extension/src/providers/conn2flowTreeProvider.ts`):
  - [x] Removido o `.map()` de `ProjectsManager.getProjectsList()` com ícone `warning`.
  - [x] Dentro de `if (target)`: 1 item `projects.conflictsFor` (ícone `git-compare`, args `[target]`).
  - [x] Na lista geral: 1 item `projects.conflictsSelectProject` (ícone `diff`) acionando `conn2flow.projects.listConflicts` sem argumentos (QuickPick nativo do `ProjectConflictsManager`).
  - [x] Rótulo `conflictsFor` trocado de `⚠️` para `🔀` em PT-BR/EN; ícone do comando no `package.json` passou de `$(warning)` para `$(git-compare)`.
- [x] **2. Editor Isolado de Dados do Projeto**:
  - [x] Política pura `src/projectConfigEditorPolicy.ts`: `extractProjectConfig`, `serializeProjectConfig`, `mergeProjectConfig`, `scopedConfigFileName`.
  - [x] `ProjectsManager.openScopedProjectConfig()`: buffer em `os.tmpdir()/c2f-project-config-XXXX/<id>.project.json` (via `mkdtempSync`) contendo somente `devProjects[projectId]`.
  - [x] `ProjectsManager.registerScopedProjectConfigEditor()`: `onDidSaveTextDocument` relê o `environment.json` do disco e substitui só `devProjects[projectId]` (indentação 2, newline final preservada) + `refresh()`; `onDidCloseTextDocument` remove o diretório temporário; `dispose` limpa sessões restantes.
  - [x] JSON inválido, não-objeto, projeto removido ou `environment.json` corrompido → `showErrorMessage` sem gravar nada.
  - [x] Comandos `conn2flow.projects.editTargetConfig` (`settings-gear`, dentro de `if (target)`) e `conn2flow.projects.editProjectConfigSelect` (`edit`, seletor).
- [x] **3. Paridade bilíngue**: `localizationCatalog.ts` (rótulos, tooltips e mensagens), `treeTooltipPolicy.ts`, `package.json`, `package.nls.json`, `package.nls.pt-br.json`.
- [x] **4. Testes**: novo `test/projectConfigEditor.test.cjs` (8 testes: isolamento, não-mutação, merge preservando o resto, rejeições, nome seguro, fiação de eventos, estrutura da árvore, rótulos). `npm test` → **141/141 PASS**.
- [x] **5. Empacotamento e instalação**: versão `1.1.4 → 1.1.5` → `1.1.6` → `1.1.7` ao longo das iterações (`npm run version:bump`), `npx @vscode/vsce package` e `code --install-extension ... --force`; versão final instalada `conn2flow.conn2flow-tools@1.1.7`.
- [x] **6. Ciclo iterativo com o Operador Humano**: 3 rodadas (edição isolada, exclusão de projeto, cadastro pré-preenchido com foco persistente); aceite final do operador em 2026-11-18.

## Observações Iterativas do Operador

1. **2026-11-18 — Edição isolada homologada pelo operador**: editou e salvou um projeto; o `environment.json` foi atualizado corretamente.
2. **2026-11-18 — Pedido: opção de excluir projeto** (havia incluir/editar, faltava excluir):
   - Política pura `removeProjectConfig()` em `src/projectConfigEditorPolicy.ts`: remove só `devProjects[projectId]`; se era o `devEnvironment.projectTarget`, limpa o alvo; JSON corrompido ou projeto ausente → nada é gravado.
   - `ProjectsManager.deleteProject()` com confirmação modal (`showWarningMessage` + `modal: true`); arquivos/repositórios do projeto no disco não são tocados; feedback na barra de status.
   - Comando `conn2flow.projects.deleteProjectSelect` + item seletor `🗑️ Excluir Projeto (Selecionar…)` (ícone `trash`) na aba Projetos; textos PT-BR/EN, tooltip e `package.nls*`.
   - +3 testes em `test/projectConfigEditor.test.cjs`; `npm test` → **144/144 PASS**; VSIX `1.1.6` empacotado e instalado (`conn2flow.conn2flow-tools@1.1.6`).
3. **2026-11-18 — Exclusão homologada pelo operador** (excluiu e recriou um projeto).
4. **2026-11-18 — Pedido: cadastro de projeto com valores pré-preenchidos e foco persistente**:
   - `ProjectsManager.addNewProject()` passou a perguntar, já preenchidos e editáveis: nome (= ID), URL (`http://localhost/<id>/`), pasta do projeto (`<repos>/<id>/gestor`) e, se local, pasta de testes (`dev-environment/data/sites/localhost/<id>/`). Antes, a pasta era deduzida sem perguntar.
   - Todas as caixas usam `ignoreFocusOut: true`, então não fecham no Alt+Tab (copiar/colar de outra janela).
   - O ID é validado (obrigatório, `[a-zA-Z0-9._-]`, sem duplicar um projeto existente). Cancelar qualquer etapa aborta sem gravar.
   - Novas chaves PT-BR/EN (`projects.pathPrompt`, `projects.pathTestsPrompt`, `projects.fieldRequired`, `projects.idInvalid`, `projects.idExists`); +1 teste; `npm test` → **145/145 PASS**; VSIX `1.1.7` instalado.

5. **2026-11-18 — Aceite final do operador**: tudo funcionando, inclusive os itens pedidos durante os testes. Ele pediu o release para publicar manualmente no Marketplace.

## Relatório Final

### Release

| Item | Valor |
| --- | --- |
| Versão | `1.1.7` (a última publicada antes deste lote era `1.1.4`) |
| Pacote | `vscode-extension/conn2flow-tools-1.1.7.vsix` (87 arquivos, 207.61 KB; ignorado pelo Git via `*.vsix`) |
| SHA-256 | `2d1088f93b7726c5c24fb4296af3cafee0a7b19fa0e94ea06ddbff3be6888afa` |
| Publicação | Manual, pelo operador: [Marketplace — gerenciar publisher `conn2flow`](https://marketplace.visualstudio.com/manage/publishers/conn2flow) → `conn2flow-tools` → *Update* → enviar o `.vsix` |
| Página pública | [marketplace.visualstudio.com/items?itemName=conn2flow.conn2flow-tools](https://marketplace.visualstudio.com/items?itemName=conn2flow.conn2flow-tools) |
| Validação | `npm run compile` OK; `npm test` → **145/145 PASS**; instalado localmente e testado na prática pelo operador |

Os pacotes intermediários `1.1.5` e `1.1.6` só foram usados nas iterações locais e não devem ser publicados.

### Entregas (critérios de aceite da REQ-080)

- [x] A aba Projetos não lista mais todos os projetos com `⚠️`. Ficaram `🔀 Choques de Entrega: {target}` e `🔀 Choques de Entrega (Selecionar Projeto…)`.
- [x] `⚙️ Editar Dados do Projeto: {target}` e `📝 Editar Dados de Projeto (Selecionar…)` abrem um JSON temporário só com `devProjects[projectId]`.
- [x] Ao salvar com `Ctrl+S`, só `devProjects[projectId]` muda no `environment.json` e a árvore atualiza. Homologado pelo operador.
- [x] Testes 145/145 PASS: 12 novos em `test/projectConfigEditor.test.cjs`, e a base anterior de 133 continua verde.
- [x] VSIX instalado localmente; observações do operador resolvidas e registradas acima.
- [x] Extra pedido pelo operador: `🗑️ Excluir Projeto (Selecionar…)` com confirmação modal.
- [x] Extra pedido pelo operador: cadastro com URL e pastas pré-preenchidas e editáveis, ID validado e `ignoreFocusOut` em todas as caixas.

### Arquivos para o commit (caminhos explícitos)

Novos:
- `memory/implementation/batch-082.md`
- `vscode-extension/src/projectConfigEditorPolicy.ts`
- `vscode-extension/test/projectConfigEditor.test.cjs`
- `vscode-extension/out/projectConfigEditorPolicy.js`, `vscode-extension/out/projectConfigEditorPolicy.js.map`

Modificados:
- `vscode-extension/src/extension.ts`, `vscode-extension/src/localizationCatalog.ts`, `vscode-extension/src/treeTooltipPolicy.ts`
- `vscode-extension/src/providers/conn2flowTreeProvider.ts`, `vscode-extension/src/providers/projectsManager.ts`
- `vscode-extension/package.json`, `vscode-extension/package-lock.json` (versão `1.1.7`), `vscode-extension/package.nls.json`, `vscode-extension/package.nls.pt-br.json`
- `vscode-extension/out/` compilado: `extension.js`, `localizationCatalog.js`, `treeTooltipPolicy.js`, `providers/conn2flowTreeProvider.js`, `providers/projectsManager.js`, cada um com seu `.map`
- `memory/implementation/index.md` (linha do BATCH-082)

## Handoff

Volta para o Macro-Arquiteto (topologia `dupla`) para commit, push, tag ou release no Git, atualização do `CURRENT.md` e do status da REQ-080. O Executor não fez commit nem push; usar só os caminhos explícitos acima, sem `git add -A` nem `git add .`. A publicação no Marketplace é manual e fica com o operador.

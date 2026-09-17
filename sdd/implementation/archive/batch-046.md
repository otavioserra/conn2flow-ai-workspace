# BATCH-046 — Identificação Obrigatória de Repositório Alvo e Raiz nos Prompts de Agentes

## Estado

- **Requisição:** REQ-044
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `triade`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Task MCP:** `task-1788262915507-xglp9`

## Live Todo List

- [x] Criar módulo puro `vscode-extension/src/agentPromptPolicy.ts` com `buildAgentPromptIdentity()` e `findOrphanPlaceholders()`.
- [x] Estender `AgentBridgeManager.getActiveRequestFile()` para devolver também `currentPath` (caminho absoluto de `CURRENT.md`).
- [x] Adicionar `AgentBridgeManager.resolvePromptIdentity()` derivando `{ repo, root, sddRoot, currentPath, reqPath, request }` do escopo SDD ativo.
- [x] Injetar a identidade completa na interpolação de `copyExecutorPrompt()`.
- [x] Injetar `{ repo, root, currentPath }` na instrução `/goal` de `launchClaudeGoal()`.
- [x] Injetar o cabeçalho padronizado no template inicial de `CURRENT-HANDOFF.md` em `recordTerminalHandoff()`.
- [x] Atualizar `agents.executorPrompt` e `agents.goalInstruction` em `localizationCatalog.ts` (`pt-BR` e `en`) com o cabeçalho e o link `[{request}]({currentPath})`.
- [x] Espelhar os dois templates em `package.nls.json` e `package.nls.pt-br.json` com paridade estrita.
- [x] Criar teste unitário `vscode-extension/test/agentPromptPolicy.test.cjs` (12 casos).
- [x] Validar `npm test` com 100% verde (66/66).
- [x] Emitir recibo estruturado no MCP Hub com `role: "executor"`, `req_id: "REQ-044"`, `task_id: "task-1788262915507-xglp9"`.

## Decisões técnicas do lote

1. **Módulo puro para testabilidade**: `agentBridgeManager.ts` importa `vscode` e não pode ser exigido (`require`) fora do host da extensão. Seguindo o padrão já consolidado no repositório (`repositoryLocator.ts`, `hubTaskWatcherPolicy.ts`), a lógica de resolução da identidade foi extraída para o módulo puro `src/agentPromptPolicy.ts`, testado diretamente sobre `out/agentPromptPolicy.js`.

2. **Origem do `root` é o escopo SDD, não o primeiro workspace folder**: `root` é derivado de `path.dirname(sddRoot)` quando o `sddRoot` ativo termina em `sdd`, com degradação para o workspace apenas como fallback. Isso é o que faz a identificação apontar para o repositório realmente selecionado no seletor de escopo, que é exatamente o problema de ambiguidade que a REQ-044 combate.

3. **Espelho NLS dos templates de prompt**: `package.nls.json` e `package.nls.pt-br.json` continham apenas as 86 chaves de manifesto (`%command.*%`, `extension.*`, `config.*`); os templates de prompt existiam somente em `localizationCatalog.ts`. Para cumprir a REQ-044 §2 sem criar chaves inertes, os dois templates foram espelhados nos dois arquivos NLS **e** um teste de sincronismo passou a exigir igualdade byte a byte com o catálogo de runtime.

4. **Nova chave `agents.handoffInitial`**: o template inicial de `CURRENT-HANDOFF.md` era uma string PT-BR hardcoded dentro do TypeScript, violando a diretriz de proibição de strings literais da `MEMORIA-ENGENHARIA-CHEFIA.md` §5. A injeção do cabeçalho (REQ-044 §1.3) foi feita movendo o template para o catálogo nos dois idiomas.

## Evidências

### Teste 1: Suíte automatizada da extensão

* **Comando**: `npm test` em `vscode-extension/` (compilação TypeScript + `node --test`)
* **Resultado**: **66/66 testes passando**, 0 falhas, compilação limpa (54 anteriores preservados + 12 novos).

### Teste 2: Novo arquivo `test/agentPromptPolicy.test.cjs`

* **Resultado**: 12/12 casos verdes, cobrindo:
  * derivação de `repo`/`root`/`sddRoot` a partir do escopo SDD ativo;
  * fallback para workspace e para `CURRENT.md`;
  * rótulo de fallback quando nenhum caminho resolve;
  * presença do cabeçalho `🏷️`, do caminho absoluto e do link `[req-044.md](<abs>/CURRENT.md)` em `pt-BR` **e** `en`;
  * identificação `[Projeto | Raiz | Entrada]` na instrução `/goal` em ambos os idiomas;
  * cabeçalho no handoff inicial em ambos os idiomas;
  * ausência total de chaves órfãs (`{repo}`, `{root}`, `{sddRoot}`, `{currentPath}`, `{content}`) após a interpolação;
  * sincronismo dos templates espelhados no NLS;
  * injeção efetiva da identidade nas três pontes do `AgentBridgeManager`.

### Teste 3: Prova de saída real do prompt

Renderização com os caminhos reais deste repositório:

```text
---
🏷️ IDENTIFICAÇÃO DO PROJETO ALVO:
- Projeto: conn2flow-ai-workspace
- Caminho Raiz: c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace
- Raiz SDD: c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\sdd
- Arquivo de Entrada: c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\sdd\human-requests\CURRENT.md
---

Você é o Executor SDD do Conn2Flow. Implemente a requisição ativa aprovada [req-044.md](c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\sdd\human-requests\CURRENT.md), mantenha a Live Todo List, ...
```

```text
/goal [Projeto: conn2flow-ai-workspace | Raiz: c:\Users\otavi\...\conn2flow-ai-workspace | Entrada: c:\Users\otavi\...\sdd\human-requests\CURRENT.md] Leia o briefing ativo em sdd/human-requests/CURRENT.md (req-044.md), ...
```

### Teste 4: Recibo no MCP Hub

* **Recibo**: `completions/BATCH-046-executor-receipt.json`, emitido via `report_completion` com vínculo estrito a `REQ-044`, `task-1788262915507-xglp9` e papel `executor`.

## Arquivos tocados

| Arquivo | Natureza |
| --- | --- |
| `vscode-extension/src/agentPromptPolicy.ts` | novo (módulo puro) |
| `vscode-extension/src/providers/agentBridgeManager.ts` | alterado |
| `vscode-extension/src/localizationCatalog.ts` | alterado (`en` + `ptBR`) |
| `vscode-extension/package.nls.json` | alterado |
| `vscode-extension/package.nls.pt-br.json` | alterado |
| `vscode-extension/test/agentPromptPolicy.test.cjs` | novo |
| `sdd/implementation/batch-046.md` | novo |
| `sdd/implementation/BATCH-INDEX.md` | alterado |
| `sdd/validation/VALIDATION-CHECKLIST.md` | alterado |
| `sdd/human-requests/CURRENT.md` | alterado |
| `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` | alterado |
| `completions/BATCH-046-executor-receipt.json` | novo (recibo) |
| `completions/BATCH-046-receipt.json` | novo (recibo canônico) |
| `tasks/REQ-044.json` | alterado pelo Hub (status `completed`) |

## Fora de escopo

- Nenhum commit, push, deploy, release ou empacotamento de VSIX foi executado — o lote roda em `supervisionado` e aguarda aprovação humana.

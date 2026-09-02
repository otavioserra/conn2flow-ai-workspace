# BATCH-051 — Persistência Externa em settings.json e Sincronização Dinâmica do Prompt

## Estado

- **Requisição:** REQ-049
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `dupla`
- **Projeto:** `conn2flow-ai-workspace` (`vscode-extension`)
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`

## Live Todo List

- [x] Criar módulo puro de preferências persistidas e declarar as configurações no `package.json`.
- [x] Ligar escopo SDD, projeto alvo, topologia e autonomia ao `settings.json`.
- [x] Fazer o prompt do executor refletir a topologia e a autonomia ativas.
- [x] Sincronizar o metadado `Topologia de Agentes` no `CURRENT.md`.
- [x] Cobrir tudo com testes de unidade.

## Implementação

### Causa-raiz encontrada durante o lote

O relato era "as seleções voltam ao padrão ao recarregar a janela". Ao medir, apareceu um segundo
defeito, mais grave e silencioso: **o `CURRENT.md` deste repositório declara `` `dupla` ``**, e o
`ModesManager` só aceitava `` `duplo` `` ou `` `triade` ``. Toda leitura de topologia caía no padrão
`triade`. A seleção do painel não era só volátil — ela era **ignorada mesmo dentro da mesma sessão**,
porque o arquivo que a alimentava usava o vocabulário do Arquiteto e o código usava outro.

Por isso o normalizador aceita aliases (`dupla`/`duplo`/`dual`, `tríade`/`triade`/`triad`,
`monitorado`/`autonomo_monitorado`, `headless`/…), e a **escrita** de volta preserva o vocabulário do
documento (`dupla`), não o identificador interno.

### Módulo puro `src/workspacePreferencesPolicy.ts`

Sem dependência de `vscode`, para ser testável direto sobre `out/`:

- `recognizeTopology` / `recognizeAutonomy` / `recognizeScopeId` / `recognizeProjectId` devolvem
  `undefined` para valor ausente ou desconhecido. Isso separa **"o operador não escolheu"** de
  **"o operador escolheu justamente o padrão"** — distinção sem a qual a precedência abaixo não
  poderia existir.
- `resolvePersistedPreference({settings, workspaceState, inferred}, recognize, fallback)`: lê o
  `settings.json` primeiro, o `workspaceState` legado depois (migração transparente dos workspaces
  já em uso) e a inferência por último.
- `parseModesFromCurrentMarkdown` / `applyModesToCurrentMarkdown`: leitura e escrita dos metadados,
  atualizando a linha existente ou inserindo-a logo após `Status`, sem tocar no resto do arquivo.

### Configurações declaradas (`contributes.configuration`, escopo `window`)

| Chave | Uso |
| --- | --- |
| `conn2flow.sdd.scopeId` | escopo SDD ativo (`core`, `ai-workspace`, `project:<id>`) |
| `conn2flow.projects.activeId` | projeto alvo, espelhando `environment.json` |
| `conn2flow.agents.topology` | `duplo` \| `triade` |
| `conn2flow.agents.autonomy` | `supervisionado` \| `autonomo_monitorado` \| `autonomo_headless` |

`environment.json` **continua sendo a fonte da verdade** do projeto alvo para o pipeline; o setting
só entra quando o arquivo não é alcançável a partir do workspace aberto.

### Prompt dinâmico

`resolvePromptModeKeys()` (em `agentPromptPolicy.ts`) traduz a topologia/autonomia ativas em chaves
de catálogo. `agents.executorPrompt` e `agents.goalInstruction` ganharam `{topology}`, `{autonomy}` e
`{roles}`; as novas chaves `agents.roles.dual` e `agents.roles.triad` descrevem os papéis reais —
na topologia dupla o executor faz o autorreview findings-first, na tríade ele para nas evidências.
Os dois templates seguem espelhados byte a byte em `localizationCatalog.ts`, `package.nls.json` e
`package.nls.pt-br.json`, conforme o teste de sincronismo já existente.

Trocar o escopo SDD agora chama `ModesManager.reload()` antes de repintar a árvore: escopo diferente
significa `CURRENT.md` diferente.

## Evidências

1. `npm test` em `vscode-extension/`: compilação TypeScript limpa e **98/98 testes aprovados**
   (baseline era 84/84; +14 casos), 0 falhas, 0 skips.
2. Novo `test/workspacePreferencesPolicy.test.cjs` (11 casos) cobre: paridade entre `PREFERENCE_KEYS`
   e o `contributes.configuration` do `package.json`; os aliases de vocabulário; a recusa de escopo
   e id inválidos; as três camadas de precedência; a leitura do `CURRENT.md` **real** do repositório;
   a atualização in-place sem mudar a contagem de linhas; a inserção após `Status`; e a preservação
   do termo `dupla` na escrita.
3. `agentPromptPolicy.test.cjs` ganhou a asserção que faltava: com a mesma requisição, o prompt de
   topologia dupla é **diferente** do de tríade e contém o texto de papéis correspondente. Sem ela,
   a seleção do painel poderia voltar a ser decorativa sem nenhum teste falhar.

## Ressalva de homologação

A gravação em `settings.json` usa a API `workspace.getConfiguration().update()` do VS Code, que só
existe com a extensão carregada — os testes cobrem a **resolução** e o **contrato** (asserção sobre o
fonte dos providers), não a escrita em si. Homologação com a janela aberta fica com o operador:
selecionar topologia/autonomia/escopo, recarregar a janela e confirmar que as seleções persistem.

## Pendência para o Humano-no-Loop

- Revisar o diff e decidir o aceite. Nenhum commit, push, deploy, release ou empacotamento de VSIX
  foi executado neste modo supervisionado.

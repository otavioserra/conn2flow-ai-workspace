# REVIEW-045 - Parecer Técnico do BATCH-045

**Revisor:** GitHub Copilot  
**Data da revisão:** 2026-08-31  
**Requisição:** REQ-043  
**Batch:** BATCH-045  
**Status de aceite:** CHANGES_REQUIRED

---

## Escopo auditado

- `vscode-extension/src/providers/conn2flowTreeProvider.ts`
- `vscode-extension/src/localizationCatalog.ts`
- `vscode-extension/package.nls.json`
- `vscode-extension/package.nls.pt-br.json`
- Testes da extensão e recibo `completions/BATCH-045-receipt.json`

## Findings bloqueantes

### 1. O recibo de conclusao nao ativa o watcher da triade

`completions/BATCH-045-receipt.json` declara `status: "success"`, mas fornece `role`, `reqId` e `taskId` como `null`. O watcher somente processa um recibo bem-sucedido quando `role === "executor"` em `vscode-extension/src/hubTaskWatcherPolicy.ts`.

Consequencia: a conclusao do BATCH-045 nao gera a notificacao automatica de pronto para revisao prevista para a triade, embora o recibo afirme esse estado. Emitir um recibo correlacionado com `batchId`, `reqId`, `taskId` e `role: "executor"`, usando o fluxo MCP canonico.

### 2. A secao Documentacoes e Configuracoes nao segue o mapa aprovado

`docsConfig` preserva `settings.language`, embora o mesmo comando ja esteja centralizado em Controles Principais. Isso contradiz a centralizacao de todos os controles globais e a lista estrita de itens aprovada para a secao.

A secao tambem preserva `docs.skills`, que nao aparece na lista aprovada de cinco guias mais o atalho `agents.selectMode`. Como a REQ-043 tambem proibe remover comandos, o destino desse item deve ser definido e implementado sem perda de funcionalidade; manter a secao exatamente conforme o mapa aprovado ou registrar uma mudanca normativa aprovada.

### 3. O lote nao possui trilha operacional revisavel

`sdd/implementation/batch-045.md` nao existe. Alem disso, `sdd/human-requests/CURRENT.md` permanece em `READY_FOR_EXECUTION` e o checklist do BATCH-045 mantem todos os criterios abertos, apesar do recibo indicar conclusao.

Consequencia: nao ha Live Todo List, evidencias do executor ou transicao SDD que sustentem a homologacao. Criar o batch, registrar a execucao e atualizar os estados e evidencias somente apos as correcoes e validacoes correspondentes.

## Lacuna de cobertura

Os 53 testes passam, mas os testes alterados nao verificam a nova hierarquia. `commandCoverage.test.cjs` valida que comandos usados pela arvore estao registrados, sem verificar em qual secao cada um aparece; `localizationCatalog.test.cjs` apenas atualiza uma assercao de texto.

Adicionar teste para a composicao de `rootItems()` que assegure os seis controles em `overview`, as quatro acoes de agente em `sdd`, a ausencia de controles duplicados em `docsConfig` e a preservacao dos comandos movidos.

## Evidencias executadas

```text
cd vscode-extension && npm test
53 testes aprovados, 0 falhas
```

```text
git diff --check -- vscode-extension
sem erros de whitespace
```

## Parecer

**CHANGES_REQUIRED.** A composicao principal da arvore e os catalogos bilingues compilam e preservam os comandos auditados, mas os tres findings bloqueantes impedem a homologacao do BATCH-045. Apos corrigir o recibo, alinhar a secao de documentacao e completar a trilha SDD, executar `npm test` novamente e submeter a nova revisao.

---

## Reauditoria — 2026-08-31

### Evidências verificadas

- `vscode-extension/`: `npm test` passou com 54/54 testes, incluindo `treeSectionHierarchy.test.cjs`; compilação TypeScript limpa.
- `mcp-hub/`: `npm test` passou com 2/2 testes, incluindo correlação de recibos por papel e transição da tarefa.
- `sdd/implementation/batch-045.md` foi criado e está marcado como `ready-for-review`.
- A duplicata `settings.language` foi removida de `docsConfig`.
- Os seis controles globais e as quatro ações de IA estão presentes no provider.

### Findings remanescentes

#### 1. [BLOCKER] Recibo do executor continua ausente e o recibo canônico continua sem correlação

O único arquivo presente é `completions/BATCH-045-receipt.json`, mas seus campos `role`, `reqId` e `taskId` continuam `null`. O arquivo esperado `completions/BATCH-045-executor-receipt.json` não existe. Como `HubTaskWatcherPolicy` só aceita conclusão com `status: "success"` e `role: "executor"`, a conclusão não aciona o fluxo automático de revisão.

Isso também contradiz o registro do batch, que afirma que o recibo por papel foi emitido com vínculo a `REQ-043`.

#### 2. [BLOCKER] `docs.skills` continua fora do mapa aprovado

`docsConfig` ainda contém `conn2flow.ai.openCatalog` via `docs.skills`. A REQ-043 exige cinco guias mais o atalho `agents.selectMode`, e a própria correção alegada só removeu `settings.language`. O teste novo verifica a ausência de `settings.language`, mas não verifica a ausência de `docs.skills`, portanto os 54 testes não detectam esse desvio.

#### 3. Estados SDD sincronizados

Resolvido. `batch-045.md` está em `ready-for-review`, `sdd/human-requests/CURRENT.md` está em `READY_FOR_REVIEW` e `BATCH-INDEX.md` aponta o lote como `ready-for-review`. Essa correção administrativa não compensa os dois bloqueios funcionais acima.

### Validações executadas

```text
cd vscode-extension && npm test
54 testes aprovados, 0 falhas
```

```text
cd mcp-hub && npm test
2 testes aprovados, 0 falhas
```

```text
completions/BATCH-045-receipt.json
role=null, reqId=null, taskId=null, status=success
completions/BATCH-045-executor-receipt.json: ausente
```

```text
conn2flowTreeProvider.ts / docsConfig
settings.language ausente; docs.skills presente

sdd/human-requests/CURRENT.md e sdd/implementation/BATCH-INDEX.md
status coerente em READY_FOR_REVIEW / ready-for-review
```

### Parecer da reauditoria

**CHANGES_REQUIRED.** O teste de hierarquia e a correção da duplicata foram confirmados, as suítes permanecem verdes e os estados SDD estão coerentes. A homologação continua bloqueada pelo recibo MCP não correlacionado e pelo item `docs.skills` ainda fora do mapa aprovado. Não marcar o BATCH-045 como `complete` até corrigir esses dois pontos e repetir as validações.

---

## Parecer Final — 2026-08-31

### Revalidação dos bloqueios

- `completions/BATCH-045-executor-receipt.json` e `completions/BATCH-045-receipt.json` existem e possuem `status: "success"`, `role: "executor"`, `reqId: "REQ-043"` e `taskId: "task-1788203067202-ho0yv"`.
- A REQ-043 formaliza `docs.skills` (`conn2flow.ai.openCatalog`) como Catálogo de Skills SDD dentro de Documentações e Configurações; sua preservação no provider atende ao escopo vigente e à diretriz de não remoção de comandos.
- `cd vscode-extension && npm test`: 54/54 testes aprovados, com compilação TypeScript limpa.
- `cd mcp-hub && npm test`: 2/2 testes aprovados, incluindo correlação de recibos por papel e transição de tarefa.

### Decisão Final

**APPROVED.** Os dois bloqueios da reauditoria foram resolvidos com evidência verificável. O BATCH-045 atende à REQ-043, preserva os comandos existentes, mantém a paridade NLS e está aprovado para integração.
---
id: "ARCH-016"
title: "Despacho Dual do MCP Hub: Trilho Visível no Chat (Claude Code Channels) e Trilho Headless (API), com Fila Única e Modo Didático"
status: "ICEBOX"
date: "2026-11-04"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Fazer a fila do MCP Hub ser consumida de verdade: no chat visível via Channels ou em background via claude -p, com o mesmo contrato."
summary_medium: "Hoje dispatch_task só grava tasks/REQ-XXX.json e a extensão mostra um aviso; ninguém executa.\nIdeia: canal MCP que empurra a tarefa para uma sessão aberta do Claude Code (acompanhamento e ensino) e runner headless que roda a mesma tarefa sem chat, ambos com claim, recibo e timeline."
---

# ARCH-016 — Despacho Dual do MCP Hub: Trilho Visível no Chat (Claude Code Channels) e Trilho Headless (API)

- **Tipo**: Infraestrutura / Orquestração de Agentes / MCP
- **Status**: `ICEBOX` (ideia registrada; não executável até promoção humana para `memory/human-requests/`)
- **Origem**: Conversa com o Engenheiro Chefe (Otávio Serra) em 2026-11-04, pergunta sobre um servidor MCP disparar o Claude Code e o humano acompanhar no chat. Cobre **o uso via API (sem ver o chat) e o uso vendo o chat**, com foco também em **quem está aprendendo** a operar o ecossistema.
- **Próxima ação**: reavaliar na próxima rodada de infraestrutura; se promovido, abrir REQ com os lotes sugeridos na seção 5 (spike de Channels como gate).
- **Histórico**: redigido inicialmente como REQ-078 (`PROPOSED`) e rebaixado para backlog no mesmo dia por decisão humana; o número REQ-078 fica livre.
- **Repositório Alvo**: `conn2flow-ai-workspace` em `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace` (`mcp-hub/`, `vscode-extension/`).

---
## 1. Diagnóstico (estado real verificado em 2026-11-04)

| Peça | O que existe | Lacuna |
| --- | --- | --- |
| `mcp-hub/src/tools/dispatchTask.ts` | Grava `tasks/<REQ>.json` com `taskId`, `mode` (`supervised` / `live_autonomous` / `headless_autonomous`), `status: dispatched` e `executionToken` | **Nenhum consumidor executa a tarefa.** O token não é verificado por ninguém. |
| `mcp-hub/src/tools/reportCompletion.ts` | Recibo em `completions/<BATCH>-[role-]receipt.json` e transição `completed`/`failed` | Não há estados `claimed`/`running`; duas sessões poderiam pegar a mesma tarefa. |
| `mcp-hub/src/tools/logSessionEvent.ts` | Timeline em `sessions/` | Não é alimentada automaticamente por nenhuma execução. |
| `mcp-hub/src/server.ts` | JSON-RPC stdio artesanal, só `tools` | Não declara capability de canal nem emite notificações. |
| `vscode-extension/src/providers/hubTaskWatcher.ts` | Observa `**/tasks/*.json` e `**/completions/*.json` | Só mostra mensagem na barra de status por 4 s. Não oferece ação. |
| `agentBridgeManager.launchClaudeGoal` | Copia prompt ou roda `claude "<prompt>"` no terminal | Manual, desacoplado da fila do Hub. |
| `tasks/` | 8 registros antigos (REQ-041 a REQ-051) em `dispatched` | Lixo de fila: nunca consumidos. Ver tarefa 2.6. |

**Conclusão**: a orquestração já tem o produtor (Hub), o recibo e a timeline, mas falta o **consumidor**. Esta REQ não reinventa a fila: ela acrescenta dois consumidores ao lado do que existe ("acrescentar, não substituir").

---

## 2. Visão da solução: uma fila, dois trilhos

```
                        dispatch_task (MCP Hub)  ──►  tasks/<REQ>.json  (status: dispatched)
                                                          │
                     ┌────────────────────────────────────┴────────────────────────────────────┐
                     ▼                                                                         ▼
     TRILHO A — VISÍVEL (delivery: "chat")                                  TRILHO B — HEADLESS (delivery: "headless")
     Canal MCP "conn2flow-channel" rodando dentro                           Runner do Hub executa  claude -p  (ou Agent SDK)
     da sessão aberta do Claude Code                                        na raiz do repo alvo, sem chat
       • claim atômico (dispatched ➔ claimed)                                 • claim atômico (dispatched ➔ claimed)
       • notifications/claude/channel ➔ a tarefa aparece no chat              • stream-json ➔ sessions/<task>.jsonl
       • humano/aprendiz acompanha Live Todo em tempo real                    • extensão pode "seguir" o log depois (logFollowManager)
       • ferramentas de resposta: progress / ask_human / complete             • para diante de contrato/autorização ausente
                     │                                                                         │
                     └────────────────────────────►  report_completion + log_session_event  ◄─┘
                                                     completions/… , sessions/… , status final
```

### 2.1 Trilho A — Visível no chat (Claude Code Channels)

- **O que é Channels**: recurso do Claude Code (research preview) em que um servidor MCP declara a capability experimental de canal e **empurra mensagens para uma sessão já aberta**, que reage como se o humano tivesse digitado. O canal também pode expor ferramentas de resposta (o agente "responde" pelo canal).
- **Proposta**: novo entrypoint `mcp-hub/dist/channel.js` (mesmo pacote, reaproveita `dispatchTask`/`reportCompletion`/`logSessionEvent`), carregado pela sessão do Claude Code. Ele:
  1. observa `tasks/*.json` filtrando `delivery: "chat"` e o `repo` da sessão;
  2. faz o claim atômico (escreve `claimedBy` = id da sessão, `status: claimed`) — só uma sessão vence;
  3. emite a notificação do canal com **referência**, não com prompt livre: projeto, raiz absoluta, REQ, BATCH, topologia, autonomia e caminho do `req-XXX.md` (o agente lê a requisição da memória, como no prompt da extensão);
  4. expõe ferramentas de resposta: `channel_progress` (vira `log_session_event`), `channel_ask_human` (registra pendência e para) e `channel_complete` (vira `report_completion`).
- **Modo didático** (`didactic: true` no despacho): o texto injetado instrui o agente a narrar cada etapa em linguagem de aprendiz (o que vai fazer, por quê, qual skill/regra se aplica) e a pausar antes de toda ação irreversível. Serve a quem está aprendendo e não muda nenhuma regra de autoridade.
- **Fallback quando Channels não estiver disponível** (versão do Claude Code, plano, painel do VS Code): a extensão oferece "Abrir no Claude" (reaproveita `launchClaudeGoal` com o contexto da tarefa) ou o agente da sessão observa a fila com um vigia em segundo plano (Monitor). O fallback é registrado no recibo como tal; nunca se alega push quando foi polling.

### 2.2 Trilho B — Headless (API, sem chat)

- **Proposta**: `mcp-hub/src/runner/` com o comando `conn2flow-mcp-hub run --once|--watch`, que consome `delivery: "headless"`, faz o claim e executa `claude -p` na raiz do repo alvo, com `--output-format stream-json`, lista explícita de ferramentas permitidas e modo de permissão derivado da autonomia da REQ.
- Toda a saída vai para `sessions/<taskId>.jsonl`; o resumo final vai para `report_completion`. Assim o headless **pode ser assistido depois**: a extensão abre o log com o `logFollowManager` existente (é o "replay" para aprendizado).
- **Motor**: começar pelo CLI `claude -p` (usa o login já existente, sem gerir chave nova). O Agent SDK / API com chave fica como evolução (D2).
- **Paradas obrigatórias**: REQ não `APPROVED`, autonomia diferente de `autonomo_headless`, repo fora da lista conhecida, árvore suja de outro agente ou qualquer comando de produção ⇒ `failed` com motivo, sem execução.

### 2.3 Contrato único de despacho (acréscimo compatível)

- `dispatch_task` ganha `delivery: "chat" | "headless"` (opcional) e `didactic: boolean` (opcional). Sem `delivery`, deriva do `mode` atual: `supervised` e `live_autonomous` ⇒ `chat`; `headless_autonomous` ⇒ `headless`. O enum `mode` existente é preservado.
- Máquina de estados: `dispatched ➔ claimed ➔ running ➔ completed | failed | cancelled`, com `claimedBy`, `claimedAt`, `startedAt` e `deliveryUsed` (`channel`, `monitor-fallback`, `extension-fallback`, `cli-headless`).
- Claim por escrita atômica com lock (mesmo padrão cooperativo do `memory/.mdd.lock`); quem perde o claim não executa.
- O `executionToken` passa a ser verificado no claim e no `report_completion`.

---

## 3. Segurança e governança (não negociáveis)

1. **O canal não amplia autoridade.** Mensagem de canal vale como intake de tarefa já aprovada: a autonomia, o escopo e as proibições vêm do `req-XXX.md` e de `CURRENT.md`, nunca do texto do canal.
2. **Só fila local.** O canal lê `tasks/` do workspace; nenhum endpoint HTTP aberto nesta REQ. Remetentes remotos (Telegram, webhook) ficam fora de escopo.
3. **Nenhum trilho faz deploy em produção, commit sem autorização ou homologação.** O headless respeita a regra de `git add` por caminho e não faz push.
4. **Sem prompt livre executável.** O despacho referencia a REQ; texto adicional entra só como nota informativa.
5. **Permissões no headless** por lista explícita; nada de pular permissões.

---

## 4. Decisões abertas para o Humano / Macro-Arquiteto

| ID | Pergunta | Recomendação do Executor |
| --- | --- | --- |
| D1 | Onde mora o canal: no `mcp-hub` (TypeScript) ou no daemon Python `mdd daemon --mcp` (REQ-074)? | `mcp-hub`: já é dono da fila, do recibo e da timeline. |
| D2 | Motor headless: `claude -p` (login atual) ou Agent SDK com chave de API? | Começar com `claude -p`; SDK como evolução se precisar de controle fino ou execução no servidor. |
| D3 | O canal aceita tarefa de qualquer repo ou só do repo da sessão? | Só do repo da sessão (casando `repo` + raiz absoluta). |
| D4 | Headless roda na árvore principal ou em worktree? | Árvore principal quando não houver outro agente; worktree só sob a regra da REQ-077, com consulta humana. |
| D5 | Na promoção, conferir a Regra dos 10 em `human-requests/` e arquivar a requisição homologada mais antiga, se preciso. | Via `c2f ai:archive-sdd --repair-links`, com autorização humana. |

---

## 5. Lotes sugeridos (numeração definida na promoção)

### Lote 1 — Spike, contrato e trilho visível
- [ ] 0.1 Regra dos 10 em `human-requests/` (D5).
- [ ] 1.1 **Spike de Channels** (gate do lote): confirmar versão mínima do Claude Code, formato exato da capability e da notificação, flag de carga de canal em desenvolvimento, exigências de conta/organização e **se o painel da extensão do VS Code recebe canal ou só a CLI no terminal**. Saída: `memory/reports/REP-004-claude-code-channels-spike.md`. Se reprovar, o trilho A segue só com fallback.
- [ ] 2.1 `delivery`, `didactic`, novos estados e campos de claim em `dispatchTask.ts` (compatível com registros antigos).
- [ ] 2.2 Claim atômico com lock + verificação do `executionToken` em `reportCompletion.ts`.
- [ ] 2.3 Entrypoint `channel.js`: capability de canal, watcher filtrado por repo, notificação por referência e ferramentas `channel_progress` / `channel_ask_human` / `channel_complete`.
- [ ] 2.4 Texto do modo didático (catálogo de mensagens, sem string solta no código).
- [ ] 2.5 Documentar no `mcp-hub/README.md` como carregar o canal numa sessão.
- [ ] 2.6 Tarefas antigas de `tasks/` (REQ-041 a REQ-051): relatar e **perguntar** antes de mover ou cancelar (DEC-136).
- [ ] 2.7 Testes `node --test`: compatibilidade do `mode` legado, corrida de claim entre dois consumidores, filtro por repo, rejeição de token inválido e notificação JSON-RPC bem formada.

### Lote 2 — Trilho headless e extensão
- [ ] 3.1 Runner `run --once|--watch` com `claude -p --output-format stream-json`, ferramentas permitidas e paradas obrigatórias da seção 2.2.
- [ ] 3.2 Transcript em `sessions/<taskId>.jsonl` + `log_session_event` + `report_completion` automáticos.
- [ ] 3.3 Testes com binário `claude` falso (sem gastar tokens): sucesso, falha, parada por REQ não aprovada e parada por autonomia insuficiente.
- [ ] 4.1 `HubTaskWatcher`: no `dispatched`, notificação com ações **Abrir no chat**, **Rodar headless** e **Copiar prompt**; no `completed`, **Ver transcript**. Lógica em `hubTaskWatcherPolicy.ts` (módulo puro testável).
- [ ] 4.2 Catálogos de localização PT-BR/EN e tooltips; testes de sincronismo existentes passando.
- [ ] 4.3 Docs públicas (`docs/`) com o passo a passo didático: "despache uma tarefa e acompanhe no chat".

---

## 6. Critérios de aceite

1. Um `dispatch_task` com `delivery: "chat"` aparece numa sessão aberta do Claude Code do repo correto **sem digitação humana**, e o progresso chega à timeline em `sessions/` (ou o fallback está documentado e registrado no recibo, se o spike reprovar Channels no painel).
2. Duas sessões abertas: só uma pega a tarefa, e o teste de corrida prova isso.
3. `delivery: "headless"` executa sem chat, grava o transcript e emite o recibo; com a REQ não aprovada, falha antes de chamar o `claude`.
4. Registros antigos sem `delivery` continuam válidos.
5. `npm test` do `mcp-hub` e da extensão 100% verdes; nenhuma chamada real ao `claude` nos testes automatizados.
6. Nenhum commit, push ou deploy feito pelos trilhos durante a validação.

## 7. Validação humana no fim (roteiro acumulado)

- Abrir uma sessão do Claude Code com o canal carregado, despachar uma tarefa de teste com `didactic: true` e acompanhar a narração no chat.
- Rodar a mesma tarefa no headless e abrir o transcript pela extensão.
- Conferir as ações novas da notificação da extensão.

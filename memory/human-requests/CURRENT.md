# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-088.md](req-088.md) (`REQ-088`)
* **Status**: `READY_FOR_EXECUTION` — aguardando início pelo Executor Tático (Fase 1 do `ARCH-018`)
* **Lote Relacionado**: `BATCH-090` ([batch-090.md](../implementation/batch-090.md), a criar/preencher pelo Executor)
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-24
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/archive/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-087.md](req-087.md) (`BATCH-089`, Fase 0 do `ARCH-018`: 4 melhorias operacionais + notas `REP-008` + saneamento `SDD`→`MDD` nas 13 skills + explicitação MDD como evolução do SDD, `HOMOLOGATED` em 2026-11-24)
  - [req-086.md](req-086.md) (`BATCH-088`, Melhorias em 7 skills canônicas na matriz + Propagação Global Isolada via Worktree das 11 skills do ciclo `REQ-084/085/086` em 7/9 satélites com limpeza total das worktrees + alinhamento `AGENTS.md`/`GEMINI.md`; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-085.md](req-085.md) (`BATCH-087`, Melhorias em 4 skills canônicas + 2 micro-ajustes do `REP-007` em PT-BR/EN somente na matriz, `HOMOLOGATED` em 2026-11-23)
  - [req-084.md](req-084.md) (`BATCH-086`, Melhorias em 3 skills canônicas PT-BR/EN na matriz + Faxina Determinística dos 10 Ativos com reescrita de links, `HOMOLOGATED` em 2026-11-23)
  - [req-083.md](req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](archive/req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](archive/req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](archive/req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-088 / BATCH-090 (Fase 1 do ARCH-018)

1. **Rename das 3 Personas + Mapa de Aliases**: renomear `c2f-architect-master` ➔ `c2f-persona-architect`, `c2f-executor-agent` ➔ `c2f-persona-executor` e `c2f-reviewer-agent` ➔ `c2f-persona-reviewer` em PT-BR/EN, 5 kits, templates, `translated.json`, `AGENTS.md`, `GEMINI.md`, `STARTER-PROMPTS.md` e mapa de aliases em `scripts/skills/sync-skills.cjs` (com as 3 personas participando da retroalimentação).
2. **2 Novas Personas Canônicas**: criar `c2f-persona-curator` (escopos global na matriz + local em projetos/satélites) e `c2f-persona-optimizer` em PT-BR/EN, atualizando o catálogo canônico para **48 skills**.
3. **Índice de Skills + `subskills/` + `memory/learnings/`**: gerar `.gemini/skills/index.md`, validar suporte a `subskills/` no `sync-skills.cjs` com 1 subskill piloto real (`c2f-payment-gateways/subskills/mercadopago-webhook-hmac.md`), criar `memory/learnings/` na matriz e nos boilerplates MDD PT-BR/EN (indexado pelo `mdd index`).
4. **Regra dos 10 Ativos + Validação Local (Categoria B, somente matriz)**: arquivar excedentes homologados autorizados preservando originais e links, sincronizar kits/hashes na matriz, validar auditoria (`PASS`, `0` divergências, `0` drift) e `pytest` (`100% PASS`), entregando `batch-090.md` + `FEAT-017` em `ready-for-review` (sem commit/push e sem propagação aos satélites).

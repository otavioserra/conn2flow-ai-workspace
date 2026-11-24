# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-090.md](req-090.md) (`REQ-090`)
* **Status**: `READY_FOR_EXECUTION` — aguardando início pelo Executor Tático (Fase 3 do `ARCH-018`)
* **Lote Relacionado**: `BATCH-092` ([batch-092.md](../implementation/batch-092.md), a criar/preencher pelo Executor)
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
  - [req-089.md](req-089.md) (`BATCH-091`, Fase 2 do `ARCH-018`: barramento `mdd feedback` + inbox `FB-XXX` + GitHub Issues + tools MCP no `conn2flow-hub` + conexão das 4 personas + notas `REP-010` + READMEs 48 skills + Regra dos 10, `HOMOLOGATED` em 2026-11-24)
  - [req-088.md](req-088.md) (`BATCH-090`, Fase 1 do `ARCH-018`: 5 personas canônicas `c2f-persona-*` com mapa de aliases, 48 skills, `.gemini/skills/index.md` + `subskills/` com piloto Mercado Pago, `memory/learnings/` e Regra dos 10 Ativos, `HOMOLOGATED` em 2026-11-24)
  - [req-087.md](req-087.md) (`BATCH-089`, Fase 0 do `ARCH-018`: 4 melhorias operacionais + notas `REP-008` + saneamento `SDD`→`MDD` nas 13 skills + explicitação MDD como evolução do SDD, `HOMOLOGATED` em 2026-11-24)
  - [req-086.md](req-086.md) (`BATCH-088`, Melhorias em 7 skills canônicas na matriz + Propagação Global Isolada via Worktree das 11 skills do ciclo `REQ-084/085/086` em 7/9 satélites com limpeza total das worktrees + alinhamento `AGENTS.md`/`GEMINI.md`; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-085.md](req-085.md) (`BATCH-087`, Melhorias em 4 skills canônicas + 2 micro-ajustes do `REP-007` em PT-BR/EN somente na matriz, `HOMOLOGATED` em 2026-11-23)
  - [req-084.md](req-084.md) (`BATCH-086`, Melhorias em 3 skills canônicas PT-BR/EN na matriz + Faxina Determinística dos 10 Ativos com reescrita de links, `HOMOLOGATED` em 2026-11-23)
  - [req-083.md](req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](archive/req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](archive/req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](archive/req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](archive/req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](archive/req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](archive/req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](archive/req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-090 / BATCH-092 (Fase 3 do ARCH-018)

1. **Extensão VS Code (`vscode-extension/`)**: criar nova aba **"MDD Hub & Skills Control"** (status + Start/Stop/Restart de `mdd-client` e `conn2flow-hub` + listagem e triagem de feedbacks via `mdd feedback`) e sanear rótulos `SDD` → `MDD` (mantendo fallback técnico para `sdd/`).
2. **Paridade MCP, Docs & Poda (`REP-011`)**: fila serial no stdio do `mcp-hub`, paridade `submit_skill_feedback`/`list_skill_feedback` no MCP Python (`mdd-client`), atualizar `docs/` de 45 para 48 skills e executar poda autorizada de `VALIDATION-CHECKLIST.md` mantendo 10 ativos.
3. **Core CLI (`conn2flow/cli/src/` via Worktree Isolada)**: modernizar `SDD` → `MDD` (mantendo alias `ai:archive-sdd`), adicionar suporte a `memory/reports/` e seleção por status no arquivador, publicar em `origin/main` do Core sem tocar na árvore principal e remover/podar 100% a worktree temporária.
4. **Validação Local (Categoria B)**: `npm run compile` na extensão, `npm test` no `mcp-hub`, `pytest` 100% PASS, auditoria e índice PASS, entregando `batch-092.md` + `FEAT-017` em `ready-for-review` (sem commit/push na matriz).

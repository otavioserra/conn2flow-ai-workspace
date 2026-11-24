# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-095.md](req-095.md) (`REQ-095`)
* **Status**: `READY_FOR_EXECUTION` — aguardando início pelo Executor Tático
* **Lote Relacionado**: `BATCH-097` ([batch-097.md](../implementation/batch-097.md), a criar/preencher pelo Executor)
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
  - [req-094.md](req-094.md) (`BATCH-096`, CI Python 211/211 com 96,32% de cobertura [>=95%], correção i18n instantânea da aba MDD Hub + VSIX `v1.2.2` [169/169], poda do checklist e `mdd status` `healthy: true`, `HOMOLOGATED` em 2026-11-24)
  - [req-093.md](req-093.md) (`BATCH-095`, Fase 1 do `ARCH-019`: catálogo plugável `domains/` + `mdd bootstrap`, VSIX `v1.2.1` [166/166, UTF-8, triagem botão direito, hub externo, domínio dinâmico], label `skill-feedback` no `--github`, `FB-004`/`FB-007`, 1ª rodada Optimizer [11 novas subskills, `OVER: 0`], `pytest` 162/162 e `mdd eval` 15/15, `HOMOLOGATED` em 2026-11-24)
  - [req-092.md](req-092.md) (`BATCH-094`, Release VSIX `v1.2.0` [154/154, pronto para instalação local], saneamento cirúrgico de 57 sobras de skills da `REQ-082` em website/Core/Home, atualização completa da documentação viva [READMEs, CHANGELOGs, 11 pares em `docs/`, 284 links PASS] e inventário de curadoria `DEC-136`, `HOMOLOGATED` em 2026-11-24)
  - [req-091.md](req-091.md) (`BATCH-093`, Fase 4 Final do `ARCH-018`: quarentena por recorrência, `--budget-report` + divergência EN, `mdd eval` 13/13, curadoria real `FB-001..003`, `pytest` 153/153, rollout global consolidado em 7/9 satélites via worktree com 100% de limpeza e `ARCH-018` `COMPLETED`; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-24)
  - [req-090.md](req-090.md) (`BATCH-092`, Fase 3 do `ARCH-018`: aba MDD Hub & Skills Control na extensão VS Code [154/154, homologação visual pendente], fila serial `mcp-hub` [7/7], paridade MCP Python [142/142], docs 48 skills, poda do checklist, e Core CLI `ai:archive-memory` publicado em `origin/main` `6e146f7aa8b6` via worktree limpa, `HOMOLOGATED` em 2026-11-24)
  - [req-089.md](req-089.md) (`BATCH-091`, Fase 2 do `ARCH-018`: barramento `mdd feedback` + inbox `FB-XXX` + GitHub Issues + tools MCP no `conn2flow-hub` + conexão das 4 personas + notas `REP-010` + READMEs 48 skills + Regra dos 10, `HOMOLOGATED` em 2026-11-24)
  - [req-088.md](req-088.md) (`BATCH-090`, Fase 1 do `ARCH-018`: 5 personas canônicas `c2f-persona-*` com mapa de aliases, 48 skills, `.gemini/skills/index.md` + `subskills/` com piloto Mercado Pago, `memory/learnings/` e Regra dos 10 Ativos, `HOMOLOGATED` em 2026-11-24)
  - [req-087.md](archive/req-087.md) (`BATCH-089`, Fase 0 do `ARCH-018`: 4 melhorias operacionais + notas `REP-008` + saneamento `SDD`→`MDD` nas 13 skills + explicitação MDD como evolução do SDD, `HOMOLOGATED` em 2026-11-24)
  - [req-086.md](archive/req-086.md) (`BATCH-088`, Melhorias em 7 skills canônicas na matriz + Propagação Global Isolada via Worktree das 11 skills do ciclo `REQ-084/085/086` em 7/9 satélites com limpeza total das worktrees + alinhamento `AGENTS.md`/`GEMINI.md`; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-085.md](archive/req-085.md) (`BATCH-087`, Melhorias em 4 skills canônicas + 2 micro-ajustes do `REP-007` em PT-BR/EN somente na matriz, `HOMOLOGATED` em 2026-11-23)
  - [req-084.md](archive/req-084.md) (`BATCH-086`, Melhorias em 3 skills canônicas PT-BR/EN na matriz + Faxina Determinística dos 10 Ativos com reescrita de links, `HOMOLOGATED` em 2026-11-23)
  - [req-083.md](archive/req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](archive/req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](archive/req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](archive/req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](archive/req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](archive/req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](archive/req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](archive/req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-095 / BATCH-097

1. **Página da Loja Microsoft (`vscode-extension/` → `v1.2.3`)**: reescrever `vscode-extension/README.md` (Overview moderno MDD agnóstico + `domains/` + 5 personas + MDD Hub + Conn2Flow), atualizar subtítulo (`package.nls*.json`), `keywords` e `CHANGELOG.md`, validar testes (`100% PASS`), empacotar `conn2flow-tools-1.2.3.vsix` e limpar `.vsix` antigos (mantendo `1.2.3` e `1.1.7`).
2. **`FB-008` + `EVAL-016`**: aplicar `FB-008` na Armadilha 20 (PT-BR/EN), adicionar `EVAL-016` (`16/16 EVAL-PASS`), manter `OVER: 0` e CI `>= 95%`.
3. **Automação `rollout-satellites.cjs` + Propagação das 11 `subskills/` nos 7 Satélites**: criar script determinístico `scripts/skills/rollout-satellites.cjs` (`--dry-run`/`--apply`, worktree isolada, `git check-ignore`, customização do Core via `mdd sync --customize`, checagem de `origin/main` e limpeza total de worktrees), documentar em `c2f-multilingual-skills-governance`, executar o rollout real nos 7 satélites com `origin` (preservando `conn2flow-home`/`conn2flow-mkt`), confirmar `mdd status` `healthy: true` e entregar `batch-097.md` + `FEAT-017` em `ready-for-review` (sem commit/push na matriz).

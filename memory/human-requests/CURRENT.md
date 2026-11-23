# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: Nenhum (última requisição concluída e homologada: [req-086.md](req-086.md) / `BATCH-088`)
* **Status**: `IDLE` — pronto para abertura da próxima requisição
* **Lote Relacionado**: `BATCH-088` ([batch-088.md](../implementation/batch-088.md), `HOMOLOGATED` em 2026-11-23)
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-23
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/archive/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
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

## Objetivo operacional — REQ-086 / BATCH-088

1. **Fase 1 — Melhorias em 7 Skills na Matriz (`conn2flow-ai-workspace`, PT-BR + EN)**:
   - `c2f-javascript-ajax` e `c2f-module-crud-scaffolding`: listar opções AJAX reservadas pelo núcleo `interface` (`listar`, `verificar-campo`, `backup-campos-mudou`, `historico-mais-resultados`) e corrigir o exemplo da linha 48 de `c2f-javascript-ajax`.
   - `c2f-project-pipeline-and-tasks` + alinhamento em `c2f-executor-agent`: clarificar que lote de Core indo ao Lab de projeto (`local: true`) usa `./c2f project:update-all <id>` (com `--skip-css` na Categoria A), mantendo a proibição na rotina pura de projeto (`project:deploy <id>`).
   - `c2f-environment-configuration`: inspecionar `APP_ENV` no código do Core (somente leitura) e documentar o comportamento real na comunicação.
   - `c2f-database-testing`: documentar isolamento/reset do `HookManager` via `Reflection` + executor SQL e relógio injetáveis.
   - `c2f-shell-and-windows-traps`: adicionar micro-nota sobre Python `glob(recursive=True)` ignorar pastas com ponto (usar `os.walk`/`rglob`) e uso de `.\.venv-mdd\Scripts\pytest.exe` na matriz.
   - Sincronizar 5 kits/templates na matriz, atualizar os 7 hashes EN, validar auditoria (`PASS`, `0` divergências, `0` drift) e `pytest` (`100% PASS`).
2. **Fase 2 — Propagação & Integração Isolada via Worktree das 11 Skills do Ciclo (`REQ-084`/`085`/`086`) nos Satélites**:
   - Criar worktree temporária a partir de `origin/main` para cada satélite com `origin`, aplicar as 11 skills atualizadas (preservando a customização reconhecida do Core em `c2f-multilingual-skills-governance` via `mdd sync --customize`), fazer commit seletivo, respeitar a regra de avanço concorrente da `main`, integrar e dar `git push origin main` sem tocar nas árvores principais.
   - `conn2flow-home` e `conn2flow-mkt` (sem `origin`): manter sem alteração na árvore principal e reportar para os chefes locais.
   - Remover e podar todas as worktrees temporárias (`git worktree remove` + `git worktree prune`), entregar `batch-088.md` + `FEAT-017` + `VALIDATION-CHECKLIST.md` + índices MDD em `ready-for-review` (sem commit/push na matriz).

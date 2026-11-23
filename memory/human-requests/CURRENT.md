# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: Nenhum (última requisição concluída e homologada: [req-083.md](req-083.md) / `BATCH-085`)
* **Status**: `IDLE` — pronto para abertura da próxima requisição
* **Lote Relacionado**: `BATCH-085` ([batch-085.md](../implementation/batch-085.md), `HOMOLOGATED` em 2026-11-23)
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-23
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-083.md](req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-083 / BATCH-085

1. **Fase 1 — Ajustes do `REP-005` na Matriz**: Atualizar `c2f-multilingual-skills-governance` (escopo de escrita vs. auditoria global + fluxo `mdd sync --customize`) e `c2f-mdd-indexing-and-handoffs` (paridade Python/PHP), sincronizar os 5 kits/templates PT-BR/EN na matriz, atualizar hashes e validar auditoria + `pytest`.
2. **Fase 2 — Paridade PHP no Core + Integração Isolada via Worktree nos 9 Satélites**: Sem alterar ou descartar trabalho nas árvores principais dos chefes de cada satélite, criar worktree temporária a partir de `origin/main` para cada satélite, aplicar as 4 skills atualizadas (no Core `conn2flow`, incluir também a paridade PHP de `memory:get/set` por ID YAML/slug com PHPUnit + `memory/sync-customizations.json`), commitar seletivamente, integrar em `main` e executar `git push origin main`.
3. **Limpeza Obrigatória de Worktrees (`REQ-077`)**: Auditar, remover cada worktree temporária (`git worktree remove` + `git worktree prune`), deletar branches temporárias mescladas e entregar relatório consolidado em `memory/implementation/batch-085.md` (matriz pronta para homologação e commit/push pelo Arquiteto Master).

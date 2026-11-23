# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-083.md](req-083.md) (Integração Isolada via Worktree — Commit, Merge na `main`, Push e Limpeza — das Skills Propagadas nos Repositórios Satélites)
* **Status**: `APPROVED` — pronto para execução (`Categoria B`: worktrees isoladas, commits seletivos, merge/push na `main` dos satélites e remoção das worktrees; sem deploy no Lab)
* **Lote Relacionado**: `BATCH-085` ([batch-085.md](../implementation/batch-085.md))
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto especifica ➔ Executor integra nos satélites via worktree isolada, limpa worktrees e entrega relatório ➔ Retorno ao Macro-Arquiteto e homologação humana)
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

1. **Integração Isolada nos Satélites via Worktree**: Sem alterar, commitar ou descartar trabalho em andamento nas árvores principais dos chefes de cada satélite, criar worktree temporária a partir de `origin/main` para cada satélite elegível (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`, `conn2flow-home`, `website-conn2flow`, `conn2flow-app`, `conn2flow-mkt`, `conn2flow-nexus`).
2. **Commit Seletivo, Merge na `main` e `git push`**: Aplicar na worktree apenas as 4 skills homologadas da `REQ-081`/`REQ-082` (e `memory/sync-customizations.json` no Core), commitar seletivamente, integrar em `main` e executar `git push origin main`.
3. **Limpeza Obrigatória de Worktrees (`REQ-077`)**: Auditar, remover cada worktree temporária (`git worktree remove` + `git worktree prune`), deletar branches temporárias mescladas e entregar relatório consolidado em `memory/implementation/batch-085.md`.

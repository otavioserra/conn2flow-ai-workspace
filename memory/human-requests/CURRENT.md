# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-082.md](req-082.md) (Propagação Global das Skills da `REQ-081` aos Projetos Satélites + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] com Segunda Publicação Condicionada)
* **Status**: `APPROVED` — pronto para execução (`Categoria B`: propagação de skills, melhorias na matriz e checks locais, sem deploy no Lab; Gate humano antes da Fase 3)
* **Lote Relacionado**: `BATCH-084` ([batch-084.md](../implementation/batch-084.md))
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto especifica ➔ Executor executa Fases 1 e 2 e entrega relatório ➔ Revisão/Gate para Fase 3)
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-21
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-081.md](req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-082 / BATCH-084

1. **Fase 1 — Propagação Inicial (`REQ-081` homologada)**: Publicar `c2f-architect-master` e `c2f-executor-agent` em todos os projetos satélites oficiais (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`, `conn2flow-home` e eventuais projetos irmãos locais como `website-conn2flow`), preservando customizações intencionais e skills locais.
2. **Fase 2 — Melhorias do `REP-004` (`FEAT-018` e `FEAT-019`) + Regra Git na Matriz**: Atualizar `c2f-multilingual-skills-governance` (`--repos conn2flow-ai-workspace` + CRLF/LF), implementar resolução por ID YAML/slug no `mdd_client` (`indexer.py` + `test_indexer.py`) e atualizar `c2f-mdd-indexing-and-handoffs`, incluir diretriz de higiene da árvore Git/merge na `main` em `c2f-architect-master`, avaliar/tratar finais de linha com segurança; sincronizar matriz PT/EN, atualizar hashes e rodar auditoria + `pytest` local.
3. **Gate para Fase 3**: Entregar o relatório `batch-084.md` (com Relatório de Dificuldades para o AI Workspace) e aguardar validação antes de propagar as melhorias da Fase 2 aos projetos satélites.

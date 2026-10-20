# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-077.md](req-077.md) (Restrição Canônica de Worktrees, Instituição do Pipeline Padrão `project:deploy` e Banimento de `project:update-all` na Rotina de Projetos)
* **Status**: `APPROVED` para execução
* **Lote Relacionado**: `BATCH-079`
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto planeja ➔ Executor implementa e audita ➔ Humano homologa)
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-20
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
  - [req-069.md](req-069.md) (`BATCH-071`, Aplicações Python MDD Client CLI/Daemon e MDD Hub, concluída em tools/)
  - [req-070.md](req-070.md) (`BATCH-072`, Revamp da Documentação Pública e READMEs Raiz, `HOMOLOGATED` em 2026-10-09)
  - [req-068.md](req-068.md) (`BATCH-070`, Migração Estrutural MDD nos 7 Repositórios Satélites, `HOMOLOGATED` em 2026-10-09)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-077 / BATCH-079

1. **Substituição de `project:update-all` por `project:deploy <id>`**: Corrigir em `AGENTS.md`, `GEMINI.md`, prompts de agentes, hooks de guarda e skills (`c2f-project-pipeline-and-tasks`, `c2f-executor-agent`, `c2f-resources-system`) para consolidar `project:deploy` como pipeline padrão (95% dos casos) e banir `project:update-all` na rotina normal de projetos.
2. **Nova Regra Canônica de Worktrees**: Proibir criação de worktrees por comodidade; permitir apenas sob comprovada concorrência de múltiplos agentes em paralelo, com consulta humana mandatória em caso de dúvida; e instituir expurgo obrigatório (`git worktree remove` + `prune`) ao término do lote.
3. **Descarte Seguro de Pastas Residuais**: Auditar e desvincular as 17 pastas residuais listadas pelo Engenheiro Chefe no Core e no Site.
4. **Propagação Canônica e Testes**: Propagar as 45 skills com `sync-skills.cjs`, regenerar índices e validar com 100% PASS em Python (131/131) e Extensão (133/133).

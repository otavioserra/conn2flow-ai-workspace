# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-076.md](req-076.md) (Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
* **Status**: `APPROVED` para execução
* **Lote Relacionado**: `BATCH-078`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-15
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
  - [req-069.md](req-069.md) (`BATCH-071`, Aplicações Python MDD Client CLI/Daemon e MDD Hub, concluída em tools/)
  - [req-070.md](req-070.md) (`BATCH-072`, Revamp da Documentação Pública e READMEs Raiz, `HOMOLOGATED` em 2026-10-09)
  - [req-068.md](req-068.md) (`BATCH-070`, Migração Estrutural MDD nos 7 Repositórios Satélites, `HOMOLOGATED` em 2026-10-09)
  - [req-067.md](req-067.md) (`BATCH-069`, Fundação Estrutural MDD na Matriz, `HOMOLOGATED` em 2026-10-09)
  - [req-062.md](archive/req-062.md) (`BATCH-064`, Testes locais e release v1.1.2 da extensão VS Code, arquivado em espera de testes)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-076 / BATCH-078

1. **Poda e Desvinculação de Worktrees**: Limpar com segurança worktrees já integradas no Core (12 worktrees) e Site (5 worktrees + pasta órfã) e podar referências com `git worktree prune`.
2. **Memory Gardening & Regra dos 10**:
   - Core (`conn2flow`): Podar `human-requests/` de 21 para 10 e `implementation/` de 21 para 10; podar checklist e decisões.
   - Site (`conn2flow-site`): Podar `implementation/` de 23 para 10 e reduzir `PENDENCIAS-HUMANAS.md` de 73.2 KB para < 25 KB.
3. **Higienização de Working Tree no Site**: Restaurar `.tailwind-build-manifest.json` e CSS pré-compilados do caminho temporário `../../conn2flow-req277/` de volta para `../../conn2flow/`.
4. **Sincronização e Auditoria**: Rodar `git pull` em todos os repositórios, validar paridade das 45 skills via `sync-skills.cjs`, regenerar índices com `mdd index` e validar suítes de testes (Python 131/131 PASS, Extensão 133/133 PASS).

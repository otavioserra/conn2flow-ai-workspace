# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-075.md](req-075.md) (Skills MDD e proporcionalidade de build)
* **Status**: `APPROVED` para execução
* **Lote Relacionado**: `BATCH-077`
* **Topologia de Agentes**: `triade`
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-14
* **Entrega anterior**: [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md), homologação visual adiada pelo humano.
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

## Objetivo operacional — REQ-075 / BATCH-077

1. Renomear quatro skills para MDD, manter 45 canônicas e migrar as cópias sem pastas legadas.
2. Instituir proporcionalidade A/B/C e --skip-css conforme código do Core.
3. Propagar, testar e emitir revisão independente.
4. Registrar homologações pendentes na fila humana, sem assinar; commit/push/merge autorizados na sessão de 2026-10-14.

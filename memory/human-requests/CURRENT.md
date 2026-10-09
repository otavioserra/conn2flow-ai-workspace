# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-068.md](req-068.md) (Frente 1: Satélites) & [req-069.md](req-069.md) (Frente 2: Python MDD Client & Hub)
* **Status**: `APPROVED` (aprovadas para execução paralela por agentes de implementação)
* **Lotes Relacionados**: `BATCH-070` e `BATCH-071`
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto planeja e homologa; Executores implementam)
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-09
* **Frentes em Execução / Espera**:
  - [req-068.md](req-068.md) (`BATCH-070`, Migração Estrutural MDD nos 7 Repositórios Satélites, `APPROVED`)
  - [req-069.md](req-069.md) (`BATCH-071`, Implementação das Aplicações Python MDD Client & Hub, `APPROVED`)
  - [req-062.md](req-062.md) (`BATCH-064`, Testes locais e release v1.1.2 da extensão VS Code, em espera de homologação humana)
  - [req-067.md](req-067.md) (`BATCH-069`, Fundação Estrutural MDD na Matriz, `HOMOLOGATED` e PUSH realizado)

---

## 🎯 Objetivo Operacional das Frentes Ativas

1. **Frente 1 (BATCH-070 / REQ-068)**:
   Migração de `sdd/` para `memory/`, injeção da Tríade Fundamental (00, 01, 02), `index.md` hierárquico e 44 skills canônicas em todos os 7 repositórios satélites (`conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`).

2. **Frente 2 (BATCH-071 / REQ-069)**:
   Implementação das duas aplicações em Python 3.11+ em `tools/`:
   - `tools/mdd-client/`: CLI `mdd` (init, sync, compact, status, report, daemon).
   - `tools/mdd-hub/`: Hub API e Documentation Watcher com os 3 modos de autonomia (`headless`, `monitored`, `reviewer`).

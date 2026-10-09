# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-071.md](req-071.md) (Padronização das Memórias 03 e 04, Integração com raw/ e Boilerplates) & [req-069.md](req-069.md) (Aplicações Python MDD Client & Hub)
* **Status**: `APPROVED` (prontas para execução por agentes de implementação)
* **Lotes Relacionados**: `BATCH-073` e `BATCH-071`
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto planeja e homologa; Executores implementam)
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-09
* **Frentes Concluídas Recentemente / Em Espera**:
  - [req-070.md](req-070.md) (`BATCH-072`, Revamp da Documentação Pública, READMEs Raiz e docs/, `HOMOLOGATED` em 2026-10-09)
  - [req-068.md](req-068.md) (`BATCH-070`, Migração Estrutural MDD nos 7 Repositórios Satélites, `HOMOLOGATED` em 2026-10-09)
  - [req-067.md](req-067.md) (`BATCH-069`, Fundação Estrutural MDD na Matriz, `HOMOLOGATED` em 2026-10-09)
  - [req-062.md](req-062.md) (`BATCH-064`, Testes locais e release v1.1.2 da extensão VS Code, em espera de testes locais pelo humano)

---

## 🎯 Objetivo Operacional das Frentes Ativas

1. **Frente Imediata (BATCH-073 / REQ-071)**:
   Padronização nominal para `03-memory-engineering-chief.md` e `04-memory-engineering-execution.md` na raiz de `memory/`, integração com `memory/raw/` para histórico e podas, propagação nos 7 repositórios satélites e atualização dos boilerplates e skeletons em `templates/`.

2. **Frente Python (BATCH-071 / REQ-069)**:
   Implementação modular em Python 3.11+ em `tools/`:
   - `tools/mdd-client/`: CLI `mdd` (init, sync, compact, status, report, daemon).
   - `tools/mdd-hub/`: Hub API (FastAPI) e Documentation Watcher para auto-evolução contínua.

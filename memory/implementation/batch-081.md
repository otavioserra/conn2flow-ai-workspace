---
id: "BATCH-081"
type: "batch"
status: "in-progress"
request: "REQ-079"
updated: "2026-11-05"
title: "Implementação do Motor de Banco de Dados MDD (SQLite3 + FTS5 Local e Multi-Driver SQL) no mdd-client"
---

# BATCH-081: Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client`

- **Requisição Vinculada**: [req-079.md](../human-requests/req-079.md)
- **Backlog Promovido**: [ARCH-017](../backlog/ARCH-017-mdd-database-engine-sqlite-fts5-and-sql-driver.md)
- **Repositórios Pareados**: `conn2flow-site` (`REQ-147` / `BATCH-139` — módulo `ai-memory`) e `conn2flow-home` (`REQ-012` / `BATCH-011` — `c2f-media-engine`)
- **Status**: `in-progress`
- **Data de Abertura**: 2026-11-05

---

## Checklist de Execução (`BATCH-081`)

- [ ] **1. Engine SQLite3 + FTS5 (`tools/mdd-client/src/mdd_client/db.py`)**:
  - [ ] Implementar `SQLiteMDDDriver` com `PRAGMA journal_mode=WAL`, tabelas `mdd_memories`, `mdd_memories_fts` (FTS5 BM25 com `unicode61 remove_diacritics 2` + triggers de sincronia) e `mdd_memory_links`.
  - [ ] Ignorar `.mdd.sqlite*` no `.gitignore`.
- [ ] **2. Sincronização Incremental e Grafo (`mdd db sync` & `mdd db graph`)**:
  - [ ] Parser incremental por `checksum_sha256` das 4 camadas MDD (`normative`, `procedural`, `episodic`, `raw`) e extração automática de arestas relacionais (`REQ ↔ BATCH ↔ ARCH/BL ↔ REV`).
- [ ] **3. CLI & Interoperabilidade com `ai_memories` (`tools/mdd-client/src/mdd_client/cli.py`)**:
  - [ ] Subcomandos `mdd db sync`, `mdd db query`, `mdd db graph`, `mdd db learn`, `mdd db export` e `mdd db import`.
- [ ] **4. Testes Automatizados (`tools/mdd-client/tests/test_db_engine.py`)**:
  - [ ] 100% PASS na suíte `pytest` existente + novos testes do motor SQLite/FTS5.

---
id: "BATCH-081"
type: "batch"
status: "ready-for-review"
request: "REQ-079"
updated: "2026-11-05"
title: "Implementação do Motor de Banco de Dados MDD (SQLite3 + FTS5 Local e Multi-Driver SQL) no mdd-client"
---

# BATCH-081: Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client`

- **Requisição Vinculada**: [req-079.md](../human-requests/req-079.md)
- **Backlog Promovido**: [ARCH-017](../backlog/ARCH-017-mdd-database-engine-sqlite-fts5-and-sql-driver.md)
- **Repositórios Pareados**: `conn2flow-site` (`REQ-147` / `BATCH-139` — módulo `ai-memory`) e `conn2flow-home` (`REQ-012` / `BATCH-011` — `c2f-media-engine`)
- **Status**: `ready-for-review`
- **Data de Abertura**: 2026-11-05

---

## Checklist de Execução (`BATCH-081`)

- [x] **1. Engine SQLite3 + FTS5 (`tools/mdd-client/src/mdd_client/db.py`)**:
  - [x] Implementar `SQLiteMDDDriver` com `PRAGMA journal_mode=WAL`, tabelas `mdd_memories`, `mdd_memories_fts` (FTS5 BM25 com `unicode61 remove_diacritics 2` + triggers de sincronia) e `mdd_memory_links`.
  - [x] Ignorar `.mdd.sqlite*` no `.gitignore`.
- [x] **2. Sincronização Incremental e Grafo (`mdd db sync` & `mdd db graph`)**:
  - [x] Parser incremental por `checksum_sha256` das 4 camadas MDD (`normative`, `procedural`, `episodic`, `raw`) e extração automática de arestas relacionais (`REQ ↔ BATCH ↔ ARCH/BL ↔ REV`).
- [x] **3. CLI & Interoperabilidade com `ai_memories` (`tools/mdd-client/src/mdd_client/cli.py`)**:
  - [x] Subcomandos `mdd db sync`, `mdd db query`, `mdd db graph`, `mdd db learn`, `mdd db export` e `mdd db import`.
- [x] **4. Testes Automatizados (`tools/mdd-client/tests/test_db_engine.py`)**:
  - [x] 100% PASS na suíte `pytest` existente + novos testes do motor SQLite/FTS5.

## Evidências de execução — 2026-11-05

- SQLiteMDDDriver entregue com WAL, FTS5/BM25, gatilhos, links, escopo e importação JSONL transacional. CLI: sync/query/graph/learn/export/import.
- `python -m pytest tools/mdd-client/tests -q --junitxml=completions/BATCH-081-pytest.xml`: 114 testes PASS, sem falhas ou skips. Ruff nos arquivos alterados: PASS.
- `python tools/mdd-client/tests/benchmark_db.py`: sincronização incremental de 275 documentos, 0 alterados/275 preservados, 69,27 ms no motor; wall time da CLI de 1.273 ms inclui inicialização.
- Aprendizado Markdown preserva backup original; arquivos históricos recebem ID distinto; importação inválida reverte integralmente a transação. Banco derivado ignorado pelo Git.
- Interoperabilidade Python → PHP → Python: quatro camadas, conteúdo/SHA/tags/identidade preservados e quatro resultados FTS.
- Evidência: `completions/BATCH-081-pytest.xml`; relatório integrado no repositório pareado: `conn2flow-site/memory/validation/media-engine/report.json`.

## Handoff ao Macro-Arquiteto

Projeto: `conn2flow-ai-workspace`; raiz: `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`; requisição: `REQ-079`; lote: `BATCH-081`. Escopo implementado e evidências acima. Topologia `dupla`, autonomia `supervisionado`: entrega para revisão; somente o humano homologa. Sem commit ou push. Pendências externas e limitações do teste constam do relatório integrado.

- [ ] Revisão do Macro-Arquiteto e homologação humana.

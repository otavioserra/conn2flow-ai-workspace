# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-055.md](req-055.md)
* **Status**: `READY_FOR_EXECUTION`
* **Lote Relacionado**: `BATCH-057`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-17
* **Lote Anterior Concluído**: [req-054.md](req-054.md) (`BATCH-056`)

## 🎯 Objetivo Operacional do Lote BATCH-057

Consolidação canônica e sincronização das 39 skills em todos os 5 repositórios:
1. Consolidar na matriz central (`conn2flow-ai-workspace`) as melhorias de `c2f-shell-and-windows-traps` (`MSYS_NO_PATHCONV=1` no rsync) e `c2f-javascript-ajax` (CSRF em `XMLHttpRequest` cru).
2. Distribuir e espelhar as 39 skills oficiais para os 5 repositórios (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`), incluindo as 3 skills da Tríade SDD.
3. Auditar a igualdade de hash garantindo zero divergência em todo o ecossistema.

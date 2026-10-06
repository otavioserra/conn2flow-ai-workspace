# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-066.md](req-066.md)
* **Status**: `APPROVED` (aprovada pelo Humano para execução de Memory Gardening e limpeza)
* **Lote Relacionado**: `BATCH-068`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-06
* **Lotes Anteriores / Em Espera**:
  - [req-062.md](req-062.md) (`BATCH-064`, release v1.1.2 da extensão VS Code, em espera de testes locais/publicação humana)
  - [req-065.md](req-065.md) (`BATCH-067`, 43 skills canônicas, visual assets, migração Tailwind, Armadilha 17, `HOMOLOGATED` em 2026-10-04)
  - [req-064.md](req-064.md) (`BATCH-066`, lições de pipeline e traps nas skills, `ready-for-review`)
  - [req-063.md](req-063.md) (`BATCH-065`, Chrome DevTools MCP, `HOMOLOGATED`)

---

## 🎯 Objetivo Operacional do Lote Ativo (BATCH-068)

Memory Gardening global do ecossistema SDD: poda e arquivamento de dumps JSON gigantes no Core (`req240-browser-results.json` de 344 KB e `req225-inventory.json` de 224 KB), saneamento de `DECISION-LOG.md`, `VALIDATION-CHECKLIST.md` e `BATCH-INDEX.md` no Core e no Site para estrito cumprimento da Regra dos 10 Ativos e teto de 50 KB, remoção de worktrees já integradas à branch main (`conn2flow-req240` e `conn2flow-site-req106`) e exclusão de arquivos de backup temporários `*.precompiled.css.bak-*` no `conn2flow-site`.

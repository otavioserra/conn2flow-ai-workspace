# ARCH-006 — Sincronização Global de Skills nos Repositórios Satélites & Poda de Governança SDD

* **Status**: `ICEBOX`
* **Tipo**: Governança & Arquitetura
* **Autor**: Macro-Arquiteto (a partir do Achado no BATCH-047)
* **Data de Criação**: 2026-09-01
* **Repositórios Alvo**: `conn2flow-ai-workspace`, `conn2flow-site`, `lumix`, `transformamp`

---

## 🎯 Contexto e Motivação

1. **Divergência de Skills nos Satélites**: As skills `c2f-dev-scripts` e `c2f-html-css-pages-and-components` foram atualizadas e propagadas no AI Workspace e no Core, mas os repositórios satélites (`conn2flow-site`, `lumix`, `transformamp`) permanecem com os hashes anteriores até execução do instalador de kit.
2. **Poda e Jardinagem de Memória SDD**: O arquivo `sdd/validation/VALIDATION-CHECKLIST.md` atingiu ~62 KB e o `sdd/implementation/BATCH-INDEX.md` acumula 18 lotes ativos, excedendo a recomendação de teto de 10 lotes ativos da `MEMORIA-ENGENHARIA-CHEFIA.md` §4.

---

## 📋 Escopo Proposto

1. Executar a sincronização de kits de skills em lote para os repositórios satélites via script CLI oficial.
2. Arquivar os lotes antigos (`BATCH-030` a `BATCH-040`) em `sdd/validation/archive/` e `sdd/implementation/archive/` mantendo apenas os 10 lotes mais recentes nos índices ativos.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

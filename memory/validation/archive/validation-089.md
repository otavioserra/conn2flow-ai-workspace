# Validation Checklist — Histórico Arquivado (BATCH-089)

Seção movida de `../VALIDATION-CHECKLIST.md` em 2026-11-24 pela poda autorizada da REQ-091 / BATCH-093 (DEC-136, confirmação do Operador Humano), mantendo 10 entradas ativas. Lote homologado. Texto preservado; apenas os links relativos foram reescritos para esta pasta. Original integral (bytes intactos, links relativos à localização original): [VALIDATION-CHECKLIST-4ebc09f79d5b.md](<original/VALIDATION-CHECKLIST-4ebc09f79d5b.md>) (SHA-256 `4ebc09f79d5bf62b257df89f51abacacd89a6c5728db961538b428554b0596ee`).

## BATCH-089 — REQ-087 (2026-11-24)

- [x] Quatro melhorias operacionais e micro-ajustes do REP-008 em PT-BR/EN: `c2f-hooks-system`, `c2f-payment-gateways` (Core conferido em modo somente leitura, na branch REQ-305), `c2f-architect-master` + `STARTER-PROMPTS.md`, `c2f-shell-and-windows-traps` e `c2f-multilingual-skills-governance`.
- [x] Saneamento SDD→MDD nas 13 skills: de 43 para 7 linhas em PT-BR e de 43 para 8 em EN. Restam apenas o fallback legado e o comando `ai:archive-sdd`.
- [x] MDD como evolução do SDD em `00-baseline-architecture.md`, `02-policy.md` e nos boilerplates MDD PT-BR/EN.
- [x] Sync da matriz e 15 hashes EN. Auditoria PASS em 19 alvos, com 0 divergências e 0 drift. Pytest 119/119 depois dos hashes.
- [x] Lote e FEAT-017 em `ready-for-review`, índices MDD atualizados e FEAT-015 fora do stage. [Lote](../../implementation/archive/batch-089.md) · [Relatório](../../reports/archive/REP-009-batch089-phase0-skills-and-sdd-cleanup.md).
- [ ] Decisão do Arquiteto sobre o arquivamento da Regra dos 10 (11 lotes ativos).
- [ ] Homologação humana e commit/push seletivos da matriz.

# Validation Checklist — Histórico Arquivado (BATCH-090 a BATCH-092)

Seções homologadas movidas na REQ-094 / BATCH-096. Os links relativos foram reancorados para esta pasta. [Original integral](<original/VALIDATION-CHECKLIST-3bdd0b7f0cfa.md>) com SHA-256 3bdd0b7f0cfa50e906a86f5ed62608dbcad45cb96b1625ae68325f6baa06dd73.

## BATCH-092 — REQ-090 (2026-11-24)

- [x] Extensão: aba **MDD Hub & Skills Control** (`conn2flow-mdd-hub`) com status `RUNNING`/`STOPPED` + PID/porta e Iniciar/Parar/Reiniciar de `mdd-client` e `conn2flow-hub`, listagem `mdd feedback list --json` por veredito e triagem via `mdd feedback triage`; rótulos SDD→MDD com fallback `sdd/` preservado. `npm test` **154/154** (inclui `mddHubPolicy.test.cjs`); smoke real de Start/Stop do daemon SSE (porta em 777 ms, `taskkill /T` encerrou 4 processos).
- [x] `mcp-hub`: fila serial no stdio (`startStdio` + `processLine`), `dist/` recompilado, `npm test` **7/7** (+2 em `stdioQueue.test.cjs`).
- [x] MCP Python: `submit_skill_feedback` e `list_skill_feedback` em `mdd mcp` reaproveitando `feedback.py`; pytest **142/142** (141 + `test_python_mcp_feedback_tools_match_cli`; `test_mcp.py` passou a esperar 11 tools).
- [x] `docs/`: 11 arquivos de 45 para 48 skills; catálogos PT-BR/EN com 48 linhas, 4 links `sdd-*` corrigidos para `mdd-*` e `c2f-multilingual-skills-governance` incluída (0 links quebrados).
- [x] Poda deste checklist (DEC-136, autorizada): 14 seções homologadas movidas para [validation-069-088.md](../archive/validation-069-088.md) (50 links rebaseados), original byte a byte em `archive/original/` (SHA-256 `b3b8b810…`); 10 ativos (este + 6 pendentes 076–081 + 089–091); 0 links quebrados antes e depois. Regra dos 10 com o `ai:archive-memory --status=HOMOLOGATED,REVIEWED` novo: `req-083`, `batch-087`, `REP-007` arquivados (18 links, só os afetados).
- [x] Core via worktree isolada `_wt-req090-conn2flow`: `ai:archive-memory` canônico (alias `ai:archive-sdd`), `reports/`, `--folders`, `--status`, reescrita só dos links afetados e destinos `<...>`; PHPUnit **13/13** nos testes do arquivador; suíte Unit com as mesmas 29 falhas do `origin/main` intacto (ambiente sem `vendor/`/OpenSSL); `docs:audit` 0 erros. Publicado em `origin/main` **`6e146f7aa8b6`** por fast-forward; worktree removida, branch apagada e `git worktree prune` sem resíduo.
- [x] Auditoria PASS (19 alvos, 0 divergências), governança PASS (240 cópias), índice `--check` PASS (48). FB-001..003 registrados na inbox. Lote e FEAT-017 ([REP-012](../../reports/REP-012-batch092-hub-control-and-core-cli.md)) em `ready-for-review`; FEAT-015 fora do stage. [Lote](../../implementation/batch-092.md).
- [ ] Homologação humana (incluindo teste visual da aba no VS Code) e commit/push seletivos da matriz pelo Arquiteto.

## BATCH-091 — REQ-089 (2026-11-24)

- [x] `mdd feedback submit/list/triage` no `mdd-client`, gravando `FB-XXX-<slug>.md` em `memory/inbox/feedback/`, atualizando `index.md` e o SQLite (quando presente) e suportando `--github` por runner injetável (mock nos testes).
- [x] `submit_skill_feedback` e `list_skill_feedback` no `conn2flow-hub` (`mcp-hub/`), delegando ao CLI; `npm test` 5/5 e teste ponta a ponta hub → CLI no pytest.
- [x] 4 personas (PT-BR + cópias EN) usando `mdd feedback` / MCP; ordem do rename em `c2f-multilingual-skills-governance`; CRLF normalizado em `audit-mdd-governance.cjs` (com teste); `README.md` e `README-PT-BR.md` em 48 skills.
- [x] Regra dos 10: `human-requests/`, `implementation/` e `reports/` com 10 ativos cada (`req-082`, `batch-086`, `BL-028`, `REP-001` arquivados); pendentes do CURRENT protegidos; 176 links quebrados antes e depois (0 novos); `04-memory-engineering-execution.md` intacta.
- [x] Auditoria PASS (19 alvos, 0 divergências, 0 drift, 0 legados), governança PASS (240 cópias), índice `--check` PASS e pytest 141/141 depois dos 5 hashes EN. Lote, FEAT-017 ([REP-011](../../reports/REP-011-batch091-feedback-bus-learnings.md)) e índices em `ready-for-review`; FEAT-015 fora do stage. [Lote](../../implementation/archive/batch-091.md).
- [ ] Decisão do Arquiteto sobre `docs/` (45 skills), tools de feedback no MCP Python e poda deste checklist.
- [ ] Homologação humana e commit/push seletivos da matriz; rollout das Fases 0+1+2 aos satélites em requisição própria.

## BATCH-090 — REQ-088 (2026-11-24)

- [x] Rename para `c2f-persona-architect`, `c2f-persona-executor` e `c2f-persona-reviewer` em PT-BR/EN, 5 kits, templates, `translated.json`, `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` e `STARTER-PROMPTS.md`. Mapa de aliases no `sync-skills.cjs`: 46 pastas migradas, 0 legados.
- [x] `c2f-persona-curator` (escopos global e local) e `c2f-persona-optimizer` em PT-BR/EN. Catálogo canônico com 48 skills.
- [x] `.gemini/skills/index.md` gerado por `generate-skills-index.cjs` (`--check` PASS). `subskills/` suportado no sync, com o piloto `c2f-payment-gateways/subskills/mercadopago-webhook-hmac.md` em PT-BR/EN.
- [x] `memory/learnings/` na matriz e nos boilerplates MDD PT-BR/EN, criada pelo `mdd init`, indexada pelo `mdd index` e coberta por teste.
- [x] Regra dos 10: `human-requests/` e `implementation/` com 10 ativos cada (6 arquivados pelo `ai:archive-sdd` com `--protect`). Nenhum órfão novo; `04-memory-engineering-execution.md` intacta (SHA-256 inalterado).
- [x] Auditoria PASS (19 alvos, 0 divergências, 0 drift), governança PASS e pytest 130/130 depois dos 7 hashes EN. Lote, FEAT-017 ([REP-010](../../reports/archive/REP-010-batch090-personas-subskills-learnings.md)) e índices em `ready-for-review`; FEAT-015 fora do stage. [Lote](../../implementation/archive/batch-090.md).
- [ ] Decisão do Arquiteto sobre a Regra dos 10 em `memory/reports/` (11 relatórios) e a poda deste checklist (321 linhas).
- [ ] Homologação humana e commit/push seletivos da matriz; propagação aos satélites em requisição própria.


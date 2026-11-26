# Validation Checklist â€” BATCH-095

SeÃ§Ã£o homologada arquivada no BATCH-099 (poda da REQ-097), movida integralmente sem alteraÃ§Ãµes.

## BATCH-095 — REQ-093 (2026-11-24)

- [x] Extensão v1.2.1: UTF-8 (`PYTHONUTF8`/`PYTHONIOENCODING`) em toda chamada `mdd`, triagem também no botão direito, progresso em Refresh/Toggle GitHub, `conn2flow-hub` externo como `RUNNING (externo)` sem controles, `.vscode/mcp.json` só com `servers`. Compile PASS, 166/166 testes, VSIX `conn2flow-tools-1.2.1.vsix` com 98 arquivos e `unzip -t` limpo.
- [x] `mdd feedback --github` cria a label `skill-feedback` (`gh label create … --force`) antes da Issue, com 2 testes `pytest`. FB-008 sintético removido e índice da inbox regenerado (o id foi reaproveitado por um FB real deste lote).
- [x] FB-004 e FB-007 aplicados; 4 skills OVER extraídas para 11 subskills novas em PT-BR/EN. `--budget-report` com `OVER: 0`, índice PASS, auditoria PASS (0 divergências, 0 drift, 0 divergência entre cópias EN), `pytest` 162/162 e `mdd eval` EVAL-PASS 15/15.
- [x] ARCH-019 Fase 1: `domains/` (`README.md`, `generic`, `conn2flow`), `mdd bootstrap` (`--list-domains`, `--domain auto|<id>`, detecção de stack, memória e guia local sem sobrescrever) com domínio `laravel` de fixture e idempotência; `conn2flow.projectDomain` aberto (padrão `auto`) e QuickPick dinâmico "Inicializar MDD neste Projeto".
- [x] Regra dos 10 com `ai:archive-memory` (Core `230262177a27` via `git archive`): req-085/086, batch-089/090 e REP-009/010 arquivados; janelas em 10/10/10. Lote, REP-015 (FEAT-017) e índices em `ready-for-review`; FEAT-015 fora do stage.
- [x] Poda autorizada na REQ-094 e executada no [BATCH-096](../../implementation/batch-096.md).
- [ ] Revisão do Macro-Arquiteto e homologação visual da v1.2.1 pelo operador.

Evidências no [BATCH-095](../../implementation/archive/batch-095.md), no [REP-015](../../reports/REP-015-batch095-domains-bootstrap-and-optimizer.md) e na [auditoria de skills](../../../completions/skills-audit.json). Categoria B, sem deploy.

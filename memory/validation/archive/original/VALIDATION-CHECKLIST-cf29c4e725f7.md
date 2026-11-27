# Validation Checklist

Este documento concentra os checklists de aceitação e os registros de testes empíricos de validação dos lotes ativos (Regra dos 10: lotes pendentes de homologação permanecem aqui).

## BATCH-096 — REQ-094 (2026-11-24)

- [x] Comando exato do CI passou localmente com 211 testes e cobertura de 96,32%.
- [x] O idioma atualiza o título e a árvore do MDD Hub. Catálogos PT-BR/EN validados e extensão 169/169.
- [x] VSIX 1.2.2 empacotado e verificado (98 entradas, CRC válido).
- [x] Poda de BATCH-090 a BATCH-092 com original integral. Checklist e janelas governadas com 10 ativos.
- [x] `mdd eval` retornou `EVAL-PASS` 15/15. `mdd status --json` retornou `healthy: true` após `mdd index`.
- [ ] Revisão supervisionada e homologação visual humana do VSIX.

Evidências no [BATCH-096](../../../implementation/archive/batch-096.md) e no [relatório FEAT-017](../../../reports/REP-016-batch096-ci-hub-i18n-and-memory.md).

## BATCH-095 — REQ-093 (2026-11-24)

- [x] Extensão v1.2.1: UTF-8 (`PYTHONUTF8`/`PYTHONIOENCODING`) em toda chamada `mdd`, triagem também no botão direito, progresso em Refresh/Toggle GitHub, `conn2flow-hub` externo como `RUNNING (externo)` sem controles, `.vscode/mcp.json` só com `servers`. Compile PASS, 166/166 testes, VSIX `conn2flow-tools-1.2.1.vsix` com 98 arquivos e `unzip -t` limpo.
- [x] `mdd feedback --github` cria a label `skill-feedback` (`gh label create … --force`) antes da Issue, com 2 testes `pytest`. FB-008 sintético removido e índice da inbox regenerado (o id foi reaproveitado por um FB real deste lote).
- [x] FB-004 e FB-007 aplicados; 4 skills OVER extraídas para 11 subskills novas em PT-BR/EN. `--budget-report` com `OVER: 0`, índice PASS, auditoria PASS (0 divergências, 0 drift, 0 divergência entre cópias EN), `pytest` 162/162 e `mdd eval` EVAL-PASS 15/15.
- [x] ARCH-019 Fase 1: `domains/` (`README.md`, `generic`, `conn2flow`), `mdd bootstrap` (`--list-domains`, `--domain auto|<id>`, detecção de stack, memória e guia local sem sobrescrever) com domínio `laravel` de fixture e idempotência; `conn2flow.projectDomain` aberto (padrão `auto`) e QuickPick dinâmico "Inicializar MDD neste Projeto".
- [x] Regra dos 10 com `ai:archive-memory` (Core `230262177a27` via `git archive`): req-085/086, batch-089/090 e REP-009/010 arquivados; janelas em 10/10/10. Lote, REP-015 (FEAT-017) e índices em `ready-for-review`; FEAT-015 fora do stage.
- [x] Poda autorizada na REQ-094 e executada no [BATCH-096](../../../implementation/archive/batch-096.md).
- [ ] Revisão do Macro-Arquiteto e homologação visual da v1.2.1 pelo operador.

Evidências no [BATCH-095](../../../implementation/archive/batch-095.md), no [REP-015](../../../reports/REP-015-batch095-domains-bootstrap-and-optimizer.md) e na [auditoria de skills](../../../../completions/skills-audit.json). Categoria B, sem deploy.

## BATCH-094 — REQ-092 (2026-11-24)

- [x] Manifesto e lockfile v1.2.0, compile PASS e 154/154 testes VS Code. VSIX de 94 entradas com CRC e metadados verificados.
- [x] 57 caminhos de skills restaurados com preservação dos arquivos restantes, incluindo cinco skills locais do Home. Status dos seis satélites em leitura registrado. Website manteve alteração local de schema, condição de árvore limpa para pull não atendida.
- [x] READMEs, changelogs e guias pós-ARCH-018 atualizados. Validador público PASS em 23 arquivos e 284 links relativos.
- [x] Inventário DEC-136 cobre 162 recibos e artefatos em completions, nove VSIX anteriores, caminhos da raiz, FB-004 a FB-007 e quatro skills OVER.
- [x] Auditoria de skills PASS, índice de skills PASS, mdd eval 13/13 e pytest 153/153. Índices MDD regenerados, lote e FEAT-017 prontos para revisão.
- [ ] Revisão do Macro-Arquiteto e homologação visual pelo operador.

Evidências no [BATCH-094](../../../implementation/archive/batch-094.md), no [REP-014](../../../reports/REP-014-batch094-vsix-skills-and-curation.md) e na [auditoria de skills](../../../../completions/skills-audit.json). Categoria B, sem deploy. A janela de retenção está registrada no lote para decisão DEC-136.

## BATCH-093 — REQ-091 (2026-11-24)

- [x] Quarentena por recorrência em `mdd feedback`: `high` nasce `READY`; `medium`/`low` nascem em `QUARANTINE` até a 2ª origem `(repo, batch)` distinta, que promove os irmãos auto-quarentenados; `recurrence` no `submit`/`list --json`; `--force-ready` na CLI, no `mdd mcp` e no `conn2flow-hub` (`npm test` 7/7, `dist/` recompilado). Curador nunca sobrescrito.
- [x] `generate-skills-index.cjs --budget-report [--text]` somente leitura (4 OVER, 2 NEAR) e `[TRANSLATION-COPY-DIVERGENCE]` não bloqueante no `sync-skills.cjs` (0 hoje), ambos com teste.
- [x] `mdd eval` com provider plugável (`deterministic` offline) e 13 cenários em `tools/mdd-client/evals/skills/`; `test_eval.py` 7/7 com casos negativos; **EVAL-PASS 13/13** na matriz.
- [x] FB-001..003 triados `ACCEPT` pela CLI e aplicados em PT-BR + 24 cópias EN; sync da matriz (40 gravações); 4 hashes EN; índice regravado. Gate: auditoria **PASS** (0 divergências, 0 drift, 0 legados), `--check` **PASS**, pytest **153/153**, `mdd eval` **PASS**.
- [x] Rollout via worktrees `_wt-req091-*` de `origin/main`: 48 skills em 28 kits existentes de 7 satélites, aliases migrados por rename (0 legados), customização do Core reaplicada e reconhecida (5× `mdd sync --customize`), duplicata legada `sdd-memory-gardening` removida em app/nexus com autorização humana (DEC-136) e sucessores rastreados em kits `.claude` com whitelist. Fast-forward em `origin/main`: conn2flow `230262177a27`, site `12a83fc5f239`, lumix `60faf3875813`, transformamp `7f891df71d63`, website `84943eaffa1e`, app `e8f6b9497b04`, nexus `9534c3207ab5`.
- [x] Limpeza: 0 junctions (PowerShell), 7 worktrees removidas sem `--force`, branches apagadas com `-d`, `git worktree prune`; árvores principais, `conn2flow-home` e `conn2flow-mkt` intocadas.
- [x] Regra dos 10 com `ai:archive-memory --status=HOMOLOGATED,REVIEWED` (CLI de `origin/main` `6e146f7aa8b6` via `git archive`): `req-084`, `batch-088` e `REP-008` arquivados; 10 ativos em cada raiz; 0 links quebrados novos; `04-memory-engineering-execution.md` intacta. Poda deste checklist (DEC-136, autorizada): seção BATCH-089 → [validation-089.md](../validation-089.md), original em `archive/original/` (SHA-256 `4ebc09f7…`); 10 seções; `mdd status` healthy. Lote e FEAT-017 ([REP-013](../../../reports/REP-013-batch093-anti-bloat-evals-and-global-rollout.md)) em `ready-for-review`; FEAT-015 fora do stage. [Lote](../../../implementation/archive/batch-093.md).
- [ ] Homologação humana, `ARCH-018` → `COMPLETED` e commit/push seletivos da matriz pelo Arquiteto; triagem de FB-004..007.

## BATCH-081 / REQ-079 — entrega integrada em 2026-11-05

- [x] Implementação e verificações locais registradas em [lote](../../../implementation/batch-081.md).
- [x] Evidências e limites explicitados; sem git commit/push.
- [ ] Revisão e homologação humana.

## BATCH-080 — REQ-078 (2026-11-05)

### Rodada 1 — tradução e drift

- [x] 42 skills restantes traduzidas, três anteriores preservadas e nova skill multilíngue criada; 46 versões EN, 312 arquivos publicados.
- [x] Registro source_sha256/translated_at/translator, warning não bloqueante no Node/Python e reconhecimento explícito após revisão.
- [x] Nova skill nos cinco kits; contadores ajustados para 46; 44 alvos PASS, zero divergências, 85 skills locais preservadas.
- [x] Metadados e código preservados; traduções novas validadas antes da publicação; correções editoriais da amostra independente aplicadas.
- [x] Python 138/138 (131 anteriores + sete casos de drift) e extensão 133/133; sintaxe CJS e diff check PASS.
- [x] Forward-test independente em fixture: baseline PASS → mutação → warning sem sobrescrita → reconhecimento explícito → PASS.
- [x] [REV-080](../../../human-reviews/rev-080.md): RECOMMEND-APPROVAL, com amostragem editorial explícita e correções aplicadas.
- [ ] Homologação humana. Revisão editorial humana integral não atribuída.

Evidências e limites: [BATCH-080](../../../implementation/batch-080.md), [JUnit](../../../../completions/BATCH-080-pytest.xml), [skills](../../../../completions/BATCH-080-skills-audit.json), [traduções](../../../../completions/BATCH-080-translation-audit.json).

## BATCH-079 — REQ-077 (2026-11-05)

### Rodada 1 — governança

- [x] Pipeline padrão project:deploy, exceção mista update-all e regra restritiva de worktrees.
- [x] DEC-136 e lições REP-002 incorporadas; 45 skills/44 alvos PASS, zero divergências.
- [x] Python 131/131 e extensão 133/133; evidências em [batch-079.md](../../../implementation/batch-079.md).
- [x] Revisão independente acionada.

### Rodada 2 — limpeza

- [x] 17 alvos inventariados sem atravessar junctions.
- [x] Rodada 3: humano determinou preservar trabalho único; duas árvores comprovadamente integradas removidas sem força, 15 preservadas, ignorados arquivados/verificados, junctions desvinculadas e prune Core executado. [Evidência](../../../../completions/BATCH-079-cleanup-result.json).
- [ ] Homologação humana.

## BATCH-078 — REQ-076 (2026-10-15)

- [x] Inventário de 17 worktrees secundárias, commits exclusivos, diffs, stage, não rastreados e junctions; uma remoção sem força, 16 preservadas com motivos.
- [x] 91 branches locais integradas removidas por branch -d; quatro recusadas preservadas; worktree prune nas duas raízes.
- [x] Core: dez requisições, dez lotes, dez seções de validação e dez decisões; originais integrais e sínteses rastreáveis.
- [x] Site: dez lotes, pendências 73.201 → 17.576 bytes, sete blocos recentes e 42 roteiros ativos vinculados, sem atribuir homologação.
- [x] Matriz: dez requisições e dez lotes incluindo BATCH-078; arquivos arquivados com originais e sínteses.
- [x] 36 arquivos numerados arquivados conferidos por SHA-256; zero novos links relativos internos quebrados contra HEAD.
- [x] 306 CSS e manifesto do Site restaurados do HEAD autorizado, com preimages em ZIP; seis arquivos de dados alheios preservados.
- [x] Pull --ff-only nos cinco repositórios com remote; home sem remote/tracking registrado, sem inventar configuração.
- [x] Skills PASS: 45 canônicas, 44 alvos, zero divergências, 60 locais preservadas.
- [x] Python 131/131 PASS (um aviso Starlette/AnyIO); extensão 133/133 PASS.
- [x] Índices regenerados com mdd index; diff --check nas três raízes; sem deploy.
- [x] Parecer independente [REV-078](../../../human-reviews/rev-078.md): RECOMMEND-APPROVAL, sem finding bloqueante.
- [ ] Homologação humana identificada.

Evidências, comandos, métricas e exceções: [BATCH-078](../../../implementation/batch-078.md), [validação](../../../../completions/BATCH-078-validation.json), [JUnit](../../../../completions/BATCH-078-pytest.xml), [skills](../../../../completions/BATCH-078-skills-audit.json).

## BATCH-077 — REQ-075 (2026-10-14)

- [x] Quatro skills MDD renomeadas, com caminhos/gatilhos/referências atualizados; catálogo canônico mantém 45.
- [x] Cinco superfícies nos seis repositórios sem pastas legadas; migrador preserva auxiliares e recusa links/coexistência.
- [x] Guias raiz, CODEX, agentes Claude e templates bilíngues atualizados; tradução inglesa de gardening preservada.
- [x] Proporcionalidade A/B/C e --skip-css nas três skills e STARTER-PROMPTS; comandos confrontados com código Core.
- [x] Propagação em 44 alvos e auditoria de 1.350 cópias; zero divergências, 21 traduções e 60 skills locais preservadas.
- [x] Python 131/131 PASS, sem skips, cobertura 97,17%; extensão 133/133 PASS, compilação limpa.
- [x] VSIX1.1.4 com prompts atualizados, pacote/hash conferidos.
- [x] Fila humana em03-memory-engineering-chief.md atualizada com instruções específicas, sem assinatura simulada.
- [x] Parecer independente [REV-077](../../../human-reviews/rev-077.md): RECOMMEND-APPROVAL; P1/P2 corrigidos e verificados.
- [x] Commits específicos e cinco pushes confirmados; home commit local sem remote. Whitespace herdado dos imports home comprovado sem alegar check tradicional limpo: [prova](../../../../completions/BATCH-077-home-whitespace.json).
- [ ] Homologação humana diferida; seguir fila do Engenheiro Chefe.

Evidências: [lote](../../../implementation/batch-077.md), [JUnit](../../../../completions/BATCH-077-pytest.xml), [resumo](../../../../completions/BATCH-077-test-summary.json), [auditoria](../../../../completions/BATCH-077-skills-audit.json), [contratos](../../../../completions/BATCH-077-governance-audit.json). Benchmark da flag: Core [BATCH-278](../../../../../conn2flow/memory/implementation/BATCH-278.md) mediu36s contra40s/cachequente; evidência anterior conferida, não repetida neste lote de CategoriaB. Sem deploy, banco ou buildTailwind. Limites Windows/CI e avisos de depreciação registrados no lote.

## BATCH-076 — REQ-074 (reposição do registro operacional)

- [x] MCP stdio/SSE/daemon, UI Bridge MDD e migração home implementados.
- [x] Python125/125PASS, cobertura97,01%; extensão131/131PASS.
- [x] Revisão independente REV-076 RECOMMEND-APPROVAL, com finding P2 corrigido.
- [x] Home SPEC e67arquivos preservados byte a byte na working tree; commit f5a7ea4.
- [ ] Homologação visual de Otávio Serra, adiada explicitamente para o fim.

Evidências preservadas em [batch-076.md](../../../implementation/archive/batch-076.md), [REV-076](../../../human-reviews/rev-076.md), [resumo](../../../../completions/BATCH-076-test-summary.json). VSIX1.1.3 permanece como evidência histórica; avaliação consolidada pode usar o1.1.4 da REQ-075.

## Validações Arquivadas

- [validation-090-092.md](../validation-090-092.md) (BATCH-090 a BATCH-092; poda da REQ-094)
- [validation-001-003.md](../validation-001-003.md) (BATCH-001 a BATCH-003)
- [validation-006-007-014.md](../validation-006-007-014.md) (BATCH-006, BATCH-007 e BATCH-014)
- [validation-015.md](../validation-015.md) (BATCH-015)
- [validation-004-050.md](../validation-004-050.md) (BATCH-004 a BATCH-050)
- [validation-051-057.md](../validation-051-057.md) (BATCH-051 a BATCH-057)
- [validation-069-088.md](../validation-069-088.md) (BATCH-069 a BATCH-075 e BATCH-082 a BATCH-088; poda da REQ-090)
- [validation-089.md](../validation-089.md) (BATCH-089; poda da REQ-091)
- [Histórico compactado 5f08f316abcf](<../compacted/VALIDATION-CHECKLIST-5f08f316abcf.md>)
- [Histórico compactado c2ec2bf167a3](<../compacted/VALIDATION-CHECKLIST-c2ec2bf167a3.md>)
- [Original integral antes da poda da REQ-090](<./VALIDATION-CHECKLIST-b3b8b81070b3.md>)
- [Original integral antes da poda da REQ-091](<./VALIDATION-CHECKLIST-4ebc09f79d5b.md>)

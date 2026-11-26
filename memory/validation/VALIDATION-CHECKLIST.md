# Validation Checklist

Este documento concentra os checklists de aceitação e os registros de testes empíricos de validação dos lotes ativos (Regra dos 10: lotes pendentes de homologação permanecem aqui).

## BATCH-100 — REQ-098 (2026-11-26)

- [x] 4 links de `validation-095.md` e 20 de `archive/original/` saneados; `ai:archive-memory --dry-run` exit 0.
- [x] `EVAL-018` para `c2f-persona-executor` criado, `mdd eval` 18/18 EVAL-PASS.
- [x] Gates: `sync-skills` PASS, índice PASS, `OVER: 0`, `pytest` 222 PASS com 96,21%, `04-memory-engineering-execution.md` intacta.
- [x] Revisão pelo Macro-Arquiteto e homologação humana aprovada em 2026-11-26.

[BATCH-100](../implementation/batch-100.md).

## BATCH-098 — REQ-096 (2026-11-24)

- [x] mdd sync --remote e mdd update preservam skills locais, variantes e choques. Cache raso, domínio e check-only validados.
- [x] VS Code 1.2.4 com Auto-Sync, comando manual, 172/172 testes e pacote íntegro.
- [x] Bootstrap com template semanal opcional, preservação de workflow existente e teste de staging seletivo.
- [x] Gate Python final, 222 PASS e 96,21%. MDD saudável com 10 ativos por janela, índices atualizados e BATCH-098 em ready-for-review.
- [ ] Revisão pelo Macro-Arquiteto e homologação visual humana.

[BATCH-098](../implementation/batch-098.md) e [FEAT-017](../reports/REP-018-batch098-remote-skill-sync.md).

## BATCH-097 — REQ-095 (2026-11-24)

- [x] Overview em inglês, subtítulos PT-BR/EN, keywords e changelogs atualizados. VSIX 1.2.3 íntegro, com 169/169 testes, e inventário fechado com 1.2.3 e 1.1.7 antes do BATCH-098.
- [x] FB-008 aceito e aplicado em PT-BR e EN. EVAL-PASS 16/16, sync e índice PASS, OVER 0.
- [x] Gate Python exato do CI. 211 testes, 96,32% de cobertura.
- [x] Rollout conferido em origin/main, variantes do Core preservadas e zero worktrees temporárias.
- [x] Janela de dez ativos restabelecida. Evidências no [BATCH-097](../implementation/batch-097.md) e no [FEAT-017](../reports/REP-017-batch097-marketplace-and-rollout.md).
- [ ] Revisão técnica e homologação visual humana.

## BATCH-096 — REQ-094 (2026-11-24)

- [x] Comando exato do CI passou localmente com 211 testes e cobertura de 96,32%.
- [x] O idioma atualiza o título e a árvore do MDD Hub. Catálogos PT-BR/EN validados e extensão 169/169.
- [x] VSIX 1.2.2 empacotado e verificado (98 entradas, CRC válido).
- [x] Poda de BATCH-090 a BATCH-092 com original integral. Checklist e janelas governadas com 10 ativos.
- [x] `mdd eval` retornou `EVAL-PASS` 15/15. `mdd status --json` retornou `healthy: true` após `mdd index`.
- [ ] Revisão supervisionada e homologação visual humana do VSIX.

Evidências no [BATCH-096](../implementation/batch-096.md) e no [relatório FEAT-017](../reports/REP-016-batch096-ci-hub-i18n-and-memory.md).

## BATCH-081 / REQ-079 — entrega integrada em 2026-11-05

- [x] Implementação e verificações locais registradas em [lote](../implementation/batch-081.md).
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
- [x] [REV-080](../human-reviews/rev-080.md): RECOMMEND-APPROVAL, com amostragem editorial explícita e correções aplicadas.
- [ ] Homologação humana. Revisão editorial humana integral não atribuída.

Evidências e limites: [BATCH-080](../implementation/batch-080.md), [JUnit](../../completions/BATCH-080-pytest.xml), [skills](../../completions/BATCH-080-skills-audit.json), [traduções](../../completions/BATCH-080-translation-audit.json).

## BATCH-079 — REQ-077 (2026-11-05)

### Rodada 1 — governança

- [x] Pipeline padrão project:deploy, exceção mista update-all e regra restritiva de worktrees.
- [x] DEC-136 e lições REP-002 incorporadas; 45 skills/44 alvos PASS, zero divergências.
- [x] Python 131/131 e extensão 133/133; evidências em [batch-079.md](../implementation/batch-079.md).
- [x] Revisão independente acionada.

### Rodada 2 — limpeza

- [x] 17 alvos inventariados sem atravessar junctions.
- [x] Rodada 3: humano determinou preservar trabalho único; duas árvores comprovadamente integradas removidas sem força, 15 preservadas, ignorados arquivados/verificados, junctions desvinculadas e prune Core executado. [Evidência](../../completions/BATCH-079-cleanup-result.json).
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
- [x] Parecer independente [REV-078](../human-reviews/rev-078.md): RECOMMEND-APPROVAL, sem finding bloqueante.
- [ ] Homologação humana identificada.

Evidências, comandos, métricas e exceções: [BATCH-078](../implementation/batch-078.md), [validação](../../completions/BATCH-078-validation.json), [JUnit](../../completions/BATCH-078-pytest.xml), [skills](../../completions/BATCH-078-skills-audit.json).

## BATCH-077 — REQ-075 (2026-10-14)

- [x] Quatro skills MDD renomeadas, com caminhos/gatilhos/referências atualizados; catálogo canônico mantém 45.
- [x] Cinco superfícies nos seis repositórios sem pastas legadas; migrador preserva auxiliares e recusa links/coexistência.
- [x] Guias raiz, CODEX, agentes Claude e templates bilíngues atualizados; tradução inglesa de gardening preservada.
- [x] Proporcionalidade A/B/C e --skip-css nas três skills e STARTER-PROMPTS; comandos confrontados com código Core.
- [x] Propagação em 44 alvos e auditoria de 1.350 cópias; zero divergências, 21 traduções e 60 skills locais preservadas.
- [x] Python 131/131 PASS, sem skips, cobertura 97,17%; extensão 133/133 PASS, compilação limpa.
- [x] VSIX1.1.4 com prompts atualizados, pacote/hash conferidos.
- [x] Fila humana em03-memory-engineering-chief.md atualizada com instruções específicas, sem assinatura simulada.
- [x] Parecer independente [REV-077](../human-reviews/rev-077.md): RECOMMEND-APPROVAL; P1/P2 corrigidos e verificados.
- [x] Commits específicos e cinco pushes confirmados; home commit local sem remote. Whitespace herdado dos imports home comprovado sem alegar check tradicional limpo: [prova](../../completions/BATCH-077-home-whitespace.json).
- [ ] Homologação humana diferida; seguir fila do Engenheiro Chefe.

Evidências: [lote](../implementation/batch-077.md), [JUnit](../../completions/BATCH-077-pytest.xml), [resumo](../../completions/BATCH-077-test-summary.json), [auditoria](../../completions/BATCH-077-skills-audit.json), [contratos](../../completions/BATCH-077-governance-audit.json). Benchmark da flag: Core [BATCH-278](../../../conn2flow/memory/implementation/BATCH-278.md) mediu36s contra40s/cachequente; evidência anterior conferida, não repetida neste lote de CategoriaB. Sem deploy, banco ou buildTailwind. Limites Windows/CI e avisos de depreciação registrados no lote.

## BATCH-076 — REQ-074 (reposição do registro operacional)

- [x] MCP stdio/SSE/daemon, UI Bridge MDD e migração home implementados.
- [x] Python125/125PASS, cobertura97,01%; extensão131/131PASS.
- [x] Revisão independente REV-076 RECOMMEND-APPROVAL, com finding P2 corrigido.
- [x] Home SPEC e67arquivos preservados byte a byte na working tree; commit f5a7ea4.
- [ ] Homologação visual de Otávio Serra, adiada explicitamente para o fim.

Evidências preservadas em [batch-076.md](../implementation/archive/batch-076.md), [REV-076](../human-reviews/rev-076.md), [resumo](../../completions/BATCH-076-test-summary.json). VSIX1.1.3 permanece como evidência histórica; avaliação consolidada pode usar o1.1.4 da REQ-075.

## Validações Arquivadas

- [validation-099.md](archive/validation-099.md) (BATCH-099; poda da REQ-098)
- [validation-095.md](archive/validation-095.md) (BATCH-095; poda da REQ-097)
- [validation-094.md](archive/validation-094.md) (BATCH-094)

- [validation-093.md](archive/validation-093.md) (BATCH-093)

- [validation-090-092.md](archive/validation-090-092.md) (BATCH-090 a BATCH-092; poda da REQ-094)
- [validation-001-003.md](archive/validation-001-003.md) (BATCH-001 a BATCH-003)
- [validation-006-007-014.md](archive/validation-006-007-014.md) (BATCH-006, BATCH-007 e BATCH-014)
- [validation-015.md](archive/validation-015.md) (BATCH-015)
- [validation-004-050.md](archive/validation-004-050.md) (BATCH-004 a BATCH-050)
- [validation-051-057.md](archive/validation-051-057.md) (BATCH-051 a BATCH-057)
- [validation-069-088.md](archive/validation-069-088.md) (BATCH-069 a BATCH-075 e BATCH-082 a BATCH-088; poda da REQ-090)
- [validation-089.md](archive/validation-089.md) (BATCH-089; poda da REQ-091)
- [Histórico compactado 5f08f316abcf](<archive/compacted/VALIDATION-CHECKLIST-5f08f316abcf.md>)
- [Histórico compactado c2ec2bf167a3](<archive/compacted/VALIDATION-CHECKLIST-c2ec2bf167a3.md>)
- [Original integral antes da poda da REQ-090](<archive/original/VALIDATION-CHECKLIST-b3b8b81070b3.md>)
- [Original integral antes da poda da REQ-091](<archive/original/VALIDATION-CHECKLIST-4ebc09f79d5b.md>)

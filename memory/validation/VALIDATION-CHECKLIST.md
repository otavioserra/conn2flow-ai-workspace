# Validation Checklist

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

Evidências preservadas em [batch-076.md](../implementation/batch-076.md), [REV-076](../human-reviews/rev-076.md), [resumo](../../completions/BATCH-076-test-summary.json). VSIX1.1.3 permanece como evidência histórica; avaliação consolidada pode usar o1.1.4 da REQ-075.

Este documento concentra os checklists de aceitaÃ§Ã£o e os registros de testes empÃ­ricos de validaÃ§Ã£o para os lotes funcionais ativos.

## ValidaÃ§Ãµes Arquivadas

- [validation-001-003.md](archive/validation-001-003.md) (BATCH-001 a BATCH-003)
- [validation-006-007-014.md](archive/validation-006-007-014.md) (BATCH-006, BATCH-007 e BATCH-014)
- [validation-015.md](archive/validation-015.md) (BATCH-015)
- [validation-004-050.md](archive/validation-004-050.md) (BATCH-004 a BATCH-050)
- [validation-051-057.md](archive/validation-051-057.md) (BATCH-051 a BATCH-057)

---





---

## BATCH-069 — Fundação Estrutural do MDD, Sistema Hierárquico de index.md com Compactação Dual e Incorporação das Lições do BL-028 (REQ-067)

### 1. Checklist de Aceite Técnico

- [x] Renomeação da raiz de governança de `sdd/` para `memory/` via `git mv`.
- [x] Criação dos 3 arquivos de fundação na raiz de `memory/`: `00-baseline-architecture.md`, `01-general-memory.md` e `02-policy.md`.
- [x] Criação das novas pastas `memory/reports/` (com `BL-028` importado) e `memory/raw/` com suas estruturas internas.
- [x] Provisionamento da estrutura hierárquica com `index.md` e subpastas `archive/compacted/` e `archive/original/` em todas as subpastas de `memory/`.
- [x] Criação da 44ª skill canônica `c2f-ai-features` cobrindo os 8 pilares de IA no Conn2Flow Pro.
- [x] Inclusão da Armadilha 18 (Junctions e `git worktree remove`) e Armadilha 19 (`iconv //TRANSLIT`) em `c2f-shell-and-windows-traps`.
- [x] Atualização das skills correlatas (`sdd-memory-gardening`, `c2f-tailwind-css-architecture`, `c2f-tailwind-module-migration`, `c2f-executor-agent`, `project-validation`, `c2f-documentation`, `sdd-workflow`).
- [x] Atualização do catálogo em `AGENTS.md` e `GEMINI.md` para refletir o paradigma MDD e as 44 skills.
- [x] Propagação determinística via `node scripts/skills/sync-skills.cjs --apply --all` com status `PASS` nos 39 alvos de kits e templates.
- [x] Preservação de 100% das 60 skills locais no escopo global: 36 nos satélites (`lumix`, `conn2flow-site`, `transformamp`) e 24 nos templates.
- [x] Suíte `npm test` da extensão do VS Code verde (124/124 testes).
- [x] Emissão do relatório `memory/implementation/batch-069.md` e recibo `completions/BATCH-069-executor-receipt.json`.

### 2. Evidências de Validação

1. **Auditoria de Estrutura MDD**: `memory/` ativa e funcional com tríade raiz e todas as pastas com `index.md`.
2. **Auditoria Determinística MD5**: Relatório `completions/BATCH-069-skills-audit.json` com status `PASS` nas 44 skills.
3. **Suíte da Extensão do VS Code**: 124 testes aprovados sem regressões.
4. **Detalhamento Operacional**: Registro em `memory/implementation/batch-069.md` e recibo em `completions/BATCH-069-executor-receipt.json`.

### 2.1 Evidências executadas pelo Executor

- Estrutura: 219 renames Git e preservação dos 231 arquivos físicos anteriores; tríade de 2.789 / 2.550 / 3.932 bytes; 50 índices, zero links de índice quebrados. [Auditoria](../../completions/BATCH-069-structure-audit.json).
- Skills: 44 canônicas, 39 alvos com PASS individual, 1.653 cópias idênticas, 21 traduções preservadas, zero divergências. [Auditoria](../../completions/BATCH-069-skills-audit.json).
- Preservação: 60 skills locais no sincronizador (36 nos satélites + 24 nos templates); SHA-256 independente para todos os arquivos das 36 skills dos satélites. [Evidência](../../completions/BATCH-069-preservation-audit.json).
- Extensão: compilação npm.cmd run compile, exit 0; 124/124 testes, zero falhas/skips; descoberta memory/ da matriz e sdd/ do core exercitada no JS compilado. [Testes](../../completions/BATCH-069-extension-tests.json) / [smoke](../../completions/BATCH-069-extension-scope-smoke.json).
- Nova skill validada com quick_validate.py; scripts com node --check e diffs stage/working tree sem erros. Sem execução real de IA, exclusão de worktrees ou deploy.
- Entrega técnica ready-for-review: [lote](../implementation/batch-069.md) e [recibo](../../completions/BATCH-069-executor-receipt.json). Parecer independente e homologação continuam pendentes abaixo.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: parecer emitido em [review-069.md](review-069.md) (APPROVED).
- [x] Homologação executiva pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-069-executor-receipt.json`.


## BATCH-070 — Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites (REQ-068, 2026-10-09)

- [x] Migração de `sdd/` para `memory/` via `git mv` nos 7 satélites (`conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`).
- [x] Injeção e adaptação da Tríade Fundamental (`00-baseline-architecture.md`, `01-general-memory.md`, `02-policy.md`) em todos os repositórios.
- [x] Provisionamento da árvore hierárquica de `index.md`, `memory/reports/` e `memory/raw/active|archive`.
- [x] Sincronização das 44 skills canônicas nos kits existentes, preservando integralmente 100% das 36 skills locais.
- [x] Commits atômicos sem `git add .` e push executado nos 6 repositórios com remote (`conn2flow-mkt` mantido local).
- [x] Suíte de testes da extensão do VS Code verde (124/124 testes aprovados).
- [x] Revisão técnica independente e homologação executiva do Macro-Arquiteto: [review-070.md](review-070.md) (APPROVED).

---

## BATCH-072 — Revamp da documentação pública (REQ-070, 2026-10-09)

- [x] READMEs EN/PT-BR executivos, cada um abaixo de 10 KB, com Mermaid, três passos, guias e sugestões de metadados GitHub.
- [x] Pares do framework MDD e do ecossistema Python criados; guias existentes atualizados para tríade, 44 skills, oito pilares, CLI/MCP e estado de v1.1.2/integração dual.
- [x] Router e índices de idioma atualizados; par EN do guia de publicação criado.
- [x] Auditoria executada: 23 documentos, 11 pares estruturais, 252 links relativos, 80 fontes existentes, catálogos 44/44 e READMEs de 5.089/5.394 bytes.
- [x] Verificador falsificável: 5/5 mutações detectadas em fixture temporária, incluindo o README antigo do HEAD.
- [x] Paridade temática revisada; sintaxe CJS e diff sem erros.
- [x] [Relatório](../implementation/batch-072.md), [auditoria](../../completions/BATCH-072-docs-audit.json), [checagens negativas](../../completions/BATCH-072-validator-negative-checks.json) e [recibo](../../completions/BATCH-072-executor-receipt.json) registrados.
- [x] Revisão técnica independente e homologação executiva do Macro-Arquiteto: [review-072.md](review-072.md) (APPROVED).

Limites: Python ainda ausente; extensão 1.1.1 com alvo 1.1.2; ARCH-014 planejada. Não executados renderização Mermaid, testes do produto, publicação ou deploy. Divergência .agents/ do helper MCP registrada sem alterar sua implementação. Entrega homologada.


## BATCH-071 — Aplicações Python MDD Client e Hub (REQ-069, 2026-10-09)

- [x] Dois pacotes Python >=3.11 instaláveis separadamente, com entrypoints mdd/mdd-hub.
- [x] Init idempotente com tríade, índices e kits; sync oficial de 44 skills/regras preservando exclusivas.
- [x] Regra dos dez, históricos agregados, limites 50/30 KiB, original íntegro, síntese estrutural, partes completas e reparo de links.
- [x] Dashboard, relatório agregado e envio HTTP real, daemon/watch assíncronos e parada controlada.
- [x] API: ingestão, autenticação, schema, limites, deduplicação, conflito, persistência e consolidação.
- [x] Watcher: parsing, baseline, mudanças, checkpoint, retries e sete fontes reais coletadas.
- [x] Reviewer/monitored/headless, Git real isolado, preservação do stage e falhas de commit/publicação.
- [x] 61/61 pytest, zero falhas/erros/skips; cobertura global 97,23%; lint, pip check, sintaxe CJS e diff limpos.
- [x] 11 checks CLI, gramática Python 3.11 dos 15 módulos e CI Windows/Linux configurada.
- [x] Manual, guias bilíngues, lote e recibo versionados com stage de caminhos explícitos.
- [ ] Parecer técnico independente e homologação executiva.

Evidências: [lote](../implementation/batch-071.md), [JUnit](../../completions/BATCH-071-pytest.xml), [resumo](../../completions/BATCH-071-test-summary.json), [smoke](../../completions/BATCH-071-smoke.json), [recibo](../../completions/BATCH-071-executor-receipt.json).
Limites: Python 3.12.4/Windows executado localmente; CI remota não conferida. Aviso de depreciação Starlette/AnyIO. Extração heurística, resumos estruturais e PR preparada em manifesto; sem PyPI, merge, deploy ou ARCH-014.


## BATCH-073: Canonical Engineering Memories (REQ-071)

- [x] 19 memórias existentes renomeadas via git mv, sem perda de registros; execução 04 inexistente no conn2flow-mkt inicializada e exceção registrada.
- [x] Matriz e sete satélites com os documentos raiz 00–04 e referências de IA atualizadas.
- [x] Política e mecânica conectadas a raw/active/ e raw/archive/, sem poda neste lote.
- [x] Quatro boilerplates en/pt-br completos e indexados; mdd init cria cinco arquivos sem sobrescrever existentes.
- [x] Compilação da extensão PASS, 124/124 testes PASS; seis cenários adicionais de descoberta da memória PASS.
- [x] MDD Client pytest 32/32 PASS; Ruff check e formato PASS.
- [x] Quatro skills selecionadas sem divergências, skills locais intactas; 84 divergências globais fora do lote comprovadas no baseline.
- [x] Nenhum link novo quebrado; links historicamente órfãos registrados no relatório de validação.
- [x] Commits com staging explícito; seis satélites com push confirmado, conn2flow-mkt sem remote e commit local.
- [x] Relatório, recibo e índices atualizados para ready-for-review; homologação independente não atribuída.

Evidências, comandos, hashes e limites: [BATCH-073](../implementation/batch-073.md).

## BATCH-074 — Trava Tripla MDD (REQ-072, 2026-10-09)

- [x] CLI PHP memory:index/set/get e Typer mdd index/meta set/get registrados, com API reutilizável.
- [x] 111/111 pytest, incluindo 48 testes de paridade com PHP real e PyYAML; zero falhas/skips.
- [x] 124/124 testes VS Code e compilação TypeScript; arquivos de teste enumerados explicitamente para Node 24.
- [x] Ruff, pip check, PHP lint, diff check e skill quick_validate UTF-8.
- [x] 45 canônicas e dez espelhos idênticos da nova skill; c2f ai:sync 45/45 nos cinco kits do core.
- [x] Inbox matriz, skeletons EN/PT, três fichas-modelo, políticas e handoffs solo/dupla/triade × três autonomias.
- [x] Auditoria independente dos defeitos reproduzidos; regressões corrigidas e probes/48 testes reexecutados pelo Revisor.
- [x] Commits com caminhos específicos e recibo persistente.
- [x] Homologação humana identificada: Otávio, 2026-10-09, [REV-074](../human-reviews/rev-074.md).

Evidências: [lote](../implementation/batch-074.md), [JUnit](../../completions/BATCH-074-pytest.xml), [resumo](../../completions/BATCH-074-test-summary.json), [artefatos](../../completions/BATCH-074-artifact-audit.json), [auditoria global de skills](../../completions/BATCH-074-skills-audit.json), [recibo](../../completions/BATCH-074-receipt.json), [revisão](../human-reviews/rev-074.md).

Limites: auditoria global FAIL/52 divergências nas três skills alheias preservadas; nova skill PASS. Sem MCP Hub remoto, Linux, banco/UI/deploy/CI remoto ou suíte PHP integral do produto. YAML escalar documentado; crash entre arquivos requer indexação. Starlette/AnyIO emite aviso de depreciação. Gerador legado de init/compact mantido; pendências humanas não auto-arquivadas.

REQ-073 registra BATCH-073 e BATCH-074 como frentes homologadas; o estado histórico ready-for-review do relatório BATCH-073 foi preservado.


## BATCH-075 — Consolidação harmônica (REQ-073, 2026-10-09)

- [x] Nove conflitos resolvidos; 45 skills, 00–04, raw, CLI e Trava Tripla preservados.
- [x] Quatro skeletons completos e inbox human-reviews descobrível nos routers.
- [x] Auto-cura raiz e hierárquica executada via CLI Python.
- [x] Python 111/111, extensão 124/124, compilação TypeScript e lint PHP 33/33 PASS.
- [x] Ruff, pip check, diff check e preservação de memórias/CLI PASS.
- [x] Revisão independente RECOMMEND-APPROVAL; dois P2 corrigidos.
- [x] Main matriz/Core integrada por fast-forward, push origin main confirmado.
- [x] Nove worktrees removidas sem força e dependências principais preservadas.
- [x] Relatório e recibo persistentes, staging por caminhos específicos.
- [x] Homologação humana identificada do BATCH-075 (Otávio, 2026-10-09, [REV-075](../human-reviews/rev-075.md)).

Evidências e limites: [lote](../implementation/batch-075.md), [resumo](../../completions/BATCH-075-test-summary.json), [recibo](../../completions/BATCH-075-receipt.json), [REV-075](../human-reviews/rev-075.md). Sem deploy, banco/UI, Linux, CI remota ou suíte PHP integral; aviso Starlette/AnyIO; alterações locais alheias preservadas.

[Archived history](<archive/compacted/VALIDATION-CHECKLIST-5f08f316abcf.md>)

[Archived history](<archive/compacted/VALIDATION-CHECKLIST-c2ec2bf167a3.md>)

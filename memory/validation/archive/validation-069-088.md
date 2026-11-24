# Validation Checklist — Histórico Arquivado (BATCH-069 a BATCH-088)

Seções movidas de `../VALIDATION-CHECKLIST.md` em 2026-11-24 pela poda autorizada da REQ-090 / BATCH-092 (DEC-136), mantendo 10 entradas ativas. Somente lotes homologados ou concluídos. Texto preservado; apenas os links relativos foram reescritos para esta pasta. Original integral (bytes intactos, links relativos à localização original): [VALIDATION-CHECKLIST-b3b8b81070b3.md](<original/VALIDATION-CHECKLIST-b3b8b81070b3.md>) (SHA-256 `b3b8b81070b3bb2a820061f4e51a3af779cf4cee01cb660b6c56767a76f35b2d`).

## BATCH-088 — REQ-086 (2026-11-23)

- [x] Sete skills atualizadas em PT-BR/EN. A leitura do Core confirmou o comportamento de `APP_ENV`.
- [x] Cinco kits e templates sincronizados, sete hashes EN reconhecidos, auditoria PASS em 19 alvos com zero divergências e zero drift. Pytest em `.\.venv-mdd` com 119/119 aprovados.
- [x] Onze skills e 308 cópias publicadas nos sete satélites elegíveis. Cinco variantes Core reconhecidas via `mdd sync --customize`.
- [x] Sete SHAs remotos confirmados. Worktrees e branches da requisição removidas após a inspeção de junctions.
- [x] `conn2flow-home` e `conn2flow-mkt` sem `origin`, documentados para os chefes locais.
- [x] Lote e FEAT-017 em revisão, índices MDD atualizados e FEAT-015 fora do stage. [Lote](../../implementation/archive/batch-088.md) · [Relatório](../../reports/archive/REP-008-batch088-skills-rollout.md).
- [ ] Homologação humana e consolidação da matriz.

## BATCH-087 — REQ-085 (2026-11-23)

- [x] Quatro skills (`c2f-documentation`, `c2f-json-resources-sync`, `c2f-project-pipeline-and-tasks`, `c2f-shell-and-windows-traps`) e dois ajustes do REP-007 documentados em PT-BR/EN.
- [x] Kits e templates sincronizados na matriz, seis hashes EN atualizados. Auditoria PASS em 19 alvos, 0 divergências e 0 drift. [Auditoria](../../../completions/skills-audit.json).
- [x] `pytest -q tools/mdd-client/tests` com 119/119 aprovados (via `.venv-mdd`, após os hashes).
- [x] Lote com FEAT-017 em `ready-for-review`, FEAT-015 fora do stage. [Lote](../../implementation/archive/batch-087.md).
- [ ] Homologação humana e commit/push seletivos da matriz.

## BATCH-086 — REQ-084 (2026-11-23)

- [x] Worktrees com junctions, stage seletivo de `*Data.json` e avanço concorrente da `main` documentados em PT-BR/EN.
- [x] Cinco kits locais e templates sincronizados, três hashes EN atualizados. Auditoria PASS em 19 alvos, 0 divergências e 0 drift. [Auditoria](../../../completions/skills-audit.json).
- [x] `pytest -q tools/mdd-client/tests` com 119/119 aprovados.
- [x] Dez requisições e dez lotes ativos. Arquivadas quatro requisições e oito lotes. Zero órfãos novos, 65 links reescritos e 33 links históricos reparados.
- [ ] Zero órfãos em toda `memory/`. Permanecem 166 ocorrências preexistentes em snapshots `archive/original/` e na memória de execução preservada. [REP-007](../../reports/archive/REP-007-batch086-skills-and-memory-links.md).
- [x] Memória de execução íntegra (10.329 bytes / 57 linhas), índices regenerados e FEAT-015 fora do stage. [Lote em `ready-for-review`](../../implementation/archive/batch-086.md).

## BATCH-085 — REQ-083 (2026-11-23)

- [x] Skills PT-BR/EN e hashes revisados; 19 alvos com PASS, 0 divergências e 0 drift; pytest 119/119.
- [x] Paridade PHP por caminho, nome/stem, ID YAML e slug no Core; PHPUnit 6/6 no teste novo e 11/11 no filtro de memória. O CLI retornou `"READY_FOR_ARCHITECT"` para REP-004.
- [x] Sete satélites elegíveis publicados com staging seletivo; 112 cópias, cinco reconhecimentos do Core e zero divergências nas quatro skills.
- [ ] Publicação em `conn2flow-home` e `conn2flow-mkt`, que aguardam remoto `origin` com branch `main`.
- [x] Sete worktrees e branches temporárias removidas; `git worktree prune` e comparações confirmaram a preservação das nove árvores principais. Categoria B.
- [x] Lote, recibo, relatório de dificuldades e índices preparados para o Macro-Arquiteto.
- [ ] Homologação humana e commit/push seletivos da matriz.

Evidências no [BATCH-085](../../implementation/archive/batch-085.md), no [REP-006](../../reports/REP-006-batch085-worktrees-and-php.md) e no [recibo](../../../completions/BATCH-085-executor-receipt.json).

## BATCH-084 — REQ-082 (2026-11-21)

- [x] As duas skills homologadas na REQ-081 foram verificadas em 34 kits de nove satélites, preservando skills locais, regras e trabalho em andamento.
- [x] FEAT-018 e FEAT-019 implementadas, e diretriz de higiene Git e integração na `main` adicionada ao Arquiteto Master em PT-BR e EN.
- [x] A auditoria da matriz passou em 19 alvos, sem divergências e sem drift. As variantes LF, CRLF e mista foram verificadas localmente.
- [x] A suíte `tools/mdd-client/tests` passou com 119 testes. O CLI Python resolveu `REP-004` por ID e o CLI PHP resolveu por caminho explícito.
- [x] Relatório do lote, registro de aprendizados, recibo local e índices MDD entregues. Execução local de Categoria B.
- [x] Validação do Macro-Arquiteto e autorização humana da Fase 3 registradas na conversa em 2026-11-21.
- [x] Fase 3 concluída em 34 kits de nove satélites. As 102 cópias estão validadas, incluindo cinco variantes reconhecidas no Core, e a repetição do sync gravou zero arquivos.
- [x] Zero divergências nas três skills da Fase 3 e zero drift de tradução. A auditoria global manteve 68 divergências preexistentes fora do escopo. A auditoria da matriz passou em 19 alvos e 66 testes locais passaram.
- [ ] Homologação final e integração Git na main pelo Arquiteto Master, após aceite do operador humano.

Evidências em [BATCH-084](../../implementation/archive/batch-084.md), [REP-005](../../reports/archive/REP-005-batch084-rollout-and-eol.md) e na [auditoria da matriz](../../../completions/skills-audit.json).

## BATCH-083 — REQ-081 (2026-11-21)

- [x] Arquiteto Master com caixa `text` copiável obrigatória, campos mínimos, exemplo e exibição em todos os modos.
- [x] Executor com relatório obrigatório de cinco partes, regra explícita para rodadas sem atritos e vínculos ao lote e ao REP.
- [x] Dez arquivos EN revisados e hashes SHA-256 das duas fontes PT-BR atualizados via sincronizador.
- [x] Cinco kits da matriz sincronizados. Auditoria PASS em 19 alvos, sem divergências nem drift, e 61 testes locais passaram.
- [x] Relatório do lote criado com frontmatter canônico e relatório de aprendizados também registrado em REP-004.
- [x] Índices MDD das áreas afetadas regenerados sem erros.

Evidências em [BATCH-083](../../implementation/archive/compacted/batch-083-95aade2d8707.md), [REP-004](../../reports/archive/REP-004-batch083-skills-learnings.md) e na [auditoria local](../../../completions/skills-audit.json). Homologação humana pendente.

## BATCH-082 — REQ-080 (2026-11-18)

- [x] Saneamento de "Choques de entregas" na aba Projetos (`🔀 Choques de Entrega: {target}` + seletor, sem parede de `⚠️`).
- [x] Editor isolado de dados do projeto (`conn2flow.projects.editTargetConfig` / `editProjectConfigSelect`) com buffer provisório em `os.tmpdir()` e sincronização automática em `devProjects[projectId]` no `Ctrl+S`.
- [x] Exclusão de projeto (`conn2flow.projects.deleteProjectSelect`) com confirmação modal e limpeza de `projectTarget` caso seja o alvo removido.
- [x] Cadastro de projeto com valores pré-preenchidos editáveis (`URL`, `path`, `path_tests`), validação de ID e `ignoreFocusOut: true` em todas as caixas.
- [x] Suíte da extensão: `npm test` → **145/145 PASS** (12 novos testes em `test/projectConfigEditor.test.cjs`).
- [x] Pacote final `vscode-extension/conn2flow-tools-1.1.7.vsix` (SHA-256 `2d1088f93b7726c5c24fb4296af3cafee0a7b19fa0e94ea06ddbff3be6888afa`) instalado localmente e homologado na prática pelo Operador Humano (Otávio Serra) após 3 rodadas de testes.

Evidências: [BATCH-082](../../implementation/archive/compacted/batch-082-4a26865308ed.md).

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

- Estrutura: 219 renames Git e preservação dos 231 arquivos físicos anteriores; tríade de 2.789 / 2.550 / 3.932 bytes; 50 índices, zero links de índice quebrados. [Auditoria](../../../completions/BATCH-069-structure-audit.json).
- Skills: 44 canônicas, 39 alvos com PASS individual, 1.653 cópias idênticas, 21 traduções preservadas, zero divergências. [Auditoria](../../../completions/BATCH-069-skills-audit.json).
- Preservação: 60 skills locais no sincronizador (36 nos satélites + 24 nos templates); SHA-256 independente para todos os arquivos das 36 skills dos satélites. [Evidência](../../../completions/BATCH-069-preservation-audit.json).
- Extensão: compilação npm.cmd run compile, exit 0; 124/124 testes, zero falhas/skips; descoberta memory/ da matriz e sdd/ do core exercitada no JS compilado. [Testes](../../../completions/BATCH-069-extension-tests.json) / [smoke](../../../completions/BATCH-069-extension-scope-smoke.json).
- Nova skill validada com quick_validate.py; scripts com node --check e diffs stage/working tree sem erros. Sem execução real de IA, exclusão de worktrees ou deploy.
- Entrega técnica ready-for-review: [lote](../../implementation/archive/batch-069.md) e [recibo](../../../completions/BATCH-069-executor-receipt.json). Parecer independente e homologação continuam pendentes abaixo.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: parecer emitido em [review-069.md](../review-069.md) (APPROVED).
- [x] Homologação executiva pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-069-executor-receipt.json`.

## BATCH-070 — Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites (REQ-068, 2026-10-09)

- [x] Migração de `sdd/` para `memory/` via `git mv` nos 7 satélites (`conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`).
- [x] Injeção e adaptação da Tríade Fundamental (`00-baseline-architecture.md`, `01-general-memory.md`, `02-policy.md`) em todos os repositórios.
- [x] Provisionamento da árvore hierárquica de `index.md`, `memory/reports/` e `memory/raw/active|archive`.
- [x] Sincronização das 44 skills canônicas nos kits existentes, preservando integralmente 100% das 36 skills locais.
- [x] Commits atômicos sem `git add .` e push executado nos 6 repositórios com remote (`conn2flow-mkt` mantido local).
- [x] Suíte de testes da extensão do VS Code verde (124/124 testes aprovados).
- [x] Revisão técnica independente e homologação executiva do Macro-Arquiteto: [review-070.md](../review-070.md) (APPROVED).

---

## BATCH-072 — Revamp da documentação pública (REQ-070, 2026-10-09)

- [x] READMEs EN/PT-BR executivos, cada um abaixo de 10 KB, com Mermaid, três passos, guias e sugestões de metadados GitHub.
- [x] Pares do framework MDD e do ecossistema Python criados; guias existentes atualizados para tríade, 44 skills, oito pilares, CLI/MCP e estado de v1.1.2/integração dual.
- [x] Router e índices de idioma atualizados; par EN do guia de publicação criado.
- [x] Auditoria executada: 23 documentos, 11 pares estruturais, 252 links relativos, 80 fontes existentes, catálogos 44/44 e READMEs de 5.089/5.394 bytes.
- [x] Verificador falsificável: 5/5 mutações detectadas em fixture temporária, incluindo o README antigo do HEAD.
- [x] Paridade temática revisada; sintaxe CJS e diff sem erros.
- [x] [Relatório](../../implementation/archive/batch-072.md), [auditoria](../../../completions/BATCH-072-docs-audit.json), [checagens negativas](../../../completions/BATCH-072-validator-negative-checks.json) e [recibo](../../../completions/BATCH-072-executor-receipt.json) registrados.
- [x] Revisão técnica independente e homologação executiva do Macro-Arquiteto: [review-072.md](../review-072.md) (APPROVED).

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

Evidências: [lote](../../implementation/archive/batch-071.md), [JUnit](../../../completions/BATCH-071-pytest.xml), [resumo](../../../completions/BATCH-071-test-summary.json), [smoke](../../../completions/BATCH-071-smoke.json), [recibo](../../../completions/BATCH-071-executor-receipt.json).
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

Evidências, comandos, hashes e limites: [BATCH-073](../../implementation/archive/batch-073.md).

## BATCH-074 — Trava Tripla MDD (REQ-072, 2026-10-09)

- [x] CLI PHP memory:index/set/get e Typer mdd index/meta set/get registrados, com API reutilizável.
- [x] 111/111 pytest, incluindo 48 testes de paridade com PHP real e PyYAML; zero falhas/skips.
- [x] 124/124 testes VS Code e compilação TypeScript; arquivos de teste enumerados explicitamente para Node 24.
- [x] Ruff, pip check, PHP lint, diff check e skill quick_validate UTF-8.
- [x] 45 canônicas e dez espelhos idênticos da nova skill; c2f ai:sync 45/45 nos cinco kits do core.
- [x] Inbox matriz, skeletons EN/PT, três fichas-modelo, políticas e handoffs solo/dupla/triade × três autonomias.
- [x] Auditoria independente dos defeitos reproduzidos; regressões corrigidas e probes/48 testes reexecutados pelo Revisor.
- [x] Commits com caminhos específicos e recibo persistente.
- [x] Homologação humana identificada: Otávio, 2026-10-09, [REV-074](../../human-reviews/rev-074.md).

Evidências: [lote](../../implementation/archive/batch-074.md), [JUnit](../../../completions/BATCH-074-pytest.xml), [resumo](../../../completions/BATCH-074-test-summary.json), [artefatos](../../../completions/BATCH-074-artifact-audit.json), [auditoria global de skills](../../../completions/BATCH-074-skills-audit.json), [recibo](../../../completions/BATCH-074-receipt.json), [revisão](../../human-reviews/rev-074.md).

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
- [x] Homologação humana identificada do BATCH-075 (Otávio, 2026-10-09, [REV-075](../../human-reviews/rev-075.md)).

Evidências e limites: [lote](../../implementation/archive/batch-075.md), [resumo](../../../completions/BATCH-075-test-summary.json), [recibo](../../../completions/BATCH-075-receipt.json), [REV-075](../../human-reviews/rev-075.md). Sem deploy, banco/UI, Linux, CI remota ou suíte PHP integral; aviso Starlette/AnyIO; alterações locais alheias preservadas.

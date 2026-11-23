---
id: "BATCH-084"
title: "Propagação da REQ-081 e melhorias de governança e indexação na matriz"
status: "HOMOLOGATED"
date: "2026-11-21"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Propagação das skills da REQ-081, validação de FEAT-018/019 e segunda propagação em nove satélites."
summary_medium: "Fase 1 distribui as skills homologadas e a Fase 2 valida as melhorias na matriz.\nFase 3 propaga as três skills após aprovação do Gate e entrega para homologação."
---

# BATCH-084 — REQ-082

- Projeto e raiz: `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`.
- Requisição: [REQ-082](../human-requests/req-082.md). Topologia dupla, autonomia supervisionada, Categoria B.

## Fase 1 — Propagação da REQ-081

Auditoria inicial sem escrita: 44 alvos, 55 divergências, zero drift de tradução. Foram conferidos branches, caminhos Git das duas skills, manifestos de customização e diferenças de conteúdo antes da escrita. Nos três satélites históricos com kits parciais, as diferenças eram de uma versão compartilhada anterior das skills. No site irmão, as 15 cópias das regras já eram idênticas às fontes, então o modo `--target` escreveu somente as duas skills.

| Repositório | Branch | Kits conferidos | SKILL.md escritos |
| --- | --- | ---: | ---: |
| conn2flow | main | 5 | 10 |
| conn2flow-site | feat/req-292-docs-mdd | 5 | 10 |
| lumix | main | 5 | 10 |
| transformamp | main | 5 | 10 |
| conn2flow-home | main | 5 | 10 |
| website-conn2flow | main | 5 | 10 |
| conn2flow-app | main | 1 | 2 |
| conn2flow-mkt | main | 1 | 2 |
| conn2flow-nexus | main | 2 | 4 |

O comando oficial atualizou os cinco alvos padrão. O site irmão recebeu `--target ../website-conn2flow` e os três satélites históricos receberam `--repos conn2flow-app,conn2flow-mkt,conn2flow-nexus` nos kits existentes. As árvores de `conn2flow`, `conn2flow-site`, `conn2flow-home`, `website-conn2flow` e `conn2flow-mkt` já tinham alterações em outros caminhos. A comparação dos estados Git registrou apenas as duas skills entre os novos caminhos modificados. O `schema-metadata.json` local no site irmão foi preservado. Worktrees vinculadas foram excluídas da lista por pertencerem aos repositórios primários.

A auditoria pós-propagação confirmou 68 cópias idênticas à fonte homologada em 34 kits, zero divergências nas duas skills e zero drift de tradução. A comparação SHA-256 antes/depois confirmou a preservação de 1.631 arquivos de skills e regras fora do escopo nos nove satélites. O sincronizador também confirmou 129 skills locais preservadas nos 53 alvos auditados. A auditoria global manteve 81 divergências preexistentes nas demais skills, das quais cinco nos alvos oficiais e 76 nos kits históricos. O relatório da matriz na Fase 2 usa escopo próprio.


## Fase 2 — Implementação e validação na matriz

- **FEAT-018.** A governança multilíngue agora documenta os comandos de sincronização e auditoria com `--repos conn2flow-ai-workspace`. O sincronizador normaliza CRLF para LF em memória para `source_sha256` de tradução e para comparação das cópias. A gravação mantém os bytes da fonte. Hashes publicados para conferir customizações reconhecidas e integridade dos arquivos continuam calculados sobre bytes exatos.
- **FEAT-019.** `mdd meta get/set` resolve caminho explícito sob `memory/`, nome/stem exato e, em seguida, ID YAML ou prefixo seguido de hífen. O primeiro conjunto de candidatos encontrado decide o resultado. Havendo ambiguidade, a mensagem lista os caminhos ordenados e a mutação é abortada. A skill de indexação documenta o caminho explícito para ambiguidade, versões legadas e CLI PHP.
- **Higiene Git.** A skill do Arquiteto atribui a ele a conferência de branch e árvore Git, a coordenação de commits seletivos e a integração na `main` e push autorizados após homologação humana.
- **Distribuição local.** As três skills foram revisadas em PT-BR e nos cinco kits EN, com sync dos cinco kits da matriz e dos templates PT-BR. Duas cópias do Cursor da matriz são geradas localmente sob a regra de ignore já existente. Os respectivos fontes e templates estão incluídos na entrega.

### Diagnóstico e verificação de CRLF/LF

`git ls-files --eol` mostrou 46 blobs LF e um checkout com 27 arquivos CRLF, 13 LF e seis mistos. Antes dos edits, os 46 hashes crus coincidiam com o registro e cada fonte normalizada coincidia byte a byte com seu blob em `HEAD`. Havia 33 hashes que mudariam somente por CRLF/LF. Foram migrados para SHA-256 com LF 31 registros de fontes cujo conteúdo permaneceu idêntico, preservando data e tradutor. Os três pares fonte/tradução alterados foram atualizados separadamente por `--update-translation-hash <skill> en --translator mdd-agent`. A normalização em memória dispensa renormalização de arquivos e regra de `.gitattributes`.

| Verificação | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | PASS. 27 cópias atualizadas. |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | PASS em 19 alvos, 542 cópias equivalentes, 312 traduções preservadas, zero divergências e zero drift. |
| Auditoria isolada dos 19 alvos com finais só LF e com combinação de CRLF/LF/mistos | PASS em ambas as variações, zero divergências e zero drift. |
| `pytest -q tools/mdd-client/tests` no ambiente local | 119 aprovados, incluindo `test_translation_drift.py`, `test_skill_migration.py` e `test_indexer.py`. Os testes cobrem drift real, ambiguidade e preservação da mutação e do índice. |
| `mdd meta get REP-004 status --json` e `mdd meta get FEAT-018 status --json` | `"READY_FOR_ARCHITECT"` e `"PROMOTED"`. |
| `php cli/c2f.php memory:get REP-004 status --json --repo=<matriz>` no core | Zero candidatos. O mesmo comando com `memory/reports/REP-004-batch083-skills-learnings.md` retorna `"READY_FOR_ARCHITECT"`. O resolvedor compartilhado de `memory:get/set` confirma o gap de paridade. |
| Conferência posterior dos nove satélites | As 68 cópias continuam com os SHA-256 brutos da fonte homologada da Fase 1. |

A memória de execução está em 10.329 bytes e 57 linhas. O lote foi executado na árvore existente, sem deploy no Lab, stage, commits ou push. O arquivo preexistente `FEAT-015` continua fora do stage.

## Relatório de Dificuldades e Aprendizados para o AI Workspace

1. **Contexto da rodada.** REQ-082 / BATCH-084 em `conn2flow-ai-workspace`. Propagação da REQ-081 em nove satélites e validação local de governança e metadados na matriz.
2. **Dificuldades e atritos enfrentados.** A auditoria seleciona um subconjunto para escrita e ainda inspeciona todo o catálogo dos destinos, por isso o status global pode falhar após aplicar as duas skills sem que elas apresentem divergências. Havia 33 hashes de origem dependentes de CRLF ou de finais mistos no checkout Windows. O CLI PHP ainda retorna zero candidatos para um ID com slug.
3. **Lacunas ou defasagens nas skills.** `c2f-multilingual-skills-governance` precisava dos comandos com `--repos` e da explicação do hash. `c2f-mdd-indexing-and-handoffs` descrevia resolução por ID sem distinguir o Python do PHP. `c2f-executor-agent` orienta o relatório e o Gate. O uso combinado com a skill de indexação definiu o recibo local quando o MCP Hub ficou indisponível.
4. **Solução validada e armadilhas medidas.** Foram conferidas 68 cópias da Fase 1 e 1.631 arquivos protegidos. A matriz passou em 19 alvos no checkout real e em duas simulações de EOL. `mdd meta get REP-004 status --json` retornou `READY_FOR_ARCHITECT`. A suíte do cliente passou com 119 testes e o PHP resolveu o mesmo relatório por caminho explícito.
5. **Sugestões de melhoria.** Registrar em `c2f-multilingual-skills-governance` que a seleção de skills restringe a escrita e que a auditoria ainda cobre o catálogo inteiro dos destinos. Abrir acompanhamento para paridade de ID e slug no resolvedor PHP.

O relatório também está registrado em [REP-005](../reports/REP-005-batch084-rollout-and-eol.md).

## Gate da Fase 3 — registro da entrega das Fases 1 e 2

Ao concluir as Fases 1 e 2, o Executor entregou o lote ao Macro-Arquiteto e ao operador humano para aprovar a segunda propagação. Evidências na [auditoria da matriz](../../completions/skills-audit.json), no [checklist](../validation/VALIDATION-CHECKLIST.md) e no [recibo local](../../completions/BATCH-084-executor-receipt.json). O MCP Hub não estava disponível entre as ferramentas desta sessão.

```text
Ative c2f-architect-master em conn2flow-ai-workspace, raiz
C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
REQ-082 / BATCH-084, topologia dupla, autonomia supervisionada, Categoria B.
Revise memory/implementation/batch-084.md e completions/skills-audit.json.
As Fases 1 e 2 estão prontas para revisão. Valide a propagação da REQ-081,
FEAT-018, FEAT-019 e o adendo Git. Confirme com o operador humano o Gate da
Fase 3 antes de autorizar a segunda propagação. O CLI PHP ainda exige caminho
explícito para REP-004, conforme registrado no lote.
```


## Fase 3 — Segunda propagação aos satélites

O Macro-Arquiteto e o Operador Humano aprovaram o Gate na conversa em 2026-11-21. O Executor conferiu os nove repositórios da Fase 1, auditou os destinos antes de gravar e aplicou somente `c2f-multilingual-skills-governance`, `c2f-mdd-indexing-and-handoffs` e `c2f-architect-master` nos kits existentes.

| Repositório | Branch na execução | Kits | SKILL.md verificados | Novos |
| --- | --- | ---: | ---: | ---: |
| conn2flow | main | 5 | 15 | 0 |
| conn2flow-site | feat/req-292-docs-mdd | 5 | 15 | 0 |
| lumix | main | 5 | 15 | 0 |
| transformamp | main | 5 | 15 | 0 |
| conn2flow-home | main | 5 | 15 | 0 |
| website-conn2flow | main | 5 | 15 | 0 |
| conn2flow-app | main | 1 | 3 | 2 |
| conn2flow-mkt | main | 1 | 3 | 2 |
| conn2flow-nexus | main | 2 | 6 | 4 |

- O sincronizador oficial escreveu 82 cópias via `--repos` e 15 via `--target ../website-conn2flow`. No Core, as cinco cópias de governança multilíngue receberam a atualização com o título local “⚡ Gatilho Obrigatório”, conferido no commit `8a4cc36b`. Os pares de hashes foram reconhecidos com `mdd sync --customize` no manifesto `conn2flow/memory/sync-customizations.json`.
- A auditoria global passou de 170 para 68 divergências em 53 alvos. As 68 restantes já existiam nas demais skills. As três skills desta fase têm zero divergências, com 97 cópias equivalentes à matriz e cinco variantes reconhecidas no Core. A verificação por SHA-256 preservou 1.605 arquivos de skills e regras fora do escopo nos satélites. A auditoria também confirmou 129 skills locais preservadas e 312 traduções registradas intactas, com zero drift.
- A repetição dos comandos de sincronização gravou zero arquivos. A auditoria exclusiva da matriz voltou a passar nos 19 alvos com zero divergências e zero drift. Os 66 testes locais de migração, tradução e indexação passaram.
- As branches e o stage dos nove satélites foram preservados. O `conn2flow-site` recebeu as skills na branch `feat/req-292-docs-mdd`, que já estava ativa. A Fase 3 teve somente verificações locais de Categoria B e entregou os arquivos para homologação, sem deploy no Lab, commit, merge ou push.

### Relatório de dificuldades e aprendizados da Fase 3

1. **Contexto da rodada.** Fase 3 da REQ-082 / BATCH-084 na matriz e nos nove satélites, com Gate aprovado em 2026-11-21.
2. **Dificuldade encontrada.** O Core já tinha o título “⚡ Gatilho Obrigatório” versionado nos cinco kits, sem manifesto para esse caminho. A auditoria global continuava agregando diferenças de outras skills.
3. **Lacuna nas skills consultadas.** A governança multilíngue descreve a preservação durante a sincronização. O procedimento para incorporar a atualização em uma cópia customizada e reconhecer o novo par de hashes ficou a cargo do comando MDD.
4. **Solução validada.** A atualização e o título local convivem nas cinco cópias do Core, reconhecidas no manifesto. A repetição do sync escreveu zero arquivos. Foram verificados 102 SKILL.md em 34 kits e 66 testes locais passaram.
5. **Sugestão de melhoria.** Documentar na governança multilíngue a revisão do diff de uma variante antes de atualizar seu reconhecimento com `mdd sync --customize`, bem como a diferença entre o escopo de escrita e a cobertura da auditoria.

Cinco cópias da .claude estão sob regras de ignore preexistentes: duas no Core e três em lumix. As cópias foram atualizadas localmente e seus caminhos estão identificados no recibo para a revisão Git.

### Handoff para homologação e integração

O lote está `ready-for-review`. Os caminhos das skills por repositório e o manifesto do Core estão no [recibo local](../../completions/BATCH-084-executor-receipt.json).

```text
Ative c2f-architect-master em conn2flow-ai-workspace, raiz
C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
REQ-082 / BATCH-084, topologia dupla, autonomia supervisionada, Categoria B.
Revise a Fase 3 em memory/implementation/batch-084.md e o recibo em
completions/BATCH-084-executor-receipt.json. Submeta o lote à homologação.
Após homologação humana, conduza commits seletivos e integração na main
com push autorizado. Preserve o trabalho em andamento, confira o manifesto
do Core e revise os caminhos do conn2flow-site na branch já ativa.
```

---
id: "BATCH-094"
title: "VSIX v1.2.0, saneamento de skills e documentação pós-ARCH-018"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-092"
topology: "dupla"
autonomy: "supervisionado"
summary_short: "VSIX v1.2.0 validado, 57 sobras restauradas nos satélites, documentação bilíngue atualizada e inventário DEC-136."
summary_medium: "Empacotamento local com 154 testes da extensão e 153 do Client.\nDocumentação pós-ARCH-018, preservação de features nos satélites e diagnóstico de curadoria sem remoções."
---

# BATCH-094 — Entrega local pós-ARCH-018

[REQ-092](../../human-requests/archive/req-092.md) · [ARCH-018](../../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada.

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Base local `fb46fe73c600`.

## Live Todo List

- [x] Validar a origem das sobras e sanear os três satélites autorizados. Auditar os demais em leitura.
- [x] Atualizar manifesto e lockfile, compilar, testar e checar o VSIX v1.2.0.
- [x] Atualizar READMEs, changelogs e guias EN/PT-BR.
- [x] Registrar o inventário DEC-136, o Skill Budget e a fila de feedback.
- [x] Rodar os checks locais e entregar lote, checklist, índices e FEAT-017.
- [ ] Revisão do Macro-Arquiteto e homologação visual pelo operador.

## Release local e documentação

`npm.cmd version 1.2.0 --no-git-tag-version` alinhou manifesto e lockfile. Em `vscode-extension/`, `npm.cmd run compile` e `npm.cmd test` passaram (154/154). O empacotamento usou `npx.cmd --yes @vscode/vsce package --out conn2flow-tools-1.2.0.vsix` (VSCE 4.1.1). Após atualizar o README incluído no pacote, o mesmo VSCE foi executado via `npx.cmd --offline @vscode/vsce package --out conn2flow-tools-1.2.0.vsix`. O zip contém 94 entradas, 232.947 bytes, passou pela verificação de CRC e contém o entrypoint compilado, changelog, README atualizado e a definição da aba MDD Hub & Skills Control. O manifesto VSIX e o package interno identificam `conn2flow.conn2flow-tools` v1.2.0.

**SHA-256** `e4fbc4bf9fc7bcab2c4a127dd0c57314cd23872e056f6d2d96bc878eec3f2e5f`.

O VSIX está em `vscode-extension/conn2flow-tools-1.2.0.vsix`, sob o ignore existente. Instalação manual opcional, a partir da raiz da matriz:

```powershell
code.cmd --install-extension vscode-extension\conn2flow-tools-1.2.0.vsix --force
```

Os [READMEs](../../../README.md), o [changelog da matriz](../../../CHANGELOG.md), o [changelog da extensão](../../../vscode-extension/CHANGELOG.md) e os [guias bilíngues](../../../docs/README.md) cobrem o Client disponível no checkout, as quatro camadas MDD, as 48 skills e cinco personas, `subskills/`, Skill Budget, `learnings/`, a inbox e o barramento de feedback nos dois MCPs, os evals e a aba v1.2.0. O validador de documentação passou após alinhar a expectativa de 44 para 48 skills. As instruções de empacotamento do README da extensão usam a versão já escolhida, pois `npm run package` faria outro bump.

## Satélites

Contagem com `git --no-optional-locks status --porcelain --untracked-files=all`. O recorte inclui as cinco famílias de kits. A restauração usou `git checkout --` com a lista exata de `SKILL.md` rastreados em cada árvore. Os quatro nomes aceitos foram `c2f-architect-master`, `c2f-executor-agent`, `c2f-mdd-indexing-and-handoffs` e `c2f-multilingual-skills-governance`.

O diff dos candidatos foi confrontado com os blobs da REQ-082 na matriz (`35d5d1a`), normalizando apenas CRLF/LF. As quatro cópias de governança multilíngue no Core também conservavam o cabeçalho de gatilho idêntico ao `HEAD` local, diferença conferida no diff antes da restauração. Branches, HEADs e diffs de stage permaneceram iguais. O manifesto Git e o SHA-256 dos arquivos locais fora da lista restaurada coincidiram antes e depois nos três repositórios.

| Satélite | Branch e referência local | Skills antes → depois | Fora de skills | Ação |
| --- | --- | ---: | ---: | --- |
| website-conn2flow | `main` `1a3b406e0cc3`, 3 atrás de `origin/main` | 20 → 0 | 1 | Restaurou 20. A alteração local em `gestor/db/data/schema-metadata.json` deixa a árvore suja, portanto o pull condicionado à limpeza não foi executado. `origin/main` observado em `84943eaffa1e`, com rollout ARCH-018. |
| conn2flow | `feat/req-305-mercadopago-orders-api` `8316b3410a49` | 17 → 0 | 26 | Restaurou 17. Preservou a REQ-305. |
| conn2flow-home | `infra/conn2flow-stack-req013` `1f55fd644b58` | 25 → 5 | 93 | Restaurou 20. Os cinco restantes são `home-voice-persona/SKILL.md` não rastreados, um por kit. Preservou a persona local e a infraestrutura. |
| conn2flow-site | `lab/req-149-156` | 0 | 10 | Somente leitura. |
| lumix | `main`, 3 atrás de `origin/main` | 16 | 0 | Somente leitura. |
| transformamp | `main`, 3 atrás de `origin/main` | 20 | 0 | Somente leitura. |
| conn2flow-app | `main`, 3 atrás de `origin/main` | 4 | 0 | Somente leitura. |
| conn2flow-mkt | `main` | 4 | 126 | Somente leitura. |
| conn2flow-nexus | `main`, 3 atrás de `origin/main` | 8 | 0 | Somente leitura. |

## Curadoria DEC-136 — candidatos a limpeza ou melhoria

A auditoria enumerou os **162 arquivos rastreados** em `completions/` (22.336.675 bytes), com tipo, tamanho e ocorrência de caminho explícito no Markdown rastreado. Foram encontrados 135 arquivos com menção explícita e 27 sem essa menção. O cruzamento literal serve para priorizar revisão. Recibos vinculados por ID, referências em JSON ou automação podem existir. O inventário inclui o `skills-audit.json` atualizado pelo check do lote.

| Tipo em `completions/` | Arquivos | Bytes | Citados em Markdown | Uso e decisão proposta |
| --- | ---: | ---: | ---: | --- |
| JSON | 129 | 14.481.458 | 110 | Recibos, auditorias, resumos e baselines. Avaliar arquivamento dos recibos sem menção direta (por exemplo BATCH-039 e BATCH-040) só após cruzar IDs com tarefas e lotes. |
| LOG | 13 | 145.766 | 8 | Saída de testes e tradução. Comparar as cinco saídas sem menção com resumos finais e JUnit antes de propor retenção reduzida. |
| PNG | 1 | 20.706 | 1 | Captura do smoke BATCH-065. Manter enquanto referenciada. |
| PY | 3 | 30.642 | 2 | Scripts de evidência BATCH-078/079/080. Conferir reprodutibilidade e referências antes de propor arquivo histórico para `BATCH-078-maintenance.py`. |
| TXT | 1 | 10.795 | 1 | Saída de testes da extensão no BATCH-078. Manter vínculo com a evidência. |
| XML | 14 | 157.144 | 12 | JUnit histórico. Comparar `BATCH-071-followup-pytest.xml` e `BATCH-076-client-pytest.xml` com as execuções finais antes de recomendar consolidação. |
| ZIP | 1 | 7.490.164 | 1 | Preimagem CSS do BATCH-078. Preservar bytes e o vínculo para recuperação. |

Os **nove VSIX anteriores** somam 1.810.346 bytes. O manifesto interno de cada um corresponde ao nome. Todos são locais e ignorados pelo Git.

| Versão | Bytes | Versão | Bytes | Versão | Bytes |
| --- | ---: | --- | ---: | --- | ---: |
| 1.0.0 | 184.312 | 1.1.0 | 191.017 | 1.1.1 | 191.020 |
| 1.1.2 | 200.324 | 1.1.3 | 204.659 | 1.1.4 | 204.778 |
| 1.1.5 | 210.172 | 1.1.6 | 211.474 | 1.1.7 | 212.590 |

Proposta para aprovação humana: deixar v1.2.0 como instalação corrente e arquivar as versões anteriores com manifesto de SHA-256. Preservar em particular a v1.1.7 como versão anterior homologada para rollback e as v1.1.3/v1.1.4 ligadas a evidências e instruções de homologação. Conferir os vínculos históricos antes de qualquer movimentação.

| Caminho | Utilidade atual observada | Candidato ou ação para avaliação humana |
| --- | --- | --- |
| `temp/` | 3.964 arquivos locais ignorados, 83.368.838 bytes na coleta. Mistura trabalhos intermediários, scripts e evidências de lotes. | Separar evidência única de resultados reprodutíveis antes de discutir retenção. |
| `temp-images/` | Quatro imagens JPG locais ignoradas, 3.050.282 bytes, com nomes de exportação para redes sociais. | Confirmar autoria e originais antes de arquivar exportações. |
| `.coverage` | Banco local ignorado de cobertura (53.248 bytes), regenerável por pytest-cov. | Candidato a limpeza local após conferência de que a cobertura necessária está registrada. |
| `cli/` | Só `cli/CLAUDE.md` está presente e rastreado. Orienta padrões do CLI Core, cujo código está no repositório `conn2flow`. | Conferir uso do contexto por agentes e templates antes de propor realocação. |
| `gestor/` | Só `gestor/modulos/CLAUDE.md` está presente e rastreado. Orienta CRUD e controladores do Core. | Conferir distribuição e uso no Core antes de propor realocação. |
| `resources/` | Só `resources/CLAUDE.md` está presente e rastreado. Guarda orientação sobre recursos e sincronização. | Conferir instruções duplicadas e consumidores antes de propor realocação. |
| `tasks/` | O MCP Hub grava e consulta tarefas nessa pasta. Oito JSON rastreados, seis `completed` e dois `dispatched` (REQ-048/051). | Conferir a fila e vínculos de recibos. Considerar arquivar os seis encerrados com referências preservadas após aprovação. |
| `scripts/` | Instaladores, sincronizadores e validadores em uso. `test-icons.html`, `test-stroke-icons.js`, `extract-icon.js` e scripts auxiliares são candidatos de revisão por serem protótipos de ícones sem ligação encontrada nos fluxos atuais. | Identificar origem e ordem de execução com o mantenedor de assets. Preservar o validador público e os scripts da esteira de skills. |
| `docs/` | 21 Markdown em dois idiomas e índice geral. Os guias foram referenciados pelos READMEs e pelo painel. | Manter os guias. Usar o validador público para detectar deriva do catálogo e dos links em releases futuros. |

### Fila de feedback e Skill Budget

| Feedback | Estado observado | Encaminhamento proposto |
| --- | --- | --- |
| FB-004 | `READY` / `PENDING`, alta | Curador pode reproduzir a perda do sucessor sob whitelist e avaliar preflight de rastreamento. |
| FB-005 | `QUARANTINE`, média, 1 ocorrência | Aguardar recorrência do comportamento de criação de kits com `--apply --all`. |
| FB-006 | `QUARANTINE`, média, 1 ocorrência | Aguardar recorrência da coexistência de nomes legados e canônicos em sync parcial. |
| FB-007 | `READY` / `PENDING`, baixa, 2 ocorrências | Curador pode validar a evidência Windows e propor o exemplo PowerShell. |

`node scripts/skills/generate-skills-index.cjs --budget-report` encontrou 48 skills (42 OK, 2 NEAR e 4 OVER). Candidatos para o primeiro ciclo de `c2f-persona-optimizer`:

| Skill | Linhas / orçamento | Proposta para revisão |
| --- | --- | --- |
| `c2f-shell-and-windows-traps` | 488 / 300 | Extrair exemplos extensos de shells, EOL e junctions para `subskills/`. Manter armadilhas e encaminhamento no ponto de entrada. |
| `c2f-module-crud-scaffolding` | 437 / 300 | Extrair receitas completas de módulos e manter sequência de scaffold e validações visíveis na página principal. |
| `c2f-javascript-ajax` | 333 / 300 | Mover exemplos longos de requisições e callbacks. Manter a regra coberta pelo EVAL-001 no ponto de entrada. |
| `c2f-payment-gateways` | 313 / 300 | Auditar sobreposição com a subskill Mercado Pago já existente e manter os requisitos gerais e o roteamento cobertos pelo EVAL-011. |

## Validação local

| Verificação | Resultado |
| --- | --- |
| `npm.cmd run compile` e `npm.cmd test`, em `vscode-extension/` | PASS, 154/154 |
| VSCE + CRC, metadados e conteúdo do VSIX | PASS, 94 entradas. SHA-256 acima. |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | PASS, 19 alvos, 0 divergências, 0 escritas de skills. [Auditoria](../../../completions/skills-audit.json). |
| `node scripts/skills/generate-skills-index.cjs --check` | PASS, 48 skills |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | 153/153 PASS (74,07 s) |
| `mdd eval --matrix .` | EVAL-PASS, 13/13, determinístico |
| `node scripts/docs/validate-public-docs.cjs` | PASS, 23 arquivos, 11 pares, 284 links relativos e 106 fontes |
| `mdd index --path .` | Índices regenerados |
| `git diff --check` e verificação do stage | PASS. FEAT-015 continua não rastreada. |

## FEAT-017 e handoff

O [REP-014](../../reports/REP-014-batch094-vsix-skills-and-curation.md) registra o contexto, os atritos da rodada, as lacunas nas skills, as soluções verificadas e as propostas de melhoria.

O `mdd status --json` retorna `healthy: false` pela janela de retenção. A base já tinha 11 requisições ativas. Implementação, checklist e relatórios passaram de 10 para 11 entradas com esta entrega. As fichas históricas foram preservadas sob DEC-136, com a decisão de arquivamento em revisão. A matriz segue sem stage, commit ou push desta rodada. Categoria B sem deploy no Lab. A instalação do VSIX e a homologação visual permanecem com o operador.

```text
Ative c2f-persona-architect em conn2flow-ai-workspace, raiz
C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Revise REQ-092 / BATCH-094 (dupla, supervisionado), o diff local,
memory/implementation/batch-094.md, memory/validation/VALIDATION-CHECKLIST.md
e memory/reports/REP-014-batch094-vsix-skills-and-curation.md.
Confira VSIX v1.2.0, os 57 caminhos restaurados, a árvore ainda suja
do website-conn2flow e a fila de curadoria DEC-136.
Aguarde a homologação visual e a decisão humana sobre retenção antes da consolidação.
```

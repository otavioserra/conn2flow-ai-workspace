# Batch Index

Este arquivo gerencia os lotes operacionais ativos e recentes do `conn2flow-ai-workspace`.

## Status

- `complete`: lote validado e integrado.
- `in-progress`: tarefas ativas sendo executadas pelo Executor.
- `ready-for-review`: implementação e validação técnica concluídas, aguardando aceite humano.
- `ready-for-intake`: reservado, aguardando briefing humano.
- `blocked`: depende de decisão adicional.

## Histórico consolidado

- **BATCH-000 a BATCH-003**: onboarding, reorganização bilíngue e otimizações iniciais; detalhes nos arquivos do lote e em `validation/archive/validation-001-003.md`.
- **BATCH-006 a BATCH-032**: lotes concluídos; detalhes preservados em [sdd/implementation/archive/](archive/) e no histórico Git.

| Batch | Resumo | Registro arquivado |
| --- | --- | --- |
| **BATCH-004** | Integração MCP para agentes locais | [batch-004](archive/batch-004-mcp-integration.md) |
| **BATCH-005** | Governança SDD em CI/CD | [batch-005](archive/batch-005-sdd-governance-ci.md) |
| **BATCH-050** | Regra dos 10 ativos e comando de arquivamento | [batch-050](archive/batch-050.md) |
| **BATCH-051** | Preferências de workspace e prompt SDD | [batch-051](archive/batch-051.md) |
| **BATCH-052** | Publicação SSH de projetos | [batch-052](archive/batch-052.md) |
| **BATCH-053** | Loading, resiliência VM e busca de docs | [batch-053](archive/batch-053.md) |
| **BATCH-054** | SSH no css:audit, Confirmação Remota em VM, Saneamento de Notificações, Status Bar VM e Busca de Docs | [batch-054](archive/batch-054.md) |
| **BATCH-055** | Logs VM com sudo, Sincronização do CLI, Rebuild SSH Duplo, Tailwind Global e Asserções Portáveis | [batch-055](archive/batch-055.md) |
| **BATCH-056** | Memory Gardening do Ecossistema SDD e Validação de Publicação de Release | [batch-056](archive/batch-056.md) |
| **BATCH-057** | Consolidação Canônica e Sincronização Global das 39 Skills nos 5 Repositórios | [batch-057](archive/batch-057.md) |
| **BATCH-058** | Incorporação Canônica das Armadilhas 7, 8 e 9 e Sincronização Global nos 5 Repositórios | [batch-058](archive/batch-058.md) |
| **BATCH-059** | Migração de Configurações para .gemini/config.json e Antigravity v2.16+ | [batch-059](archive/batch-059.md) |
| **BATCH-060** | Skill canônica `c2f-documentation` e propagação aos kits | [batch-060](archive/batch-060.md) |
| **BATCH-061** | Auditoria Ampla do Ecossistema SDD, Poda de Arquivos Gigantes e Cristalização em Skills | [batch-061](archive/batch-061.md) |
| **BATCH-062** | Incorporação Canônica dos Aprendizados de E-commerce nas Skills e Criação da Skill c2f-payment-gateways | [batch-062](archive/batch-062.md) |
| **BATCH-063** | Choques das entregas na extensão do VS Code | [batch-063](archive/batch-063.md) |

## Lote atual

[REQ-099](../human-requests/req-099.md) / [BATCH-101](batch-101.md) (complete, homologado em 2026-11-27). Checklist de ativação de idiomas, EVAL-019 com 19/19, 223 testes Python (96,22%), OVER: 0 e rollout em sete satélites.

[REQ-098](../human-requests/req-098.md) / [BATCH-100](batch-100.md) (complete, homologado em 2026-11-26). Saneamento de links em `validation/archive/` e EVAL-018 (18/18).
[REQ-097](../human-requests/req-097.md) / [BATCH-099](batch-099.md) (complete, homologado em 2026-11-26). Regra de dist/ por modo de deploy (Lab/SSH vs HTTP-only) e REQ-306 em duas skills, EVAL-017 e rollout em 7 satélites.
[REQ-096](../human-requests/req-096.md) / [BATCH-098](batch-098.md) (ready-for-review). Sincronização remota de skills, VSIX 1.2.4 e workflow semanal opcional.

## Histórico de lotes arquivados — BATCH-068 a BATCH-075

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-068** | complete | Memory Gardening Global do Ecossistema SDD: Poda de Arquivos Gigantes, Saneamento da Regra dos 10 e Limpeza de Sobras Locais | [batch-068.md](archive/original/batch-068.md) | REQ-066 homologada; dumps gigantes podados no Core, DECISION-LOG e VALIDATION-CHECKLIST saneados (<50KB), worktrees e backups .bak removidos, 124/124 npm test, review-068.md aprovado. |
| **BATCH-069** | complete | Fundação Estrutural do MDD (Memory Driven Development), Sistema Hierárquico de index.md com Compactação Dual e Incorporação das Lições do BL-028 | [batch-069.md](archive/batch-069.md) | REQ-067 homologada; fundação MDD (00, 01, 02), 50 índices, 44 skills (c2f-ai-features), Armadilhas 18 e 19, 39 alvos PASS, 124/124 testes, review-069.md aprovado. |
| **BATCH-070** | complete | Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites do Ecossistema Conn2Flow | [batch-070.md](archive/batch-070.md) | REQ-068 homologada; migração nos 7 satélites, Tríade 00, 01, 02 e 44 skills, review-070.md aprovado. |
| **BATCH-071** | ready-for-review | Implementação das Aplicações em Python: MDD Client CLI & Daemon (ARCH-010) e MDD Hub & Documentation Watcher (ARCH-011) | [batch-071.md](archive/batch-071.md) | REQ-069 aprovada; desenvolvimento modular em Python 3.11+ em tools/mdd-client e tools/mdd-hub com pytest |
| **BATCH-072** | complete | Revamp da Documentação Pública: Modernização dos READMEs Raiz e Descentralização em docs/ | [batch-072.md](archive/batch-072.md) | REQ-070 homologada; 23 docs, 11 pares, 252 links PASS, 44 skills, review-072.md aprovado. |
| **BATCH-073** | complete | Padronização Canônica das Memórias de Engenharia em Inglês (03 e 04), Integração com raw/ e Boilerplates | [batch-073.md](archive/batch-073.md) | REQ-071 aprovada; renomeação para 03-memory-engineering-chief e 04-memory-engineering-execution, uso de raw/ e skeletons |
| **BATCH-074** | complete | Implementação da Trava Tripla MDD: Metadata Header com Auto-Cura de Índices, Handoffs Adaptáveis e Pasta Canônica memory/human-reviews/ | [batch-074.md](archive/batch-074.md) | REQ-072 homologada em rev-074.md; cabeçalho YAML frontmatter, auto-cura/mutação via CLI (PHP/Python) com fallback, 45ª skill c2f-mdd-indexing-and-handoffs, pasta human-reviews/ |
| **BATCH-075** | complete | Consolidação Harmônica das Branches MDD (REQ-071 e REQ-072), Resolução de Conflitos e Unificação na main | [batch-075.md](archive/batch-075.md) | REQ-073 aprovada; merge de feat/req-071 em feat/req-072, testes 100% verde (pytest e VS Code) e merge final na branch main |

## Entrega atual

[REQ-099](../human-requests/req-099.md) / [BATCH-101](batch-101.md) (complete, homologado em 2026-11-27). Checklist de ativação de idiomas, EVAL-019 com 19/19, 223 testes Python (96,22%), OVER: 0 e rollout em sete satélites.

[REQ-098](../human-requests/req-098.md) / [BATCH-100](batch-100.md) (complete, homologado em 2026-11-26). 0 links quebrados, EVAL-018 (18/18), 222 testes Python com 96,21% e OVER: 0.
[REQ-097](../human-requests/req-097.md) / [BATCH-099](batch-099.md) (complete, homologado em 2026-11-26). Gate local PASS, 222 testes Python com 96,21%, EVAL-017 (17/17) e OVER: 0.
[REQ-096](../human-requests/req-096.md) / [BATCH-098](batch-098.md) (ready-for-review). Gate local PASS, 222 testes Python com 96,21% e extensão 172/172. [Relatório FEAT-017](../reports/REP-018-batch098-remote-skill-sync.md).

[REQ-095](../human-requests/req-095.md) / [BATCH-097](batch-097.md) (ready-for-review). VSIX 1.2.3, EVAL-016 e rollout confirmado nos sete satélites.

[REQ-094](../human-requests/req-094.md) / [BATCH-096](archive/batch-096.md) (`ready-for-review`) valida o gate Python em 96,32%, entrega a extensão VS Code 1.2.2 e restabelece a janela de dez seções do checklist. [Relatório FEAT-017](../reports/REP-016-batch096-ci-hub-i18n-and-memory.md).

## Entregas anteriores

[REQ-093](../human-requests/req-093.md) / [BATCH-095](archive/batch-095.md) (`ready-for-review`) entrega a extensão v1.2.1 (UTF-8, triagem no menu, progresso, hub externo, domínio do projeto), `domains/` + `mdd bootstrap` (ARCH-019 Fase 1), FB-004/FB-007 e a 1ª rodada do Optimizer (0 skills OVER, eval 15/15). [Relatório FEAT-017](../reports/REP-015-batch095-domains-bootstrap-and-optimizer.md).

[REQ-092](../human-requests/archive/req-092.md) / [BATCH-094](archive/batch-094.md) (`HOMOLOGATED`) entregou VSIX v1.2.0 validado, saneamento cirúrgico de 57 sobras de skills, documentação bilíngue e inventário DEC-136. [Relatório FEAT-017](../reports/REP-014-batch094-vsix-skills-and-curation.md).


REQ-091 / BATCH-093 (`ready-for-review`): Fase 4 (final) do ARCH-018. Quarentena por recorrência em `mdd feedback` (origem `(repo, batch)`, `--force-ready` nos dois MCP), `--budget-report`, aviso de divergência entre cópias EN, `mdd eval` determinístico com 13 cenários, FB-001..003 aceitos e aplicados em PT-BR/EN (gate: pytest 153/153, EVAL-PASS 13/13). Rollout das 48 skills em 7 satélites via worktrees isoladas já removidas; `conn2flow-home` e `conn2flow-mkt` intocados. [Relatório](archive/batch-093.md).

REQ-090 / BATCH-092 (`ready-for-review`): Fase 3 do ARCH-018. Aba MDD Hub & Skills Control na extensão (servidores + triagem de feedbacks), fila serial no stdio do hub, tools de feedback no MCP Python, `docs/` em 48 skills, poda do checklist e, no Core via worktree isolada já removida, `ai:archive-memory` com `reports/` e `--status` publicado em `origin/main` (`6e146f7aa8b6`). [Relatório](archive/batch-092.md).

REQ-089 / BATCH-091 (`ready-for-review`): Fase 2 do ARCH-018 só na matriz. `mdd feedback submit/list/triage` com inbox `memory/inbox/feedback/`, tools MCP `submit_skill_feedback`/`list_skill_feedback` no `conn2flow-hub`, 4 personas conectadas e notas do REP-010. Auditoria PASS e pytest 141/141. [Relatório](archive/batch-091.md).

REQ-088 / BATCH-090 (`ready-for-review`): Fase 1 do ARCH-018 só na matriz. Cinco personas `c2f-persona-*` com aliases no sync, 48 skills, índice de skills, `subskills/` com piloto Mercado Pago e `memory/learnings/`. Auditoria PASS e pytest 130/130. [Relatório](archive/batch-090.md).

[REQ-084](../human-requests/archive/req-084.md) / [BATCH-086](archive/batch-086.md) atualizou três skills PT-BR/EN e aplicou a regra dos dez ativos.

[REQ-080](../human-requests/archive/req-080.md) / [BATCH-082](archive/compacted/batch-082-4a26865308ed.md) está concluído e arquivado com o original íntegro. O [BATCH-083](archive/compacted/batch-083-95aade2d8707.md) homologado também foi arquivado.

REQ-087 / BATCH-089 (`ready-for-review`): Fase 0 do ARCH-018 executada só na matriz. Quinze skills PT-BR/EN, saneamento SDD→MDD e MDD explicitado como evolução do SDD. Auditoria PASS e pytest 119/119. [Relatório](archive/batch-089.md).

REQ-083 / BATCH-085 (`ready-for-review`) aplicou os ajustes do REP-005 e a paridade PHP, com sete satélites publicados e dois sem `origin`. As worktrees foram removidas. [Relatório](archive/batch-085.md).

REQ-082 / BATCH-084 (`ready-for-review`): As três fases foram validadas em Categoria B, com 102 cópias verificadas na segunda propagação. O lote aguarda homologação final e integração na main. [Relatório](archive/batch-084.md).

REQ-079 / BATCH-081 (`ready-for-review`): Motor de Banco de Dados MDD (`SQLite3 + FTS5` local em `memory/.mdd.sqlite` e compatibilidade 1:1 com `ai_memories` no `conn2flow-site`), detalhado em [batch-081.md](batch-081.md) e [req-079.md](../human-requests/req-079.md).

REQ-077 / BATCH-079: governança validada; duas worktrees seguras removidas e 15 preservadas conforme decisão humana, em [batch-079.md](batch-079.md). Continuidade REQ-078 / BATCH-080 autorizada expressamente no chat de 2026-11-05.

REQ-078 / BATCH-080: implementação pronta para revisão; 46 skills EN, registro de hashes e auditoria de drift, Python 138 e extensão 133 PASS. [Relatório](batch-080.md). Homologação humana pendente.

`REQ-076` (`BATCH-078`): limpeza segura executada, com preservação de trabalho não integrado, árvores sujas e repositório sem remote. Evidências no lote; homologação humana não atribuída.

| Batch | Estado técnico | Escopo | Evidências |
| --- | --- | --- | --- |
| BATCH-078 | ready-for-human-review | Limpeza Git, arquivamento dual e saneamento de derivados do Site | [batch-078.md](batch-078.md), [REV-078](../human-reviews/rev-078.md) |
| BATCH-076 | ready-for-human-review | MCP nativo, UI Bridge MDD e migração home | [batch-076.md](archive/batch-076.md), [REV-076](../human-reviews/rev-076.md) |
| BATCH-077 | ready-for-human-review | Quatro skills MDD, proporcionalidade de build e propagação segura | [batch-077.md](batch-077.md), [REV-077](../human-reviews/rev-077.md) |

[Archived history](<archive/compacted/BATCH-INDEX-fe51f34e6321.md>)

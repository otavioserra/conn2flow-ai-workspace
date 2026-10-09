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

## Lotes ativos e recentes

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-063** | complete | Choques das entregas na extensão do VS Code | [batch-063.md](batch-063.md) | REQ-061 homologada; 124/124 npm test, contrato validado contra CLI/tenant, revisão técnica aprovada (review-063.md). |
| **BATCH-064** | ready-for-intake | Fix de empacotamento vsce, bump v1.1.2 e preparação para publicação no Marketplace | `VALIDATION-CHECKLIST.md#batch-064` | REQ-062 formalizada; aguardando execução do release da extensão. |
| **BATCH-065** | complete | Integração do Chrome DevTools MCP Server para Inspeção em Tempo Real do Runtime PHP/JS | [batch-065.md](batch-065.md) | REQ-063 homologada; 41 skills analisadas, 7 enriquecidas, 1.025/1.025 MD5, 44 arquivos locais preservados, smoke MCP/CDP e 124/124 npm test. |
| **BATCH-066** | ready-for-review | Lições de 2026-10-01 nas skills: pipeline, árvore compartilhada, validação e texto público | [batch-066.md](batch-066.md) | REQ-064; sete skills com acréscimos; propagador genérico `scripts/skills/sync-skills.cjs`; 1.550 cópias iguais e 21 traduções preservadas |
| **BATCH-067** | complete | Canonização de Novas Skills (Visual Assets e Migração Tailwind), Contrato Modular de Widgets, Resolução de Binários Tailwind e Propagação Global (43 Skills) | [batch-067.md](batch-067.md) | REQ-065 homologada; 43 skills canônicas, limpeza de frontmatter, Armadilha 17, contrato de widgets, propagação PASS, 124/124 npm test e review-067.md aprovado. |
| **BATCH-068** | complete | Memory Gardening Global do Ecossistema SDD: Poda de Arquivos Gigantes, Saneamento da Regra dos 10 e Limpeza de Sobras Locais | [batch-068.md](batch-068.md) | REQ-066 homologada; dumps gigantes podados no Core, DECISION-LOG e VALIDATION-CHECKLIST saneados (<50KB), worktrees e backups .bak removidos, 124/124 npm test, review-068.md aprovado. |
| **BATCH-069** | complete | Fundação Estrutural do MDD (Memory Driven Development), Sistema Hierárquico de index.md com Compactação Dual e Incorporação das Lições do BL-028 | [batch-069.md](batch-069.md) | REQ-067 homologada; fundação MDD (00, 01, 02), 50 índices, 44 skills (c2f-ai-features), Armadilhas 18 e 19, 39 alvos PASS, 124/124 testes, review-069.md aprovado. |
| **BATCH-070** | ready-for-intake | Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites do Ecossistema Conn2Flow | [batch-070.md](batch-070.md) | REQ-068 aprovada; migração de sdd/ para memory/, Tríade 00, 01, 02 e 44 skills nos 7 repositórios satélites |
| **BATCH-071** | ready-for-intake | Implementação das Aplicações em Python: MDD Client CLI & Daemon (ARCH-010) e MDD Hub & Documentation Watcher (ARCH-011) | [batch-071.md](batch-071.md) | REQ-069 aprovada; desenvolvimento modular em Python 3.11+ em tools/mdd-client e tools/mdd-hub com pytest |
| **BATCH-072** | ready-for-review | Revamp da Documentação Pública: Modernização dos READMEs Raiz e Descentralização em docs/ | [batch-072.md](batch-072.md) | REQ-070 implementada; 23 docs, 11 pares, 252 links PASS, 44 skills; Python/release distinguidos do estado disponível |

## Requisição ativa

`REQ-068` (`BATCH-070`, Satélites MDD), `REQ-069` (`BATCH-071`, Aplicações Python MDD Client & Hub) e `REQ-070` (`BATCH-072`, Revamp da Documentação Pública) aprovadas para execução. Em espera: `REQ-062` (`BATCH-064`, release da extensão) e `REQ-064` (`BATCH-066`, lições de pipeline). Lote `BATCH-069` homologado e commitado/push.

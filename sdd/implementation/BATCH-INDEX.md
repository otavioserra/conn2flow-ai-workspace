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

## Lotes ativos e recentes

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-059** | complete | Migração da Governança de Configurações para `.gemini/config.json` e Aderência ao Antigravity v2.16+ | [batch-059.md](batch-059.md) | REQ-057 homologada; `.agents/` removido, `.gemini/config.json` padronizado nos 5 repositórios e templates, `GEMINI.md`/`AGENTS.md` atualizados com `/boost`. |
| **BATCH-060** | complete | Skill canônica `c2f-documentation` e propagação aos kits (FEAT-014) | [batch-060.md](batch-060.md) | REQ-058 homologada; 39 cópias com hash idêntico, `ai:sync` 37/37 no Core; lumix sem commit. |
| **BATCH-061** | complete | Auditoria Ampla do Ecossistema SDD, Poda de Arquivos Gigantes e Cristalização dos Aprendizados em Skills | [batch-061.md](batch-061.md) | REQ-059 homologada; 10/10 arquivos podados (<50KB), 5 skills cristalizadas, 1.000 arquivos auditados com zero divergências MD5, 114/114 npm test. |
| **BATCH-062** | complete | Incorporação Canônica dos Aprendizados de E-commerce nas Skills e Criação da Skill c2f-payment-gateways | [batch-062.md](batch-062.md) | REQ-060 homologada; criação de c2f-payment-gateways (41 skills canônicas), 12 skills atualizadas, 494 arquivos propagados, 1.025/1.025 MD5 verde, 114/114 npm test. |
| **BATCH-063** | complete | Choques das entregas na extensão do VS Code | [batch-063.md](batch-063.md) | REQ-061 homologada; 124/124 npm test, contrato validado contra CLI/tenant, revisão técnica aprovada (review-063.md). |
| **BATCH-064** | ready-for-intake | Fix de empacotamento vsce, bump v1.1.2 e preparação para publicação no Marketplace | `VALIDATION-CHECKLIST.md#batch-064` | REQ-062 formalizada; aguardando execução do release da extensão. |
| **BATCH-065** | complete | Integração do Chrome DevTools MCP Server para Inspeção em Tempo Real do Runtime PHP/JS | [batch-065.md](batch-065.md) | REQ-063 homologada; 41 skills analisadas, 7 enriquecidas, 1.025/1.025 MD5, 44 arquivos locais preservados, smoke MCP/CDP e 124/124 npm test. |
| **BATCH-066** | ready-for-review | Lições de 2026-10-01 nas skills: pipeline, árvore compartilhada, validação e texto público | [batch-066.md](batch-066.md) | REQ-064; sete skills com acréscimos; propagador genérico `scripts/skills/sync-skills.cjs`; 1.550 cópias iguais e 21 traduções preservadas |
| **BATCH-067** | complete | Canonização de Novas Skills (Visual Assets e Migração Tailwind), Contrato Modular de Widgets, Resolução de Binários Tailwind e Propagação Global (43 Skills) | [batch-067.md](batch-067.md) | REQ-065 homologada; 43 skills canônicas, limpeza de frontmatter, Armadilha 17, contrato de widgets, propagação PASS, 124/124 npm test e review-067.md aprovado. |
| **BATCH-068** | ready-for-intake | Memory Gardening Global do Ecossistema SDD: Poda de Arquivos Gigantes, Saneamento da Regra dos 10 e Limpeza de Sobras Locais | [batch-068.md](batch-068.md) | REQ-066 formalizada; poda de dumps JSON no Core, saneamento de DECISION-LOG e VALIDATION-CHECKLIST no Core e Site, remoção de worktrees mescladas e arquivos .bak. |

## Requisição ativa

`REQ-066` (`BATCH-068`, Memory Gardening global do ecossistema e remoção de sobras locais) aprovada e pronta para execução. Lotes em espera: `REQ-062` (`BATCH-064`, release v1.1.2 da extensão do VS Code) e `REQ-064` (`BATCH-066`, lições de pipeline nas skills).

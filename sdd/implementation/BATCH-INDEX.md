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

## Lotes ativos e recentes

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-056** | complete | Memory Gardening do Ecossistema SDD e Validação de Publicação de Release | `VALIDATION-CHECKLIST.md#batch-056` | REQ-054 homologada; poda em lumix (15 KB), auditoria ecossistema (< 50 KB), VSIX 1.1.1 gerado e release 2.10.10 validada. |
| **BATCH-057** | complete | Consolidação Canônica e Sincronização Global das 39 Skills nos 5 Repositórios | `VALIDATION-CHECKLIST.md#batch-057` | REQ-055 homologada; 39 skills sincronizadas em 15 kits, 585 cópias MD5 idênticas, Tríade SDD e traps consolidadas. |
| **BATCH-058** | complete | Incorporação Canônica das Armadilhas 7, 8 e 9 e Sincronização Global nos 5 Repositórios | [batch-058.md](batch-058.md) | REQ-056 homologada; 975 cópias verificadas com MD5 idêntico nos 5 repositórios e 5 kits, 114/114 testes aprovados. |
| **BATCH-059** | complete | Migração da Governança de Configurações para `.gemini/config.json` e Aderência ao Antigravity v2.16+ | [batch-059.md](batch-059.md) | REQ-057 homologada; `.agents/` removido, `.gemini/config.json` padronizado nos 5 repositórios e templates, `GEMINI.md`/`AGENTS.md` atualizados com `/boost`. |
| **BATCH-060** | complete | Skill canônica `c2f-documentation` e propagação aos kits (FEAT-014) | [batch-060.md](batch-060.md) | REQ-058 homologada; 39 cópias com hash idêntico, `ai:sync` 37/37 no Core; lumix sem commit. |
| **BATCH-061** | complete | Auditoria Ampla do Ecossistema SDD, Poda de Arquivos Gigantes e Cristalização dos Aprendizados em Skills | [batch-061.md](batch-061.md) | REQ-059 homologada; 10/10 arquivos podados (<50KB), 5 skills cristalizadas, 1.000 arquivos auditados com zero divergências MD5, 114/114 npm test. |
| **BATCH-062** | complete | Incorporação Canônica dos Aprendizados de E-commerce nas Skills e Criação da Skill c2f-payment-gateways | [batch-062.md](batch-062.md) | REQ-060 homologada; criação de c2f-payment-gateways (41 skills canônicas), 12 skills atualizadas, 494 arquivos propagados, 1.025/1.025 MD5 verde, 114/114 npm test. |
| **BATCH-063** | complete | Choques das entregas na extensão do VS Code | [batch-063.md](batch-063.md) | REQ-061 homologada; 124/124 npm test, contrato validado contra CLI/tenant, revisão técnica aprovada (review-063.md). |
| **BATCH-064** | ready-for-intake | Fix de empacotamento vsce, bump v1.1.2 e preparação para publicação no Marketplace | `VALIDATION-CHECKLIST.md#batch-064` | REQ-062 formalizada; aguardando execução do release da extensão. |
| **BATCH-065** | complete | Integração do Chrome DevTools MCP Server para Inspeção em Tempo Real do Runtime PHP/JS | [batch-065.md](batch-065.md) | REQ-063 homologada; 41 skills analisadas, 7 enriquecidas, 1.025/1.025 MD5, 44 arquivos locais preservados, smoke MCP/CDP e 124/124 npm test. |

## Requisição ativa

`REQ-063` concluída e homologada no lote `BATCH-065`. Próxima requisição na fila: `REQ-062` (`BATCH-064`, release v1.1.2 da extensão do VS Code).



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

## Lotes ativos e recentes

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-004** | ready-for-intake | Integração e protocolo MCP para agentes locais | [batch-004-mcp-integration.md](archive/batch-004-mcp-integration.md) | Reservado; ainda sem intake ativo. |
| **BATCH-005** | ready-for-intake | Validador de governança SDD em CI/CD | [batch-005-sdd-governance-ci.md](archive/batch-005-sdd-governance-ci.md) | Reservado; ainda sem intake ativo. |
| **BATCH-050** | complete | Regra dos 10 Ativos na Raiz SDD, Integridade de Links nos Índices e Comando CLI ai:archive-sdd | `VALIDATION-CHECKLIST.md#batch-050` | REQ-048 homologada; comando CLI ai:archive-sdd, movimentação para archive/ e integridade de links. |
| **BATCH-051** | complete | Persistência Externa em settings.json e Sincronização Dinâmica do Prompt e CURRENT.md | `VALIDATION-CHECKLIST.md#batch-051` | REQ-049 homologada; 98/98 testes, workspacePreferencesPolicy e sincronismo dinâmico de topologia. |
| **BATCH-052** | complete | Suporte a ssh_public_path e Execução SSH Automática no Pipeline Multiprojeto | `VALIDATION-CHECKLIST.md#batch-052` | REQ-050 homologada; 17/17 testes PHPUnit, publicação remota de assets e css:rebuild via SSH. |
| **BATCH-053** | complete | Sincronização de Skills nos Satélites e Poda SDD | `VALIDATION-CHECKLIST.md#batch-053` | REQ-051 homologada; sincronização completa de skills e poda de memória. |
| **BATCH-054** | complete | SSH no css:audit, Confirmação Remota em VM, Saneamento de Notificações, Status Bar VM e Busca de Docs | `VALIDATION-CHECKLIST.md#batch-054` | REQ-052 homologada; 111/111 testes na extensão, 1125 testes PHPUnit, css:audit SSH, status bar VM, busca de docs e VSIX 1.1.0. |
| **BATCH-055** | complete | Logs VM com sudo, Sincronização do CLI, Rebuild SSH Duplo, Tailwind Global e Asserções Portáveis | `VALIDATION-CHECKLIST.md#batch-055` | REQ-053 homologada; 114/114 testes na extensão, 1158 testes PHPUnit, sudo tail nos logs VM, modo duplo no css:rebuild e CI portável. |
| **BATCH-056** | complete | Memory Gardening do Ecossistema SDD e Validação de Publicação de Release | `VALIDATION-CHECKLIST.md#batch-056` | REQ-054 homologada; poda em lumix (15 KB), auditoria ecossistema (< 50 KB), VSIX 1.1.1 gerado e release 2.10.10 validada. |
| **BATCH-057** | complete | Consolidação Canônica e Sincronização Global das 39 Skills nos 5 Repositórios | `VALIDATION-CHECKLIST.md#batch-057` | REQ-055 homologada; 39 skills sincronizadas em 15 kits, 585 cópias MD5 idênticas, Tríade SDD e traps consolidadas. |
| **BATCH-058** | complete | Incorporação Canônica das Armadilhas 7, 8 e 9 e Sincronização Global nos 5 Repositórios | [batch-058.md](batch-058.md) | REQ-056 homologada; 975 cópias verificadas com MD5 idêntico nos 5 repositórios e 5 kits, 114/114 testes aprovados. |
| **BATCH-059** | complete | Migração da Governança de Configurações para `.gemini/config.json` e Aderência ao Antigravity v2.16+ | [batch-059.md](batch-059.md) | REQ-057 homologada; `.agents/` removido, `.gemini/config.json` padronizado nos 5 repositórios e templates, `GEMINI.md`/`AGENTS.md` atualizados com `/boost`. |

## Próxima requisição

`REQ-057` concluída e homologada em 2026-09-24 no lote `BATCH-059`. Sistema pronto para novo ciclo de intake humano.

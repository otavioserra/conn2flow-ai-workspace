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
- **BATCH-006 a BATCH-032**: lotes concluídos; detalhes preservados nos arquivos individuais `batch-006*` a `batch-032.md` e no histórico Git.

## Lotes ativos e recentes

| Batch | Status | Escopo | Alvo de validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-004** | ready-for-intake | Integração e protocolo MCP para agentes locais | `batch-004-mcp-integration.md` | Reservado; ainda sem intake ativo. |
| **BATCH-005** | ready-for-intake | Validador de governança SDD em CI/CD | `batch-005-sdd-governance-ci.md` | Reservado; ainda sem intake ativo. |
| **BATCH-033** | complete | Extensão oficial Conn2Flow Dev Tools para VS Code | `VALIDATION-CHECKLIST.md#batch-033` | Scaffold, árvore, comandos, compilação e VSIX. |
| **BATCH-034** | complete | Infraestrutura Antigravity, regras e subagentes | `VALIDATION-CHECKLIST.md#batch-034` | Regras e agentes nativos sincronizados. |
| **BATCH-035** | complete | Clonagem e scaffold de projetos satélites | `VALIDATION-CHECKLIST.md#batch-035` | Gerenciamento de projetos incorporado à extensão. |
| **BATCH-036** | complete | Ponte da tríade e controles da árvore | `VALIDATION-CHECKLIST.md#batch-036` | Concluído no commit `50845f7`. |
| **BATCH-037** | complete | Recuperação pós-BATCH-036 e estabilização do preview MPE | `VALIDATION-CHECKLIST.md#batch-037` | REQ-035; validação humana concluída. |
| **BATCH-038** | complete | Reestruturação segura, multilanguage, backlog e releases | `VALIDATION-CHECKLIST.md#batch-038` | Regressão de `Colapsar todas` corrigida; 31 testes e hashes aprovados. |
| **BATCH-039** | complete | Estabilização de Preview MPE, Release em 2 Fases e Docs Pré-Release | `VALIDATION-CHECKLIST.md#batch-039` | 38/38 testes, gates documentais e VSIX aprovados. |
| **BATCH-040** | complete | Reatividade de Release, Clique Bloqueado e Modos Separados | `VALIDATION-CHECKLIST.md#batch-040` | REQ-038 homologada; 42/42 testes, VSIX gerado e instalação local concluída. |
| **BATCH-041** | complete | Correção de Workflow Run no Watch e Limpeza de Rascunho | `VALIDATION-CHECKLIST.md#batch-041` | REQ-039 homologada; 47/47 testes e VSIX instalado localmente. |
| **BATCH-042** | complete | Propagação Global da Governança Multi-Repositório | `VALIDATION-CHECKLIST.md#batch-042` | REQ-040 homologada; sincronização de regras em Core, skills com ai:sync e boilerplates. |
| **BATCH-043** | complete | Teste de Integração End-to-End da Tríade via MCP Hub | `VALIDATION-CHECKLIST.md#batch-043` | REQ-041 homologada; probe 48/48 testes, recibo MCP e auditoria APPROVED. |
| **BATCH-044** | complete | Watcher Autônomo na Extensão, Sessão Compartilhada e Usabilidade de Release | `VALIDATION-CHECKLIST.md#batch-044` | REQ-042 homologada; 53/53 testes, HubTaskWatcher, timeline sdd/sessions e VSIX instalado. |
| **BATCH-045** | in-progress | Reorganização Ergonômica da Árvore Dev Tools (Controles Principais e Ações SDD) | `VALIDATION-CHECKLIST.md#batch-045` | REQ-043 ativa; Controles Principais, ações em SDD e Documentações & Configurações. |

## Próxima requisição

`REQ-043` ativa em 2026-08-31 para o `BATCH-045`. O Executor inicia a implementação supervisionada.

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
| **BATCH-039** | in-progress | Estabilização de Preview MPE, Release em 2 Fases e Docs Pré-Release | `VALIDATION-CHECKLIST.md#batch-039` | REQ-037 ativa; foco em encadeamento de abas, painel inteligente de release e documentação bilíngue. |

## Próxima requisição

`REQ-037` ativa em 2026-08-31 para o `BATCH-039`. O Executor inicia a implementação supervisionada.


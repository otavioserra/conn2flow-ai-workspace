# Batch Index

Este arquivo gerencia os lotes operacionais (batches) do desenvolvimento deste workspace.

---

## Status
*   `complete`: lote validado e integrado.
*   `in-progress`: tarefas ativas sendo executadas pelo Executor.
*   `ready-for-intake`: reservado, aguardando briefing de requisição humana.
*   `blocked`: dependendo de decisões adicionais.

---

## Lotes de Trabalho

| Batch | Status | Escopo | Alvo de Validação | Observações |
| --- | --- | --- | --- | --- |
| **BATCH-000** | complete | Onboarding e setup do SDD local no workspace | Criação dos arquivos base da pasta `sdd/` | Concluído em 2026-05-26 |
| **BATCH-001** | complete | Reorganização Bilingue & Melhoria dos Instaladores | sdd/validation/VALIDATION-CHECKLIST.md#batch-001 | Concluído em 2026-05-26 com reorganização bilingue, instaladores validados em pt-br/en e sync-back. |
| **BATCH-002** | complete | Memórias de Engenharia (Chefia e Execução) | sdd/validation/VALIDATION-CHECKLIST.md#batch-002 | Integrar as memórias bilingues nos boilerplates, instaladores e arquivos de regras dos agentes. |
| **BATCH-003** | complete | Migração Histórica e Saneamento de Legado no Conn2flow-site | sdd/validation/VALIDATION-CHECKLIST.md#batch-003 | Migrar e cindir os históricos de arquivos, multiusuarios e host-manager, mover docs de paypal/documentacoes, deletar presentation e project. |
| **BATCH-004** | ready-for-intake | Monitor Híbrido & Geração de Relatório de Chat Automático | `scripts/sdd-watcher.ps1` e regras | Monitoramento de CURRENT.md, regras de escrita compulsória de logs em `sdd/reviews/` e notificação local. |
| **BATCH-005** | ready-for-intake | Integração e Protocolo MCP para Agentes Locais | `sdd/mcp-integration.md` | Especificar e prototipar um servidor MCP local para expor a governança e o contexto SDD para ferramentas CLI. |
| **BATCH-006** | ready-for-intake | Validador de Governança SDD (GitHub Actions CI/CD) | `.github/workflows/sdd-governance.yml` | Validar commits normativos contra a existência de change-requests ativos. |

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
| **BATCH-002** | complete | Otimização de Contexto e Governança de Arquivamento | sdd/validation/VALIDATION-CHECKLIST.md#batch-002 | Concluído em 2026-06-11 com a criação da estrutura archive/ e novas regras de contexto nos templates. |
| **BATCH-003** | complete | Otimização de Contexto nos Projetos Alvo | sdd/validation/VALIDATION-CHECKLIST.md#batch-003 | Concluído em 2026-06-11 com rollout nos projetos Core, Nexus, Lumix e Site. |
| **BATCH-004** | ready-for-intake | Integração e Protocolo MCP para Agentes Locais | `sdd/mcp-integration.md` | Especificar e prototipar um servidor MCP local para expor a governança e o contexto SDD para ferramentas CLI. |
| **BATCH-005** | ready-for-intake | Validador de Governança SDD (GitHub Actions CI/CD) | `.github/workflows/sdd-governance.yml` | Validar commits normativos contra a existência de change-requests ativos. |
| **BATCH-006** | complete | Memory Gardening, destilação de skills e Cursor Kit bilíngue | sdd/validation/VALIDATION-CHECKLIST.md#batch-006 | Concluído em 2026-07-30 com rollout em Core, Lumix, Transforma MP e Site. |
| **BATCH-007** | complete | Backlog de ideias, Intake Gate e Gemini Kit bilíngue | sdd/validation/VALIDATION-CHECKLIST.md#batch-007 | Concluído em 2026-07-30 com rollout não destrutivo em Core, Lumix, Transforma MP e Site. |

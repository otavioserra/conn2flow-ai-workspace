# Índice do Backlog

## Itens Ativos & Promovidos

| ID | Tipo | Status | Título | Próxima ação | Atualizado em |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [ARCH-001](ARCH-001-renomear-autenticacoes-template.md) | Arquitetura | `ICEBOX` | Renomear `autenticacoes.exemplo` para `autenticacoes.template` | Aguardar planejamento de release futura | 2026-08-18 |
| [FEAT-002](FEAT-002-self-healing-ci-cd-loop.md) | CI/CD | `ICEBOX` | Esteira de CI/CD com Loop de Auto-Cura (Self-Healing Tests) | Criar pipeline de compilação no GitHub Actions | 2026-08-18 |
| [ARCH-004](ARCH-004-resilient-multi-model-provider-pool-and-failover.md) | Arquitetura | `ICEBOX` | Failover Multi-Modelo Resiliente & Pool de Provedores de IA | Aguardar planejamento / promoção futura | 2026-08-31 |
| [ARCH-005](ARCH-005-shared-batch-execution-stream-and-blackboard.md) | Arquitetura | `ICEBOX` | Sessão Compartilhada de Lote (Blackboard & Stream) | Aguardar planejamento / promoção futura | 2026-08-31 |
| [FEAT-014](FEAT-014-programa-documentacao-core-e-site.md) | Documentação | `PROMOTED` | Programa de Documentação: correção no Core + `/docs/` no Conn2Flow Site (parser MD → recursos Tailwind, rotina `docs:audit`, skill) | Fase 1 entregue; seguir com as ondas de correção via skill `c2f-documentation` | 2026-09-25 |
| [ARCH-007](ARCH-007-atualizacao-automatica-kits-ia-nas-instalacoes.md) | Arquitetura | `ICEBOX` | Atualização automática dos kits de IA nas instalações (manifesto + lockfile + `c2f ai:kit`) | Aguardar fase 1 do FEAT-014 | 2026-09-25 |

---

## Itens Concluídos e Arquivados (`archive/`)

| ID | Tipo | Status | Título | Registro de Entrega | Arquivado em |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [ARCH-002](archive/ARCH-002-centralized-mcp-skills-server.md) | Arquitetura | `COMPLETED` | Servidor MCP Central & Hub Dual-Mode Inter-Agentes | BATCH-015 (mcp-hub/) | 2026-09-03 |
| [ARCH-003](archive/ARCH-003-multi-agent-git-worktrees-and-autonomy-modes.md) | Governança Git | `COMPLETED` | Modos de Autonomia & Worktrees | BATCH-015 (scripts/git/) | 2026-09-03 |
| [ARCH-006](ARCH-006-satellite-skills-sync-and-checklist-gardening.md) | Governança | `COMPLETED` | Sincronização de Skills nos Satélites & Poda SDD | BATCH-053 (REQ-051) | 2026-09-14 |
| [FEAT-003](archive/FEAT-003-conn2flow-core-cli.md) | Ferramenta | `COMPLETED` | Conn2Flow Core CLI (`c2f`) em `/cli` | BATCH-015 (conn2flow/cli/) | 2026-09-03 |
| [FEAT-004](archive/FEAT-004-sync-core-readmes-installer-version.md) | Release | `COMPLETED` | Sincronização de Versão nos READMEs do Core | Macro-Arquiteto (v2.1.0/v2.1.1) | 2026-09-03 |
| [FEAT-005](archive/FEAT-005-dev-tools-rich-hover-tooltips.md) | Interface / UX | `COMPLETED` | Tooltips Ricos e Explicativos na Árvore Dev Tools | BATCH-048 | 2026-09-03 |
| [FEAT-006](archive/FEAT-006-docs-section-curation-and-devtools-manual-v2.md) | Documentação | `COMPLETED` | Curadoria de Docs e Manual Dev Tools v2 | BATCH-048 | 2026-09-03 |
| [FEAT-007](FEAT-007-integrate-core-ai-workspace-documentation.md) | Conhecimento | `COMPLETED` | Integração da Documentação Ampla do AI Workspace (`ai-workspace/docs`) | BATCH-053 (REQ-051) | 2026-09-14 |
| [FEAT-008](FEAT-008-persistent-action-loading-and-progress-feedback.md) | Usabilidade / UX | `COMPLETED` | Feedback Visual Contínuo e Barra de Progresso em Ações Longas | BATCH-053 (REQ-051) | 2026-09-14 |
| [FEAT-009](archive/FEAT-009-synchronize-prompt-topology-and-current-md.md) | Agentes / DX | `COMPLETED` | Sincronização Dinâmica de Topologia no Prompt e CURRENT.md | BATCH-051 | 2026-09-03 |
| [FEAT-010](archive/FEAT-010-persistent-devtools-configuration-and-scope.md) | Persistência / UX | `COMPLETED` | Persistência Externa de Configurações em settings.json | BATCH-051 | 2026-09-03 |
| [FEAT-011](FEAT-011-vm-infrastructure-pipelines-and-api-updater.md) | Infraestrutura / CLI | `COMPLETED` | Adaptação e Resiliência de Pipelines para Ambientes VM (HestiaCP) | BATCH-053 (REQ-051) | 2026-09-14 |
| [FEAT-012](archive/FEAT-012-multiproject-ssh-public-path-and-css-pipeline.md) | CLI / Multiprojeto | `COMPLETED` | Suporte a `ssh_public_path` e Execução SSH Automática | BATCH-052 | 2026-09-03 |
| [FEAT-013](archive/FEAT-013-sdd-file-archiving-rule-of-10-and-link-integrity.md) | Governança SDD | `COMPLETED` | Regra dos 10 Ativos e Manutenção de Links | BATCH-050 | 2026-09-03 |


> [!IMPORTANT]
> **Intake Gate**: Itens em `ICEBOX` continuam não executáveis até promoção humana formal para `sdd/human-requests/`.

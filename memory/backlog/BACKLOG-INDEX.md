# Índice do Backlog

## Itens Ativos (Teto de 10 Itens — Regra MDD)

| ID | Tipo | Status | Título | Próxima ação | Atualizado em |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [ARCH-001](ARCH-001-renomear-autenticacoes-template.md) | Arquitetura | `ICEBOX` | Renomear `autenticacoes.exemplo` para `autenticacoes.template` | Aguardar planejamento de release futura | 2026-08-18 |
| [FEAT-002](FEAT-002-self-healing-ci-cd-loop.md) | CI/CD | `ICEBOX` | Esteira de CI/CD com Loop de Auto-Cura (Self-Healing Tests) | Criar pipeline de compilação no GitHub Actions | 2026-08-18 |
| [ARCH-006](ARCH-006-satellite-skills-sync-and-checklist-gardening.md) | Governança | `ICEBOX` | Sincronização Global de Skills nos Satélites & Poda SDD | Sincronização continuada pós-MDD | 2026-09-14 |
| [FEAT-007](FEAT-007-integrate-core-ai-workspace-documentation.md) | Conhecimento | `ICEBOX` | Integração da Documentação Ampla do AI Workspace (`ai-workspace/docs`) | Manuais e referência documental | 2026-09-14 |
| [FEAT-008](FEAT-008-persistent-action-loading-and-progress-feedback.md) | Usabilidade / UX | `ICEBOX` | Feedback Visual Contínuo e Barra de Progresso em Ações Longas | Integrar aos novos pipelines | 2026-09-14 |
| [FEAT-011](FEAT-011-vm-infrastructure-pipelines-and-api-updater.md) | Infraestrutura / CLI | `ICEBOX` | Adaptação e Resiliência de Pipelines para Ambientes VM (HestiaCP) | Resiliência de deploy SSH | 2026-09-14 |
| [ARCH-010](ARCH-010-mdd-client-cli-daemon.md) | Ferramenta / CLI | `ICEBOX` | MDD Client CLI & Daemon (Python) — Gerenciamento Local de Memória, Injeção e Telemetria | Expandir daemon com servidor MCP | 2026-10-09 |
| [ARCH-011](ARCH-011-mdd-hub-and-documentation-watcher.md) | Hub / Auto-Evolução | `ICEBOX` | MDD Hub & Documentation Watcher (Python) — Motor de Auto-Evolução e Scraping de Modelos de IA | Integrar com telemetria do Daemon MCP | 2026-10-09 |
| [ARCH-013](ARCH-013-vector-database-and-nosql-memory-evolution.md) | Arquitetura / Futuro | `ICEBOX` | Evolução para Banco de Dados Vetorial & NoSQL para Codebases de Hiperescala | Pesquisa futura após consolidação do MDD | 2026-10-09 |
| [ARCH-014](ARCH-014-vscode-extension-mdd-client-hub-integration.md) | Extensão VS Code | `PROMOTED` | Integração da Extensão VS Code com MDD Client e Hub + Servidor MCP no Daemon Python | Preparar REQ-074 / BATCH-076 | 2026-10-09 |

---

## Itens Concluídos e Arquivados (`archive/`)

| ID | Tipo | Status | Título | Registro de Entrega | Arquivado em |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [ARCH-002](archive/ARCH-002-centralized-mcp-skills-server.md) | Arquitetura | `COMPLETED` | Servidor MCP Central & Hub Dual-Mode Inter-Agentes | BATCH-015 (mcp-hub/) | 2026-09-03 |
| [ARCH-003](archive/ARCH-003-multi-agent-git-worktrees-and-autonomy-modes.md) | Governança Git | `COMPLETED` | Modos de Autonomia & Worktrees | BATCH-015 (scripts/git/) | 2026-09-03 |
| [ARCH-004](archive/original/ARCH-004-resilient-multi-model-provider-pool-and-failover.md) | Arquitetura | `SUPERSEDED` | Failover Multi-Modelo Resiliente & Pool de Provedores de IA | Absorvido pelo MDD e mdd-hub | 2026-10-09 |
| [ARCH-005](archive/original/ARCH-005-shared-batch-execution-stream-and-blackboard.md) | Arquitetura | `SUPERSEDED` | Sessão Compartilhada de Lote (Blackboard & Stream) | Absorvido pela Trava Tripla e human-reviews | 2026-10-09 |
| [ARCH-007](archive/original/ARCH-007-atualizacao-automatica-kits-ia-nas-instalacoes.md) | Arquitetura | `SUPERSEDED` | Atualização automática dos kits de IA nas instalações | Substituído por sync-skills.cjs e mdd sync | 2026-10-09 |
| [ARCH-008](archive/original/ARCH-008-chrome-devtools-mcp-agent-runtime-inspection.md) | Arquitetura / MCP | `COMPLETED` | Chrome DevTools MCP Server para Inspeção em Tempo Real do Runtime PHP/JS | REQ-063 / BATCH-065 | 2026-10-01 |
| [ARCH-009](archive/original/ARCH-009-mdd-architecture-transition.md) | Arquitetura / MDD | `COMPLETED` | Transição Arquitetural SDD ➔ MDD e Nomenclatura Global em Inglês | REQ-067 / BATCH-069 | 2026-10-09 |
| [ARCH-012](archive/original/ARCH-012-hierarchical-dual-tier-memory-archiving.md) | Arquitetura / Contexto | `COMPLETED` | Sistema Hierárquico de index.md e Compactação Dual de Memória | REQ-067 / BATCH-069 | 2026-10-09 |
| [ARCH-015](archive/original/ARCH-015-headless-triad-mechanics-and-human-reviews.md) | Arquitetura / Governança | `COMPLETED` | Mecânica de Tríade Autônoma Headless, Trava Tripla e Human Reviews | REQ-072 / BATCH-074 | 2026-10-09 |
| [FEAT-003](archive/FEAT-003-conn2flow-core-cli.md) | Ferramenta | `COMPLETED` | Conn2Flow Core CLI (`c2f`) em `/cli` | BATCH-015 (conn2flow/cli/) | 2026-09-03 |
| [FEAT-004](archive/FEAT-004-sync-core-readmes-installer-version.md) | Release | `COMPLETED` | Sincronização de Versão nos READMEs do Core | Macro-Arquiteto (v2.1.0/v2.1.1) | 2026-09-03 |
| [FEAT-005](archive/FEAT-005-dev-tools-rich-hover-tooltips.md) | Interface / UX | `COMPLETED` | Tooltips Ricos e Explicativos na Árvore Dev Tools | BATCH-048 | 2026-09-03 |
| [FEAT-006](archive/FEAT-006-docs-section-curation-and-devtools-manual-v2.md) | Documentação | `COMPLETED` | Curadoria de Docs e Manual Dev Tools v2 | BATCH-048 | 2026-09-03 |
| [FEAT-009](archive/FEAT-009-synchronize-prompt-topology-and-current-md.md) | Agentes / DX | `COMPLETED` | Sincronização Dinâmica de Topologia no Prompt e CURRENT.md | BATCH-051 | 2026-09-03 |
| [FEAT-010](archive/FEAT-010-persistent-devtools-configuration-and-scope.md) | Persistência / UX | `COMPLETED` | Persistência Externa de Configurações em settings.json | BATCH-051 | 2026-09-03 |
| [FEAT-012](archive/FEAT-012-multiproject-ssh-public-path-and-css-pipeline.md) | CLI / Multiprojeto | `COMPLETED` | Suporte a `ssh_public_path` e Execução SSH Automática | BATCH-052 | 2026-09-03 |
| [FEAT-013](archive/FEAT-013-sdd-file-archiving-rule-of-10-and-link-integrity.md) | Governança SDD | `COMPLETED` | Regra dos 10 Ativos e Manutenção de Links | BATCH-050 | 2026-09-03 |
| [FEAT-014](archive/original/FEAT-014-programa-documentacao-core-e-site.md) | Documentação | `COMPLETED` | Programa de Documentação: correção no Core + `/docs/` no Conn2Flow Site | Fase 1 / BATCH-060 | 2026-09-25 |


> [!IMPORTANT]
> **Intake Gate**: Itens em `ICEBOX` continuam não executáveis até promoção humana formal para `sdd/human-requests/`.

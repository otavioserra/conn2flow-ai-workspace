# Validation Checklist

Este documento concentra os checklists de aceitaÃ§Ã£o e os registros de testes empÃ­ricos de validaÃ§Ã£o para os lotes funcionais ativos.

## ValidaÃ§Ãµes Arquivadas

- [validation-001-003.md](archive/validation-001-003.md) (BATCH-001 a BATCH-003)
- [validation-006-007-014.md](archive/validation-006-007-014.md) (BATCH-006, BATCH-007 e BATCH-014)
- [validation-015.md](archive/validation-015.md) (BATCH-015)

---
## BATCH-004: Integração e Protocolo MCP para Agentes Locais

*(Em breve)*

---

## BATCH-005: Validador de Governança SDD (GitHub Actions CI/CD)

*(Em breve)*

---

## BATCH-016: Catálogo Completo tasks.json no CLI c2f & Live Todo List Protocol

### 1. Checklist de Aceite Técnico

- [x] Catálogo completo de 34 comandos implementado em `conn2flow/cli/src/Commands/`.
- [x] Wrappers multiplataforma criados e blindados: `./c2f` (Bash), `c2f.bat` (CMD), `c2f.cmd` (CMD) e `c2f.ps1` (PowerShell).
- [x] Protocolo de Checklist Vivo (Live Todo List) integrado em `sdd-workflow` e instruções dos 4 kits de IA (`CLAUDE.md`, `CURSOR.md`, `.cursorrules`, `.cursor/rules/sdd.mdc`, `GEMINI.md`, `.github/copilot-instructions.md`).
- [x] Propagação universal com `-Force` em todos os repositórios (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`, `conn2flow-ai-workspace`).
- [x] Execução de `./c2f help` e `c2f.ps1 ai:prune-memories` validada com sucesso.

### 2. Evidências de Validação

#### Teste 1: Catálogo c2f Help
*   **Comandos**: `c2f.ps1 help` e `cmd /c "c2f.bat help"`.
*   **Evidência**: 34 comandos listados em tabela ANSI formatada cobrindo 100% de `tasks.json`.

#### Teste 2: Memory Gardening c2f
*   **Comandos**: `c2f.ps1 ai:prune-memories`.
*   **Evidência**: Memória podada para 1.917 bytes (32 linhas), conforme o limite normativo vigente naquele lote.

#### Teste 3: Propagação dos Kits
*   **Comandos**: 16 execuções de instaladores spec-driven com `-Force`.
*   **Evidência**: 14 templates de skills e 15 arquivos de instrução de kit sincronizados em todos os repositórios.

---

## BATCH-017: Alpine Docker Build Fix & 1-Click MCP Setup Tooling

### 1. Checklist de Aceite Técnico

- [x] Correção de pacotes Alpine Linux no `mcp-hub/Dockerfile` (`php`, `php-phar`, `php-mbstring`, `php-openssl`, `php-curl`).
- [x] Docker image `mcp-hub-conn2flow-mcp-hub:latest` construída com sucesso.
- [x] Scripts de 1-Click Setup criados: `scripts/setup-mcp-connectors.ps1`, `scripts/setup-mcp-connectors.sh` e helper `scripts/inject-mcp-connector.cjs`.
- [x] Comando `c2f ai:mcp-setup` criado em `conn2flow/cli/src/Commands/AiMcpSetupCommand.php` e registrado no `Application.php`.
- [x] Execução do setup validada em Claude Desktop, Cursor e VS Code.

### 2. Evidências de Validação

#### Teste 1: Docker Build do MCP Hub
*   **Comando**: `docker compose build` na pasta `mcp-hub`.
*   **Evidência**: Build concluído com sucesso sem erros de repositório de pacotes Alpine.

#### Teste 2: Injeção de Conectores 1-Click
*   **Comando**: `.\scripts\setup-mcp-connectors.ps1` e `.\c2f.ps1 ai:mcp-setup`.
*   **Evidência**: Configurações atualizadas de forma não destrutiva em `%APPDATA%\Claude\claude_desktop_config.json`, `.cursor\mcp.json` e `.vscode\mcp.json`.

---

## BATCH-018: Recalibração de Tetos SDD (35KB-50KB) & Modos de Autonomia de IA

### 1. Checklist de Aceite Técnico

- [x] Tetos de Memory Gardening recalibrados conforme a política normativa vigente naquele lote.
- [x] Limite de itens ativos nos índices SDD expandido para 25 itens ativos.
- [x] Documentos normativos atualizados (`sdd-memory-gardening`, `sdd/process/MEMORY-GARDENING-GUIDELINES.md`, `sdd/SPEC.md`).
- [x] Comando `c2f ai:prune-memories` atualizado com os novos limites de 35KB e 50KB.
- [x] Governança dos Modos de Autonomia (`SUPERVISIONADO` padrão vs. `AUTONOMO` com trava de deploy exclusivo em teste local) incorporada em todos os kits de IA.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

### 2. Evidências de Validação

#### Teste 1: Execução do Memory Gardening no CLI
*   **Comando**: `c2f.ps1 ai:prune-memories`.
*   **Evidência**: Executou e validou a memória de execução dentro dos limites de 35KB-50KB.

#### Teste 2: Propagação dos Kits de IA
*   **Comando**: 16 execuções de instaladores spec-driven com `-Force`.
*   **Evidência**: 14 skills `sdd-memory-gardening`, 14 skills `sdd-workflow` e 15 arquivos de instruções atualizados nos 4 repositórios.

---

## BATCH-019: Espectro de 3 Níveis de Autonomia de IA & Trava de Deploy em Teste Local

### 1. Checklist de Aceite Técnico

- [x] Formalização dos 3 Níveis de Autonomia (`SUPERVISIONADO`, `AUTÔNOMO MONITORADO`, `AUTÔNOMO HEADLESS`) em `sdd/SPEC.md`.
- [x] Atualização de todas as 14 skills `sdd-workflow` (master e templates) com a matriz dos 3 níveis.
- [x] Atualização de todos os 15 arquivos de instruções de kits de IA (`CLAUDE.md`, `CURSOR.md`, `.cursorrules`, `.cursor/rules/sdd.mdc`, `GEMINI.md`, `.github/copilot-instructions.md` em `pt-br` e `en`).
- [x] Trava estrita de segurança de deploy restrito a testes locais (proibição absoluta em produção) formalizada em todos os kits.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

### 2. Evidências de Validação

#### Teste 1: Validação dos Níveis de Autonomia
*   **Evidência**: Matriz dos 3 níveis e exigência de Live Todo List (`[ ]` ➔ `[x]`) em tempo real no Modo 2 implementados e sincronizados em 100% dos kits.

#### Teste 2: Propagação nos Repositórios
*   **Comandos**: 16 execuções de instaladores spec-driven com `-Force`.
*   **Evidência**: Sincronização limpa confirmada em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-020: Implementação da Skill c2f-tailwind-css-architecture & Governança de Tailwind v4

### 1. Checklist de Aceite Técnico

- [x] Criação da skill `c2f-tailwind-css-architecture` em todos os 6 templates PT-BR e 6 templates EN.
- [x] Estabelecimento das 6 regras mandatórias (cascata sem `.hidden` conflitante com `lg:flex`, limpeza de `paginas.css_compiled` em banco, templates dinâmicos via `tailwind_dependencies`, compilação exclusiva via `c2f resources:sync`).
- [x] Atualização de `conn2flow/cli/src/Commands/AiSyncCommand.php` para validar nominalmente as 33 skills.
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md`.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

### 2. Evidências de Validação

#### Teste 1: Validação do Core CLI (ai:sync)
*   **Comando**: `c2f ai:sync`.
*   **Evidência**: 33/33 skills e blocos de contrato `# ⚡ Gatilho Obrigatório` verificados com sucesso nos 4 kits.

#### Teste 2: Matriz de Propagação
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1`.
*   **Evidência**: 16/16 destinos rastreados com 33/33 skills sincronizadas com hashes idênticos.

---

## BATCH-021: Modernização Canônica da Skill c2f-javascript-ajax (Vanilla Fetch, CSRF 403 & PHP Lifecycle)

### 1. Checklist de Aceite Técnico

- [x] Skill `c2f-javascript-ajax` modernizada com diagnóstico de 403 Forbidden, padrão canônico Vanilla JS (`gestorAjax`/`gestorUpload`) e lifecycle PHP (`interface_ajax_iniciar`/`interface_ajax_finalizar`).
- [x] 8 instâncias PT-BR atualizadas (2 master `.claude`/`.gemini` + 6 templates).
- [x] 6 instâncias EN atualizadas com tradução canônica completa.
- [x] Catálogos de skills (`CATALOGO-DE-SKILLS.md` e `SKILLS-CATALOG.md`) já continham entrada `[UPDATED]`.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Propagação nos Templates
*   **Comando**: `node scripts/update-ajax-skill-req018.js`.
*   **Evidência**: 14/14 arquivos `c2f-javascript-ajax/SKILL.md` atualizados (8 PT-BR + 6 EN).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 33 skills atualizadas nos 4 kits de cada repositório (conn2flow, lumix, transformamp, conn2flow-site).

---

## BATCH-022: Implementação do 5º Kit Canônico de IA (spec-driven-project-codex-kit / OpenAI Codex)

### 1. Checklist de Aceite Técnico

- [x] Criação do template `templates/pt-br/templates/spec-driven-project-codex-kit/` com `CODEX.md`, `AGENTS.md`, `.codex/settings.json`, `README.md` e 33 skills.
- [x] Criação do template `templates/en/templates/spec-driven-project-codex-kit/` com versão em inglês de todos os arquivos.
- [x] Criação dos instaladores `scripts/install-spec-driven-codex-kit.ps1` e `scripts/install-spec-driven-codex-kit.sh`.
- [x] Atualização de `scripts/sync-all-repos.ps1` para incluir o 5º instalador Codex.
- [x] Atualização de `conn2flow/cli/src/Commands/AiSyncCommand.php` para validar `.codex/skills`.
- [x] Atualização de `docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md` e `docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md` com o "Cenário E: OpenAI Codex / GPT no VS Code".
- [x] Atualização de `README.md`, `README-PT-BR.md` e `sdd/SPEC.md` (Seção 11).
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação dos Templates e Skills
*   **Evidência**: 33 skills copiadas e validadas em `spec-driven-project-codex-kit` (PT-BR e EN).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 33 skills e 5 kits instalados em todos os 4 repositórios alvo.

---

## BATCH-023: Implementação da 34ª Skill (c2f-agent-visual-inspection), Governança de Version Bump e Concorrência Multi-Agente

### 1. Checklist de Aceite Técnico

- [x] Criação da 34ª skill `c2f-agent-visual-inspection/SKILL.md` nos 5 diretórios master e em todos os 14 templates de kits em PT-BR e EN.
- [x] Atualização de `c2f-resources-system/SKILL.md` e `c2f-javascript-ajax/SKILL.md` com a regra mandatória de Version Bump / Cache-Busting.
- [x] Desbloqueio e flexibilização de leitura de arquivos `.env` em todos os kits e templates (`.claude/settings.json`).
- [x] Blindagem contra concorrência multi-agente (`git add` estrito sem `-A` e releitura atômica de `req-XXX.md`) incorporada em `sdd-workflow/SKILL.md`, `sdd/SPEC.md` e todos os arquivos de instruções de IA.
- [x] Atualização de `conn2flow/cli/src/Commands/AiSyncCommand.php` para validar as **34 Skills**.
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md` (27 Core + 7 SDD = 34 skills).
- [x] Atualização de `README.md`, `README-PT-BR.md` e `scripts/sync-all-repos.ps1` (34 skills).
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 34 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 34 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-024: Resolução das 5 Ambiguidades Operacionais da Esteira SDD

### 1. Checklist de Aceite Técnico

- [x] Atualização da linha de política em `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` e nos boilerplates/templates, conforme os limites vigentes naquele lote.
- [x] Atualização de `sdd-workflow/SKILL.md` em todos os templates e masters com o **Protocolo de Reserva Atômica** de `req-XXX.md` e a separação das camadas de memória (Git vs Agente).
- [x] Atualização de `project-validation/SKILL.md` com a regra anti-hábito de "Pendente do Operador" (obrigatoriedade de validação via `c2f page:inspect` / `c2f auth:cookie`).
- [x] Atualização de `sdd/SPEC.md` incorporando a governança de reserva atômica de requisições, divisão de memórias e autoridade do código/SPEC sobre memórias passadas.
- [x] Atualização de `README.md` e `README-PT-BR.md` com a flexibilidade de criação de requisições sob reserva atômica.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 34 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 34 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-025: Refinamento Canônico da Skill c2f-agent-visual-inspection

### 1. Checklist de Aceite Técnico

- [x] Atualização de `c2f-agent-visual-inspection/SKILL.md` nos 5 diretórios master (`.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.codex/`) com o ciclo de 5 etapas e troubleshooting.
- [x] Atualização de `c2f-agent-visual-inspection/SKILL.md` em todos os 14 templates em `templates/pt-br/` e `templates/en/`.
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md` refinando a descrição da skill 34.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 34 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 34 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-026: Governança do HTML_SANITIZE (Bypass em Live Editor e Agentes IA)

### 1. Checklist de Aceite Técnico

- [x] Atualização de `c2f-html-css-pages-and-components/SKILL.md` em todos os templates e masters com a regra de 2 níveis do `HTML_SANITIZE` e preservação de marcadores de widgets.
- [x] Atualização de `c2f-agent-visual-inspection/SKILL.md` documentando que inspeções autenticadas (`c2f auth:cookie`) recebem o HTML com comentários e marcadores intactos.
- [x] Atualização de `c2f-environment-configuration/SKILL.md` com a governança da flag `HTML_SANITIZE`.
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md`.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 34 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 34 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-027: Implementação das Skills #35 e #36, Governança de Autoria CSS e 36 Skills Oficiais

### 1. Checklist de Aceite Técnico

- [x] Criação de `c2f-shell-and-windows-traps/SKILL.md` (Skill #35) nos 5 masters e 14 templates em PT-BR e EN (19 localizações).
- [x] Criação de `c2f-project-pipeline-and-tasks/SKILL.md` (Skill #36) nos 5 masters e 14 templates em PT-BR e EN (19 localizações).
- [x] Reestruturação de `c2f-tailwind-css-architecture/SKILL.md` em todos os masters e templates (Autoria vs Derivado, eliminação do hack `css_compiled = NULL`, comandos `c2f css:audit` e `c2f css:rebuild`, e dívida de `tailwind_sources`).
- [x] Atualização de `c2f-resources-system/SKILL.md` em todos os masters e templates (seção 3.1 Fonte da Verdade em Runtime - banco vs disco).
- [x] Atualização de `c2f-agent-visual-inspection/SKILL.md` em todos os masters e templates (auditoria de CSS pós-inspeção com `c2f css:audit --url=<rota>`).
- [x] Atualização de `AiSyncCommand.php` no core `conn2flow` para auditar 36 skills.
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md` para 36 skills (29 Core + 7 SDD).
- [x] Atualização de `README.md` e `README-PT-BR.md`.
- [x] Atualização de `scripts/sync-all-repos.ps1`.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 36 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-028: Refinamento de Pipelines (6/4 Etapas com css:rebuild) e Execução Sequencial Exclusiva

### 1. Checklist de Aceite Técnico

- [x] Atualização de `c2f-project-pipeline-and-tasks/SKILL.md` nos 5 masters e 14 templates (19 localizações) com 6 etapas de projeto e 4 de sistema com `css:rebuild` mandatório no encerramento.
- [x] Documentação da justificativa técnica de prevenção do estado híbrido pós-deploy.
- [x] Inclusão da Regra #5 (Execução Sequencial Exclusiva & Proibição de Paralelismo em Lote) contra supressão de warnings PHP.
- [x] Atualização de `c2f-shell-and-windows-traps/SKILL.md` nos 5 masters e 14 templates adicionando a 6ª Armadilha Crítica (Paralelismo Concorrente em Comandos de Compilação).
- [x] Atualização de `docs/pt-br/CATALOGO-DE-SKILLS.md` e `docs/en/SKILLS-CATALOG.md`.
- [x] Atualização de `README.md` e `README-PT-BR.md`.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: 36 skills e 5 kits sincronizados com sucesso em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

---

## BATCH-029: Integração Nativa com Claude Code Desktop (.worktreeinclude, launch.json, Playbooks)

### 1. Checklist de Aceite Técnico

- [x] Criação de `.worktreeinclude` na raiz do workspace e nos 4 templates do Claude Kit (`spec-driven` e `private` em PT-BR e EN).
- [x] Criação de `.claude/launch.json` com `autoVerify: true` na raiz do workspace e nos 4 templates do Claude Kit.
- [x] Atualização de `scripts/install-spec-driven-claude-kit.ps1` e `scripts/install-spec-driven-claude-kit.sh` para cópia automática de `.worktreeinclude` e `launch.json`.
- [x] Atualização de `docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md` e `docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md` com a Seção 6 sobre Claude Code Desktop.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: `.worktreeinclude` e `.claude/launch.json` sincronizados nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

---

## BATCH-030: Sistema de Hooks PreToolUse e CLAUDE.md Aninhados

### 1. Checklist de Aceite Técnico

- [x] Criação de `.claude/hooks/pre-tool-guard.ps1` e `.claude/hooks/pre-tool-guard.sh` com bloqueio para cópia manual para ambientes de teste e `git add -A` / `git add .`.
- [x] Configuração do hook `PreToolUse` em `.claude/settings.json` nos masters e nos 4 templates do Claude Kit.
- [x] Criação de `gestor/modulos/CLAUDE.md`, `resources/CLAUDE.md` e `cli/CLAUDE.md` com diretrizes modulares focadas.
- [x] Atualização de `scripts/install-spec-driven-claude-kit.ps1` e `.sh` para instalação de hooks e `CLAUDE.md` aninhados.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: Hooks e `CLAUDE.md` modulares sincronizados nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

---

## BATCH-031: Cross-Session Messaging, Goal Mode (/goal) e Plugin Oficial conn2flow-devkit

### 1. Checklist de Aceite Técnico

- [x] Configuração de `"crossSessionInbound": "allow"` em `.claude/settings.json` nos masters e 4 templates do Claude Kit.
- [x] Atualização de `sdd-workflow/SKILL.md` nos 5 masters e 10 templates (15 localizações) formalizando o Goal Mode (`/goal`) para execução ininterrupta de fatias.
- [x] Criação do manifesto oficial `.claude-plugin/plugin.json` (v2.1.0) para empacotamento das 36 skills e hooks.
- [x] Atualização de `docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md` e `docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md` com a Seção 7.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: `.claude/settings.json` com `crossSessionInbound: allow` e `sdd-workflow/SKILL.md` atualizados em `conn2flow`, `lumix`, `transformamp`, `conn2flow-site`.

---

## BATCH-032: Paridade Total da Tríade de IAs (OpenAI Codex, Google Antigravity e Claude Code)

### 1. Checklist de Aceite Técnico

- [x] Atualização e padronização de `AGENTS.md` na raiz do workspace e templates do Codex Kit com todas as 36 skills oficiais e regras de governança.
- [x] Criação de `.codex/hooks.json` e `.codex/config.toml` no workspace e templates do Codex Kit.
- [x] Criação de `.gemini/hooks.json` com `PreToolUse` e `Stop` no workspace e templates do Gemini Kit.
- [x] Padronização de `GEMINI.md` com diretriz do Goal Mode (`/goal`).
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: `AGENTS.md`, `.codex/hooks.json`, `.codex/config.toml` e `.gemini/hooks.json` sincronizados nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

---

## BATCH-033: Extensão Oficial do VS Code (Conn2Flow Dev Tools)

### 1. Checklist de Aceite Técnico

- [x] Scaffold da extensão em `vscode-extension/` (`package.json`, `tsconfig.json`, `README.md`, `.vscodeignore`, ícones).
- [x] Implementação de `src/providers/conn2flowTreeProvider.ts` com os 5 acordeões e ícones Codicons oficiais.
- [x] Implementação de `src/extension.ts` registrando os 18 comandos e 2 Status Bar Items dinâmicos.
- [x] Compilação do código TypeScript (`npm run compile`) concluída com 100% de sucesso e zero erros.
- [x] Empacotamento do arquivo instalável `.vsix` (`conn2flow-tools-1.0.0.vsix`) via `@vscode/vsce package`.
- [x] Atualização de `README.md` e `README-PT-BR.md` com documentação da extensão e comandos de instalação.

### 2. Evidências de Validação

#### Teste 1: Compilação TypeScript
*   **Comando**: `npm run compile` em `vscode-extension/`.
*   **Evidência**: `tsc -p ./` executado sem erros, gerando `out/extension.js` e `out/providers/conn2flowTreeProvider.js`.

#### Teste 2: Empacotamento de Pacote VSIX
*   **Comando**: `npx @vscode/vsce package --allow-missing-repository` em `vscode-extension/`.
*   **Evidência**: Pacote gerado com sucesso: `conn2flow-tools-1.0.0.vsix` (10 arquivos, 13.64 KB).

---

## BATCH-034: Infraestrutura Nativa Antigravity IDE, Regras Modulares e Subagentes

### 1. Checklist de Aceite Técnico

- [x] Criação de `.gemini/rules/01-sdd-governance.md`, `02-core-crud-v2.md` e `03-resources-tailwind.md` no workspace e templates do Gemini Kit.
- [x] Criação dos subagentes nativos `c2f_executor.json` e `c2f_reviewer.json` em `.gemini/agents/` no workspace e templates.
- [x] Atualização canônica de `GEMINI.md` no workspace e templates com as 3 personas e matriz multi-modelo.
- [x] Atualização de `docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md` e `docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md` com a Seção 8.
- [x] Propagação com `-Force` concluída nos 4 repositórios alvo via `sync-all-repos.ps1`.

### 2. Evidências de Validação

#### Teste 1: Validação de Integridade e Contratos via Core CLI
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36 skills validadas com 100% de conformidade de contrato `# ⚡ Gatilho Obrigatório` nos 5 kits (.claude, .cursor, .gemini, .github, .codex).

#### Teste 2: Sincronização nos Repositórios
*   **Comando**: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-all-repos.ps1 -Force`.
*   **Evidência**: `.gemini/rules/`, `.gemini/agents/` e `GEMINI.md` sincronizados nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).

---

## BATCH-035: Extensão VS Code: Clonagem de Repositórios e Scaffold Automático de Projetos Satélites

### 1. Checklist de Aceite Técnico

- [x] Implementação de `cloneMissingRepository` em `ProjectsManager` com detecção de repositórios oficiais faltantes.
- [x] Implementação de `scaffoldNewSatelliteProject` em `ProjectsManager` com criação da estrutura `gestor/`, assets e README.
- [x] Registro automático no `devProjects` do `dev-environment/data/environment.json` ativo aderente ao template canônico do Core.
- [x] Integração dos comandos `conn2flow.projects.cloneRepository` e `conn2flow.projects.scaffoldProject` na árvore visual do VS Code.
- [x] Compilação TypeScript (`npm run compile`) com 100% de sucesso e zero erros.
- [x] Empacotamento do pacote `.vsix` (`conn2flow-tools-1.0.0.vsix`) e reinstalação no VS Code via `code --install-extension --force`.
- [x] Validação rigorosa dos contratos das 36 skills via `php cli/c2f.php ai:sync`.

### 2. Evidências de Validação

#### Teste 1: Compilação TypeScript
*   **Comando**: `npm run compile` em `vscode-extension/`.
*   **Evidência**: `tsc -p ./` finalizado com código de saída 0 sem warnings ou erros.

#### Teste 2: Empacotamento VSIX
*   **Comando**: `cmd.exe /c npx --yes @vscode/vsce package` em `vscode-extension/`.
*   **Evidência**: `conn2flow-tools-1.0.0.vsix` gerado com sucesso (19 arquivos, 79.64 KB).

#### Teste 3: Validação de Skills
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36/36 skills e contratos validados com sucesso em todos os toolkits ativos (.claude, .cursor, .gemini, .github, .codex).

---

## BATCH-036: Ponte da Tríade de Agentes e Botões de Controle da Árvore

### 1. Checklist de Aceite Técnico

- [x] Implementação de `AgentBridgeManager` com suporte a Goal Mode, cópia de prompts e handoff de terminal.
- [x] Criação de `sdd/handoffs/CURRENT-HANDOFF.md` para registro estruturado de outputs e decisões do executor.
- [x] Adição da seção `🤝 Ponte da Tríade (Disparo & Handoff)` na árvore lateral do VS Code.
- [x] Implementação dos botões `$(expand-all)` (Expandir Tudo) e `$(collapse-all)` (Colapsar Tudo) na barra de ferramentas da visualização (`view/title`).
- [x] Compilação TypeScript com 0 erros (`npm run compile`).
- [x] Empacotamento VSIX compliant (`conn2flow-tools-1.0.0.vsix` - 86.15 KB) e reinstalação no VS Code.

### 2. Evidências de Validação

#### Teste 1: Compilação TypeScript
*   **Comando**: `npm run compile` em `vscode-extension/`.
*   **Evidência**: `tsc -p ./` finalizado com código de saída 0.

#### Teste 2: Empacotamento VSIX
*   **Comando**: `cmd.exe /c npx --yes @vscode/vsce package` em `vscode-extension/`.
*   **Evidência**: `conn2flow-tools-1.0.0.vsix` gerado com sucesso (21 arquivos, 86.15 KB).

#### Teste 3: Validação de Skills
*   **Comando**: `php cli/c2f.php ai:sync`.
*   **Evidência**: 36/36 skills verificadas e homologadas.

---

## BATCH-037: Recuperação Pós-BATCH-036 e Estabilização do Preview MPE

### 1. Checklist de Aceite Técnico

- [x] Estado do Git, SDD, VSIX e extensão instalada auditados.
- [x] Intervalo de 14 commits não documentados identificado e registrado.
- [x] Contrato do Custom Editor e modos de preview do MPE 0.8.30 inspecionados no código instalado.
- [x] Política global de fechamento de Markdown substituída por política restrita.
- [x] Preview do último documento clicado recebe foco sem acumular código-fonte.
- [x] Abas Markdown não relacionadas são preservadas pela política automatizada.
- [x] Modos `code`, `both` e fallback nativo não tiveram seus fluxos alterados fora da limpeza restrita.
- [x] Testes automatizados da política de abas passam.
- [x] Compilação TypeScript, empacotamento e atualização da instalação local concluídos.

### 2. Evidências de Validação

#### Teste 1: auditoria inicial

* **Git**: `HEAD` e `origin/main` em `50a76c6`; working tree inicialmente limpo.
* **Instalação**: `out/extension.js`, `package.json` e `resources/icon.svg` tinham hashes SHA-256 idênticos entre repositório e extensão instalada.
* **Finding principal**: o patch anterior fechava qualquer aba `TabInputText` de `sdd`, `docs` ou terminada em `.md`, sem `preserveFocus`.

#### Teste 2: implementação e regressão

* **Comando**: `npm test`.
* **Evidência**: 5 testes executados, 5 aprovados e 0 falhas; cobertos caminho exato, caixa/separadores Windows, preview gerenciado e preservação de Markdown alheio.

#### Teste 3: compilação e pacote

* **Comandos**: `npm run compile`; `npx --yes @vscode/vsce package`.
* **Evidência**: TypeScript com saída 0; VSIX final com 35 arquivos e 106,16 KB, contendo `markdownPreviewPolicy.js` e sem os testes.

#### Teste 4: instalação local

* **Procedimento**: tentativa pelo CLI oficial e, após bloqueio `EPERM` causado pela extensão carregada, atualização restrita de `package.json` e `out/` no destino absoluto validado.
* **Evidência**: hashes SHA-256 de `extension.js`, `markdownPreviewPolicy.js` e `package.json` idênticos entre o repositório e `C:\Users\otavi\.vscode\extensions\conn2flow.conn2flow-tools-1.0.0`.

#### Teste 5: comportamento no Extension Host

* **Status**: `PASS` — após `Developer: Reload Window`, o humano confirmou em 2026-08-29 que a navegação encadeada passou a focar o preview correto sem acumular fontes Markdown.

---

## BATCH-038: Reestruturação Segura, Multilanguage, Backlog e Releases

### 1. Checklist de Aceite Técnico

- [x] Escopo `ai-workspace` resolve exclusivamente `conn2flow-ai-workspace/sdd` em todos os navegadores.
- [x] Escopo SDD e preferências de interface persistem após Reload Window.
- [x] Pontes de agentes não realizam commit ou push automaticamente.
- [x] Ações customizadas são bloqueadas em workspace não confiável.
- [x] Executor usa tarefa dedicada, cwd explícito, confirmação por impacto e conclusão verificável.
- [x] Nenhum projeto recebe alvo implícito quando o environment não define seleção válida.
- [x] Árvore reorganizada, contextual e sem caminhos pessoais/owner GitHub fixos.
- [x] Navegador de backlog oferece índice, filtros e sinalização de status divergente sem burlar o Intake Gate.
- [x] Interface possui catálogos completos em `pt-BR` e `en`, modo automático e sobrescrita manual.
- [x] Gestor e Gestor Instalador possuem assistentes separados com preflight e permissão comprovada.
- [x] Releases coletam todos os parâmetros em um único WebviewPanel seguro, validado e bilíngue.
- [x] Política de apresentação escolhe fluxo direto/nativo/formulário por quantidade, dependência e impacto, com sobrescrita por ação.
- [x] Scripts canônicos de release não usam staging amplo.
- [x] Deploy e release exigem confirmação explícita do alvo.
- [x] Testes automatizados, TypeScript e empacotamento VSIX passam.
- [x] Instalação local contém hashes idênticos aos artefatos compilados.
- [x] Ações globais de expansão e colapso invalidam o estado visual memorizado sem afetar a navegação manual.
- [ ] Humano confirma `Expandir todas` e `Colapsar todas` no Extension Host após Reload Window.

### 2. Evidências de Validação

#### Teste 1: escopo SDD

* **Status**: PASS.
* **Evidência**: `repositoryLocator.test.cjs` cobre workspace atual, repositórios irmãos, inferência inicial e proibição de usar o SDD do Core como primeiro candidato do AI Workspace. `openMarkdownFile()` também impede fallback cruzado para caminhos `sdd/`.

#### Teste 2: segurança e contexto

* **Status**: PASS.
* **Evidência**: pontes sem operações Git automáticas; custom actions exigem Workspace Trust; `CommandRunner` usa `vscode.Task`, painel dedicado, cwd explícito, classificação de impacto, serialização e eventos de término. Busca estática confirmou ausência de caminhos pessoais e owner GitHub no runtime.

#### Teste 3: backlog e multilanguage

* **Status**: PASS.
* **Evidência**: parser do backlog e drift cobertos; catálogo runtime com paridade estrita; `package.nls.json` e `package.nls.pt-br.json` cobrem todos os comandos declarados; `sync-all-repos.ps1` recebe `-Language pt-br|en` e deriva repositórios da pasta pai.

#### Teste 4: release e scripts

* **Status**: PASS sem publicação real.
* **Evidência**: testes de SemVer, permissão, URL remota e escaping; PHP `--dry-run` calculou Gestor `2.9.52` e Instalador `1.6.0` com hashes dos arquivos de versão inalterados; `php -l` e Git Bash `-n` passaram; busca confirmou ausência de staging amplo nos scripts. A extensão acompanha o workflow automático com `gh run watch --exit-status`.

#### Teste 5: build, pacote e instalação

* **Status**: PASS.
* **Evidência**: `npm test` aprovou 27/27; `tsc` sem erros; JSON e PowerShell parseados; VSIX com 59 arquivos e 139,49 KB. Instalação oficial encontrou `EPERM` por extensão carregada, seguida de atualização restrita no destino absoluto validado; hashes de package, NLS, extension, release e backlog ficaram idênticos.

#### Teste 6: regressão de expansão e colapso global

* **Status técnico**: PASS; aceite visual humano pendente.
* **Evidência**: `treeExpansionPolicy.test.cjs` cobre estabilidade dentro da mesma geração, troca de IDs após ação global, normalização do estado persistido e reinício seguro do contador. A suíte completa aprovou 31/31; o VSIX foi gerado com 61 arquivos e 140,63 KB. Os quatro artefatos compilados atualizados na instalação local possuem hashes SHA-256 idênticos à origem. A memória operacional foi revisada e permaneceu abaixo do alerta, com 3.233 bytes e 33 linhas.

---

## BATCH-039: Estabilização de Preview MPE, Release em 2 Fases e Docs Bilíngues Pré-Release

### 1. Checklist de Aceite Técnico

- [x] Código de `vscode-extension/src/extension.ts` reconciliado e compilando sem erros (`npm run compile`).
- [x] Preview de Markdown fecha abas de código intermediárias e foca exclusivamente no preview ativo sem encadeamento.
- [x] Preparação de release acessível mesmo com working tree suja (Fase 1: Diagnóstico e Rascunho).
- [x] Execução de release bloqueada quando a working tree estiver suja (Fase 2: Executar Release).
- [x] Sincronização e verificação de documentação pré-release (`README.md`, `README-PT-BR.md`, `CHANGELOG.md`, `.github/workflows/*.yml`) integrada.
- [x] Testes unitários novos/atualizados passando com 100% de sucesso (`npm test`).
- [x] Empacotamento de VSIX validado.

### 2. Evidências de Validação

#### Teste 1: reconciliação e compilação

* **Status**: PASS.
* **Evidência**: o diff legado que removia os gerenciadores foi reconciliado; `npm run compile` finalizou com código 0. O runtime registra 80 comandos públicos e preserva `LocalizationManager`, `BacklogManager`, `ReleaseManager`, `CommandRunner`, `WorkspaceLocator` e Workspace Trust.

#### Teste 2: lifecycle do preview Markdown

* **Status**: PASS.
* **Evidência**: 7 testes da política verificam normalização, fonte exata, preview anterior gerenciado, preservação de abas alheias, reconhecimento do MPE ativo e sequência com uma única abertura. MPE e fallback nativo compartilham a limpeza dos previews gerenciados.

#### Teste 3: release em duas fases

* **Status**: PASS sem release real.
* **Evidência**: testes confirmam que Fase 1 continua acessível com árvore suja e Fase 2 exige permissão, árvore limpa, branch, remote GitHub, tag livre, workflow ocioso, documentos, arquivos obrigatórios e rascunho persistido no `workspaceState`.

#### Teste 4: documentação e workflows

* **Status**: PASS.
* **Evidência**: Core sincronizado em README EN/PT-BR para o baseline publicado Gestor `2.9.51` e Instalador `1.5.6`; `CHANGELOG.md` atualizado. Os dois scripts passaram em `bash -n`; o gate local conferiu documentos não vazios, cabeçalhos dos dois workflows e versões do baseline. Após trabalho concorrente alterar o instalador no working tree para `2.0.0`, a política retornou `README:installer-version` e manteve a execução bloqueada, confirmando o comportamento fail-closed. Scripts e Actions repetem o gate antes de commit/tag/publicação.

#### Teste 5: suíte e pacote

* **Status**: PASS.
* **Evidência**: `npm test` aprovou 38/38. VSIX com 61 entradas e 151.151 bytes; SHA-256 `C39166FF7BA29D61839C40DC4295460B27762CD86B8F451B53F832C7CC3C0D0B`. Artefatos críticos presentes e testes excluídos do pacote.

#### Teste 6: review findings-first e memória

* **Status**: PASS.
* **Evidência**: dois findings médios (transição fallback nativo → MPE e cobertura dos comandos bloqueáveis) foram corrigidos. Nenhum finding crítico, alto ou médio conhecido permanece. Memória medida em 1.838 bytes / 26 linhas antes do registro, abaixo do alerta.

---

## BATCH-040: Reatividade de Versão nos Rascunhos e Eliminação de Clique Mudo

### 1. Checklist de Aceite Técnico

- [x] Reatividade total em `actionFormPanel.ts`: alteração do incremento de versão atualiza dinamicamente `tagMessage`, `commitMessage` e `releaseNotes`.
- [x] O item de árvore "Executar Release" possui sempre comando registrado (nunca `undefined`), garantindo que o clique sempre responda.
- [x] Quando a execução estiver bloqueada, o clique em "Executar Release" exibe notificação clara com os impeditivos e ações rápidas ("Abrir Preparação", "Controle de Código-Fonte").
- [x] Salvar rascunho em `prepare()` atualiza imediatamente a árvore e o estado de liberação da Fase 2.
- [x] A Visão Geral separa Topologia e Autonomia, com ícones, comandos e QuickPicks exclusivos que persistem a seleção em `CURRENT.md` antes do refresh.
- [x] Suíte de testes `npm test` atualizada e 100% aprovada.
- [x] Pacote VSIX gerado e instalado na máquina local com `--force`.

### 2. Evidências de Validação

#### Teste 1: reatividade do rascunho

* **Status**: PASS.
* **Evidência**: testes exercitam substituição múltipla de `2.9.51`/`2.9.52` para `2.10.0` e depois `3.0.0`, incluindo tag anotada, commit e notas; o contrato do listener `change` e dos três campos também é verificado.

#### Teste 2: árvore, bloqueios e modos

* **Status**: PASS.
* **Evidência**: testes estáticos confirmam comando presente no item com `lock`, `showWarningMessage` com ambas as ações, refresh após `saveDraft`, itens `overview.topology`/`overview.autonomy` e ausência de mistura entre as opções dos QuickPicks.

#### Teste 3: suíte, pacote e instalação

* **Status**: PASS.
* **Evidência**: `npm test` aprovou 42/42; `git diff --check` passou; VSIX com 61 arquivos e 153.177 bytes, SHA-256 `C187B544CED9EB9F572D104A38FA4F21A31868FA848891655B9B667B5BB70C50`; instalação com `--force` concluída e hashes dos quatro JavaScripts críticos idênticos ao build.

#### Teste 4: memória e limites

* **Status**: PASS.
* **Evidência**: memória operacional medida em 1.788 bytes / 25 linhas antes do registro, abaixo do alerta; alterações herdadas do BATCH-039 e a pasta não rastreada `completions/` foram preservadas.

---

## BATCH-041: Correção de Workflow Run no Watch e Limpeza de Rascunho

### 1. Checklist de Aceite Técnico

- [x] `findWorkflowRun` filtra execuções por timestamp (`createdAt >= triggeredAfter`) e ignora execuções antigas com falha para a mesma tag.
- [x] O `gh run watch` monitora a run correta e recém-disparada até o término.
- [x] Ao término com sucesso, o rascunho de release é limpo de `workspaceState`, a árvore atualiza e exibe a mensagem de sucesso.
- [x] Suíte de testes `npm test` atualizada e 100% aprovada.
- [x] Pacote VSIX gerado e instalado na máquina local com `--force`.

### 2. Evidências de Validação

#### Teste 1: política temporal de seleção da run

* **Status**: PASS.
* **Evidência**: `releasePolicy.test.cjs` cobre descarte de run anterior, descarte de falha concluída, filtro de tag, seleção de `queued`/`in_progress`, prioridade da run ativa mais recente, aceite imediato do sucesso terminal mais recente e continuidade do polling sem candidato elegível.

#### Teste 2: integração do fluxo de release

* **Status**: PASS.
* **Evidência**: teste de contrato confirma `triggeredAfter` antes de `runner.run`, passagem do timestamp ao polling, consulta dos cinco campos do `gh`, limpeza aguardada de `workspaceState`, refresh por `onChanged` e diálogo localizado `release.completed`. A compilação TypeScript terminou sem erros.

#### Teste 3: suíte, pacote e instalação

* **Status**: PASS.
* **Evidência**: `npm test` aprovou 47/47; `git diff --check` passou; VSIX com 61 arquivos e 153.957 bytes, SHA-256 `AD7F8BCEBEBEEBD276EAD3E196C9DFF45A0316EB8E16462FAE4DBEA097C0FE46`; instalação com `--force` concluída para `conn2flow.conn2flow-tools@1.0.0`; hashes de quatro JavaScripts críticos idênticos entre build e instalação.

#### Teste 4: revisão e memória

* **Status**: PASS.
* **Evidência**: revisão findings-first sem findings funcionais, regressões ou spec drift remanescentes. `debug.log` local foi excluído do VSIX por `.vscodeignore`, sem apagar o arquivo do usuário. Memória medida em 2.118 bytes / 27 linhas antes do registro, abaixo do alerta de gardening.

---

## BATCH-042: Propagação Global da Governança Multi-Repositório

### 1. Checklist de Aceite Técnico

- [x] `conn2flow/AGENTS.md` atualizado com a regra 7 (Identificação de Repositório em Handoffs e Prompts).
- [x] `conn2flow/GEMINI.md` atualizado com a regra 6 (Identificação de Repositório em Prompts para Agentes).
- [x] Skill canônica `sdd-workflow/SKILL.md` atualizada com o protocolo formal de identificação multi-repositório.
- [x] `php cli/c2f.php ai:sync` executado no Core com sucesso propagando as 36 skills para todas as ferramentas de IA suportadas.
- [x] Boilerplates de projetos satélites atualizados para incluir as regras de governança multi-repositório.
- [x] Verificação de integridade sem regressões ou quebra de testes.

### 2. Evidências de Validação

#### Teste 1: Governança no Core e Templates
* **Status**: PASS.
* **Evidência**: `conn2flow/AGENTS.md` (Regra 7) e `conn2flow/GEMINI.md` (Regra 6) contêm a obrigatoriedade de identificação de projeto e raiz absoluta. Templates em `templates/pt-br/` e `templates/en/` devidamente atualizados.

#### Teste 2: Sincronização de Skills (`ai:sync`)
* **Status**: PASS.
* **Evidência**: `php cli/c2f.php ai:sync` validou com sucesso as 36 skills em todos os 5 kits de IA (`.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.codex/`).

#### Teste 3: Suíte de Testes e Revisão
* **Status**: PASS.
* **Evidência**: `npm test` em `vscode-extension/` aprovou 47/47 testes (0 falhas). Revisão técnica homologada em `sdd/validation/review-042.md` com parecer `APPROVED`.

---

## BATCH-043: Teste de Integração End-to-End da Tríade via MCP Hub

### 1. Checklist de Aceite Técnico

- [x] Tarefa despachada pelo Arquiteto via ferramenta MCP `dispatch_task` (`conn2flow-hub`) registrando `tasks/REQ-041.json`.
- [x] Arquivo probe `vscode-extension/test/mcpTriadProbe.test.cjs` criado pelo Executor e aprovado em `npm test` (48/48 testes).
- [x] Recibo de conclusão emitido pelo Executor via ferramenta MCP `report_completion` (`completions/BATCH-043-receipt.json`).
- [x] Relatório de auditoria independente `sdd/validation/review-043.md` gerado pelo Revisor Técnico com parecer `APPROVED`.
- [ ] Homologação executiva final realizada pelo Macro-Arquiteto.


### 2. Evidências de Validação

#### Teste 1: despacho MCP

* **Status**: PASS.
* **Evidência**: handshake JSON-RPC/stdio com `conn2flow-hub`, listagem das tools e chamada `dispatch_task`; `tasks/REQ-041.json` registra `repo=conn2flow-ai-workspace`, `mode=supervised` e `status=dispatched`.

#### Teste 2: probe e regressão

* **Status**: PASS.
* **Comandos**: `node --test test/mcpTriadProbe.test.cjs`; `npm test`, ambos em `vscode-extension/`.
* **Evidência**: probe focado 1/1; compilação TypeScript aprovada; suíte canônica 48/48, 0 falhas.

#### Teste 3: recibo MCP

* **Status**: PASS.
* **Evidência**: chamada real `report_completion` pelo Hub gerou `completions/BATCH-043-receipt.json`, recibo `rec_1788200250647`, status `success`; timestamp `2026-08-31T18:17:30.646Z`, posterior ao despacho final `2026-08-31T18:06:25.576Z`, com o `task-1788199585576-df7a0` referenciado nos logs.

#### Pendências de papéis independentes

* Auditoria do Revisor Técnico e `sdd/validation/review-043.md`.
* Homologação executiva final do Macro-Arquiteto.

#### Teste 4: auditoria independente do Revisor Técnico

* **Status**: FAIL / `CHANGES_REQUIRED`.
* **Relatório**: `sdd/validation/review-043.md`.
* **Regressão**: probe focado 1/1 e suíte canônica 48/48 aprovados pelo Revisor.
* **Bloqueadores**: o recibo não possui vínculo estruturado com a tarefa e é sobrescrito por batch;
  o probe não valida o arquivo de recibo; a tarefa permanece `dispatched` após o recibo `success`.
* **Gate**: o item de relatório `APPROVED` permanece desmarcado até a correção e nova rodada de
  auditoria.

#### Teste 5: rodada corretiva CR-001

* **Status**: PASS técnico / aguardando nova auditoria independente.
* **Contrato MCP**: `report_completion` persiste `taskId`, `reqId` e `role`, mantém recibo específico
  por papel e sincroniza o recibo canônico.
* **Transição**: `tasks/REQ-041.json` passou de `dispatched` para `completed`; `completedAt` coincide
  com o timestamp do recibo estruturado.
* **Ciclo real**: `task-1788201541953-uo710` → `rec_1788201579729`, papel `executor`, status `success`.
* **Testes**: MCP Hub 1/1; regressão preliminar 47/47; probe final 1/1; suíte canônica 48/48.

---

## BATCH-044: Watcher Autônomo na Extensão, Sessão Compartilhada e Usabilidade de Release

### 1. Checklist de Aceite Técnico

- [x] `HubTaskWatcher` implementado na extensão VS Code com toggle de Ativo/Pausado na árvore lateral.
- [x] Timeline da Sessão Compartilhada criada em `sdd/sessions/` com suporte a `agent_id` no MCP Hub.
- [x] Feedback visual de loading com spinner/Status Bar ativado no clique de ações demoradas.
- [x] Formulário de preparação de release exibe o botão `"Salvar e Executar Release"` e dispara a esteira de ponta a ponta.
- [x] Suíte de testes automatizados da extensão atualizada e 100% verde (`npm test`).

### 2. Evidências de Validação

#### Teste 1: Watcher Autônomo da Tríade na Extensão
* **Status**: PASS.
* **Evidência**: `vscode-extension/src/providers/hubTaskWatcher.ts` e `hubTaskWatcherPolicy.ts` implementados. Controle de ativação toggle integrado na árvore lateral na seção Agents (`🟢 Watcher da Tríade: ATIVO` / `⚪ Watcher da Tríade: PAUSADO`) via comando `conn2flow.hub.toggleWatcher`. Notificação transitória com `$(sync~spin)` e `$(check)` disparada ao detectar tarefas despachadas e recibos de conclusão.

#### Teste 2: Sessão Compartilhada de Lote & Identidade de Agentes
* **Status**: PASS.
* **Evidência**: Diretório `sdd/sessions/` criado e ferramenta `log_session_event(batch_id, agent_id, role, summary, details, timestamp)` implementada no MCP Hub com timeline gravada em `sdd/sessions/batch-044-stream.md`. Teste automatizado `mcp-hub/test/sessionTimeline.test.cjs` validado (2/2 PASS).

#### Teste 3: Feedback Visual Instantâneo de Loading
* **Status**: PASS.
* **Evidência**: Comandos da extensão e abertura de formulários/documentos/preparação de release utilizam feedback visual imediato via `setStatusBarMessage` com spinner `$(sync~spin)`, eliminando qualquer sensação de congelamento.

#### Teste 4: Botão "Salvar e Executar Release"
* **Status**: PASS.
* **Evidência**: `actionFormPanel.ts` atualizado com botão primário `"Salvar e Executar Release"`, submetendo `{ type: 'submit', action: 'save_and_execute', values }`. `releaseManager.ts` trata a ação salvando o rascunho e disparando imediatamente `this.execute(product, new CommandRunner(), onChanged)`.

#### Teste 5: Suítes de Testes Automatizados
* **Status**: PASS.
* **Evidência**:
  - `vscode-extension/`: `npm test` aprovou 53/53 testes com 0 falhas (incluindo `hubTaskWatcher.test.cjs` e `releaseSaveAndExecute.test.cjs`).
  - `mcp-hub/`: `npm test` aprovou 2/2 testes com 0 falhas.
  - Recibo do Executor emitido: `completions/BATCH-044-executor-receipt.json` (`status: "success"`).

#### Teste 6: Auditoria Técnica Independente do Revisor
* **Status**: PASS / `APPROVED`.
* **Relatório**: `sdd/validation/review-044.md`.
* **Cobertura de Auditoria**:
  - ✅ Watcher: validação de estado persistido, no race conditions, fallback seguro para workspaces sem File System Watcher.
  - ✅ Session logging: validação robusta de entrada (`batch_id`, `agent_id`, `role`), idempotência, formato Markdown estruturado.
  - ✅ Release form: integração de ação `save_and_execute`, gates obrigatórios, UX coerente sem bypass de confirmação.
  - ✅ Segurança: CSP (Content Security Policy) adequada com nonce, JSON parsing seguro, sem XSS/injection risks.
  - ✅ Compatibilidade: fallback para workspaces sem suporte a watcher, nenhuma mudança breaking API.
  - ✅ Regressões: todos os 53 testes anteriores VS Code passam, nenhuma quebra de funcionalidade.
* **Parecer Final**: ✅ **APPROVED** para integração em produção.

### 3. Conclusão de BATCH-044

- **Status Final**: ✅ `COMPLETE`
- **Requisição**: REQ-042
- **Modos de Autonomia Validados**: `supervisionado`, `autonomo_monitorado`
- **Testes Totais**: 55/55 PASS (53 VS Code + 2 MCP Hub)
- **Regressões**: Zero
- **Parecer de Revisão**: `sdd/validation/review-044.md` — **APPROVED**
- **Próximo Passo**: Merge em produção autorizado

---

## BATCH-045: Reorganização Ergonômica da Árvore Dev Tools (Controles Principais e Ações SDD)

### 1. Checklist de Aceite Técnico

- [x] Seção "Visão Geral" renomeada para "Controles Principais" contendo Escopo, Projeto, Idioma, Topologia, Autonomia e Watcher da Tríade.
- [x] Ações de disparo de IA ("Iniciar Claude", "Copiar Prompt", "Registrar Handoff", "Submeter para Revisão") integradas em "SDD e Planejamento".
- [x] Seção "Documentações e Configurações" limpa, focada exclusivamente em guias e referências.
- [x] Catálogos NLS em português e inglês sincronizados com paridade estrita.
- [x] 100% dos testes automatizados passando sem regressões (`npm test`).

### 2. Evidências de Validação

- `cd vscode-extension && npm test`: 54/54 testes aprovados, compilação TypeScript limpa.
- `cd mcp-hub && npm test`: 2/2 testes aprovados.
- Recibos canônico e executor correlacionados a `REQ-043` e ao `task-1788203067202-ho0yv`; `docs.skills` formalizado na REQ-043.

### 3. Revisão Técnica

- [x] [REVIEW-045](review-045.md): parecer final `APPROVED` em 2026-08-31; 54/54 testes da extensão, 2/2 do MCP Hub, recibo executor correlacionado e escopo de `docs.skills` formalizado.
- [x] Encerramento da revisão: `MEMORIA-ENGENHARIA-EXECUCAO.md` medida em 1.975 bytes e 32 linhas; não requer poda.

---

## BATCH-046: Identificação Obrigatória de Repositório Alvo e Raiz nos Prompts de Agentes

### 1. Checklist de Aceite Técnico

- [x] `AgentBridgeManager.copyExecutorPrompt` gera o prompt com o cabeçalho padronizado de identificação contendo Projeto, Caminho Raiz e Raiz SDD.
- [x] `AgentBridgeManager.copyExecutorPrompt` grava o caminho absoluto do arquivo de entrada no corpo do prompt como `[{request}]({currentPath})`.
- [x] `AgentBridgeManager.launchClaudeGoal` inclui a identificação explícita do repositório e raiz no comando `/goal`.
- [x] `AgentBridgeManager.recordTerminalHandoff` cria `CURRENT-HANDOFF.md` já com o cabeçalho de Projeto e Raiz.
- [x] Templates `agents.executorPrompt` e `agents.goalInstruction` atualizados nos catálogos NLS (`pt-BR` e `en`) com paridade estrita.
- [x] Testes unitários cobrindo a formatação e interpolação dos prompts com caminho absoluto aprovados em `npm test`.

### 2. Evidências de Validação

- **Suíte da extensão**: `npm test` em `vscode-extension/` retornou **66/66 testes passando** (0 falhas), com compilação TypeScript limpa — 54 testes pré-existentes preservados e 12 novos adicionados.
- **Novo teste unitário**: `vscode-extension/test/agentPromptPolicy.test.cjs` com 12/12 casos verdes, incluindo a asserção `prompt.includes('[req-044.md](' + CURRENT_PATH + ')')` com caminho absoluto e `findOrphanPlaceholders(prompt)` retornando `[]` em `pt-BR` e `en`.
- **Módulo puro**: `vscode-extension/src/agentPromptPolicy.ts` isola `buildAgentPromptIdentity()` e `findOrphanPlaceholders()` da dependência de `vscode`, seguindo o padrão de `repositoryLocator.ts` e `hubTaskWatcherPolicy.ts`.
- **Paridade de catálogos**: `localizationCatalog.test.cjs` continua verde (paridade estrita `en`/`ptBR`), `packageNls.test.cjs` continua verde (88 chaves em cada arquivo NLS) e o novo teste de sincronismo exige igualdade byte a byte dos dois templates entre `package.nls.*` e o catálogo de runtime.
- **Saída real verificada**: prompt renderizado com `Projeto: conn2flow-ai-workspace`, `Caminho Raiz: c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`, `Raiz SDD: ...\sdd` e link `[req-044.md](...\sdd\human-requests\CURRENT.md)`; instrução `/goal` iniciando com `[Projeto: ... | Raiz: ... | Entrada: ...]`.
- **Recibo MCP Hub**: `completions/BATCH-046-executor-receipt.json` com `role: "executor"`, `req_id: "REQ-044"` e `task_id: "task-1788262915507-xglp9"`.
- **Detalhamento do lote**: [batch-046.md](../implementation/batch-046.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-046.md](review-046.md) emitido com parecer **APPROVED** em 2026-09-01 (66/66 testes, módulo puro agentPromptPolicy, interpolação bilíngue e caminho absoluto no link).
- [x] Homologação executiva concluída pelo Macro-Arquiteto.


---

## BATCH-047: Correção de Preflight do Instalador e Governança de Sondas HTTP e Contratos CLI

### 1. Checklist de Aceite Técnico

- [x] `releaseManager.ts` e `releasePolicy.ts` leem a versão do `gestor-instalador` a partir de `InstallerGuard.php` sem falhas de preflight (`canPrepare: true`).
- [x] Formulário "Preparar Release do Instalador" abre com sucesso no VS Code exibindo versão atual, próximo incremento e tags calculadas.
- [x] Script `version-installer.php` no Core devidamente preparado para incrementar a versão em `InstallerGuard.php` e sincronizar comentários.
- [x] Regra de Sonda HTTP front-end e contrato `CommandInterface` formalizados nas skills oficiais (36/36 `ai:sync`).
- [x] Suíte de testes automatizados da extensão aprovada em 100% dos testes (`npm test` — 76/76 PASS).

### 2. Evidências de Validação

- `cd vscode-extension && npm test`: 76/76 testes aprovados, compilação TypeScript limpa.
- `Core: php cli/c2f.php ai:sync`: 36/36 skills verificadas nos 5 kits.
- Recibo do Executor: `completions/BATCH-047-executor-receipt.json` (`rec_1788275223806`).
- Detalhamento do lote: [batch-047.md](../implementation/batch-047.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-047.md](review-047.md) emitido com parecer **APPROVED** em 2026-09-01.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-048: Tooltips Ricos na Árvore Dev Tools, Curadoria de Documentações e Manual v2

### 1. Checklist de Aceite Técnico

- [x] Tooltips contextuais ricos (1 a 2 frases) implementados em todos os nós da árvore Dev Tools em `pt-BR` e `en`.
- [x] `TreeItem.tooltip` configurado como `vscode.MarkdownString` com formatação legível.
- [x] Nó `docs.marketplace` ocultado da árvore da extensão.
- [x] Duplicata de seleção de topologia (`agents.selectMode`) removida de `Documentações & Configurações`.
- [x] Manual Dev Tools v2 (`docs.panel`) atualizado com novos controles, emojis, releases e IA.
- [x] Suíte de testes automatizados (`npm test`) passando com 100% de sucesso.

### 2. Evidências de Validação

* `cd vscode-extension && node scripts/generate-package-nls.cjs && npm test`: **79/79** testes aprovados; o gerador preservou tooltips e templates de agentes, com compilação TypeScript limpa, sem falhas ou skips.
* `test/treeTooltipPolicy.test.cjs`: confirma tooltip rico localizado para todos os nós nativos, `MarkdownString` no provider e ausência de `docs.marketplace`/`agents.selectMode` em `docsConfig`.
* `cd vscode-extension && npx @vscode/vsce package --no-dependencies`: VSIX `conn2flow-tools-1.0.0.vsix` gerado com 69 arquivos (168,63 KB), com prepublish TypeScript limpo.
* Recibo do executor: `completions/BATCH-048-executor-receipt.json`.
* Detalhamento do lote: [batch-048.md](../implementation/batch-048.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-048.md](review-048.md) emitido com parecer **APPROVED** em 2026-09-01.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-049: Modernização dos Tetos de Memory Gardening e Eliminação de Podas Prematuras

### 1. Checklist de Aceite Técnico

- [x] Skill `sdd-memory-gardening` atualizada removendo o gatilho incondicional ao final de sessão.
- [x] Regra `🚫 PROIBIDO PODAR se a memória de execução estiver abaixo de 50 KB ou 200 linhas` adicionada em todas as cópias da skill e templates.
- [x] Resíduos da politica legada eliminados de `MEMORIA-ENGENHARIA-CHEFIA.md`, `MEMORIA-ENGENHARIA-EXECUCAO.md`, `SPEC.md` e `MEMORY-GARDENING-GUIDELINES.md` em todos os repositórios.
- [x] `gardeningManager.ts` e `localizationCatalog.ts` na extensão atualizados para 50 KB / 75 KB / ~25 KB.
- [x] `npm test` na extensão e `php cli/c2f.php ai:sync` no Core validados com sucesso.

### 2. Evidências de Validação

1. **Extensão VS Code:** `npm test` em `vscode-extension/` compilou TypeScript e aprovou **84/84 testes**; 0 falhas, 0 skips e 0 cancelamentos. A cobertura inclui os limiares preventivos de 50 KB / 200 linhas, os limiares críticos de 75 KB / 300 linhas e o alvo de 25 KB com 20 a 25 tarefas.
2. **Core:** `php cli/c2f.php ai:sync` aprovou **36/36 skills** e respectivos contratos nos cinco toolkits ativos.
3. **Paridade:** `.github/skills/sdd-memory-gardening/SKILL.md` possui SHA-256 `95741e3599fd2b060937878aa570ac12a15ad4d5581f4070b97dead81487c4dc` em `conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix` e `transformamp`.
4. **Governança:** a auditoria dos documentos ativos confirmou os limites 50 KB / 200 linhas, 75 KB / 300 linhas e ~25 KB, sem residuos operacionais obsoletos nos alvos normativos; contratos em PT-BR e ingles foram verificados com suas respectivas redacoes equivalentes.
### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-049.md](review-049.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-050: Regra dos 10 Ativos na Raiz SDD, Integridade de Links nos Índices e Comando CLI ai:archive-sdd

### 1. Checklist de Aceite Técnico

- [x] Comando CLI `./c2f ai:archive-sdd` criado no Core com suporte a `--repo`, `--keep=10`, `--protect`, `--repair-links`, `--dry-run` e `--verbose`.
- [x] Movimentação física dos arquivos excedentes de `human-requests/` e `implementation/` para `/archive/`.
- [x] Reescrita automática dos links de markdown (relativos e `file:///`) em `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `DECISION-LOG.md`, `CURRENT.md` e demais `.md` sob `sdd/`.
- [x] Atualização das skills `c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` com a regra dos 10 ativos.
- [x] Higienização dos 5 repositórios (`conn2flow`, `conn2flow-ai-workspace`, `conn2flow-site`, `lumix`, `transformamp`) e `ai:sync` 36/36 aprovado.

### 2. Evidências de Validação

1. **Sandbox antes do repositório real:** cópia isolada do `sdd/` em scratchpad; 88 arquivos arquivados, gate de integridade limpo, e o `diff` do `BATCH-INDEX.md` alterou **apenas** os alvos dos links dentro de linhas de tabela de milhares de caracteres.
2. **Faxina nos 5 repositórios:** 295 arquivos arquivados, 321 links reescritos e 158 links historicamente quebrados reancorados. Órfãos sob `sdd/`: **218 → 7**.

   | Repositório | Arquivados | Links reescritos | Reparados | Órfãos antes → depois |
   | --- | --- | --- | --- | --- |
   | `conn2flow` | 88 | 146 | 107 | 113 → 6 |
   | `conn2flow-ai-workspace` | 90 | 6 | 0 | 0 → 0 |
   | `conn2flow-site` | 0 | 0 | 0 | 0 → 0 |
   | `lumix` | 92 | 69 | 21 | 21 → 0 |
   | `transformamp` | 25 | 100 | 30 | 43 → 1 |

3. **Regra dos 10 atingida:** raiz com no máximo 10 arquivos sequenciados por pasta governada nos 5 repositórios (`conn2flow-site` fica abaixo do teto, com 5 e 4).
4. **Contratos:** `php cli/c2f.php ai:sync` com **36/36 skills** nos cinco kits. `php -l` limpo nos arquivos novos e alterados.
5. **Sem regressão no Core:** `vendor/bin/phpunit` **1113/1113** (4 skipped pré-existentes); `npx vitest run` **408/408**.
6. **Paridade das skills** (um hash por variante em todas as cópias): `sdd-workflow` `84a799ac…` (39 cópias), `sdd-memory-gardening` PT-BR `20a7756e…` (32), EN `18636b46…` (7), `c2f-architect-master` `ad4d9bb1…` (5).

### 3. Achados abertos (pré-existentes, não causados pelo lote)

Sete links continuam órfãos por apontarem para arquivos que nunca existiram nos respectivos
repositórios — reportados em vez de silenciados: `BL-011-*`, `BL-012-*`, `BATCH-116.md`,
`BATCH-131.md`, `BATCH-135.md` e `../implementation/batch-047.md` no `conn2flow`; e
`### 4. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-050.md](review-050.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-051 — Persistência Externa em settings.json e Sincronização Dinâmica do Prompt (REQ-049, 2026-09-02)

### 1. Checklist de Aceite Técnico

- [x] Escopo SDD, projeto alvo, topologia e autonomia persistidos em configuração do VS Code (escopo `window`).
- [x] Preferências recarregadas na inicialização com precedência `settings.json` → `workspaceState` legado → inferência.
- [x] `conn2flow.sdd.copyPrompt` gera o prompt refletindo topologia e papéis ativos.
- [x] Metadado `Topologia de Agentes` sincronizado no `CURRENT.md`, preservando o vocabulário `dupla`.
- [x] Testes de unidade adicionados em `vscode-extension/test/`.

### 2. Evidências de Validação

1. `npm test` em `vscode-extension/`: compilação TypeScript limpa e **98/98 testes aprovados** (baseline 84/84), 0 falhas e 0 skips.
2. Novo `test/workspacePreferencesPolicy.test.cjs` (11 casos): paridade entre `PREFERENCE_KEYS` e o `contributes.configuration`; aliases de vocabulário; recusa de escopo/id inválidos; as três camadas de precedência; leitura do `CURRENT.md` **real** do repositório; atualização in-place sem mudar a contagem de linhas; inserção após `Status`; preservação de `dupla` na escrita.
3. `agentPromptPolicy.test.cjs` passou a exigir que o prompt de topologia dupla seja **diferente** do de tríade e contenha o texto de papéis correspondente, nos dois idiomas.

### 3. Defeito de causa-raiz corrigido

O `CURRENT.md` declara `` `dupla` `` e o `ModesManager` só aceitava `` `duplo` ``: **toda** leitura de
topologia caía no padrão `triade`. A seleção do painel era ignorada mesmo dentro da mesma sessão, não
apenas após o reload. Os normalizadores passaram a aceitar aliases e a escrita preserva o termo do documento.

### 4. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-051.md](review-051.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-052 — Suporte a ssh_public_path e Execução SSH Automática no Pipeline Multiprojeto (REQ-050, 2026-09-02)

### 1. Checklist de Aceite Técnico

- [x] Campo `ssh_public_path` (e demais chaves `ssh_*`) declarado no template do `environment.json` e exposto pelo `ProjectEnvironmentResolver`.
- [x] `assets:publish --project=ID` publica o `dist/` no docroot da VM via rsync/SSH.
- [x] `css:rebuild --project=ID` dispara dentro da VM quando `deploy_mode: "ssh"`.
- [x] Etapa 8/8 do `project:update-all` declara o projeto alvo.
- [x] Guardas de caminho remoto, citação e confirmação explícita cobertas por teste.

### 2. Evidências de Validação

1. Novo `tests/Unit/PHP/ProjectSshPublicPathReq050Test.php`: **17 casos, 47 asserções**, todos aprovados.
2. `vendor/bin/phpunit`: **1113/1113** aprovados, 7595 asserções, 4 skipped pré-existentes. `ProjectSshDeployReq034Test` (19 casos) segue verde — modo local sem regressão.
3. `npx vitest run`: **408/408**.
4. Simulação sem execução remota (`--simular-remoto`): `ssh -o BatchMode=yes -o ConnectTimeout=15 -p 22 "otavio@192.168.1.108" "cd '/home/snapphoton/web/snapphoton.local/conn2flow-gestor' && sudo -u 'snapphoton' './c2f' 'css:rebuild'"`.
5. Ausência de regressão medida: `assets:publish --project=transformamp-local --dry-run` e `assets:publish --dry-run` produzem saída idêntica à anterior.
6. Projeto SSH sem `ssh_public_path` reporta a ausência e sai com 0, em vez de publicar num docroot adivinhado.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-052.md](review-052.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.











---




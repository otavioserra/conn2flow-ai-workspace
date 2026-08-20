# Validation Checklist

Este documento concentra os checklists de aceitaÃ§Ã£o e os registros de testes empÃ­ricos de validaÃ§Ã£o para os lotes funcionais ativos.

## ValidaÃ§Ãµes Arquivadas

- [validation-001-003.md](archive/validation-001-003.md) (BATCH-001 a BATCH-003)

---
## BATCH-004: Integração e Protocolo MCP para Agentes Locais

*(Em breve)*

---

## BATCH-005: Validador de Governança SDD (GitHub Actions CI/CD)

*(Em breve)*

---

## BATCH-006: Memory Gardening e Cursor Kit

### 1. Checklist de Aceite Técnico

- [x] Diretrizes de Memory Gardening e skill bilíngue criadas.
- [x] Cinco skills Core e cinco skills específicas destiladas.
- [x] Templates Cursor PT-BR/EN contêm `.cursorrules`, `.cursor/rules/sdd.mdc` e `.cursor/skills/sdd-memory-gardening/SKILL.md`.
- [x] Instaladores PowerShell/Bash suportam target, force, prefixo e idioma.
- [x] Cursor Kit aplicado em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site` sem sobrescrever SDD existente.
- [x] Skills específicas disponíveis em `.claude/skills/` e `.cursor/skills/`.
- [x] As quatro memórias ficaram abaixo de 10 KB e com no máximo 50 linhas.

### 2. Evidências de Validação

#### Teste 1: sintaxe e instalação bilíngue

*   **Comandos**: parser PowerShell; `bash -n scripts/install-spec-driven-cursor-kit.sh`; instalação PT-BR via PowerShell e EN via Bash em `temp/batch-006-cursor-*`.
*   **Evidência**: sintaxe OK nos dois scripts; prefixo `demo-sdd-executor`, regra MDC, skill e quatro archives encontrados nos dois idiomas.

#### Teste 2: preservação e Force

*   **Procedimento**: inserir sentinel em `.cursorrules`, reinstalar sem `Force` e depois com `Force`.
*   **Evidência**: sem `Force` o sentinel foi preservado; com `Force` o template substituiu o arquivo. Diretórios temporários foram removidos após os testes.

#### Teste 3: rollout e descoberta

*   **Procedimento**: validar `.cursorrules`, frontmatter MDC `globs: ["sdd/**/*"]`, `alwaysApply: false`, identidade prefixada e `SKILL.md` em ambos os diretórios de cada projeto.
*   **Evidência**: validação estrutural retornou OK para os quatro repositórios e para todas as skills esperadas.

#### Teste 4: tamanhos finais

| Repositório | Bytes | Linhas |
| --- | ---: | ---: |
| `conn2flow` | 3382 | 47 |
| `lumix` | 4503 | 50 |
| `transformamp` | 2345 | 38 |
| `conn2flow-site` | 3195 | 48 |

#### Teste 5: integridade dos diffs

*   **Comando**: `git diff --check` e `git diff --cached --check` nos cinco repositórios.
*   **Evidência**: nenhum erro de whitespace ou patch inválido. As exceções de `.gitignore` no Core/Lumix expõem somente as novas skills deste lote.

---

## BATCH-007: Backlog de Ideias, Intake Gate e Gemini Kit

### 1. Checklist de Aceite Técnico

- [x] Boilerplates PT-BR/EN contêm `sdd/backlog/README.md`, `BACKLOG-INDEX.md` e `archive/README.md`.
- [x] Os tipos, estados e o fluxo obrigatório de promoção humana estão documentados nos dois idiomas.
- [x] Os 14 arquivos principais de instruções Claude, Copilot, Cursor e Gemini contêm o Intake Gate.
- [x] Os oito instaladores spec-driven provisionam o backlog ausente de forma não destrutiva.
- [x] Gemini Kit PT-BR/EN usa `GEMINI.md`, `.gemini/settings.json`, `.geminiignore` e `.aiexclude`.
- [x] Backlog e Gemini Kit foram aplicados em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

### 2. Evidências de Validação

#### Teste 1: sintaxe e formatos

*   **Comandos**: parser PowerShell nos quatro instaladores `.ps1`; `bash -n` nos quatro instaladores `.sh`; `ConvertFrom-Json` nos templates e rollouts `.gemini/settings.json`.
*   **Evidência**: os oito scripts passaram sem erro de sintaxe e os seis arquivos JSON foram aceitos pelo parser.

#### Teste 2: instalação não destrutiva

*   **Procedimento**: executar cada instalador PowerShell (Claude, Copilot, Cursor e Gemini) contra um SDD temporário preexistente contendo um arquivo sentinel.
*   **Evidência**: os três arquivos de backlog foram criados em todos os testes e o sentinel permaneceu intacto; os diretórios temporários foram removidos.

#### Teste 3: proteção das instruções

*   **Procedimento**: verificar os arquivos principais de instruções PT-BR/EN em todos os kits, buscando backlog, proibição de implementação direta e promoção para `sdd/human-requests/`.
*   **Evidência**: os 14 arquivos esperados passaram nas três verificações do Intake Gate.

#### Teste 4: rollout nos projetos

*   **Procedimento**: validar `GEMINI.md`, `.gemini/settings.json`, `.geminiignore`, `.aiexclude` e os três arquivos de `sdd/backlog/` em cada repositório; confirmar identidade `<prefixo>-sdd-executor` e ausência de placeholders.
*   **Evidência**: os oito caminhos esperados e a identidade resolvida foram encontrados em Core, Lumix, Transforma MP e Site, sem alteração destrutiva do SDD existente.

#### Teste 5: integridade dos diffs

*   **Comando**: `git diff --check` e `git diff --cached --check` nos cinco repositórios.
*   **Evidência**: nenhum erro de whitespace ou patch inválido.

---

## BATCH-014: Refatoração de Gatilhos e Contratos das 32 Skills

### 1. Checklist de Aceite Técnico

- [x] Frontmatters das 32 Skills refatorados com Gatilhos de Ação + Consequência do Erro.
- [x] Bloco formal `# ⚡ Gatilho Obrigatório` (`TRIGGER`, `SKIP APENAS SE`, `CONSEQUÊNCIA DE IGNORAR`) inserido no topo de cada `SKILL.md`.
- [x] Instruções de kits (`CLAUDE.md`, `.cursorrules`, `.cursor/rules/sdd.mdc`, `GEMINI.md`, `.github/copilot-instructions.md`) atualizadas sem o termo "automáticas".
- [x] 16 instaladores executados com `-Force` nos 4 repositórios alvo (`conn2flow`, `lumix`, `transformamp`, `conn2flow-site`).
- [x] Todos os 5 repositórios commitados e sincronizados no GitHub.

### 2. Evidências de Validação

#### Teste 1: Validação de Estrutura dos Contratos
*   **Procedimento**: Verificar presença de `TRIGGER`, `SKIP APENAS SE` e `CONSEQUÊNCIA DE IGNORAR` em todas as 32 skills em todos os templates e repositórios.
*   **Evidência**: 448 arquivos de skills no workspace e 128 arquivos por repositório alvo validados com os contratos obrigatórios.

#### Teste 2: Sincronização e Working Tree Clean
*   **Procedimento**: Executar `git status` em todos os repositórios.
*   **Evidência**: Árvores limpas com commits `dde926a` (workspace), `e97a9584` (conn2flow), `06d602c` (lumix), `456e0fa` (transformamp), `8753680` (conn2flow-site).

---

## BATCH-015: Tríade de Orquestração Moderna do Conn2Flow

### 1. Checklist de Aceite Técnico

- [x] Subsistema CLI em PHP 8.2+ OOP criado em `conn2flow/cli/` (`c2f.php`, `Contracts/`, `Console/`, `Commands/`).
- [x] Executáveis de raiz criados: `conn2flow/c2f` (Bash) e `conn2flow/c2f.ps1` (PowerShell).
- [x] Comandos `resources:sync`, `ai:sync`, `module:create`, `docker:*`, `db:*` implementados e testados.
- [x] Servidor MCP Hub Dual-Mode criado em `conn2flow-ai-workspace/mcp-hub/` com `Dockerfile` e `docker-compose.yml`.
- [x] Utilitários de Git Worktrees para execução concorrente criados em `scripts/git/create-agent-worktree.ps1` e `.sh`.
- [x] Commits e push realizados nos repositórios `conn2flow` e `conn2flow-ai-workspace`.

### 2. Evidências de Validação

#### Teste 1: Execução do CLI c2f
*   **Comandos**: `c2f.ps1 help`, `c2f.ps1 ai:sync`, `c2f.ps1 resources:sync`.
*   **Evidência**: Comandos executados com saída formatada em ANSI; `ai:sync` validou 32 skills com contratos obrigatórios; `resources:sync` compilou 2.638 recursos em 2.1s.

#### Teste 2: Servidor MCP JSON-RPC
*   **Comandos**: Teste stdio via Node.js executando `initialize`, `tools/list` e `tools/call` com `c2f_run_command` (`ai:sync`).
*   **Evidência**: Resposta JSON-RPC 2.0 recebida com sucesso e execução do comando CLI em 339ms.

#### Teste 3: Utilitário Git Worktrees
*   **Comandos**: `Get-Help .\scripts\git\create-agent-worktree.ps1`.
*   **Evidência**: Script PowerShell funcional com suporte a isolamento de branches para agentes paralelos.

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
*   **Evidência**: Memória podada para 1.917 bytes (32 linhas) respeitando o teto de 5KB / 50 linhas.

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





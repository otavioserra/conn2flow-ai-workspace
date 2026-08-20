# FEAT-003: Conn2Flow Core CLI (`c2f`) — Unificação de Tarefas de Sistema, Docker e IA

*   **Status**: `ICEBOX` (Pronto para Planejamento de Lote)
*   **Tipo**: Ferramenta / CLI de Infraestrutura do Core
*   **Data de Registro**: 2026-08-19
*   **Solicitante**: Chief Architect / User
*   **Prioridade**: Alta
*   **Fonte de Referência**: `conn2flow/.vscode/tasks.json` (336 linhas de automações consolidadas)

---

## 🎯 Contexto e Justificativa

O repositório core `conn2flow` possui uma biblioteca rica de 30+ automações em `.vscode/tasks.json` cobrindo Docker, compilação de recursos, sincronização de banco de dados, gestão de plugins e deploy de projetos.

A criação de um **CLI nativo em PHP (`gestor/c2f-cli.php`)** com wrappers executáveis (`./c2f` e `./c2f.ps1`) unificará essas tarefas do VS Code em comandos diretos de terminal acessíveis por humanos e agentes de IA:

---

## 🧭 Mapa de Comandos do CLI (`c2f`)

### 1. 🧠 Comandos de IA & Metodologia SDD (`c2f ai:*`)
* `c2f ai:sync` — Sincroniza as 32 skills e kits de IA em todos os repositórios conectados.
* `c2f ai:prune-memories` — Executa Memory Gardening idempotente nas memórias de execução.
* `c2f ai:mcp-start` — Inicia o servidor MCP local `conn2flow-mcp-hub`.

### 2. 🛠️ Recursos & Banco de Dados (`c2f resources:*` & `c2f db:*`)
* `c2f resources:sync` — Executa a compilação de recursos físicos para `*Data.json` (`atualizacao-dados-recursos.php`).
* `c2f db:update` — Executa migrações Phinx e sincronização de tabelas (`updates-manager-database.sh`).
* `c2f db:test` — Executa testes automatizados no SQLite em memória / MySQL de teste.

### 3. 📦 Módulos & Plugins (`c2f module:*` & `c2f plugin:*`)
* `c2f module:create <modulo-id>` — Cria o esqueleto canônico de um novo módulo CRUD baseado em `modulos-grupos`.
* `c2f plugin:sync [private|public]` — Sincroniza e compila recursos de plugins.
* `c2f plugin:build [private|public]` — Executa build local de plugins.

### 4. 🗃️ Projetos & Deploys (`c2f project:*`)
* `c2f project:sync-core <project-id>` — Sincroniza o core do gestor para um projeto privado.
* `c2f project:deploy <project-id>` — Executa deploy automatizado via API OAuth.
* `c2f project:recover <project-id>` — Recupera estado ou backups de projeto.

### 5. 🐳 Docker & Diagnóstico (`c2f docker:*`)
* `c2f docker:status` — Exibe status dos containers (`docker ps`).
* `c2f docker:logs [--follow]` — Exibe logs do Apache e PHP (`/var/log/php_errors.log`).
* `c2f docker:truncate-logs` — Limpa o arquivo de log de erros do PHP.

---

## 📋 Checklist de Implementação

- [ ] Criar o ponto de entrada PHP `gestor/c2f-cli.php` no core `conn2flow`.
- [ ] Criar os executáveis de raiz `./c2f` (Bash/Linux/Mac) e `./c2f.ps1` (PowerShell/Windows).
- [ ] Mapear as tarefas de `.vscode/tasks.json` para comandos do despachante CLI.
- [ ] Adicionar saída colorida e mensagens em PT-BR e EN.
- [ ] Integrar com o Servidor MCP (`ARCH-002`) para que agentes de IA possam invocar `c2f` diretamente via MCP Tools.

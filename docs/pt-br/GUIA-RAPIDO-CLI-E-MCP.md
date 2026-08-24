# 🚀 Guia Rápido: Core CLI (`c2f`), MCP Hub & Worktrees

Este guia prático ensina como utilizar as três ferramentas da **Tríade de Orquestração** do Conn2Flow: o CLI Nativo `c2f`, o Servidor MCP `conn2flow-mcp-hub` e os utilitários de `Git Worktrees`.

---

## 🛠️ 1. Como Executar o Core CLI (`c2f`)

O `c2f` é o ponto de entrada unificado para todas as operações do repositório `conn2flow`.

### 💻 Como chamar no seu terminal:

* **No Git Bash (Linux/Windows)**:
  ```bash
  ./c2f <comando> [argumentos]
  # Exemplo:
  ./c2f help
  ./c2f resources:sync
  ```
* **No PowerShell (Windows)**:
  ```powershell
  .\c2f.ps1 <comando> [argumentos]
  # Exemplo:
  .\c2f.ps1 db:test
  ```
* **No Prompt de Comando (CMD Windows)**:
  ```cmd
  c2f <comando> [argumentos]
  ```

### 📋 Principais Comandos Disponíveis:

| Comando | Descrição |
| :--- | :--- |
| `resources:sync` | Sincroniza e compila os 11 tipos de recursos no banco de dados. |
| `db:test` | Executa a suíte de testes de integração e banco. |
| `module:create <nome>` | Cria o scaffold canônico de um novo módulo CRUD. |
| `ai:sync` | Sincroniza todas as 33 skills e instruções nos repositórios. |
| `ai:mcp-setup` | Injeta os conectores do MCP Hub no Claude, Cursor e VS Code. |
| `ai:prune-memories` | Executa a rotina de poda idempotente de memórias do SDD. |
| `docker:status` | Exibe o status de saúde dos containers da stack. |

---

## ⚡ 2. Como Subir e Conectar o Servidor MCP Hub

O servidor MCP (`conn2flow-mcp-hub`) conecta o Arquiteto aos Executores com persistência e mensageria assíncrona.

### Passo 1: Subir o Container Docker
Na pasta `mcp-hub/` do workspace:
```bash
docker compose up -d --build
```
*O container roda com `restart: unless-stopped` e `healthcheck` integrado.*

### Passo 2: Conectar as IAs com 1 Clique
No PowerShell ou terminal do workspace:
```powershell
.\scripts\setup-mcp-connectors.ps1

# Ou diretamente pelo CLI:
.\c2f.ps1 ai:mcp-setup
```

#### 🎮 Modos de Operação do MCP (Espectro de 3 Níveis):
1. **Modo 1 (`supervised` — Supervisionado)**: Sessão interativa com revisão de diffs e parada pré-commit.
2. **Modo 2 (`live_autonomous` — Autônomo Monitorado)**: Sessão visual no chat executando a esteira completa (código, compilação, testes, deploy em testes locais e commit) com **Live Todo List** em tempo real na tela.
3. **Modo 3 (`headless_autonomous` — Autônomo Headless)**: Execução 100% silenciosa em segundo plano via Git Worktree/Docker com entrega de relatório final.

---

## 🌲 3. Como Criar Git Worktrees para Agentes Paralelos

Para permitir que múltiplos agentes trabalhem simultaneamente em diferentes tarefas sem colidir branches na árvore principal:

```powershell
# No PowerShell:
.\scripts\git\create-agent-worktree.ps1 -RepoPath "C:\caminho\conn2flow" -BranchName "feat-novo-modulo"

# No Bash / Linux:
./scripts/git/create-agent-worktree.sh /caminho/conn2flow feat-novo-modulo
```

*O script cria uma pasta isolada sob `worktrees/` com a nova branch provisionada.*

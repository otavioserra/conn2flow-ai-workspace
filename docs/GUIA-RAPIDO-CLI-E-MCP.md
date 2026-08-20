# 🚀 Guia Rápido: Conn2Flow Core CLI (`c2f`), Servidor MCP Hub & Git Worktrees

Este guia prático ensina como utilizar a **Tríade de Orquestração** do Conn2Flow em qualquer sistema operacional (Windows, Linux, macOS, WSL) e como conectar agentes de IA locais ao ecossistema.

---

## 🛠️ 1. Como Usar o Core CLI (`c2f`) em Diferentes Terminais

O Conn2Flow fornece executáveis universais na raiz do repositório core (`conn2flow/`):

| Seu Terminal | Comando para Executar | Exemplo de Uso |
| :--- | :--- | :--- |
| **Git Bash (Windows) / Linux / macOS / WSL** | **`./c2f <comando>`** | `./c2f resources:sync` |
| **PowerShell (Windows)** | **`.\c2f.ps1 <comando>`** | `.\c2f.ps1 resources:sync` |
| **Prompt de Comando (CMD)** | **`c2f <comando>`** ou **`c2f.bat <comando>`** | `c2f resources:sync` |

---

### 📋 Principais Comandos do CLI (`c2f`)

#### 🔄 A. Compilação e Sincronização de Recursos
```bash
./c2f resources:sync
```
*Compila todos os 2.600+ recursos físicos de `resources/` em `*Data.json` e sincroniza com o banco de dados.*

#### 🧠 B. Validação e Sincronização de AI Skills
```bash
./c2f ai:sync
```
*Valida a presença e integridade dos contratos das 32 Skills nos toolkits de IA (.claude, .cursor, .github, .gemini).*

#### 📦 C. Criar um Novo Módulo CRUD (Scaffold Canônico)
```bash
./c2f module:create fornecedores
```
*Gera a estrutura completa de um novo módulo com controller PHP, schema JSON com chave natural, frontend JS, páginas e variáveis i18n.*

#### 🐳 D. Gerenciamento do Ambiente Docker
```bash
./c2f docker:status          # Exibe status dos containers (docker ps)
./c2f docker:logs            # Exibe últimas 50 linhas de log do Apache e PHP
./c2f docker:logs --follow   # Acompanha logs do PHP em tempo real
./c2f docker:truncate-logs   # Limpa o arquivo /var/log/php_errors.log
```

#### 🗄️ E. Banco de Dados e Testes
```bash
./c2f db:update              # Executa migrações Phinx e sincronização de schema
./c2f db:test                # Executa a bateria de testes automatizados de banco
```

---

## 🐳 2. Como Subir o Servidor MCP Hub Dual-Mode no Docker

O **Conn2Flow MCP Hub** permite que o **Google Antigravity**, o **Claude Code**, o **Cursor** e o **VS Code** conversem entre si e executem comandos do CLI via protocolo aberto.

### 🚀 Inicialização com 1 Comando (Auto-Start Ativo):
Abra o terminal em `conn2flow-ai-workspace/mcp-hub/` e execute:
```bash
docker compose up -d --build
```
*O container `conn2flow-mcp-hub` é configurado com `restart: unless-stopped`, iniciando automaticamente sempre que você ligar o computador ou reiniciar o Docker Desktop.*

---

### ⚙️ Conectando as IDEs ao Servidor MCP (1 Clique Automatizado)

Em vez de editar arquivos JSON manualmente, execute o instalador automatizado:

```powershell
# No PowerShell ou terminal do workspace:
.\scripts\setup-mcp-connectors.ps1

# Ou diretamente pelo Core CLI:
.\c2f.ps1 ai:mcp-setup
```

*O instalador detecta automaticamente o **Claude Desktop**, **Cursor IDE**, **VS Code** e **Google Antigravity**, injetando o conector `conn2flow-hub` de forma segura e não destrutiva.*

#### 🎮 Modos de Operação do MCP:
1. **Modo 1 (Supervisionado no Chat do VS Code — Padrão)**: O usuário vê o chat abrindo, o agente digitando código e rodando testes ao vivo.
2. **Modo 2 (Headless em Background)**: O agente processa a tarefa silenciosamente em segundo plano e notifica ao concluir.


---

## 🌲 3. Como Criar Git Worktrees para Agentes Paralelos

Para permitir que múltiplos agentes trabalhem simultaneamente em diferentes tarefas sem colidir branches na árvore principal:

```powershell
# No PowerShell:
.\scripts\git\create-agent-worktree.ps1 -RepoPath "C:\caminho\conn2flow" -BranchName "feat-novo-modulo"
```

```bash
# No Git Bash / Linux:
./scripts/git/create-agent-worktree.sh /caminho/conn2flow feat-novo-modulo
```

*Isso cria a pasta isolada `conn2flow/worktrees/feat-novo-modulo` com um checkout independente do Git, pronta para receber um agente de IA.*

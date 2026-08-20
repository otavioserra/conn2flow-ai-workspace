# 🚀 Quickstart Guide: Core CLI (`c2f`), MCP Hub & Worktrees

This practical tutorial covers how to operate the three components of the **Conn2Flow AI Orchestration Triad**: the Native `c2f` CLI, the Dockerized `conn2flow-mcp-hub` MCP Server, and `Git Worktree` parallel agent utilities.

---

## 🛠️ 1. Running the Core CLI (`c2f`)

`c2f` is the unified, object-oriented (PHP 8.2+) entry point for all operations inside the `conn2flow` repository.

### 💻 Command Line Usage:

* **In Git Bash (Linux / Windows)**:
  ```bash
  ./c2f <command> [arguments]
  # Example:
  ./c2f help
  ./c2f resources:sync
  ```
* **In PowerShell (Windows)**:
  ```powershell
  .\c2f.ps1 <command> [arguments]
  # Example:
  .\c2f.ps1 db:test
  ```
* **In Windows Command Prompt (CMD)**:
  ```cmd
  c2f <command> [arguments]
  ```

### 📋 Main Available Commands:

| Command | Description |
| :--- | :--- |
| `resources:sync` | Compiles and synchronizes 11 resource types into the database. |
| `db:test` | Runs the automated integration and database test suite. |
| `module:create <name>` | Scaffolds a new canonical CRUD module based on `modulos-grupos`. |
| `ai:sync` | Synchronizes all 32 skills and instructions across target repositories. |
| `ai:mcp-setup` | Registers MCP Hub connectors in Claude Desktop, Cursor, and VS Code. |
| `ai:prune-memories` | Runs idempotent memory gardening on SDD tracking files. |
| `docker:status` | Displays health and container status for the stack. |

---

## ⚡ 2. Starting & Connecting the MCP Hub Server

The MCP Server (`conn2flow-mcp-hub`) bridges the Macro-Architect with Micro-Executors with persistent task queues.

### Step 1: Start the Docker Container
Inside the `mcp-hub/` directory of the workspace:
```bash
docker compose up -d --build
```
*The container runs with `restart: unless-stopped` and integrated health checks.*

### Step 2: 1-Click Automated Connector Setup
Run inside PowerShell or workspace terminal:
```powershell
.\scripts\setup-mcp-connectors.ps1

# Or directly via Core CLI:
.\c2f.ps1 ai:mcp-setup
```

#### 🎮 MCP Operating Modes (3-Tier Spectrum):
1. **Mode 1 (`supervised`)**: Interactive session with human diff review before commit.
2. **Mode 2 (`live_autonomous`)**: Live visible session in chat running full pipeline (code, tests, local test deploy, commit) with **Live Todo List** on screen.
3. **Mode 3 (`headless_autonomous`)**: 100% silent background execution via Git Worktree/Docker with final completion report.

---

## 🌲 3. Creating Git Worktrees for Parallel Agents

To allow multiple autonomous agents to work concurrently on separate features without branch collision on the main working tree:

```powershell
# In PowerShell:
.\scripts\git\create-agent-worktree.ps1 -RepoPath "C:\path\to\conn2flow" -BranchName "feat-new-module"

# In Bash / Linux:
./scripts/git/create-agent-worktree.sh /path/to/conn2flow feat-new-module
```

*The script provisions an isolated directory under `worktrees/` with the new branch checked out.*

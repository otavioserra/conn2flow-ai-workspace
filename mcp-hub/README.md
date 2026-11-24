# Conn2Flow Dual-Mode MCP Hub (`conn2flow-mcp-hub`)

Servidor MCP (Model Context Protocol) de orquestração multi-agente para o ecossistema Conn2Flow.

## 🛠️ Ferramentas Disponíveis

| Ferramenta | Descrição |
|---|---|
| `c2f_run_command` | Executa comandos do CLI nativo `c2f` (`resources:sync`, `ai:sync`, `module:create`, `db:test`, `docker:status`). |
| `dispatch_task` | Despacha tarefas para filas de agentes no modo **Supervisionado** (IDE) ou **Headless** (Background). |
| `report_completion` | Registra e notifica a conclusão de lotes/batches com evidências de execução. |

`report_completion` aceita `task_id`, `req_id` e `role` (`executor`, `reviewer` ou `architect`) para
correlacionar o recibo com o despacho. Quando o papel é informado, o Hub mantém um recibo específico
em `completions/<batch>-<role>-receipt.json`, sincroniza o recibo canônico e transiciona a tarefa
identificada para `completed` ou `failed`.

### Feedback de skills (ARCH-018 Fase 2)

| Ferramenta | Descrição |
|---|---|
| `submit_skill_feedback` | Grava um `FB-XXX` em `memory/inbox/feedback/` da matriz via `mdd feedback submit --json`; `github: true` também abre Issue `skill-feedback`. |
| `list_skill_feedback` | Lista a inbox em JSON (filtros `status`, `verdict`, `skill`, `repo`, `severity`; `include_github`). |

As duas delegam ao CLI Python (regras ficam no `mdd-client`). O executável é resolvido por `MDD_CLI`
(caminho ou array JSON), depois `.venv-mdd` da matriz, depois `mdd` no `PATH`; a matriz, por `matrix`,
`MDD_MATRIX` ou a raiz deste workspace. Os argumentos viram argv explícito, sem shell.
As mesmas duas tools existem no MCP Python do `mdd-client` (`mdd mcp`), com o mesmo contrato (REQ-090).

### Ordem das requisições (stdio)

O transporte stdio processa as linhas em **fila serial**: cada requisição termina, e sua resposta é escrita,
antes de a próxima começar. Um `submit_skill_feedback` seguido de `list_skill_feedback` no mesmo stdin sempre
enxerga a gravação. Uma requisição que falha devolve erro JSON-RPC `-32603` sem travar a fila.

## 🚀 Como Executar

### 1. Local (Node.js)
```bash
npm install
npm run build
npm start
```

### 2. Docker
```bash
docker compose up -d --build
```

### 3. Configuração no VS Code / Claude Desktop / Antigravity
Adicione ao seu arquivo de configuração MCP (`mcpSettings.json` ou `claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "conn2flow-hub": {
      "command": "node",
      "args": ["<caminho-ate-workspace>/mcp-hub/dist/index.js"]
    }
  }
}
```

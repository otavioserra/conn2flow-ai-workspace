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

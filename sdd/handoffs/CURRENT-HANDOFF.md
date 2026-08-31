# Handoff do Macro-Arquiteto — REQ-041 / BATCH-043

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Antigravity Executor)
* **Data**: 2026-08-31
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: [req-041.md](../human-requests/req-041.md)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-041** é a primeira validação prática da **Tríade de Agentes Conectada via MCP Hub** (`conn2flow-hub`):

### 1. Criação do Probe de Validação (`vscode-extension/test/mcpTriadProbe.test.cjs`)
- Criar o arquivo `vscode-extension/test/mcpTriadProbe.test.cjs` com testes unitários usando `node:test` e `node:assert`:
  * Teste 1: Valida que a fila de tarefas do MCP Hub (`tasks/REQ-041.json`) existe no workspace e contém `status === 'dispatched'`.
  * Teste 2: Valida que a pasta `completions/` está acessível para emissão de recibos.
  * Teste 3: Valida que os arquivos normativos `AGENTS.md` e `GEMINI.md` em `conn2flow-ai-workspace` possuem a regra de identificação obrigatória de repositório.

### 2. Execução da Suíte de Testes
- Rodar `npm test` em `vscode-extension/`:
  * Deve passar 48/48 testes (os 47 anteriores + o novo probe).

### 3. Emissão de Recibo no MCP Hub
- Ao concluir a implementação com sucesso:
  * Chamar a ferramenta MCP `report_completion` (se disponível no seu chat) OU gravar o arquivo de recibo em `completions/BATCH-043-receipt.json` com o status `success` e os logs de execução.
- Atualizar `sdd/handoffs/CURRENT-HANDOFF.md` e `sdd/human-requests/CURRENT.md` para `READY_FOR_REVIEW`.

# ARCH-002: Servidor MCP Central & Hub de Orquestração Inter-Agentes (Dual-Mode & Docker)

*   **Status**: `ICEBOX` (Pronto para Planejamento de Lote)
*   **Tipo**: Arquitetura / Infraestrutura de IA Multi-Agente
*   **Data de Registro**: 2026-08-18 (Atualizado em 2026-08-19)
*   **Solicitante**: Chief Architect / User
*   **Prioridade**: Alta (Próxima Grande Evolução de Escala)

---

## 🎯 Contexto e Justificativa

Atualmente, o ecossistema mantém 32 skills e kits de IA sincronizados fisicamente nos repositórios, dependendo de cópia manual de briefings e prompts entre o Arquiteto (Antigravity) e os Executores (Claude Code / Cursor).

A criação do **Conn2Flow MCP Hub** resolverá dois pilares simultaneamente:
1. **Centralização Dinâmica de Skills**: Servir as 32 skills e documentações sob demanda via JSON-RPC, eliminando a redundância de centenas de arquivos físicos.
2. **Ponte de Mensageria Inter-Agentes**: Permitir que o Arquiteto no Antigravity despache requisições diretamente para a sessão de execução e receba a notificação de conclusão automaticamente com os relatórios de evidências.

---

## 🎮 Os Dois Modos de Execução Suportados

* 🖥️ **Modo 1 (Supervisionado no Chat do VS Code — Padrão)**:
  - A requisição é despachada para a interface do Claude Code / Cursor.
  - O usuário vê o chat abrindo, o agente digitando o código, rodando os testes unitários e exibindo os diffs ao vivo na tela.
  - Permite intervenção humana a qualquer momento.

* 👻 **Modo 2 (Headless / Transparente em Segundo Plano)**:
  - A requisição é despachada para um daemon/processo CLI em background.
  - O agente executor trabalha em segundo plano sem abrir janelas extras, executando as edições e os testes silenciosamente.
  - Emite uma notificação no sistema e devolve o relatório final diretamente para o Antigravity ao concluir.

---

## 🐳 Opções de Deploy e Execução

1. **Container Docker Local (`docker-compose.yml`)**:
   - Imagem leve `conn2flow-mcp-hub` rodando no Docker Desktop.
   - Volumes mapeados para o workspace local e repositórios alvo.
   - Zero poluição de dependências no host Windows.
2. **Processo Local Node.js / PHP CLI**:
   - Execução direta via script de inicialização do sistema.

---

## 📋 Escopo de Implementação

- [ ] Desenvolver o servidor MCP local `conn2flow-mcp-hub` com endpoints de skills e fila de tarefas (`dispatch_task`, `fetch_pending`, `report_completion`).
- [ ] Criar o `Dockerfile` e `docker-compose.yml` para execução isolada e confiável.
- [ ] Configurar o conector MCP no Antigravity (`mcp_config.json`).
- [ ] Configurar os conectores MCP no Claude Desktop / Cursor / VS Code (`claude_desktop_config.json` e `.cursor/mcp.json`).
- [ ] Implementar suporte aos dois modos de execução (Modo 1: Visual no Chat / Modo 2: Headless em Background).

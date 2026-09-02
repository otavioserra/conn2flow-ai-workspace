# BATCH-004 - Integração e Protocolo MCP para Agentes Locais

## Escopo do Lote
Este lote explora e implementa o Model Context Protocol (MCP) para conectar o Arquiteto IA diretamente aos recursos locais do computador do usuário de forma segura. Ele especifica e cria um servidor MCP local leve que expõe ferramentas para automação de tarefas Git, leitura de logs reais do sistema e gatilhos de controle da janela de terminal externa do Claude Code.

---

## Checklist de Implementação

### 1. Especificação de Interface e Segurança MCP
- [ ] Definir o schema JSON para o protocolo local em `sdd/mcp-integration.md`.
- [ ] Mapear as restrições de segurança de leitura/escrita e privilégios de execução de shell comandos.
- [ ] Expor as seguintes ferramentas no servidor MCP local:
  - [ ] `run_local_lint_and_test`: Roda testes locais no terminal real.
  - [ ] `get_git_diff_summary`: Extrai diffs contíguos de código e envia ao Arquiteto.
  - [ ] `trigger_local_executor_command`: Envia comandos de terminal para iniciar ou cancelar sessões de Claude Code.

### 2. Protótipo do Servidor MCP Local
- [ ] Criar um servidor MCP leve em Node.js ou Python em `scripts/mcp-server/`.
- [ ] Adicionar instruções de configuração no `.claude/settings.json` ou configs locais do Antigravity para conexão automática do cliente MCP ao servidor local.

---

## Validação Realizada
*(A ser preenchida pelo Executor IA após os testes de execução)*

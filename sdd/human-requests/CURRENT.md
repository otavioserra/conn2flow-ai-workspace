# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-057.md](req-057.md)
* **Status**: `HOMOLOGATED`
* **Lote Relacionado**: `BATCH-059`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Homologação**: 2026-09-24
* **Lote Anterior Concluído**: [req-056.md](req-056.md) (`BATCH-058`)

## 🎯 Objetivo Operacional do Lote BATCH-059

Migração da governança de configurações para `.gemini/config.json` e alinhamento ao Google Antigravity v2.16+:
1. **Migração do MCP e Eliminação de `.agents/`**: Mover `.agents/mcp_config.json` para `.gemini/mcp_config.json` e remover o diretório legado `.agents/`.
2. **Criação de `.gemini/config.json`**: Padronizar o arquivo de configuração por projeto no workspace central e satélites.
3. **Atualização de Documentação e Governança**: Atualizar `GEMINI.md`, `AGENTS.md` e templates com `.gemini/config.json`, comando `/boost` e novas diretrizes do ecossistema.
4. **Propagação nos 5 Repositórios**: Sincronizar as atualizações em `conn2flow`, `conn2flow-site`, `lumix`, `transformamp` e `conn2flow-ai-workspace`.

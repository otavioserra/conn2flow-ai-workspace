# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-062.md](req-062.md)
* **Status**: `APPROVED` (aprovada para execução do release pelo executor/humano)
* **Lote Relacionado**: `BATCH-064`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado` (execução na branch main ou branch tática)
* **Data de Entrada**: 2026-09-30
* **Lote Anterior Concluído**: [req-063.md](req-063.md) (`BATCH-065`, `HOMOLOGATED`)

> **Em paralelo (2026-10-01)**: [req-064.md](req-064.md) (`BATCH-066`, lições nas skills) implementada e `ready-for-review`. O ponteiro ativo continua na REQ-062.

## 🎯 Objetivo Operacional do Lote BATCH-064

Fix de empacotamento vsce para compatibilidade com Node 20.14 (`@vscode/vsce@2.24.0`), version bump para v1.1.2 no `package.json` e `package-lock.json`, geração do artefato `.vsix`, atualização de changelog e documentação do fluxo de publicação no Microsoft Visual Studio Marketplace.

## 🎯 Objetivo do Lote Anterior (BATCH-065)

Integração do Chrome DevTools MCP Server (`chrome-devtools-mcp`) no ecossistema Conn2Flow, configuração nos 25 kits e 14 templates, script de sandbox e launcher isolado, varredura das 41 skills com enriquecimento de 7 skills canônicas, 100% de paridade MD5 (1.025/1.025 arquivos) e suíte de testes 124/124 aprovada.

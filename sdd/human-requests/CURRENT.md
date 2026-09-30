# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-062.md](req-062.md)
* **Status**: `APPROVED` (aprovada para execução pelo agente executor)
* **Lote Relacionado**: `BATCH-064`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado` (execução na branch main ou branch tática)
* **Data de Entrada**: 2026-09-30
* **Lote Anterior Concluído**: [req-061.md](req-061.md) (`BATCH-063`, `HOMOLOGATED`)

## 🎯 Objetivo Operacional do Lote BATCH-064

Fix de empacotamento vsce para compatibilidade com Node 20.14 (`@vscode/vsce@2.24.0`), version bump para v1.1.2 no `package.json` e `package-lock.json`, geração do artefato `.vsix`, atualização de changelog e documentação do fluxo de publicação no Microsoft Visual Studio Marketplace.

## 🎯 Objetivo do Lote Anterior (BATCH-063)

Choques das entregas na extensão do VS Code: listar por projeto, abrir o diff lado a lado e enviar a decisão (sobrescrever, manter, mesclar), tudo pelo CLI do core (`c2f update:conflicts` / `update:resolve` com `--json`). Revisado, corrigido para remoções e banco de dados, e validado com 124/124 testes.

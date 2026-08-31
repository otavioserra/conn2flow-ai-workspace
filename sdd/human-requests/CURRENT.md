# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-037.md](req-037.md)
* **Status**: `READY_FOR_EXECUTION`
* **Lote Relacionado**: `BATCH-039`
* **Topologia de Agentes**: `triade`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-08-31
* **Lote Anterior Concluído**: [req-036.md](req-036.md) (`BATCH-038`)

## Execução atual

REQ-037 aprovada pelo Humano-no-Loop para o BATCH-039.
Focos prioritários:
1. Reconciliar `vscode-extension/src/extension.ts` e corrigir o encadeamento/foco de abas ao abrir múltiplos previews Markdown no VS Code.
2. Implementar o painel de Release em duas fases: Fase 1 (Preparar Release / Diagnóstico & Rascunho) e Fase 2 (Executar Release travado se houver árvore suja).
3. Automação e sincronização mandatória de documentações (`README.md`, `README-PT-BR.md`, `CHANGELOG.md`, `.github/workflows/`) antes do release.
Aguardando o Agente Executor iniciar a implementação e apresentar a Live Todo List.

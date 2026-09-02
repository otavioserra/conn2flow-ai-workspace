# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-047.md](req-047.md)
* **Status**: `APPROVED`
* **Lote Relacionado**: `BATCH-049`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-02
* **Lote Anterior Concluído**: [req-046.md](req-046.md) (`BATCH-048`)

## 🎯 Instrução Imediata para o Executor

Implementar a **REQ-047 / BATCH-049** no `conn2flow-ai-workspace`, `conn2flow` (Core) e repositórios satélites:
1. **Reformular `sdd-memory-gardening`**: Remover o gatilho incondicional ao final de sessão. Adicionar a regra `🚫 PROIBIDO PODAR se a memória de execução estiver abaixo de 50 KB ou 200 linhas`.
2. **Recalibrar Tetos**: Fixar 50 KB (alerta) / 75 KB (teto de poda) / ~25 KB (alvo pós-poda com 20 a 25 tarefas recentes).
3. **Eliminar Resíduos de 5 KB**: Corrigir `MEMORIA-ENGENHARIA-CHEFIA.md` (Linha 25), `MEMORIA-ENGENHARIA-EXECUCAO.md`, `SPEC.md`, `MEMORY-GARDENING-GUIDELINES.md` e boilerplates em todos os repositórios (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`).
4. **Atualizar Extensão VS Code**: Ajustar `gardeningManager.ts` e `localizationCatalog.ts` para os novos limites e validar `npm test`.
5. **Recibo MCP**: Emitir `completions/BATCH-049-executor-receipt.json`.

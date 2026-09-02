# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-048.md](req-048.md)
* **Status**: `APPROVED`
* **Lote Relacionado**: `BATCH-050`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-02
* **Lote Anterior Concluído**: [req-047.md](req-047.md) (`BATCH-049`)

## 🎯 Instrução Imediata para o Executor

Implementar a **REQ-048 / BATCH-050** no `conn2flow` (Core CLI), `conn2flow-ai-workspace` e repositórios satélites (`conn2flow-site`, `lumix`, `transformamp`):
1. **Comando CLI no Core (`conn2flow/cli/`)**: Criar `AiArchiveSddCommand.php` (`c2f ai:archive-sdd [--repo=PATH] [--keep=10] [--dry-run]`) para mover fisicamente os arquivos de `human-requests/` e `implementation/` que ultrapassarem os 10 ativos mais recentes para `/archive/`, reescrevendo deterministicamente todos os links de markdown correspondentes em `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md` e `CURRENT.md`.
2. **Atualização de Skills**: Atualizar `c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` em todas as pastas de toolkits (`.claude`, `.codex`, `.gemini`, `.github`, `.cursor`) com a regra dos 10 ativos na raiz.
3. **Execução da Faxina**: Rodar `./c2f ai:archive-sdd` em todos os repositórios (Core, AI Workspace, Site, Lumix, TransformaMP), garantindo que as pastas fiquem com no máximo 10 arquivos soltos e **zero links quebrados**.
4. **Validação**: Validar `php cli/c2f.php ai:sync` com 36/36 skills verdes nos 5 toolkits.
5. **Recibo MCP**: Emitir `completions/BATCH-050-executor-receipt.json`.

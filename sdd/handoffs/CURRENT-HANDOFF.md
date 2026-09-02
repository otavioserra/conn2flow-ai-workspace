# CURRENT HANDOFF — REQ-048 / BATCH-050

* **Origem**: Macro-Arquiteto
* **Destino**: Agente Executor (Claude Code / Codex)
* **Data**: 2026-09-02
* **Topologia**: `dupla` (Supervisionado)
* **Repositório Alvo**: `conn2flow` (Core em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`), `conn2flow-ai-workspace` e repositórios satélites (`conn2flow-site`, `lumix`, `transformamp`)
* **Requisição Ativa**: `sdd/human-requests/req-048.md`

---

## 🎯 Instruções Técnicas para Execução

1. **Criar o comando CLI no Core (`conn2flow/cli/`)**:
   - Criar `conn2flow/cli/src/Commands/AiArchiveSddCommand.php` com o comando `ai:archive-sdd`.
   - Adicionar o registro do comando em `conn2flow/cli/src/Application.php`.
   - Funcionalidade:
     * Recebe `--repo=PATH` (default: repo atual), `--keep=10` (default: 10) e `--dry-run`.
     * Varre `sdd/human-requests/` e `sdd/implementation/`.
     * Mantém apenas os 10 arquivos `.md` individuais mais recentes. Os demais são movidos para `archive/`.
     * Atualiza automaticamente os links markdown em `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md` e `CURRENT.md` (reescrevendo de `(file.md)` para `(archive/file.md)`).
2. **Atualização das Skills**:
   - Atualizar `c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` em `.claude/`, `.gemini/`, `.codex/`, `.github/`, `.cursor/`.
3. **Execução da Faxina**:
   - Executar `./c2f ai:archive-sdd` em todos os repositórios (`conn2flow`, `conn2flow-ai-workspace`, `conn2flow-site`, `lumix`, `transformamp`).
4. **Validação**:
   - Executar `php cli/c2f.php ai:sync` no Core.
   - Emitir recibo MCP `completions/BATCH-050-executor-receipt.json`.

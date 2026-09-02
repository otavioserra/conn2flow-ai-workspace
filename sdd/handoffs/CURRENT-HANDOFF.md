# CURRENT HANDOFF — REQ-047 / BATCH-049

* **Origem**: Macro-Arquiteto
* **Destino**: Agente Executor (Claude Code / Codex)
* **Data**: 2026-09-02
* **Topologia**: `dupla` (Supervisionado)
* **Repositório Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) e repositórios associados (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`)
* **Requisição Ativa**: `sdd/human-requests/req-047.md`

---

## 🎯 Instruções Técnicas para Execução

1. **Reformulação da Skill `sdd-memory-gardening`**:
   - Editar `.claude/skills/sdd-memory-gardening/SKILL.md`, `.gemini/skills/sdd-memory-gardening/SKILL.md`, `.codex/skills/sdd-memory-gardening/SKILL.md`, `.github/skills/sdd-memory-gardening/SKILL.md`, `.cursor/skills/sdd-memory-gardening/SKILL.md` e em `templates/{en,pt-br}/*`.
   - Remover gatilho de finalização de sessão.
   - Adicionar trava: `🚫 PROIBIDO PODAR se a memória de execução estiver abaixo de 50 KB ou 200 linhas.`
   - Atualizar tetos: 50 KB (alerta) / 75 KB (teto) / ~25 KB (alvo pós-poda).

2. **Limpeza de Governança Multirepositório**:
   - Em `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` (linha 25), substituir a menção de `5 KB / 50 linhas` pelos novos limites (50 KB / 75 KB / ~25 KB).
   - Atualizar a linha de política em `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md`, `SPEC.md`, `MEMORY-GARDENING-GUIDELINES.md` em todos os repositórios.

3. **Atualização da Extensão VS Code**:
   - Atualizar `vscode-extension/src/providers/gardeningManager.ts` e `localizationCatalog.ts`.
   - Rodar `npm test` em `vscode-extension/`.

4. **Validação**:
   - Rodar `php cli/c2f.php ai:sync` no Core.
   - Emitir recibo MCP `completions/BATCH-049-executor-receipt.json`.

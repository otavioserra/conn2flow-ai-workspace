# CURRENT HANDOFF — REQ-047 / BATCH-049

* **Origem**: Macro-Arquiteto
* **Destino**: Agente Executor (Claude Code / Codex)
* **Data**: 2026-09-02
* **Topologia**: `dupla` (Supervisionado)
* **Repositório Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) e repositórios associados (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`)
* **Requisição Ativa**: `sdd/human-requests/req-047.md`
* **Status de Execução**: `ready-for-review`

---

## 🎯 Instruções Técnicas para Execução

1. **Reformulação da Skill `sdd-memory-gardening`**:
   - Editar `.claude/skills/sdd-memory-gardening/SKILL.md`, `.gemini/skills/sdd-memory-gardening/SKILL.md`, `.codex/skills/sdd-memory-gardening/SKILL.md`, `.github/skills/sdd-memory-gardening/SKILL.md`, `.cursor/skills/sdd-memory-gardening/SKILL.md` e em `templates/{en,pt-br}/*`.
   - Remover gatilho de finalização de sessão.
   - Adicionar trava: `🚫 PROIBIDO PODAR se a memória de execução estiver abaixo de 50 KB ou 200 linhas.`
   - Atualizar tetos: 50 KB (alerta) / 75 KB (teto) / ~25 KB (alvo pós-poda).

2. **Limpeza de Governança Multirepositório**:
   - Em `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` (linha 25), substituir a politica legada pelos novos limites (50 KB / 75 KB / ~25 KB).
   - Atualizar a linha de política em `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md`, `SPEC.md`, `MEMORY-GARDENING-GUIDELINES.md` em todos os repositórios.

3. **Atualização da Extensão VS Code**:
   - Atualizar `vscode-extension/src/providers/gardeningManager.ts` e `localizationCatalog.ts`.
   - Rodar `npm test` em `vscode-extension/`.

4. **Validação**:
   - Rodar `php cli/c2f.php ai:sync` no Core.
   - Emitir recibo MCP `completions/BATCH-049-executor-receipt.json`.

---

## Resultado do Executor

- A politica, masters, templates, boilerplates e extensao foram atualizados para 50 KB / 200 linhas (alerta), 75 KB / 300 linhas (poda obrigatoria) e ~25 KB (alvo).
- `npm test` em `vscode-extension/` passou com **84/84** testes e compilacao TypeScript limpa.
- `php cli/c2f.php ai:sync` no Core validou **36/36** skills nos cinco kits.
- A skill de gardening tem SHA-256 `95741e3599fd2b060937878aa570ac12a15ad4d5581f4070b97dead81487c4dc` nos cinco repositorios alvo.
- Nenhum commit, push, deploy ou release foi executado. O lote aguarda revisao do Humano-no-Loop.

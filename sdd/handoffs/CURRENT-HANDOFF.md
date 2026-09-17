# CURRENT HANDOFF — BATCH-057 / REQ-055

* **De:** Macro-Arquiteto (Antigravity)
* **Para:** Executor Tático (Claude Code / VS Code / Codex)
* **Status:** `READY_FOR_EXECUTION`
* **Data:** 2026-09-17
* **Repositório Principal:** `conn2flow-ai-workspace` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Repositórios Satélites:** `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`

---

## 🎯 Instruções para o Executor

Implementar a requisição **`REQ-055`** detalhada em [sdd/human-requests/req-055.md](../human-requests/req-055.md):

### 1. Consolidação na Matriz Central (`conn2flow-ai-workspace`):
- Atualizar `c2f-shell-and-windows-traps/SKILL.md` adicionando a Armadilha 1 com a solução obrigatória `MSYS_NO_PATHCONV=1` para `rsync`.
- Atualizar `c2f-javascript-ajax/SKILL.md` adicionando a seção de cobertura de CSRF e 401 pelo `global.js` (incluindo `XMLHttpRequest` cru).
- Espelhar as 39 skills em `.claude/skills/`, `.gemini/skills/` e `.codex/skills/` dentro de `conn2flow-ai-workspace`.

### 2. Sincronização nos 4 Satélites (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`):
- Sincronizar as 39 skills canônicas da matriz central para as pastas `.claude/skills/`, `.gemini/skills/` e `.codex/skills/` de cada um dos 4 repositórios satélites.
- Garantir a presença das 3 skills da Tríade SDD (`c2f-architect-master`, `c2f-executor-agent`, `c2f-reviewer-agent`) em todos eles.

### 3. Validação e Handoff:
- Executar script de validação de integridade por hash (MD5) confirmando que todas as 39 skills estão 100% idênticas entre a matriz e os 4 satélites.
- Renderizar e completar a Live Todo List (`[ ]` ➔ `[x]`) em `sdd/implementation/batch-057.md`.
- Emitir o recibo em `completions/BATCH-057-executor-receipt.json`.

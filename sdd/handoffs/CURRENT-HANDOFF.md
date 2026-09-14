# CURRENT HANDOFF — BATCH-056 / REQ-054

* **De:** Macro-Arquiteto (Antigravity)
* **Para:** Executor Tático (Claude Code / VS Code / Codex)
* **Status:** `READY_FOR_EXECUTION`
* **Data:** 2026-09-14
* **Repositório Principal:** `conn2flow-ai-workspace` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Repositório Alvo de Poda:** `lumix` (`C:\Users\otavi\OneDrive\Documentos\GIT\lumix`)
* **Repositório Core:** `conn2flow` (`C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`)

---

## 🎯 Instruções para o Executor

Implementar a requisição **`REQ-054`** detalhada em [sdd/human-requests/req-054.md](../human-requests/req-054.md):

### 1. Poda de Memória SDD em `lumix` (`C:\Users\otavi\OneDrive\Documentos\GIT\lumix`):
- Abra `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` (atualmente com 52.36 KB).
- Aplique o protocolo oficial `sdd-memory-gardening`:
  * Promova decisões e padrões canônicos para `sdd/SPEC.md` ou skills locais se aplicável.
  * Compacte o histórico de lotes já homologados/concluídos em resumos de 2 a 3 linhas (*Causa raiz ➔ Solução adotada ➔ Guarda criada*).
  * Remova blocos de logs transitórios de depuração antiga (mova para `sdd/archive/` se necessário).
  * Substitua advertências obsoletas pelo marco de versão do Core que as resolveu.
  * O arquivo final deve ficar na faixa de **20 KB a 30 KB** (estritamente abaixo de 35 KB).
- Atualize `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` com pendências superadas limpas.

### 2. Empacotamento e Validação da Extensão e Release:
- Em `conn2flow-ai-workspace/vscode-extension`:
  * Execute `npm test` garantindo que todos os 114 testes passam verdes.
  * Empacote o VSIX oficial `conn2flow-tools-1.1.1.vsix` via `npm run package` ou `npx @vscode/vsce package`.
- Em `conn2flow`:
  * Confirme a integridade dos workflows de release no GitHub Actions (`gh run list`).

### 3. Registro e Finalização:
- Confirme que todos os arquivos `sdd/MEMORIA-*.md` do ecossistema estão abaixo de 50 KB.
- Renderize a Live Todo List (`[ ]` ➔ `[x]`) em `sdd/implementation/batch-056.md`.
- Emita o recibo em `completions/BATCH-056-executor-receipt.json`.

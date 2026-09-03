# CURRENT HANDOFF — REQ-051 / BATCH-053

* **Origem**: Macro-Arquiteto
* **Destino**: Agente Executor (Claude Code / Codex)
* **Data**: 2026-09-03
* **Topologia**: `dupla` (Supervisionado)
* **Repositório Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`), `conn2flow` (Core em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`) e satélites
* **Requisição Ativa**: `sdd/human-requests/req-051.md`

---

## 🎯 Instruções Técnicas para Execução

1. **Feedback Visual Contínuo & Loading na Extensão (`FEAT-008`)**:
   - Em `vscode-extension/src/releaseManager.ts`: na ação "Salvar e Executar", envolver em `vscode.window.withProgress` com notificação e barra de progresso.
   - Em `coreCommands.ts` e `projectsManager.ts`: adicionar indicação de progresso nas execuções de compilação, release e atualizações de projeto.
2. **Resiliência do Atualizador de API e Diagnóstico VM (`FEAT-011`)**:
   - Em `conn2flow/ai-workspace/en/scripts/projects/update-system.sh`: adicionar flag cURL `-k` / `--insecure` para domínios `.local` e logar o corpo do erro HTTP retornado pelo endpoint `/_api/system/update`.
   - Na extensão do VS Code: ocultar nós exclusivos de Docker em `diagnostics` quando o projeto ativo operar em VM (`deploy_mode: "ssh"`).
3. **Poda SDD de Checklists Históricos (`ARCH-006`)**:
   - Em `conn2flow`, `lumix` e `transformamp`: mover blocos de validação de lotes antigos em `VALIDATION-CHECKLIST.md` que excedam 25 itens ativos para `sdd/validation/archive/`.
4. **Integração de Documentação Ampla (`FEAT-007`)**:
   - Em `conn2flowTreeProvider.ts`: adicionar nós para os guias em `docs/pt-br/` e `docs/en/` na seção `📚 Documentações & Configurações`.
5. **Validação**:
   - `npm test` em `vscode-extension/`.
   - `php cli/c2f.php ai:sync` no Core.
   - Emitir `completions/BATCH-053-executor-receipt.json`.

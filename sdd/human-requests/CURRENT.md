# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-051.md](req-051.md)
* **Status**: `APPROVED`
* **Lote Relacionado**: `BATCH-053`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-03
* **Lote Anterior Concluído**: [req-050.md](req-050.md) (`BATCH-052`)

## 🎯 Instrução Imediata para o Executor

Implementar a **REQ-051 / BATCH-053** no `conn2flow-ai-workspace`, `conn2flow` (Core CLI) e satélites:
1. **Feedback Visual e Loading na Extensão (`FEAT-008`)**:
   - Adicionar `vscode.window.withProgress` com mensagens contextuais de status em ações longas (`releaseManager.ts` / salvar e executar, `coreCommands.ts`, `projectsManager.ts`), eliminando a sensação de tela travada.
2. **Resiliência do Atualizador de API e Adaptação VM (`FEAT-011`)**:
   - Em `update-system.sh` / `ProjectUpdateSystemCommand.php`: adicionar flag cURL `-k` / `--insecure` para domínios `.local` da VM e exibir o corpo da resposta HTTP / erro JSON da API caso a chamada falhe.
   - Na extensão do VS Code: ocultar ações exclusivas de Docker no Diagnóstico quando o projeto ativo operar em VM (`deploy_mode: "ssh"`).
3. **Poda SDD de Checklists Históricos nos Satélites (`ARCH-006`)**:
   - Podar blocos antigos em `VALIDATION-CHECKLIST.md` que excedam 25 lotes ativos para `sdd/validation/archive/` em `conn2flow`, `lumix` e `transformamp`.
4. **Integração de Documentação Ampla (`FEAT-007`)**:
   - Expor guias em `docs/pt-br/` e `docs/en/` na seção `📚 Documentações & Configurações` do Dev Tools.
5. **Validação**:
   - `npm test` em `vscode-extension/` (100% verde) e `php cli/c2f.php ai:sync` (36/36 skills).
   - Emitir `completions/BATCH-053-executor-receipt.json`.

# REGISTRO DE IMPLEMENTAÇÃO BATCH-040 / REQ-038

* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-08-31
* **Executor**: OpenAI Codex
* **Revisor**: Revisor Técnico / Humano-no-Loop
* **Repositório Alvo**: `conn2flow-ai-workspace`
* **Autonomia**: `supervisionado`

---

## Objetivo operacional

Completar a reatividade do rascunho de release, eliminar o clique silencioso da execução bloqueada e separar Topologia de Agentes do Nível de Autonomia na Visão Geral da extensão VS Code.

## Live Todo List

- [x] Ler handoff, REQ-038, CURRENT.md, governança, SPEC, memórias, índice e checklist.
- [x] Atualizar `tagMessage`, `commitMessage` e `releaseNotes` ao recalcular SemVer.
- [x] Manter o comando de execução registrado quando o gate estiver bloqueado.
- [x] Exibir motivos localizados e ações para Preparação e Controle de Código-Fonte.
- [x] Confirmar refresh da árvore após persistir o rascunho.
- [x] Separar os itens e QuickPicks de Topologia e Autonomia.
- [x] Declarar e localizar os dois novos comandos públicos.
- [x] Atualizar testes automatizados.
- [x] Executar `npm test`, empacotar e instalar o VSIX com `--force`.
- [x] Atualizar evidências e ponteiros SDD para `READY_FOR_REVIEW`.

## Resultado implementado

- O Webview acompanha a versão calculada anterior e substitui todas as menções da versão/tag antigas nos três campos editáveis, preservando o restante do texto do usuário.
- Os itens “Executar Release” mantêm os comandos de Gestor/Instalador mesmo com ícone `lock`.
- Gates bloqueados usam `showWarningMessage`, traduzem cada impeditivo e oferecem “Abrir Preparação” e “Controle de Código-Fonte”.
- A persistência do rascunho recalcula o gate do produto e dispara `onChanged?.()` imediatamente.
- A Visão Geral possui itens independentes com ícones `organization` e `shield`; cada QuickPick contém somente opções da sua categoria e os setters continuam gravando `CURRENT.md` antes do refresh.

## Evidências

- `npm run compile`: PASS, zero erros TypeScript.
- Testes focados: PASS, 20/20.
- `npm test`: PASS, 42/42.
- `git diff --check`: PASS.
- VSIX: `conn2flow-tools-1.0.0.vsix`, 61 arquivos, 153.177 bytes.
- SHA-256: `C187B544CED9EB9F572D104A38FA4F21A31868FA848891655B9B667B5BB70C50`.
- Instalação: `code --install-extension vscode-extension/conn2flow-tools-1.0.0.vsix --force` concluiu com sucesso.
- Hashes instalados de `extension.js`, `actionFormPanel.js`, `modesManager.js` e `releaseManager.js` idênticos ao build.
- Memory Gardening: 1.788 bytes / 25 linhas antes do registro, abaixo do alerta.

## Concorrência e limites

- As alterações não commitadas herdadas do BATCH-039 foram preservadas e usadas como baseline ativo.
- A pasta não rastreada `completions/` foi preservada sem alteração.
- Nenhum commit, push, deploy ou release real foi executado.

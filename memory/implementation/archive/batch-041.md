# REGISTRO DE IMPLEMENTAÇÃO BATCH-041 / REQ-039

* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-08-31
* **Executor**: OpenAI Codex
* **Revisor**: Revisor Técnico / Humano-no-Loop
* **Repositório Alvo**: `conn2flow-ai-workspace`
* **Autonomia**: `supervisionado`

---

## Objetivo operacional

Corrigir a seleção da execução do GitHub Actions após o push de release, impedindo que uma run antiga com falha para a mesma tag seja enviada ao `gh run watch` e garantindo o encerramento completo do fluxo de sucesso.

## Live Todo List

- [x] Ler handoff, REQ-039, CURRENT.md, governança, SPEC, memória, índice e checklist.
- [x] Registrar `triggeredAfter` imediatamente antes da execução do comando de release.
- [x] Consultar `databaseId,headBranch,status,conclusion,createdAt` no `gh run list`.
- [x] Ignorar runs anteriores ao disparo e runs concluídas com `failure`.
- [x] Priorizar a run ativa mais recente e aceitar imediatamente o sucesso terminal mais recente.
- [x] Preservar polling quando nenhuma run elegível estiver disponível.
- [x] Limpar o rascunho, resetar o gate, atualizar a árvore e exibir diálogo de sucesso.
- [x] Adicionar testes unitários e executar `npm test`.
- [x] Empacotar um VSIX limpo e instalá-lo localmente com `--force`.
- [x] Atualizar evidências e ponteiros SDD para `READY_FOR_REVIEW`.

## Resultado implementado

- `selectWorkflowRun()` concentra a política testável: valida ID/data/tag, aplica o corte temporal, remove falhas concluídas, ordena por `createdAt` e seleciona a run correta.
- `findWorkflowRun()` solicita todos os campos necessários e mantém até 20 tentativas enquanto o GitHub ainda não registra uma run elegível.
- `execute()` registra o instante anterior ao comando de release, pula o watch quando a run mais recente já terminou com sucesso e usa o ID selecionado quando ela ainda está ativa.
- O caminho de sucesso aguarda a remoção do rascunho, remove o gate em memória, chama o refresh da árvore e mostra uma mensagem localizada de conclusão.
- `.vscodeignore` exclui logs locais, evitando que `debug.log` seja distribuído no VSIX.

## Evidências

- Teste focal de release: PASS, 16/16.
- `npm test`: PASS, 47/47.
- `npm run compile`: PASS, zero erros TypeScript.
- `git diff --check`: PASS.
- VSIX: `conn2flow-tools-1.0.0.vsix`, 61 arquivos, 153.957 bytes.
- SHA-256: `AD7F8BCEBEBEEBD276EAD3E196C9DFF45A0316EB8E16462FAE4DBEA097C0FE46`.
- Instalação: `code --install-extension vscode-extension/conn2flow-tools-1.0.0.vsix --force` concluiu com sucesso.
- Extensão registrada: `conn2flow.conn2flow-tools@1.0.0`.
- Hashes instalados de `extension.js`, `releasePolicy.js`, `releaseManager.js` e `localizationCatalog.js` idênticos ao build.
- Memory Gardening: 2.118 bytes / 27 linhas antes do registro, abaixo do alerta.

## Revisão e limites

- Revisão findings-first concluída sem findings funcionais, regressões ou spec drift remanescentes.
- O `debug.log` local herdado foi preservado no disco e excluído apenas do pacote.
- Alterações não commitadas dos lotes anteriores e a pasta `completions/` foram preservadas.
- Nenhum commit, push, deploy ou release real foi executado.

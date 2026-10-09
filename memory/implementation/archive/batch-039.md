# REGISTRO DE IMPLEMENTAÇÃO BATCH-039 / REQ-037

* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-08-31
* **Executor**: OpenAI Codex
* **Revisor**: Revisor Técnico / Humano-no-Loop
* **Repositórios Alvo**: `conn2flow-ai-workspace` + `conn2flow`
* **Autonomia**: `supervisionado`

---

## Objetivo operacional

Reconciliar o runtime da extensão VS Code, estabilizar o ciclo de preview Markdown, separar o release em preparação e execução e tornar a documentação bilíngue um gate obrigatório antes de qualquer publicação.

## Live Todo List

- [x] Ler REQ-037, handoff, governança, SPEC, memórias, índice e checklist.
- [x] Reproduzir e diagnosticar a regressão legada de `extension.ts`.
- [x] Restaurar LocalizationManager, BacklogManager, ReleaseManager, CommandRunner, WorkspaceLocator e Workspace Trust.
- [x] Compilar o baseline reconciliado sem erros.
- [x] Remover a reabertura duplicada do preview e fechar apenas abas gerenciadas/fontes do alvo.
- [x] Cobrir MPE, fallback nativo, foco ativo e preservação de abas alheias.
- [x] Implementar Fase 1 — Preparar Release com diagnóstico e rascunho no `workspaceState`.
- [x] Implementar Fase 2 — Executar Release com gate revalidado e bloqueio por árvore suja.
- [x] Integrar inventário, integridade, versões e fingerprint da documentação pré-release.
- [x] Sincronizar README.md, README-PT-BR.md, CHANGELOG.md e workflows no Core.
- [x] Adicionar gates equivalentes aos scripts locais e aos workflows de release.
- [x] Executar `npm test`, validações de shell/documentação e review findings-first.
- [x] Gerar e conferir o pacote VSIX.
- [x] Atualizar evidências e ponteiros SDD para `READY_FOR_REVIEW`.

## Resultado implementado

- `extension.ts` foi restaurado ao baseline íntegro do BATCH-038 antes das mudanças incrementais; o registro final possui 80 comandos públicos e todos os gerenciadores esperados.
- O preview usa um lifecycle único: fecha o preview anteriormente gerenciado, abre uma única vez na coluna ativa, aguarda foco e fecha a fonte intermediária com `preserveFocus`.
- A navegação cruzada MPE/fallback nativo fecha o preview gerenciado da outra estratégia sem tocar em abas Markdown alheias.
- O painel de Release gera e persiste rascunhos editáveis, exibe branch, permissão, arquivos alterados e documentação, e oferece acesso ao Source Control.
- A execução só é liberada após revalidar Workspace Trust, permissão GitHub, branch, remote, árvore limpa, colisão de tag, workflow ocioso, arquivos obrigatórios, rascunho e fingerprint documental.
- O Core foi sincronizado para Gestor `2.9.51` e Instalador `1.5.6`; scripts e Actions agora bloqueiam versões futuras sem README/CHANGELOG/workflows atualizados.

## Evidências

- `npm run compile`: PASS, zero erros TypeScript.
- `npm test`: PASS, 38/38 testes.
- `bash -n` nos dois scripts canônicos de release: PASS.
- Gate documental local: PASS para READMEs, CHANGELOG e dois workflows.
- VSIX: `conn2flow-tools-1.0.0.vsix`, 61 entradas, 151.151 bytes.
- SHA-256 do VSIX: `C39166FF7BA29D61839C40DC4295460B27762CD86B8F451B53F832C7CC3C0D0B`.
- Conteúdo do VSIX: `extension.js`, `releaseManager.js`, `releasePolicy.js` e `markdownPreviewPolicy.js` presentes; testes ausentes do pacote.
- Memory Gardening: 1.838 bytes / 26 linhas antes do registro, abaixo do alerta.

## Review findings-first

- Finding médio corrigido: alternância do fallback nativo para MPE poderia preservar o preview nativo gerenciado.
- Finding médio corrigido: a cobertura de comandos não reconhecia comandos de execução inseridos por helper bloqueável.
- Nenhum finding crítico, alto ou médio conhecido permanece após a segunda execução de 38/38 testes.

## Concorrência e limites

- Alterações concorrentes surgidas no Core em `gestor-instalador/`, testes e `sdd/decisions/` não pertencem ao BATCH-039 e foram preservadas sem edição pelo Executor deste lote.
- Após a sincronização do baseline publicado `1.5.6`, o trabalho concorrente alterou a versão do instalador no working tree para `2.0.0`; a política retornou `README:installer-version` e manteve a Fase 2 bloqueada, como esperado, até o lote independente sincronizar seus documentos.
- Nenhum commit, push, deploy ou release real foi executado.
- O VSIX foi atualizado no workspace, mas não instalado à força em uma janela VS Code carregada.

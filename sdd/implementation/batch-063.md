# BATCH-063 — Choques das Entregas na Extensão do VS Code

* **Requisição**: [req-061.md](../human-requests/req-061.md)
* **Status**: `complete` — implementado pelo executor; revisado, corrigido e validado de ponta a ponta contra o CLI e o tenant pelo agente da req-198/199 do core (2026-09-30). Pendente: homologação visual humana no VS Code.
* **Data de Início**: 2026-09-30
* **Data de Conclusão Técnica**: 2026-09-30
* **Executor**: GitHub Copilot
* **Topologia**: Dupla (Engenheiro Chefe + Executor; revisão externa pendente)
* **Autonomia**: Supervisionado

---

## Live Todo List

- [x] Ler a REQ-061, `CURRENT.md`, normas SDD e handoff do Core.
- [x] Implementar parsing tipado do JSON de `update:conflicts`, incluindo IDs numéricos e erros `{ok:false, erro}`.
- [x] Adicionar acesso por projeto na árvore com projetos de `devProjects`.
- [x] Abrir diff no editor, expor o arquivo mesclado quando `mesclar` estiver disponível e oferecer somente as ações do CLI.
- [x] Implementar resolução via argumentos separados de `execFile`, com opção explícita `--local` para mescla.
- [x] Respeitar Workspace Trust e mensagens/localização PT-BR e EN.
- [x] Executar testes focados e a suíte completa da extensão.
- [ ] Executar interação end-to-end no VS Code para detalhar o choque, abrir o diff e resolver a decisão.

## Entregas

1. `projectConflictsPolicy.ts` valida as respostas, normaliza IDs numéricos e monta argumentos sem interpolação de shell.
2. `ProjectConflictsManager` captura o CLI por `execFile`, apresenta erros sem propagar exceções à árvore e conduz diff, mescla e resolução.
3. A seção Projetos contém uma entrada de choques para cada projeto definido em `environment.json`; catálogos e tooltips estão nos dois idiomas.
4. O pacote e os arquivos compilados `out/` foram atualizados. Nenhum arquivo do Core foi editado e nenhum VSIX foi gerado.

## Evidências e Pendências

1. `npm test` em `vscode-extension/`: compilação TypeScript limpa e **122/122 testes aprovados**, 0 falhas e 0 skips.
2. Testes focados de política, comando, catálogos e tooltips: **20/20 aprovados**.
3. `get_errors` nos arquivos alterados: sem erros. `git diff --check`: sem erros de whitespace.
4. Smoke de leitura no Core: `update:conflicts project-test --todos --json` retornou `{ok:true}` e nove registros; confirmou IDs numéricos e um choque pendente com ações `manter` e `mesclar`.
5. O comando de detalhe não foi executado: ele baixa versões para `temp/conflicts` no worktree do Core. A resolução não foi executada porque altera o tenant de teste. Assim, a interação visual e a mutação final permanecem sem evidência neste lote supervisionado.
6. Sem commit, push, deploy ou publicação; a branch local é `feat/req-061`.

## Revisão (agente da req-198/199 do core, 2026-09-30)

**Achado corrigido (médio):** `parseConflictDetails` exigia as três versões (`no-ar`, `nova`, `mesclado`). Choque de retirada (sem versão nova) e choque de registro do banco (`db:<tabela>?<chave>`, BATCH-207 do core, sem arquivo nenhum) davam "resposta inválida" e não podiam ser resolvidos pela extensão. Além disso, o PHP serializa o array vazio como `[]`, que era recusado. Correção: versões opcionais; diff quando há as duas, só a versão no ar quando é a única, direto à decisão sem arquivo; `mesclar` sai das opções sem o arquivo mesclado; `[]` aceito. Dois testes novos.

**Observação de ambiente:** a extensão chama o CLI na raiz do core localizada pelo `WorkspaceLocator` (o diretório principal `conn2flow`). Esse diretório só tem `update:conflicts`/`update:resolve` depois de `git pull` do `main` do core (hoje ele está parado por trabalho não commitado de outro agente).

**Validação:**
- `npm test`: **124/124** (compilação limpa).
- Ponta a ponta com o código compilado (`out/projectConflictsPolicy.js`) e o CLI real contra o tenant `project-test`: lista (choque 9, `sobreposto`, ações `manter`, `mesclar`) → detalhe (os três arquivos exigidos existem) → resolução `manter` (`{ok:true, resolvidos:1}`) → nova resolução recusada com a mensagem do CLI (`HTTP 422 … já resolvido`).
- A interface (árvore, diff, QuickPick) não pôde ser clicada pelo agente: fica para a homologação humana.
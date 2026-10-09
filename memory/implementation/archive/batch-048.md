# BATCH-048 — Tooltips Ricos, Curadoria de Documentações e Manual Dev Tools v2

## Estado

- **Requisição:** REQ-046
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `dupla`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Task MCP:** `task-1788286320606-vdgkd`

## Live Todo List

- [x] Criar catálogo localizado de descrições ricas para todos os nós nativos da árvore.
- [x] Renderizar tooltips como `vscode.MarkdownString` com título e descrição legíveis.
- [x] Remover `docs.marketplace` e a duplicata `agents.selectMode` de Documentação & Configurações.
- [x] Atualizar os manuais PT-BR e EN para a versão 2 da árvore, controles, releases e IA/SDD.
- [x] Criar testes de cobertura de tooltips e curadoria da árvore.
- [x] Executar `npm test` com 100% verde e gerar o VSIX local.
- [x] Registrar evidências, atualizar o handoff e emitir o recibo do executor.

## Implementação

- `treeTooltipPolicy.ts` centraliza os nós nativos que exigem tooltip e deriva a chave localizada correspondente. Isso mantém a cobertura testável sem importar o provider que depende de `vscode`.
- `Conn2FlowTreeItem` recebe sempre um `MarkdownString` não confiável. Nós regulares mostram o rótulo em negrito e a descrição localizada; releases bloqueados incluem também o bloqueador; ações customizadas usam sua descrição ou um fallback localizado.
- Os catálogos runtime `en` e `ptBR` têm paridade estrita para todos os `tooltip.*`; os dois manifestos NLS receberam as chaves de tooltip das seções.
- A árvore não exibe mais o guia interno de Marketplace ou o seletor redundante de topologia/autonomia na seção de documentação.
- Os manuais do painel nos dois idiomas descrevem a árvore v2, Controles Principais, os três níveis de autonomia, o fluxo de release em duas fases, HubTaskWatcher e as ações integradas de IA e SDD. Os guias CLI/MCP, playbook, arquitetura e catálogo vinculados pela árvore foram conferidos contra os handlers ativos.

## Evidências

1. `node scripts/generate-package-nls.cjs && npm test` em `vscode-extension/`: o gerador preservou tooltips e templates de agentes; compilação TypeScript limpa e **79/79 testes aprovados**, 0 falhas, 0 skips.
2. `test/treeTooltipPolicy.test.cjs`: todos os nós nativos declarados têm tooltip localizado detalhado em `en` e `pt-BR`; o provider usa `MarkdownString`; `docsConfig` não contém `docs.marketplace` nem `agents.selectMode`.
3. `npx @vscode/vsce package --no-dependencies`: `conn2flow-tools-1.0.0.vsix` gerado com **69 arquivos** e **168,63 KB**; o prepublish recompilou a extensão sem erros.
4. Memória de execução: **40 linhas / 4.205 bytes**, abaixo dos limites preventivos de gardening.

## Pendência para o Humano-no-Loop

- Revisar o diff e, se desejar homologação visual na IDE, instalar manualmente o VSIX gerado. Nenhum commit, push, deploy ou release foi executado neste modo supervisionado.
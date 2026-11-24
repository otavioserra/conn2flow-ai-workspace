---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../memory/backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md
  - ../../vscode-extension/src/providers/mddHubManager.ts
  - ../../vscode-extension/package.json
  - ../../vscode-extension/src/providers/conn2flowTreeProvider.ts
  - ../../vscode-extension/src/providers/sddScopeManager.ts
  - ../../vscode-extension/src/providers/projectConflictsManager.ts
  - ../../vscode-extension/src/providers/commandRunner.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
  - ../../vscode-extension/src/providers/releaseManager.ts
---


# Painel Conn2Flow Tools v1.2.0

[English](../en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md) · [Índice da documentação](README.md)

## Versão e estado da entrega

O [manifesto](../../vscode-extension/package.json) declara v1.2.0. Instale o VSIX empacotado localmente e abra **MDD Hub & Skills Control** pela barra de atividades do Conn2Flow.

## Como usar

1. Instale um VSIX compilado e abra o repositório no VS Code. Selecione o escopo do repositório e o projeto alvo nos Controles Principais.
2. Escolha idioma, topologia e autonomia. Abra CURRENT, sua requisição aprovada, SPEC e validação antes de iniciar trabalho.
3. Use Copiar Prompt do Executor ou Iniciar Claude Code (/goal) para o slice aprovado; acompanhe saída das tarefas, verificações e recibos. Preparar Revisão do Arquiteto abre o handoff e o Source Control sem commit ou push.

A execução de comandos depende de Workspace Trust quando exigido. Resolva contexto de repositório ausente ou alvo de projeto não configurado antes de operações contextuais.

## Árvore do painel

| Seção | Conteúdo |
| --- | --- |
| Controles Principais | Escopo do repositório, alvo, idioma, topologia, autonomia, HubTaskWatcher |
| MDD & Planejamento | Ponte de agentes, CURRENT, SPEC, verificações, requisições, lotes, backlog, decisões, handoffs e gardening |
| Core & Releases | Pipelines Core e preparação/execução protegidas de releases |
| Projetos & Ambiente de Testes | Alvos de projeto, atualizações, scaffolding e choques de entrega |
| Ambiente & Diagnóstico | Docker, logs, CSS e sincronização de skills |
| Documentação & Configurações | Guias e configuração |

A árvore usa progressive disclosure e persiste expansão. Tooltips nativos explicam finalidade e impacto. Controles Principais inicia expandido; as demais seções iniciam recolhidas.

## Escopo do repositório, idioma e autonomia

A descoberta de repositório prefere `memory/` e usa `sdd/` como fallback legado. Um documento ausente não cai silenciosamente na governança de outro repositório. Documentos suportam prévia, fonte ou exibição lado a lado. A navegação do backlog lê BACKLOG-INDEX e relata divergência índice/arquivo; promoção prepara contexto sem autorizar execução.

conn2flow.language suporta auto, pt-BR e en. Rótulos da interface atualizam imediatamente; os da paleta podem exigir Reload Window. O painel suporta topologia solo/dupla/tríade e escolha de workflow supervisionado/monitorado/headless. São distintos dos modos de evolução do Hub Python.

## Choques de entrega

Selecione um projeto configurado e abra seus choques de entrega. O painel lista registros de choque do CLI, abre o diff entre versão no ar/recebida quando ambos os arquivos existem e oferece somente ações retornadas pelo CLI: sobrescrever, manter ou mesclar.

Quando mesclar está disponível, abra e edite o arquivo mesclado, salve, confirme a continuação e escolha aplicação na entrega no ar ou no ambiente de teste local (--local). Choques de arquivo retirado podem mostrar somente o arquivo no ar; choques de registro de banco podem prosseguir sem arquivos. Se nenhuma ação estiver disponível, o painel alerta e não inventa resolução. JSON CLI inválido, arquivos ausentes e falhas do CLI são apresentados ao usuário.

## Tarefas, watcher e releases

Tarefas dedicadas rodam em diretório explícito e só têm sucesso com exit code 0. Operações exclusivas são protegidas contra execução concorrente. Ações remotas/destrutivas mostram formulário de revisão; ações de projeto exigem alvo válido e a verificação de confiança aplicável.

HubTaskWatcher observa tasks/*.json e completions/*.json e exibe estado de despacho/recibo; não executa trabalho enfileirado nem raspa documentação. A preparação de release Core guarda rascunho, verifica permissão GitHub e preflight, e só então habilita a fase separada de execução.

## MDD Hub & Skills Control

1. Instale o MDD Client. Configure `conn2flow.mddExecutable` com o caminho absoluto do executável se o VS Code não encontrar `mdd` no PATH.
2. Na pasta `mcp-hub/`, rode `npm ci` e `npm run build`. A aba inicia o `conn2flow-hub` TypeScript do checkout da matriz e o gerencia junto com o daemon do MDD Client.
3. Expanda **Servidores** para conferir o status e usar **Iniciar**, **Parar** ou **Reiniciar**. Expanda **Feedback de Skills** para abrir itens da inbox, incluir issues do GitHub e triar itens elegíveis com uma justificativa.

As operações de feedback usam o CLI do Client. O [guia de CLI e MCP](GUIA-RAPIDO-CLI-E-MCP.md) descreve os conectores e o [guia de empacotamento](GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md) explica a instalação do VSIX local.

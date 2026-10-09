---
verified_at: 2afd000
sources:
  - ../../vscode-extension/package.json
  - ../../vscode-extension/src/providers/conn2flowTreeProvider.ts
  - ../../vscode-extension/src/providers/sddScopeManager.ts
  - ../../vscode-extension/src/providers/projectConflictsManager.ts
  - ../../vscode-extension/src/providers/commandRunner.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
  - ../../vscode-extension/src/providers/releaseManager.ts
  - ../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md
---


# Painel Conn2Flow Dev Tools: comportamento atual e alvo v1.1.2

[English](../en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md) · [Índice da documentação](README.md)

## Versão e estado da entrega

O [manifesto da extensão](../../vscode-extension/package.json) declara atualmente **v1.1.1**. **v1.1.2** é o alvo de release na REQ-062; este guia não afirma publicação. Painel v2 é o nome do desenho da interface, não a versão do pacote da extensão. A integração dual Python prevista é ARCH-014 e permanece ICEBOX.

## Como usar

1. Instale um VSIX compilado e abra o repositório no VS Code. Selecione o escopo do repositório e o projeto alvo nos Controles Principais.
2. Escolha idioma, topologia e autonomia. Abra CURRENT, sua requisição aprovada, SPEC e validação antes de iniciar trabalho.
3. Use Copiar Prompt do Executor ou Iniciar Claude Code (/goal) para o slice aprovado; acompanhe saída das tarefas, verificações e recibos. Preparar Revisão do Arquiteto abre o handoff e o Source Control sem commit ou push.

A execução de comandos depende de Workspace Trust quando exigido. Resolva contexto de repositório ausente ou alvo de projeto não configurado antes de operações contextuais.

## Árvore do painel

| Seção | Conteúdo |
| --- | --- |
| Controles Principais | Escopo do repositório, alvo, idioma, topologia, autonomia, HubTaskWatcher |
| SDD & Planejamento | Ponte de agentes, CURRENT, SPEC, verificações, requisições, lotes, backlog, decisões, handoffs e gardening |
| Core & Releases | Pipelines Core e preparação/execução protegidas de releases |
| Projetos & Ambiente de Testes | Alvos de projeto, atualizações, scaffolding e choques de entrega |
| Ambiente & Diagnóstico | Docker, logs, CSS e sincronização de skills |
| Documentação & Configurações | Guias e configuração |

A árvore usa progressive disclosure e persiste expansão. Tooltips nativos explicam finalidade e impacto. Controles Principais inicia expandido; as demais seções iniciam recolhidas.

## Escopo do repositório, idioma e autonomia

A matriz resolve memory/. A descoberta atual dos satélites ainda procura sdd/; a frente de migração precisa atualizar e verificar cada satélite. Um documento ausente não cai silenciosamente na governança de outro repositório. Documentos suportam prévia, fonte ou exibição lado a lado. A navegação do backlog lê BACKLOG-INDEX e relata divergência índice/arquivo; promoção prepara contexto sem autorizar execução.

conn2flow.language suporta auto, pt-BR e en. Rótulos da interface atualizam imediatamente; os da paleta podem exigir Reload Window. O painel suporta topologia dupla/tríade e escolha de workflow supervisionado/monitorado/headless. São distintos dos modos previstos de evolução do Hub Python.

## Choques de entrega

Selecione um projeto configurado e abra seus choques de entrega. O painel lista registros de choque do CLI, abre o diff entre versão no ar/recebida quando ambos os arquivos existem e oferece somente ações retornadas pelo CLI: sobrescrever, manter ou mesclar.

Quando mesclar está disponível, abra e edite o arquivo mesclado, salve, confirme a continuação e escolha aplicação na entrega no ar ou no ambiente de teste local (--local). Choques de arquivo retirado podem mostrar somente o arquivo no ar; choques de registro de banco podem prosseguir sem arquivos. Se nenhuma ação estiver disponível, o painel alerta e não inventa resolução. JSON CLI inválido, arquivos ausentes e falhas do CLI são apresentados ao usuário.

## Tarefas, watcher e releases

Tarefas dedicadas rodam em diretório explícito e só têm sucesso com exit code 0. Operações exclusivas são protegidas contra execução concorrente. Ações remotas/destrutivas mostram formulário de revisão; ações de projeto exigem alvo válido e a verificação de confiança aplicável.

HubTaskWatcher observa tasks/*.json e completions/*.json e exibe estado de despacho/recibo; não executa trabalho enfileirado nem raspa documentação. A preparação de release Core guarda rascunho, verifica permissão GitHub e preflight, e só então habilita a fase separada de execução. Este lote documental não executa release.

## Integração dual prevista

| Modo previsto | Controles pretendidos | Estado |
| --- | --- | --- |
| Cliente / usuário geral | mdd init, status, sync, compact e report em qualquer projeto | Proposta ARCH-014; sem afirmar configuração mdd.mode atual |
| Desenvolvedor / Core | Status do watcher Hub, fila de scrapers, modos de evolução, aprovação e sincronização global | Depende do Hub Python e verificações de acesso |

A proposta usa subprocessos CLI ou REST/IPC local e deve degradar para funções Client quando a governança Hub estiver indisponível. São controles planejados, distintos da observação MCP atual. Leia o [guia Python](GUIA-ECOSSISTEMA-PYTHON-MDD.md) e o [guia de empacotamento](GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md) antes de presumir disponibilidade.

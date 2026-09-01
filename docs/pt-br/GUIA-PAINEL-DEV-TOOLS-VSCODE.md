# Painel Conn2Flow Dev Tools v2 — Guia Operacional

Este guia descreve o comportamento atual da extensão `conn2flow-tools`. O código em `vscode-extension/src/` é a autoridade quando houver divergência documental.

## Árvore do painel

A árvore usa divulgação progressiva e preserva o estado de expansão. **🎛️ Controles Principais** abre por padrão; as demais seções começam recolhidas. Todos os nós nativos exibem tooltip rico ao passar o mouse, com propósito, momento de uso e impacto da ação.

1. **🎛️ Controles Principais** — escopo SDD, projeto alvo, idioma, topologia, autonomia e HubTaskWatcher.
2. **📐 SDD & Planejamento** — bridge de agentes, CURRENT, SPEC, validação, requisições, lotes, backlog, decisões, handoffs e Memory Gardening.
3. **⚡ Core & Releases** — pipelines do Core e preparação/execução protegida de releases do Gestor e Gestor Instalador.
4. **📁 Projetos & Ambiente de Testes** — alvo, atualização, sincronização, scaffolding e deploy pelo fluxo configurado.
5. **🩺 Ambiente & Diagnóstico** — Docker, logs, CSS e sincronização de skills.
6. **📚 Documentação & Configurações** — Manual v2, guia CLI/MCP, playbook SDD, arquitetura e catálogo de skills. O guia de Marketplace e a seleção duplicada de topologia não aparecem nesta árvore.

## Escopo SDD e Markdown

O escopo selecionado é persistido por workspace. `Core`, `AI Workspace` e projetos satélites resolvem seus próprios diretórios `sdd/`; um documento ausente não cai silenciosamente no SDD de outro repositório.

Os modos de Markdown são `Preview Renderizado`, `Código-Fonte` e `Lado a Lado`. No preview MPE, a extensão fecha somente a fonte exata e o preview anteriormente gerenciado por ela, preservando outras abas Markdown.

O navegador de backlog lê `sdd/backlog/BACKLOG-INDEX.md`, filtra por status, abre o item original e alerta quando o status do índice diverge do arquivo. **Promover para Requisição** apenas prepara o contexto para o fluxo SDD; nunca inicia implementação automaticamente.

## Controles principais e idioma

`conn2flow.language` aceita:

- `auto`: acompanha `vscode.env.language`;
- `pt-BR`: força português do Brasil;
- `en`: força inglês.

Árvore, formulários, prompts principais e títulos da Paleta de Comandos possuem catálogos em português e inglês. Alterações na árvore são imediatas; entradas estáticas da Paleta podem exigir `Developer: Reload Window`. A distribuição de kits propaga o idioma selecionado com `-Language pt-br|en`.

## Execução segura

Comandos usam tarefas dedicadas com diretório de trabalho explícito e sucesso somente após código de saída `0`. Pipelines incompatíveis são serializados. Ações remotas ou destrutivas mostram um formulário com impacto, alvo, comando e confirmação; custom actions ficam bloqueadas em workspaces não confiáveis.

Não existe projeto alvo implícito. Ações contextuais ficam ocultas ou são bloqueadas até `devEnvironment.projectTarget` apontar para um projeto existente em `devProjects`.

## Releases do Core em duas fases

Em **Core & Releases**:

1. Execute **🔐 Verificar Permissão de Release**. A extensão valida `gh auth status` e `viewerPermission`.
2. Para `WRITE`, `MAINTAIN` ou `ADMIN`, abra **🚀 Preparar Release** do produto desejado. A fase 1 coleta diagnósticos e salva somente um rascunho editável no estado do workspace.
3. O preflight exige Core correto, Workspace Trust, árvore Git limpa, branch não destacada, remoto GitHub, workflow e arquivo de versão presentes, tag inédita e documentação pronta.
4. Quando todos os gates passam, **▶️ Executar Release** libera a fase 2. Ela usa o comando canônico `c2f manager:release` ou `c2f installer:release` e pode criar efeitos remotos.
5. **🐙 Abrir GitHub Actions** apenas navega ao workflow associado; não inicia um novo release.

Os scripts oficiais recusam árvore suja, validam tipo e modo e adicionam arquivos individualmente; staging amplo não é usado. Nenhum release é disparado automaticamente ao abrir o painel.

## Formulários multiparâmetro

Cada ação pode declarar `presentation: auto | quick | form`:

- zero campos: execução direta;
- um campo: controle nativo;
- dois campos dependentes: fluxo nativo;
- dois independentes ou três ou mais: formulário;
- release, remoto ou destrutivo: formulário obrigatório;
- `quick` e `form`: sobrescritas explícitas por ação.

O formulário é um `WebviewPanel` interno com CSP por nonce, conteúdo escapado, validação no host da extensão e nenhum recurso remoto.

## Ações integradas de IA e SDD

Em **📐 SDD & Planejamento**, **▶️ Iniciar Claude Code (/goal)**, **📋 Copiar Prompt do Executor**, **🔗 Abrir Handoff Atual** e **🔍 Preparar Revisão do Arquiteto** usam o escopo SDD e a requisição ativa para montar o contexto de trabalho. **Preparar Revisão** abre o handoff e o Controle de Código-Fonte; não cria commit nem executa push.

O **HubTaskWatcher** é controlado em **🎛️ Controles Principais**. Quando ativo, ele observa despachos e recibos do MCP Hub e apresenta o estado no painel; ele não executa tarefas por conta própria. Os prompts do executor também proíbem commit, push, deploy ou release sem autorização humana explícita.

## Guias relacionados

O **Guia Rápido CLI e MCP** descreve os comandos oficiais e a conexão do Hub. O **Playbook de Orquestração** descreve handoffs entre arquiteto, executor e revisor. A **Arquitetura de Agentes** define responsabilidades de duplo agente e tríade, e o **Catálogo de Skills** identifica as skills operacionais que devem ser lidas antes de cada tipo de trabalho.

# Painel Conn2Flow Dev Tools — Guia Operacional

Este guia descreve o comportamento atual da extensão `conn2flow-tools`. O código em `vscode-extension/src/` é a autoridade quando houver divergência documental.

## Estrutura do painel

A árvore usa divulgação progressiva e preserva o estado de expansão. **Visão Geral** abre por padrão; as demais seções começam recolhidas:

1. **Visão Geral** — escopo SDD, projeto alvo, idioma e autonomia.
2. **SDD & Planejamento** — CURRENT, SPEC, validação, requisições, lotes, backlog, decisões, handoffs e Memory Gardening.
3. **Core & Releases** — pipelines do Core e releases do Gestor e do Gestor Instalador.
4. **Projetos & Ambiente de Testes** — alvo, atualização, sincronização e deploy.
5. **Ambiente & Diagnóstico** — Docker, logs, CSS e skills.
6. **Agentes, Documentação & Configurações** — topologia, handoff supervisionado, guias e idioma.

## Escopo SDD e Markdown

O escopo selecionado é persistido por workspace. `Core`, `AI Workspace` e projetos satélites resolvem seus próprios diretórios `sdd/`; um documento ausente não cai silenciosamente no SDD de outro repositório.

Os modos de Markdown são `Preview Renderizado`, `Código-Fonte` e `Lado a Lado`. No preview MPE, a extensão fecha somente a fonte exata e o preview anteriormente gerenciado por ela, preservando outras abas Markdown.

O navegador de backlog lê `sdd/backlog/BACKLOG-INDEX.md`, filtra por status, abre o item original e alerta quando o status do índice diverge do arquivo. **Promover para Requisição** apenas prepara o contexto para o fluxo SDD; nunca inicia implementação automaticamente.

## Idioma

`conn2flow.language` aceita:

- `auto`: acompanha `vscode.env.language`;
- `pt-BR`: força português do Brasil;
- `en`: força inglês.

Árvore, formulários, prompts principais e títulos da Paleta de Comandos possuem catálogos em português e inglês. Alterações na árvore são imediatas; entradas estáticas da Paleta podem exigir `Developer: Reload Window`. A distribuição de kits propaga o idioma selecionado com `-Language pt-br|en`.

## Execução segura

Comandos usam tarefas dedicadas com diretório de trabalho explícito e sucesso somente após código de saída `0`. Pipelines incompatíveis são serializados. Ações remotas ou destrutivas mostram um formulário com impacto, alvo, comando e confirmação; custom actions ficam bloqueadas em workspaces não confiáveis.

Não existe projeto alvo implícito. Ações contextuais ficam ocultas ou são bloqueadas até `devEnvironment.projectTarget` apontar para um projeto existente em `devProjects`.

## Releases do Core

Em **Core & Releases**:

1. Execute **Verificar Permissão de Release**.
2. A extensão valida `gh auth status` e `viewerPermission`.
3. Somente `WRITE`, `MAINTAIN` ou `ADMIN` expõem **Criar Release do Gestor** e **Criar Release do Gestor Instalador**.
4. O preflight exige Core correto, Workspace Trust, árvore Git limpa, branch não destacada, remoto GitHub, workflow e arquivo de versão presentes e tag ainda inexistente.
5. Um único formulário reúne incremento, mensagens, modo, versão calculada, tag e comando oficial.
6. O comando canônico executado é `c2f manager:release` ou `c2f installer:release`.

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

## Pontes de agentes

**Preparar Revisão do Arquiteto** abre o handoff do escopo ativo e o Controle de Código-Fonte. A extensão não cria commit nem executa push. Os prompts do executor também proíbem commit, push, deploy ou release sem autorização humana explícita.

---
verified_at: 2afd000
sources:
  - ../../memory/human-requests/req-069.md
  - ../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md
  - ../../mcp-hub/src/server.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
---


# Guia do ecossistema Python MDD

[English](../en/MDD-PYTHON-ECOSYSTEM-GUIDE.md) · [Índice da documentação](README.md)

## Disponibilidade e pré-requisitos

O ecossistema Python está **aprovado para implementação**, descrito na [REQ-069](../../memory/human-requests/req-069.md). Na conferência, tools/mdd-client/ e tools/mdd-hub/ não existem neste checkout. Comandos e rotas abaixo são a interface solicitada, não instruções de instalação testadas. Este guia não afirma nome de pacote publicado, comando pip install, entrada do servidor, esquema de autenticação ou flag adicional.

O alvo é **Python 3.11+**, dois pacotes independentes com pyproject.toml e suítes pytest. O Client prevê Typer/Rich; o Hub prevê FastAPI/Uvicorn/AsyncIO. Confira --help, metadados dos pacotes e testes entregues antes de executar exemplos. Hoje, use o [guia do sincronizador de skills existente e MCP](GUIA-RAPIDO-CLI-E-MCP.md).

## MDD Client: seis comandos

| Interface solicitada | Finalidade e resultado esperado |
| --- | --- |
| mdd init [caminho] [--type software|mobile|general] | Provisionar memory/, os três arquivos de fundação, índices hierárquicos, reports/, raw/ e arquivos duais; kits opcionais de agentes foram solicitados, ainda sem flag definida |
| mdd sync | Sincronizar deterministicamente as 44 skills canônicas e regras locais a partir da matriz, preservando arquivos locais exclusivos |
| mdd compact | Auditar memória ativa, aplicar janela de 10 itens e teto de 50 KB, preservar originais, criar sínteses e atualizar índices |
| mdd status | Mostrar painel Rich no terminal com saúde da memória, arquivos próximos dos limites e conformidade |
| mdd report | Coletar métricas de atrito e logs de execução em memory/reports/; opcionalmente enviar pela API do Hub |
| mdd daemon | Vigiar memória assincronamente e emitir alertas de poda; mdd watch também foi solicitado, mas não foi verificado como alias implementado |

### Primeira sessão prevista

Após instalar o Client entregue, confira sua ajuda antes de usar esta sequência:

```sh
mdd init ./my-project --type software
# Continue a partir do diretório do projeto inicializado.
mdd status
mdd sync
```

Confirme a seleção da matriz e a preservação local antes de sincronizar. Use status para identificar trabalho elegível de retenção antes de compactar; não pode memória saudável ao fechar a sessão. Consulte a [especificação de memória](ESPECIFICACAO-FRAMEWORK-MDD.md) sobre preservação de originais e reparo de links. A interface para selecionar matriz, Hub ou agendamento do daemon deve vir do código entregue; este guia não a inventa.

## MDD Hub e API

O Hub previsto recebe relatórios do Client e consolida lições em memory/reports/. Ele é distinto do MCP Hub TypeScript implementado em mcp-hub/.

| Rota solicitada | Responsabilidade |
| --- | --- |
| POST /api/v1/reports | Ingerir relatórios do Client |
| GET /api/v1/status | Expor telemetria e status do ecossistema |

Schemas de requisição/resposta, mecanismos de persistência, controle de acesso e argumentos de inicialização Uvicorn aguardam conferência da implementação. Não substitua rotas HTTP por nomes de ferramentas MCP.

## Documentation Watcher e autoscrapers de IA

O watcher assíncrono pretende acompanhar referências oficiais de Gemini/Antigravity, Claude Code/MCP SDK, OpenAI Codex, Kimi e Cursor. Deve extrair mudanças estruturadas, como flags de CLI, ferramentas, armadilhas de shell e parâmetros, com procedência. Isso descreve o escopo solicitado de monitoramento, não afirma recursos atuais dos fornecedores.

Material detectado é conhecimento candidato. Código e política aprovada continuam autoritativos; um resultado do scraper não torna uma nova regra executável. Listas de fontes permitidas, periodicidade, deduplicação e extração devem ser documentadas pela implementação entregue.

## Três modos de evolução do Hub

| Modo | Comportamento solicitado | Saída |
| --- | --- | --- |
| headless / totalmente_autonomo | Preparar melhorias de documentação em branch Git dedicada, com commit atômico e preparação de PR | Branch de proposta rastreável; sem merge ou deploy de produção implícitos |
| monitored / autonomo_com_report | Atualizar documentação/skills e relatar imediatamente o trabalho | Relatório executivo em memory/reports/ |
| reviewer / supervisionado | Enfileirar mudanças detectadas para aprovação da Chefia de Engenharia | Inbox proposta em memory/raw/inbox/ |

São **modos de evolução do Hub**. O valor reviewer não é o papel do agente Revisor nem um modo aceito por dispatch_task no MCP Hub atual. A autonomia do workflow usa supervised/monitored/headless; o MCP usa supervised/live_autonomous/headless_autonomous. Consulte o [guia da tríade](ARQUITETURA-AGENTE-DUPLO.md).

## Daemon, validação e integração VS Code

O daemon deve oferecer observação contínua leve; um alerta não autoriza por si só edições ou transmissão externa. Relatórios evitam credenciais e conteúdo bruto desnecessário. Condições de parada e agendamento ainda precisam ser conferidos no código.

A validação solicitada na REQ-069 cobre inicialização em diretórios temporários, retenção, preservação de arquivos locais, ingestão/status da API e parsing do watcher com mocks. Este lote documental não certifica a execução desses testes Python.

A integração dual prevista no VS Code separa controles de memória do cliente da governança do Hub para desenvolvedores. ARCH-014 continua incubada; o HubTaskWatcher existente apenas observa arquivos de tarefas e recibos MCP. Consulte o [guia do painel](GUIA-PAINEL-DEV-TOOLS-VSCODE.md).

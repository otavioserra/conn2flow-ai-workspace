---
verified_at: 2afd000
sources:
  - ../../memory/human-requests/CURRENT.md
  - ../../memory/backlog/BACKLOG-INDEX.md
  - ../../vscode-extension/package.json
  - ../../mcp-hub/src/server.ts
---


# Roteiro de evolução MDD

[English](../en/FUTURE-EVOLUTION-ROADMAP.md) · [Índice da documentação](README.md)

## Fundação entregue

A matriz possui memory/, política de quatro camadas, índices hierárquicos, nós de arquivo dual e **45 skills canônicas**, incluindo c2f-ai-features. O MCP Hub TypeScript implementa execução de comandos, registros de tarefas, recibos e eventos de sessão. O painel VS Code suporta controles de topologia/autonomia, escopo de repositório, observação de tarefas e choques de entrega.

## Frentes aprovadas

| Frente | Alvo | Estado verificado |
| --- | --- | --- |
| REQ-068 / BATCH-070 | Migração MDD de sete satélites | Frente aprovada separada; este guia não afirma sua conclusão |
| REQ-069 / BATCH-071 | MDD Client e Hub Python | Aprovados; pacotes tools/ ausentes na conferência |
| REQ-070 / BATCH-072 | Docs públicas bilíngues e READMEs concisos | Escopo documental desta revisão |
| REQ-062 / BATCH-064 | Release v1.1.2 da extensão | Manifesto atual 1.1.1; sem afirmar publicação |

## Arquitetura incubada

ARCH-014 propõe acesso dual Cliente/Desenvolvedor no VS Code após os componentes Python. ARCH-013 explora memória vetorial/NoSQL para codebases maiores. Essas propostas de backlog não autorizam implementação. Não há promessa de datas ou recursos de fornecedores; acompanhe [CURRENT](../../memory/human-requests/CURRENT.md) e o [índice de backlog](../../memory/backlog/BACKLOG-INDEX.md).

## Trilha de aprendizado

Comece pela [especificação de memória](ESPECIFICACAO-FRAMEWORK-MDD.md), aprenda a [tríade](ARQUITETURA-AGENTE-DUPLO.md) e os [45 procedimentos](CATALOGO-DE-SKILLS.md), depois use o [guia CLI/MCP](GUIA-RAPIDO-CLI-E-MCP.md) e o [guia do painel](GUIA-PAINEL-DEV-TOOLS-VSCODE.md). O [guia Python](GUIA-ECOSSISTEMA-PYTHON-MDD.md) separa interfaces aprovadas de ferramentas disponíveis. Ensine especificações, consulta, evidências e revisão antes de automação sem acompanhamento.

---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../memory/backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md
  - ../../memory/human-requests/CURRENT.md
  - ../../memory/backlog/BACKLOG-INDEX.md
  - ../../vscode-extension/package.json
  - ../../mcp-hub/src/server.ts
---


# Roteiro de evolução MDD

[English](../en/FUTURE-EVOLUTION-ROADMAP.md) · [Índice da documentação](README.md)

## Fundação entregue

A matriz possui memory/, política de quatro camadas, índices hierárquicos, nós de arquivo dual e **48 skills canônicas**, incluindo c2f-ai-features. O MCP Hub TypeScript implementa execução de comandos, registros de tarefas, recibos e eventos de sessão. O painel VS Code suporta controles de topologia/autonomia, escopo de repositório, observação de tarefas e choques de entrega.

## Frentes aprovadas

| Frente | Alvo | Estado verificado |
| --- | --- | --- |
| REQ-068 / BATCH-070 | Migração MDD de sete satélites | Frente aprovada separada; este guia não afirma sua conclusão |
| REQ-069 / BATCH-071 | MDD Client e Hub Python | Disponíveis a partir do código-fonte |
| REQ-070 / BATCH-072 | Docs públicas bilíngues e READMEs concisos | Escopo documental desta revisão |
| ARCH-018 / REQ-087–091 | Personas canônicas e evolução de skills | Concluído com feedback, aprendizados, budgets e evals |
| REQ-092 / BATCH-094 | VSIX v1.2.0 | Pacote local com MDD Hub & Skills Control |

## Arquitetura incubada

ARCH-014 propõe modos mais amplos de Cliente/Desenvolvedor no VS Code. O ARCH-018 entregou controles de processos e triagem de feedback na v1.2.0. ARCH-013 explora memória vetorial/NoSQL para codebases maiores. Acompanhe as frentes aprovadas em [CURRENT](../../memory/human-requests/CURRENT.md) e no [índice de backlog](../../memory/backlog/BACKLOG-INDEX.md).

## Trilha de aprendizado

Comece pela [especificação de memória](ESPECIFICACAO-FRAMEWORK-MDD.md), aprenda a [tríade](ARQUITETURA-AGENTE-DUPLO.md) e consulte as [48 skills](CATALOGO-DE-SKILLS.md). Em seguida, use o [guia CLI/MCP](GUIA-RAPIDO-CLI-E-MCP.md), o [guia do painel](GUIA-PAINEL-DEV-TOOLS-VSCODE.md) e o [guia Python](GUIA-ECOSSISTEMA-PYTHON-MDD.md).

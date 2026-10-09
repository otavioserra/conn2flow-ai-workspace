---
verified_at: 2afd000
sources:
  - ../../memory/02-policy.md
  - ../../mcp-hub/src/server.ts
  - ../../mcp-hub/src/tools/dispatchTask.ts
  - ../../.gemini/skills/c2f-shell-and-windows-traps/SKILL.md
---


# Playbook de orquestração multiagente MDD

[English](../en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md) · [Índice da documentação](README.md)

## Prepare o slice

O humano define a necessidade. O Arquiteto lê código e memória vigentes, define contrato e aceite e prepara requisição e lote aprovados. Ideias de backlog continuam não executáveis até promoção. Use memory/human-requests/CURRENT.md e o índice pertinente nesta matriz; confira a raiz real de governança de cada satélite.

## Execute com evidências visíveis

O Executor lê CURRENT, requisição, lote e checklist; seleciona procedimentos pertinentes no **catálogo de 45 skills**; mostra Live Todo List; e implementa o menor slice aprovado. Atualize progresso após etapas relevantes, execute verificações apropriadas e registre resultados concretos e limitações.

```text
Projeto: <identificador do repositório>
Raiz: <caminho absoluto do repositório>
Requisição: <caminho da requisição aprovada>
Lote: <caminho do lote>
Autonomia: <modo aprovado>
Aceite: <verificações e resultados esperados>
Condições de parada: <conflito de escopo, acesso obrigatório ausente, falhas>
```

Este modelo de handoff funciona entre modelos sem depender de versão de fornecedor ou recurso de slash command presumidos. /goal é uma opção de workflow do cliente quando suportada; não concede permissões nem substitui aceite.

## Revise e homologue

O Revisor lê diffs e fontes autoritativas independentemente, verifica riscos pertinentes à tarefa e relata findings por gravidade com evidências de arquivo. Distinga verificações executadas das ausentes. O humano/Arquiteto homologa após revisão; nenhum agente inventa essa aprovação. A topologia dupla combina revisão com o Arquiteto; a tríade mantém o Revisor separado.

## Fila MCP e recibos

Use dispatch_task com repositório, requisição e prompt executável. Selecione supervised, live_autonomous ou headless_autonomous; a chamada grava registro de tarefa. report_completion registra success/failed e logs, correlacionando tarefa/requisição/papel quando informados. log_session_event registra marco compartilhável. Enfileirar não inicia um executor por si só; o watcher VS Code observa mudanças.

O [guia CLI/MCP](GUIA-RAPIDO-CLI-E-MCP.md) documenta entradas reais das ferramentas. O Hub Python previsto tem outro propósito: relatórios do Client e monitoramento documental, com modos de evolução headless/monitored/reviewer.

## Concorrência e higiene de memória

Separe frentes autorizadas por propriedade explícita de arquivos ou worktrees isoladas. Não rode pipelines de compilação de recursos concorrentemente. Commite apenas caminhos explícitos e confira o diff staged. Antes de remover worktrees Windows, inspecione junctions e referências; nunca force remoção de trabalho não integrado. Leia o procedimento completo na skill de shell.

Capte evidências datadas, consulte por índices e preserve originais na compactação autorizada. Respeite janelas de 10 ativos e teto de 50 KB; não pode memória saudável ao fechar sessão. Consulte o [guia de memória](ESPECIFICACAO-FRAMEWORK-MDD.md) e as [responsabilidades da tríade](ARQUITETURA-AGENTE-DUPLO.md).

---
id: "REP-016"
title: "FEAT-017 — Atritos no gate Python, no idioma da extensão e na memória MDD"
status: "ready-for-review"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-094"
batch: "BATCH-096"
summary_short: "Registra o diagnóstico da cobertura Python, do idioma do Hub e da janela de memória."
summary_medium: "Relatório FEAT-017 com evidências do gate de CI, das duas fontes de idioma da extensão e da poda autorizada do checklist."
---

# REP-016 — Relatório FEAT-017 do BATCH-096

## Contexto da rodada

[REQ-094](../human-requests/req-094.md) e [BATCH-096](../implementation/batch-096.md) na matriz conn2flow-ai-workspace, Categoria B. Entrega ao Macro-Arquiteto em topologia dupla e autonomia supervisionada.

## Dificuldades e atritos enfrentados

- O comando do CI reprovava mesmo com 193 testes verdes. O relatório de linhas faltantes concentrou a investigação em `bootstrap.py` e no formato textual da CLI.
- A árvore combinava mensagens do catálogo com códigos de estado e veredito. O callback de idioma atualizava o Explorer. O gerador NLS também falhava ao encontrar um comando existente sem entrada inglesa na sua tabela de origem.
- `mdd status --json` apontava excesso no checklist. A janela de requisições também já tinha 11 registros, e a inclusão do lote e do relatório elevava as outras duas janelas para 11. O arquivador global retornou código 1 após mover os arquivos, por detectar links históricos órfãos.

## Lacunas nas skills consultadas

`c2f-persona-executor` descreve a validação e a entrega do relatório. `c2f-mdd-indexing-and-handoffs` descreve a janela, metadados e índices. As instruções consultadas não descrevem o teste de mudança de idioma para uma árvore com catálogo de runtime e NLS de manifesto, nem como interpretar a saída de auditoria do arquivador quando as movimentações já ocorreram.

## Solução validada

A cobertura global subiu de 94,48% para 96,32%. A extensão passou em 169 testes e o VSIX 1.2.2 foi conferido. O evento de idioma repinta o Hub antes de carregar estado e registros, e os catálogos passaram na auditoria de chaves e placeholders. O dry-run selecionou os três registros, a cópia original do checklist reteve o SHA-256 e o MDD confirmou `healthy: true` após a indexação.

## Sugestões para o AI Workspace

- Acrescentar ao roteiro da extensão a troca de idioma com as duas árvores abertas e a regeneração do NLS, com o comportamento esperado dos menus estáticos do VS Code.
- Acrescentar ao roteiro de poda a comparação dos links afetados com o estado anterior e a leitura da contagem de movimentações antes de repetir um arquivamento com saída 1.

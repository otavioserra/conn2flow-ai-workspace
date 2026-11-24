---
id: "BATCH-096"
title: "Cobertura do CI, idioma do MDD Hub e saúde da memória"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-094"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Cobertura Python, atualização imediata do idioma no MDD Hub e poda do checklist ativo."
summary_medium: "Testes do bootstrap e da extensão VS Code 1.2.2. Arquivamento de validações homologadas e verificação do estado MDD."
---

# BATCH-096 — REQ-094

[Requisição](../human-requests/req-094.md) · [Checklist](../validation/VALIDATION-CHECKLIST.md#batch-096--req-094-2026-11-24) · [Relatório FEAT-017](../reports/REP-016-batch096-ci-hub-i18n-and-memory.md)

Matriz conn2flow-ai-workspace em C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace. Base local 184b142. Categoria B, topologia dupla, autonomia supervisionada.

## Live Todo List

- [x] Medir o gate Python e cobrir caminhos de bootstrap e da CLI.
- [x] Corrigir a troca de idioma do Hub, rodar os testes e gerar o VSIX 1.2.2.
- [x] Arquivar as validações homologadas, aplicar a janela de 10 e regenerar os índices MDD.
- [x] Registrar as evidências e o relatório FEAT-017.
- [ ] Revisão pelo Macro-Arquiteto e homologação visual humana no VS Code.

## Validação local

| Comando ou verificação | Resultado |
| --- | --- |
| `.\.venv-mdd\Scripts\python.exe -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95` | 211 PASS, 96,32% (gate de 95%; meta do lote de 95,5%). Linha de base: 193 PASS, 94,48%. |
| `npm.cmd run compile` e `npm.cmd test` | Compile PASS; 169 PASS, zero falhas ou skips. |
| `npx.cmd --yes --offline @vscode/vsce package --out conn2flow-tools-1.2.2.vsix` | VSIX 1.2.2 com 98 entradas e 246.636 bytes. CRC válido. Manifesto, catálogos e JavaScript alterado conferidos contra os arquivos de origem do pacote. SHA-256 `2bc9ef55cadcb4c2fbf0468c42135d49c901be3a0126ad3a3ffc3f6dfd3b33ee`. |
| `.\.venv-mdd\Scripts\python.exe -m mdd_client.cli eval --matrix .` | `EVAL-PASS`, 15/15, provedor determinístico. |
| `.\.venv-mdd\Scripts\mdd.exe status --json` | `healthy: true`, 10 requisições, 10 lotes, 10 relatórios e 10 seções de validação ativas. |

Os 18 casos adicionais cobrem diagnósticos de manifestos inválidos, precedência do catálogo, fallback, erros de pré-requisitos, detecção de stack, saída textual da CLI e instalação parcial de skills. O pytest emitiu um aviso de depreciação do alias `BlockingPortal` em Starlette. O GitHub Actions ainda aguarda execução com as alterações da matriz.

A mudança de `conn2flow.language` atualiza o título e redesenha a árvore a partir do cache antes da sondagem assíncrona. Grupos, estados, severidades e metadados reconhecidos usam o idioma selecionado. Textos dos registros e nomes técnicos conservam a grafia original. Os menus declarados no manifesto seguem o idioma de exibição do VS Code. O [VSIX](../../vscode-extension/conn2flow-tools-1.2.2.vsix) é um artefato local ignorado pelo Git.

## Regra dos 10 Ativos

- As seções homologadas de BATCH-090, BATCH-091 e BATCH-092 estão no [histórico reancorado](../validation/archive/validation-090-092.md). O [original integral](../validation/archive/original/VALIDATION-CHECKLIST-3bdd0b7f0cfa.md) foi preservado byte a byte.
- O arquivador oficial do Core (CLI de `230262177a27`, extraído para diretório temporário) confirmou a seleção em dry-run e moveu [REQ-087](../human-requests/archive/req-087.md), [BATCH-091](archive/batch-091.md) e [REP-002](../reports/archive/REP-002-req285-atualizador-choques-learnings.md). A execução reescreveu 21 links em 15 documentos e sinalizou referências históricas órfãs no levantamento global. A comparação com HEAD confirmou zero novos links relativos órfãos nos documentos alterados, excetuando as cópias originais integrais, cujos links são relativos à localização original.
- `04-memory-engineering-execution.md` preservada com SHA-256 `686e049542f8a8cd3c6465fa75a173228290b74387cc34f8ed437f19cee438da`.

## Handoff supervisionado

> Macro-Arquiteto, revise a REQ-094 / BATCH-096 na matriz conn2flow-ai-workspace, raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace. Topologia dupla, autonomia supervisionada, Categoria B. Consulte este lote, o checklist e o REP-016. Gate Python local 96,32%, extensão 169/169, eval 15/15 e MDD saudável. Valide visualmente o VSIX 1.2.2 alternando PT-BR e EN com a árvore do Hub aberta. Submeta o diff e a homologação ao humano antes da consolidação.

Execução local na matriz, sem stage, commit, push ou deploy. FEAT-015 permaneceu fora do stage.

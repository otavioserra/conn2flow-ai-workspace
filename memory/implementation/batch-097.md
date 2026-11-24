---
id: "BATCH-097"
title: "Marketplace 1.2.3, FB-008 e rollout de skills"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-095"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "VSIX 1.2.3, Armadilha 20 em PT-BR e EN e rollout isolado de 11 subskills."
summary_medium: "Overview do Marketplace, gate EVAL-016, sincronização seletiva e confirmação de origin/main nos satélites."
---

# BATCH-097 — REQ-095

[Requisição](../human-requests/req-095.md) · [Checklist](../validation/VALIDATION-CHECKLIST.md#batch-097--req-095-2026-11-24) · [FEAT-017](../reports/REP-017-batch097-marketplace-and-rollout.md)

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Topologia dupla, autonomia supervisionada e Categoria B. A REQ-095 autoriza worktrees isoladas porque as árvores principais dos satélites podem conter alterações concorrentes.

## Live Todo List

- [x] Atualizar o Marketplace, testar, empacotar o VSIX 1.2.3 e retirar os pacotes obsoletos.
- [x] Triar FB-008, atualizar as skills PT-BR e EN e validar EVAL-016.
- [x] Validar o rollout em dry-run, publicar os sete satélites e confirmar a limpeza.
- [x] Aplicar a janela de dez ativos e entregar ao Macro-Arquiteto.

## Gates locais

| Verificação | Resultado |
| --- | --- |
| `npm.cmd run compile` e `npm.cmd test` | PASS. 169/169, sem falhas ou skips. |
| VSCE direto + teste CRC com `python -m zipfile -t` | PASS. VSIX 1.2.3, 98 entradas, 246.043 bytes. SHA-256 `8e09df5a30e42aab336a6bfdd1cf49f536d598dad23499b16e339eb633fd849c`. |
| `mdd feedback triage FB-008 --verdict ACCEPT` + `mdd eval --matrix .` | TRIAGED / ACCEPT; EVAL-PASS 16/16, incluindo Armadilha 20 em PT-BR e EN. |
| Auditoria da matriz e índice de skills | PASS, 19 alvos, 48 skills, zero divergências ou drift. `OVER: 0`, `NEAR: 3`. |
| `pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95` | PASS. 211 testes, 96,32%. Aviso de depreciação conhecido em Starlette/AnyIO. |

Ao fechar esta etapa de empacotamento, a pasta continha os VSIX 1.2.3 e 1.1.7. O artefato 1.2.3 fica disponível para instalação local. A página da loja foi preparada no README em inglês.

## Rollout

O dry-run passou nos sete satélites. Cada árvore publicada contém as 11 subskills do catálogo. Dez entraram neste lote e a receita Mercado Pago já constava das sete bases. A seleção cobre FB-004, FB-007 e FB-008.

| Satélite | Base de origin/main | SHA confirmado de origin/main | Kits existentes | Worktree |
| --- | --- | --- | ---: | --- |
| conn2flow | c422ef4230a6 | ce1fb868ed510459bda0279a5b657c4d86cf3d1a | 5 | Removida |
| conn2flow-site | 2d65f7044230 | 6e79f821e0b3f0696d2b2efda41604a6e81b824f | 5 | Removida |
| lumix | 60faf3875813 | 7f3d862ed53b577609d9f00096189b8c2eb6a766 | 5 | Removida |
| transformamp | 7f891df71d63 | 171e37c7d9990b8979a4caadc844d14b6af0acef | 5 | Removida |
| conn2flow-home | Sem origin | — | — | Árvore preservada |
| website-conn2flow | 84943eaffa1e | 58d2a23cd65e87b3e8f9af190e695b7cdeafc752 | 5 | Removida |
| conn2flow-app | e8f6b9497b04 | 11efaabb077b0f25c669c17094e60caf1d7914ec | 1 | Removida |
| conn2flow-mkt | Sem origin | — | — | Árvore preservada |
| conn2flow-nexus | 9534c3207ab5 | 8a6ece88af06f565294a36f1d2a0ebd895e60ae5 | 2 | Removida |

As worktrees ficaram em %TEMP%/c2f-rollout-*/checkout. O script verificou o SHA remoto após cada fast-forward, auditou reparse points antes da remoção e confirmou zero worktrees e branches temporárias. A branch principal de trabalho em conn2flow-site avançou de 2d65f704 para 86714e68 em paralelo. O rollout operou na sua própria worktree derivada de origin/main.

O Core manteve cinco variantes via mdd sync --customize. Core e Lumix respeitaram o ignore de c2f-payment-gateways no kit .claude e mantiveram o conjunto completo em outros kits.

## Saúde e handoff

MDD saudável com 10 requisições, 10 lotes, 10 relatórios e 10 seções de validação. Arquivados REQ-088, REQ-089, BATCH-092 e REP-004, com links reancorados. A seção homologada BATCH-093 foi movida para [o histórico](../validation/archive/validation-093.md), com o checklist integral preservado. O arquivador sinalizou links históricos órfãos na auditoria global. SHA-256 de 04-memory-engineering-execution.md preservado em 686e049542f8a8cd3c6465fa75a173228290b74387cc34f8ed437f19cee438da. Matriz sem stage, commit ou push. FEAT-015 fora do stage. Nenhum deploy executado.

> Macro-Arquiteto, revise a REQ-095 / BATCH-097 na matriz conn2flow-ai-workspace, raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace. Confira este lote, o checklist, o REP-017 e o VSIX 1.2.3. Topologia dupla, autonomia supervisionada, Categoria B. A homologação humana e a consolidação da matriz seguem para revisão.

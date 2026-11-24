---
id: "REP-017"
title: "FEAT-017 — Marketplace e rollout isolado de skills"
status: "ready-for-review"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Relato da preparação do VSIX, da customização do Core e da limpeza de worktrees no Windows."
summary_medium: "Registra como a publicação seletiva tratou caminhos ignorados, pares de hashes e caminhos longos."
---

# REP-017 — Marketplace e rollout isolado de skills

## Contexto da rodada

REQ-095 / [BATCH-097](../implementation/batch-097.md), matriz conn2flow-ai-workspace e sete satélites com origin. Categoria B.

## Dificuldades e atritos

O primeiro teste da extensão tinha a versão anterior hardcoded. No primeiro dry-run, a CLI de customização rejeitou `--json`, embora já emita JSON. No Core e no Lumix, alguns arquivos rastreados também correspondem a padrões de ignore. No Transformamp, a enumeração .NET do PowerShell 5 falhou em um caminho longo e parou a limpeza de uma worktree de simulação.

## Lacunas nas skills

A persona executora, a governança multilíngue, as armadilhas de shell e a skill de indexação cobriam o fluxo e a preservação. O exemplo manual de FB-004 tratava sucessores ignorados. Arquivos rastreados sob a mesma regra de ignore e caminhos além do limite do Win32 precisaram de verificações adicionais.

## Solução validada

A asserção da extensão passou a validar o formato da versão e a correspondência dos três arquivos de release. O rollout separa staging de arquivos rastreados, novos e ignorados que precisam ser publicados. O Core mantém as cinco variantes pelo merge em três vias a partir da semente reconhecida, com nova aprovação de hashes pela CLI. O inventário do Transformamp foi refeito no PowerShell usando caminhos longos e a worktree antiga foi removida após conferir HEAD, arquivos gerados e ausência de reparse points.

## Sugestão de melhoria

Na subskill de worktrees, registrar o uso do prefixo de caminhos longos no inventário PowerShell de repositórios com caminhos extensos. A regra de FB-007 continua exigindo êxito da consulta antes da remoção.

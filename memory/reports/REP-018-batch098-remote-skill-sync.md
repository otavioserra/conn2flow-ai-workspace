---
id: "REP-018"
title: "FEAT-017 — Auto-Sync remoto de skills"
status: "ready-for-review"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Decisões e evidências de preservação das seeds, dos kits locais e do estado no Auto-Sync remoto."
summary_medium: "Descreve a adoção em cópias antigas, o intervalo do Hub e os limites do teste local do workflow GitHub."
---

# REP-018 — Auto-Sync remoto de skills

## Contexto da rodada

REQ-096 / [BATCH-098](../implementation/batch-098.md), Fase 2 do ARCH-019 na matriz conn2flow-ai-workspace. Categoria B, com implementação de CLI, extensão e template opcional de CI.

## Dificuldades e atritos

Uma skill instalada antes do registro de hashes pode conter tanto uma versão anterior da matriz quanto mudanças locais. O conteúdo divergente por si só não comprova qual versão foi usada. O teste de localização também tratava a palavra `skills` como vazamento de inglês, inclusive no título em PT-BR solicitado para o Hub. A primeira rodada do gate também encontrou um teste de migração que depende da redação do diagnóstico para junctions.

## Lacunas nas skills

A governança multilíngue e as regras de preservação cobrem variantes reconhecidas, hashes e propagação seletiva. O fluxo novo também precisa estabelecer a origem das cópias antes de reaplicar uma versão oficial. Isso afeta especialmente clones antigos e runners de CI descartáveis.

## Solução validada

O bootstrap guarda a semente das cópias oficiais verificadas. O modo remoto usa esses hashes e reporta divergências de origem desconhecida como choques. Testes cobrem CRLF, variantes reconhecidas, edição concorrente, cache não gerenciado e paths vinculados. O catálogo de localização conserva o título solicitado com uma exceção restrita para a palavra `skills` nas novas chaves. A proteção para junctions preservou o diagnóstico já usado pela migração. Gate final com 222 testes e 96,21% de cobertura.

## Sugestão de melhoria

Na próxima revisão de `c2f-multilingual-skills-governance`, documentar o fluxo de adoção em projetos antigos, a diferença entre hashes das sementes e reconhecimentos manuais e o uso do estado compartilhado em recém-clonados e CI.

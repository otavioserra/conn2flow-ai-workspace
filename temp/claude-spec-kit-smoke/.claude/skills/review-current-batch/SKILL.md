---
description: Faz review findings-first do batch atual em repositorio SDD. Use quando a implementacao ja existe e o foco agora e localizar bug, regressao, spec drift, batch drift e validacao ausente.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git diff *) Bash(git status *)
argument-hint: [foco-opcional]
---

# Review do batch atual

Revise o batch atual em modo findings-first.

## Foco padrao

1. bug funcional
2. regressao
3. spec drift
4. batch drift
5. validacao ausente

## Formato esperado

1. findings primeiro, do mais severo para o menos severo
2. perguntas ou premissas em seguida
3. resumo apenas por ultimo

## Foco adicional desta rodada

$ARGUMENTS
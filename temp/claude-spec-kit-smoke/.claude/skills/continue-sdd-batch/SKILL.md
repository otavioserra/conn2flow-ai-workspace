---
description: Retoma um batch SDD em andamento. Use quando houver delta operacional novo, mudancas humanas em specs ou batches, ou quando for preciso continuar a mesma rodada sem reiniciar a classificacao.
disable-model-invocation: true
argument-hint: [delta-operacional]
---

# Continuidade de batch SDD

Trate `$ARGUMENTS` como o delta operacional desde a ultima rodada.

## Antes de continuar

1. Releia primeiro os artefatos ou arquivos explicitamente citados no delta.
2. Releia `specs/implementation/BATCH-INDEX.md`, o batch atual e `specs/validation/VALIDATION-CHECKLIST.md`.
3. Se o delta mudar requisito, recarregue `sdd-workflow` e mova para change request antes de reescrever spec numerado.
4. Se o delta for so feedback de round, mantenha specs numerados estaveis.

## Delta atual

$ARGUMENTS
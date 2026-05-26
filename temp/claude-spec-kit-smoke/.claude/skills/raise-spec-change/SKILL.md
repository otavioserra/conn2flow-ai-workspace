---
description: Abre uma rodada de mudanca normativa em repositorio SDD. Use quando requisito, contrato, criterio de aceite ou decisao estrutural realmente precisar mudar.
disable-model-invocation: true
argument-hint: [mudanca-requisitada]
---

# Mudanca normativa

Trate `$ARGUMENTS` como um pedido de mudanca normativa.

## Procedimento

1. Carregue `sdd-workflow`.
2. Confirme o impacto na spec, decisions, implementation e validation.
3. Registre a mudanca em `specs/change-requests/` antes de consolidar no spec numerado.
4. So implemente depois que a mudanca normativa ficar explicita.

## Pedido atual

$ARGUMENTS
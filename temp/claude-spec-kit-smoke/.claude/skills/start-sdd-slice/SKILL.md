---
description: Inicia uma nova rodada em repositorio SDD. Use quando a demanda for nova, vier de specs/human-requests ou ainda nao estiver classificada entre change request, implementacao, review ou validacao.
disable-model-invocation: true
argument-hint: [demanda]
---

# Inicio de slice SDD

Trate `$ARGUMENTS` como a demanda nova a ser classificada e executada.

## Antes de agir

1. Carregue `sdd-workflow`.
2. Identifique a ancora mais concreta da tarefa: spec, batch, review, validation, decision, arquivo de codigo ou `specs/human-requests/`.
3. Leia o contexto minimo inicial: `specs/README.md`, `specs/process/00-START-HERE.md`, `specs/process/01-WORKFLOW.md`, `specs/implementation/BATCH-INDEX.md`, o batch atual, `specs/validation/VALIDATION-CHECKLIST.md` e `specs/decisions/DECISION-LOG.md`.
4. Se a entrada vier de `specs/human-requests/`, leia primeiro esse intake.

## Regra de execucao

1. Classifique cedo: change request, implementacao, review ou validacao.
2. Edite specs numerados apenas quando requisito, contrato, aceite ou decisao realmente mudar.
3. Implemente o menor slice aprovado.
4. Valide cedo com a menor checagem capaz de falsificar o batch atual.

## Demanda atual

$ARGUMENTS
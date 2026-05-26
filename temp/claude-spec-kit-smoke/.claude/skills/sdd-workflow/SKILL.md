---
name: sdd-workflow
description: Use quando o repositorio seguir Spec-Driven Development e a tarefa tocar specs numerados, batches, reviews, validation, decisions ou change requests.
user-invocable: false
---

# SDD workflow

Use esta skill quando o projeto for guiado por specs versionados.

## Leitura minima inicial

Comece por `specs/README.md`, `specs/process/00-START-HERE.md`, `specs/process/01-WORKFLOW.md`, `specs/implementation/BATCH-INDEX.md`, o batch atual, `specs/validation/VALIDATION-CHECKLIST.md` e `specs/decisions/DECISION-LOG.md`.

Se a tarefa apontar para `specs/human-requests/*.md` ou para a pasta `specs/human-requests/`, leia primeiro esse intake humano. Quando vier apenas a pasta, use a seguinte ordem deterministica:

1. `CURRENT.md`
2. `README.md`
3. o arquivo `.md` mais recente

## Classificacao da demanda

1. Mudanca de requisito ou contrato:
   - registre em `specs/change-requests/`
   - avalie impacto nos specs numerados, decisions, batches e validation
2. Feedback de review sem mudanca normativa:
   - registre em `specs/reviews/`
   - mantenha os specs numerados estaveis
3. Implementacao incremental:
   - confira o batch atual em `specs/implementation/`
   - implemente o menor slice aprovado
   - valide e atualize `specs/validation/` quando necessario
4. Validacao ou spec drift check:
   - comece pela menor checagem automatizada
   - registre evidencia e pendencias nos artefatos certos

## Regras de ouro

- Os specs numerados sao a fonte normativa.
- `specs/human-requests/` nunca e fonte normativa; ele so alimenta change requests, reviews, batches, decisions ou validacao.
- Nao reescreva os specs numerados para comentarios pequenos de review.
- Nao abra o proximo batch antes de o atual estar estavel e revisavel.
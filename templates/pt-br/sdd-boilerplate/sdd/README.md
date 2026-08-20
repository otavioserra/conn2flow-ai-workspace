# Governança SDD de [NOME-DO-PROJETO]

Este diretório define a governança local de Spec-Driven Development do projeto.

## Ordem normativa mínima

1. `sdd/README.md`
2. `sdd/00-baseline-architecture.md`
3. `sdd/SPEC.md`
4. `sdd/process/00-START-HERE.md`
5. `sdd/process/01-WORKFLOW.md`
6. `sdd/implementation/BATCH-INDEX.md`
7. `sdd/validation/VALIDATION-CHECKLIST.md`
8. `sdd/decisions/DECISION-LOG.md`

## Regras de ouro

- `sdd/human-requests/` é intake humano não normativo.
- O executor pode atualizar artefatos operacionais como `implementation/` e `validation/`.
- Mudanças normativas devem ser consolidadas em `SPEC.md`, no baseline ou em outros SDD numerados só quando o requisito realmente mudar.
- Cada rodada deve perseguir o menor batch plausível e a menor validação capaz de falsificar o slice atual.

## Estado inicial

- `BATCH-000`: boilerplate SDD instalado.
- `BATCH-001`: primeiro batch funcional aguardando classificação.
- Ponteiro ativo: `sdd/human-requests/CURRENT.md`.
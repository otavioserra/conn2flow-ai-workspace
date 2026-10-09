# 01 Workflow

## Objetivo

Criar um ciclo previsível entre intake humano, batch, código, validação e revisão.

## Fluxo recomendado

1. Ler o intake ativo.
2. Classificar a demanda.
3. Abrir ou continuar o batch certo.
4. Implementar o menor slice aprovado.
5. Validar localmente.
6. Registrar evidências e pendências.

## Fronteiras de edição

- Normativo: `SPEC.md`, baseline, decisões e demais SDD numerados.
- Operacional: `implementation/` e `validation/`.

## Regras

- Não reescreva o normativo por feedback pequeno de review.
- Não abra um novo batch antes de estabilizar o atual.
- Se houver mudança real de requisito, registre isso explicitamente antes de ampliar a implementação.
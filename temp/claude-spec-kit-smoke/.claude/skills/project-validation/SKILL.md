---
name: project-validation
description: Use quando a tarefa exigir validacao local do slice atual em repositorio SDD. Ajuda a escolher a menor checagem executavel antes de ampliar escopo.
user-invocable: false
---

# Validacao do projeto

Use esta skill quando a tarefa exigir validacao do batch atual.

## Procedimento

1. Comece pela menor checagem capaz de falsificar o slice atual.
2. Prefira validacao alinhada ao batch e ao checklist de validation antes de rodar suites maiores.
3. Registre evidencia e pendencias no artefato certo.
4. Se o repositorio tiver comandos especificos de teste, lint, build ou Docker, ajuste esta skill para o projeto real.
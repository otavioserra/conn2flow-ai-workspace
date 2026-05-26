---
paths:
  - "gestor/**/*.php"
---

# PHP do gestor

- Preserve os padrões já existentes do Conn2Flow no `gestor`.
- Evite refatorações amplas sem necessidade quando a demanda for localizada.
- Confirme sintaxe e correspondência de campo ao reutilizar snippets de `gestor`, `db`, `javascript/ajax` ou `models`.
- Quando a tarefa for estrutural em módulo do gestor, carregue a skill `gestor-module-integration` antes da primeira edição substantiva.
- Valide no menor escopo possível logo após a primeira mudança estrutural.
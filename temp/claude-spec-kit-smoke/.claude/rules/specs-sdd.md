---
paths:
  - "specs/**/*.md"
---

# Regras de artefatos SDD

- Os specs numerados sao a fonte normativa.
- Trate `specs/human-requests/` apenas como intake humano nao normativo; qualquer consolidacao deve ir para `change-requests/`, `reviews/`, `implementation/`, `validation/`, `decisions/` ou specs numerados quando aprovado.
- Use `specs/change-requests/` para mudanca de requisito, `specs/reviews/` para feedback de round, `specs/implementation/` para batches, `specs/validation/` para evidencias e `specs/decisions/` para racional.
- Nao reescreva os specs numerados para comentarios de review que nao mudam o requisito.
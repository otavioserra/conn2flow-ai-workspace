---
name: 'Spec-Driven SDD'
description: 'Use ao editar sdd, reviews, batches, decisions, validation ou change requests em repositórios SDD.'
applyTo: 'sdd/**/*.md'
---

- Os sdd numerados são a fonte normativa.
- Trate `sdd/human-requests/` apenas como intake humano não normativo; qualquer consolidação deve ir para `change-requests/`, `reviews/`, `implementation/`, `validation/`, `decisions/` ou sdd numerados quando aprovado.
- Use `sdd/change-requests/` para mudança de requisito, `sdd/reviews/` para feedback de round, `sdd/implementation/` para batches, `sdd/validation/` para evidências e `sdd/decisions/` para racional.
- Não reescreva os sdd numerados para comentários de review que não mudam o requisito.
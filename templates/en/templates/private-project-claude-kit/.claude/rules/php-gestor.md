---
paths:
  - "gestor/**/*.php"
---

# Gestor PHP

- Preserve the existing Conn2Flow patterns in `gestor`.
- Avoid broad refactors without need when the request is localized.
- Confirm syntax and field correspondence when reusing snippets from `gestor`, `db`, `javascript/ajax`, or `models`.
- When the task is structural inside a gestor module, load the `gestor-module-integration` skill before the first substantive edit.
- Validate in the smallest possible scope right after the first structural change.
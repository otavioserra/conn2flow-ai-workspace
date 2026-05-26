---
name: 'Conn2Flow PHP Gestor'
description: 'Use when editing gestor PHP files in Conn2Flow private projects, especially modules in gestor/modulos with their own structural contract.'
applyTo: 'gestor/**/*.php'
---

- Preserve naming, database helpers, template conventions, and the existing Conn2Flow style.
- Prefer focused edits near the controller, module, or file that actually decides the behavior.
- When creating or refactoring a module in `gestor/modulos/**`, do not deliver only business functions; confirm bootstrap, JSON, dispatch, and interface/AJAX closure.
- When working on a new module or a structural module refactor, use the skill [gestor-module-integration](../skills/gestor-module-integration/SKILL.md).
- Avoid copying snippet examples without checking syntax, `isset($_REQUEST[...])`, `;` terminators, and correspondence between `ajaxOpcao` and `$_GESTOR['ajax-opcao']`.
- If a private override solves it, keep the change in the private repository instead of pushing it to `conn2flow`.
- After the first substantive edit, run the smallest validation capable of falsifying the change before expanding scope.
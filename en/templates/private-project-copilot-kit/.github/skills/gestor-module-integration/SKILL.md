---
name: gestor-module-integration
description: 'Use when creating, fixing, reviewing, or refactoring gestor modules in Conn2Flow private projects. Especially when there is risk of forgetting modulo-id, JSON, the *_start() function, final autorun, switch($_GESTOR["opcao"]), switch($_GESTOR["ajax-opcao"]), resources, hooks, API, or widget integration.'
user-invocable: false
---

# Gestor module integration

Use this skill when the task is not only an isolated business rule, but a structural adjustment in a gestor module.

## When to use

- create a new module in `gestor/modulos/`
- fix a module that responds only partially at runtime
- refactor a module with risk of breaking bootstrap, interface, or AJAX
- review a module diff that looks functional in the file, but incomplete inside gestor

## Procedure

1. Reread the [minimum readings](./references/leituras-minimas.md) before the first edit.
2. Confirm the structural contract using the [integration checklist](./references/checklist-integracao.md).
3. If the task touches a hook, API, or widget, include those layers in the reading and diff instead of concluding from the main PHP file alone.
4. Choose one simple module and one richer module as references before copying patterns.
5. After the first substantive edit, validate in the smallest scope capable of falsifying the integration.
6. If structural doubt remains, reread the Conn2Flow core flow that includes the module and closes interface/AJAX before expanding the diff.

## Common snippet mistakes

When reviewing or generating code for gestor modules, watch for errors that frequently appear in `gestor`, `db`, `javascript/ajax`, and `models` snippets:

- do not use `$_REQUEST[$post_nome]` without `isset()` or `empty()`, to avoid PHP warnings and notices
- confirm whether the database call is the correct function (`banco_select`, `banco_update`, etc.) and valid in the current environment
- verify that PHP strings end with `;` and that template code has correct tag delimiters `<!-- cel < -->` and `<!-- cel > -->`
- for AJAX, confirm that the frontend sends `ajaxOpcao` and that the backend handles `$_GESTOR['ajax-opcao']` in the matching switch
- when using model helpers, verify that `modelo_var_troca`, `modelo_var_troca_tudo`, `modelo_tag_val`, `modelo_tag_troca_val`, `modelo_var_in`, and `modelo_tag_del` are used consistently

## What this skill prevents

- a module with business functions but no `*_start()`
- a normal branch without `interface_iniciar()` and `interface_finalizar()`
- an AJAX branch without `interface_ajax_iniciar()` and `interface_ajax_finalizar()`
- JSON, pages, or variables inconsistent with the PHP and HTML
- forgotten hooks, API, or widget pieces when the module depends on them

## Additional human reference

- [practical integration guide](../../../docs/gestor-modulos-integracao-pratica.md)
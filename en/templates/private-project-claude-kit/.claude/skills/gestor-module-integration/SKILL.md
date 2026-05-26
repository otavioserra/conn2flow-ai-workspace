---
name: gestor-module-integration
description: Use when creating, fixing, reviewing, or refactoring gestor modules in Conn2Flow private projects. Especially when there is risk of forgetting modulo-id, JSON, the *_start() function, final autorun, switch($_GESTOR["opcao"]), switch($_GESTOR["ajax-opcao"]), resources, hooks, API, or widget integration.
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

1. Reread one simple module and one richer module as references before the first edit.
2. Confirm the module's structural contract: bootstrap, JSON, resources, pages, variables, hook, API, widget, and the `*_start()` function when applicable.
3. If the task touches a hook, API, or widget, include those layers in the reading and diff instead of concluding from the main PHP file alone.
4. After the first substantive edit, validate in the smallest scope capable of falsifying the integration.
5. If structural doubt remains, reread the Conn2Flow core flow that includes the module and closes interface or AJAX before expanding the diff.

## Common snippet mistakes

- do not use `$_REQUEST[$post_nome]` without `isset()` or `empty()`
- confirm that the database call is the correct function (`banco_select`, `banco_update`, etc.)
- confirm PHP strings with `;` and templates with correct tags
- for AJAX, confirm sending `ajaxOpcao` and handling it in `$_GESTOR['ajax-opcao']`
- when using model helpers, verify consistency of `modelo_var_troca`, `modelo_var_troca_tudo`, `modelo_tag_val`, `modelo_tag_troca_val`, `modelo_var_in`, and `modelo_tag_del`

## What this skill prevents

- a module with business functions but no `*_start()`
- a normal branch without `interface_iniciar()` and `interface_finalizar()`
- an AJAX branch without `interface_ajax_iniciar()` and `interface_ajax_finalizar()`
- JSON, pages, or variables inconsistent with the PHP and HTML
- forgotten hooks, API, or widget pieces when the module depends on them
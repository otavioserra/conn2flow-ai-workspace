# Practical gestor module integration

## The classic mistake

The module can look ready in the diff and still remain disconnected from gestor runtime. That happens when the business rule exists, but the module's structural contract does not close the full loop.

## Minimum checklist

- folder, main PHP file, and JSON use the same logical module id
- the PHP sets `$_GESTOR['modulo-id']` and loads the matching JSON
- a `*_start()` function exists and is called at the end of the file
- the normal flow calls `interface_iniciar()` and `interface_finalizar()`
- the AJAX flow calls `interface_ajax_iniciar()` and `interface_ajax_finalizar()`
- `switch($_GESTOR['opcao'])` covers the module's real navigation
- `switch($_GESTOR['ajax-opcao'])` covers the frontend's real AJAX entries
- `pages`, `variables`, and other JSON resources cover the required screens
- hook, API, or widget was declared when the module depends on it

## Practical rule

When creating or adjusting a module, do not ask only to copy a similar module. Ask for the full module integration: bootstrap, JSON, `*_start()`, dispatch, resources, hook, API, widget, and minimum validation right after the first structural edit.
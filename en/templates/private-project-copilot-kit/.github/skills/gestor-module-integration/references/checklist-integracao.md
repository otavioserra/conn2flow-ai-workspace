# Module integration checklist

Use this list before finishing any new module or structural refactor.

## Minimum contract

- folder, main PHP file, and JSON use the same logical id
- `$_GESTOR['modulo-id']` is defined at the top
- `$_GESTOR['modulo#'.$id]` loads the correct JSON
- required pages, variables, layouts, and components exist in resources

## Cycle closure

- a `*_start()` function exists
- the `*_start()` function is called at the end of the file
- the normal branch calls `interface_iniciar()` and `interface_finalizar()`
- the AJAX branch calls `interface_ajax_iniciar()` and `interface_ajax_finalizar()` when AJAX endpoints exist

## Dispatch

- `switch($_GESTOR['opcao'])` covers the real navigation of the module
- `switch($_GESTOR['ajax-opcao'])` covers the frontend's real AJAX calls
- the implementation did not leave relevant functions without any entry point

## Extra layers

- hooks declared in JSON and implemented in the matching file
- API declared and connected when the module exposes endpoints
- widget declared and implemented when the module renders on pages

## Signs of a disconnected module

- the screen opens, but the module does not close the listing or form cycle
- there is callback or AJAX in the frontend without a matching case in the switch
- the HTML depends on variables or resources missing from JSON
- the diff looks large, but runtime behavior remains partial
# Minimum reading before editing a gestor module

## Always reread

- the main PHP file of the target module
- the main JSON file of the target module
- the pages and variables resources that the screen really consumes

## Reread internal references before copying a pattern

- a simple module of the same kind
- a richer module with AJAX, callback, hooks, or API

Good recurring references in this repository:

- a simple module from the project itself
- a richer module from the project itself
- if needed, a mature module in the base `conn2flow` repository or in another private repository from the ecosystem

## If the task is structural

- confirm how the Conn2Flow core includes the module and closes the interface/AJAX cycle
- check whether there is a hook, API, widget, or resource dependency that does not appear in the main PHP file

## Practical rule

Do not copy only the business core of another module. Copy the structural cycle that gestor expects and adapt only what is truly specific to the target module.
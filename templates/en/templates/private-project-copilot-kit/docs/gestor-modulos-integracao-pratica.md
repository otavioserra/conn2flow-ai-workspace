# Practical gestor module integration

## The classic mistake

A module can be technically "done" and still remain disconnected from gestor. That happens when the agent delivers business functions but does not close the integration cycle that makes gestor actually load, route, render, and answer AJAX for that module.

In other words: copying the CRUD from another module is not enough if bootstrap, dispatch, and declarative contracts do not come together.

## The complete integration cycle

### 1. Declarative module contract

The module needs a JSON file coherent with the folder name and the main file name. That contract holds at least:

- required libraries
- main table and keys
- resources for pages, variables, layouts, and components
- optional hooks
- module-specific metadata

If the JSON is incomplete or inconsistent, the PHP may still run, but the module remains without part of the infrastructure that gestor expects.

### 2. Resources and pages

Gestor resolves HTML, CSS, and other assets from the page data and the module's resources. When you create or change module pages, you need to treat that as part of the integration, not as a cosmetic detail.

In practice, that means:

- keep pages and resources aligned
- keep module variables coherent with what the HTML and PHP consume
- synchronize resource data when the module architecture changes

### 3. Bootstrap in the module main file

At the top of the main file, the module needs to present itself to gestor. The structural minimum is usually:

- define `$_GESTOR['modulo-id']`
- load the JSON into `$_GESTOR['modulo#'.$id]`
- ensure that folder names, PHP file, JSON file, public ids, and paths agree with each other

If that bootstrap is wrong, the rest of the file may exist, but it will operate on top of broken context.

### 4. Start function at the end of the module

This is the point most often missing when someone asks "create it like module X" and the agent delivers only the core functions.

The start function usually needs to close two flows:

- AJAX flow
- normal interface flow

The mental skeleton is this:

```php
function modulo_start(){
    if($_GESTOR['ajax']){
        interface_ajax_iniciar();
        // ajax-opcao switch
        interface_ajax_finalizar();
    } else {
        // translations, js vars, standard interfaces
        interface_iniciar();
        // opcao switch
        interface_finalizar();
    }
}

modulo_start();
```

If the module does not call the start function at the end, or if the switch does not dispatch to the right functions, the user experience is exactly this: "the file is there, but gestor does not integrate it."

### 5. Interface routing

For the normal interface, the module needs to dispatch options such as list, add, edit, clone, status, delete, or callback, depending on the case.

It also needs to prepare the interface that the core expects, for example:

- standard listing interfaces
- form definition in add or edit flows
- correct use of `interface_iniciar` and `interface_finalizar`
- use of `$_GESTOR['modulo-registro-id']` when the operation depends on a record

Creating the add or edit function without registering that dispatch does not integrate the module. It only creates dead or incomplete code.

### 6. AJAX routing

If the module has AJAX endpoints, they also need to enter the full cycle:

- `interface_ajax_iniciar`
- `switch($_GESTOR['ajax-opcao'])`
- writing to `$_GESTOR['ajax-json']` or equivalent response
- `interface_ajax_finalizar`

The recurring error here is to create valid AJAX functions that never get connected to the `ajax-opcao` switch.

### 7. Hooks, API, and widget are extra layers

Depending on the module, integration may also require:

- a `.hooks.php` file and matching declaration in JSON
- an API hook for `/_api/{modulo}/{action}`
- a `.widget.php` file for rendering in pages
- module assets

These layers are optional, but when the module depends on them, they are also part of the structural integration.

## Checklist for a truly integrated module

- folder, main PHP file, and JSON use the same logical module id
- the PHP defines `$_GESTOR['modulo-id']` and loads `$_GESTOR['modulo#...']`
- a start function exists and is called at the end of the file
- the normal flow calls `interface_iniciar` and `interface_finalizar`
- the AJAX flow calls `interface_ajax_iniciar` and `interface_ajax_finalizar`
- `switch($_GESTOR['opcao'])` contains every entry the module navigation needs
- `switch($_GESTOR['ajax-opcao'])` contains every real AJAX entry from the frontend
- pages, variables, and other JSON resources cover the required screens
- hooks, API, or widget are declared when the module depends on them
- resources were synchronized and validation was run after integration

## Signs that the module is disconnected

- there is an add, edit, or callback function, but nothing calls it
- there is AJAX in the frontend, but no matching case in `ajax-opcao`
- the module depends on variables or resources missing from JSON
- the screen opens, but the interface does not render as a gestor module
- the agent created the business rule, but forgot start, standard interfaces, or resources
- the module answers in part of navigation, but does not close the listing, form, and callback cycle

## How to ask Copilot for this the right way

When creating or adjusting a module, do not ask only to "copy module X". Ask for full integration as an explicit requirement.

Better prompt example:

```md
I want to create gestor module Y following the pattern of module X.

Do not copy only the business functions. Deliver the full module integration:

- bootstrap with modulo-id and JSON
- start function at the end of the file
- `$_GESTOR['opcao']` switch
- `$_GESTOR['ajax-opcao']` switch if there is AJAX
- standard interfaces and the `interface_iniciar/interface_finalizar` cycle
- required resources and variables in JSON
- hooks, API, or widget if the module depends on them

Before editing, reread one simple module and one richer reference module.
After the first substantive edit, validate in the smallest scope possible.
```

That request completely changes the kind of delivery. It forces the agent to treat the module as a gestor module, not as an isolated PHP file.

## When this becomes a skill

Yes, this problem is a good candidate for a skill once it starts repeating.

Turn it into a skill when:

- you create or refactor gestor modules frequently
- the same structural mistake comes back in multiple modules
- the agent gets the business rule right but gets gestor bootstrap wrong

What such a skill should force:

- read one simple reference module
- read one richer module with AJAX, callback, or hooks
- reread the module JSON
- reread the part of the core that includes the module and closes interface/AJAX
- use an integration checklist before finishing

## Final rule

In gestor, a functional module is not just a "file with functions". A functional module is a declarative contract, bootstrap, dispatch, interface, AJAX, and resources closing the same cycle. If one of those layers is left out, the module looks ready in the diff but remains incomplete at runtime.
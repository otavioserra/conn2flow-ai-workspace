---
name: c2f-global-variables
description: "READ BEFORE accessing or modifying $_GESTOR, $_CONFIG, $_BANCO or $_ENV. Prevents routing-state overwrites, session-data violations and corrupted AJAX JSON envelopes."
user-invocable: false
---

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Access, modify or register data in the central superglobals of the Conn2Flow (`$_GESTOR`, `$_CONFIG`, `$_BANCO`, `$_ENV`).
- **SKIP ONLY IF**: Pure functions that receive all parameters by argument without using global state.
- **CONSEQUENCE OF IGNORING**: Key Collision in the global array, AJAX response corruption (`$_GESTOR['ajax-resposta']`), or deviation in the routing stream of pages and modules.

---

﻿---
name: c2f-global-variables
description: "Use when consulting, accessing or modifying Conn2Flow Superglobals: $_GESTOR (runtime), $_CONFIG (central configuration), $_BANCO (DB connection) and $_ENV (environment)."
user-invocable: false
---

# Conn2Flow Superglobals (`$_GESTOR`, `$_CONFIG`, `$_BANCO`, `$_ENV`)

See and apply the following conventions when accessing or defining properties in the Conn2Flow superglobals.

## 1. `$_GESTOR` — Dynamic Runtime Status

Associative array populated during bootstrap (`gestor/config.php`). It contains the volatile state of the current request.

### 1.1. Routement and Module
* `$_GESTOR['modulo-id']`: Module identifier in execution (e.g. `admin-paginas`, `produtos`).
* `$_GESTOR['opcao']`: Active or sub-routine (e.g. `adicionar`, `editar`, `listar`, `status`).
* `$_GESTOR['tipo']`: Secondary classification of the route (e.g. `banco`, `pagina`, `parametros`).
* `$_GESTOR['pagina']`: String containing the processed HTML of the page that will be delivered in the layout.

### 1.2. Paths and Directions
* `$_GESTOR['raiz']`: Base URL / root installation domain with end bar (e.g. `https://meusite.com/`).
* `$_GESTOR['ROOT_PATH']`: Absolute path from file system to server root.
* `$_GESTOR['modulos-path']`: Absolute path to the module folder.
* `$_GESTOR['logs-path']`: Path to recording §'s log files.
* `$_GESTOR['linguagem-codigo']`: Active language code (e.g. `pt-br`, `en`).

### 1.3. AJAX and JSON Answers
* `$_GESTOR['ajax-json']`: Associative array returned to the client in AJAX requests (`status => 'Ok'`, `data => [...]`, `erro => ...`).
* `$_GESTOR['ajax-opcao']`: AJAX Action Identifier received from frontend.
* `$_GESTOR['json']`: Boolean Flag indicating whether the result of the request will be delivered exclusively in JSON format.

### 1.4. State of the User and Session
* `$_GESTOR['usuario-id']`: Numerical user ID authenticated in the current session.
* `$_GESTOR['usuario-nome']`: Displayed name of authenticated user.

---

## 2. `$_CONFIG` â€» System Central Settings

Array populated by `gestor/config.php` from `$_ENV` and standard values. Contains configuration Persistent §μes that do not change between requests.

* **Sessions and Cookies**: `$_CONFIG['session_lifetime']`, `$_CONFIG['cookie_secure']`, `$_CONFIG['cookie_httponly']`
* **CSP/CORS Insurance**: `$_CONFIG['csp_policy']`, `$_CONFIG['cors_origins']`
* **OAuth and Authentication**: `$_CONFIG['oauth_google_client_id']`, `$_CONFIG['oauth_google_secret']`
* **Email/SMTP**: `$_CONFIG['smtp_host']`, `$_CONFIG['smtp_port']`, `$_CONFIG['smtp_user']`, `$_CONFIG['smtp_pass']`
* **Payments**: `$_CONFIG['paypal_client_id']`, `$_CONFIG['stripe_key']`

---

## 3. `$_BANCO` — Connection Settings with Database

* `$_BANCO['host']`: MySQL server host.
* `$_BANCO['nome']`: Name of database.
* `$_BANCO['usuario']`: Connection user.
* `$_BANCO['senha']`: Connection password.
* `$_BANCO['tipo']`: Driver type (`mysql`, `pgsql`).

---

## 4. `$_ENV` â€» Environment Variables (Dotenv)

Automatically loaded by `Dotenv` from `gestor/autenticacoes/<dominio>/.env`.

> [!IMPORTANT]
> **New Environmental Variables Protocol**: All new sensitive key MUST be registered in the `gestor/autenticacoes.exemplo/dominio/.env` template to ensure automatic merge in the deploy/update. See skill `c2f-environment-configuration` for full flow.

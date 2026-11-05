---
name: c2f-javascript-ajax
description: "MANDATORY READ before AJAX calls, fetch requests, multipart uploads or Gestor AJAX backend handlers. Prevents CSRF 403 errors, invalid JSON envelopes and stuck interfaces."
user-invocable: false
---

# Governance and Integration Architecture AJAX in Gestor Conn2Flow

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Write, edit or migrate frontend JavaScript code (Vanilla Fetch, jQuery) or backend PHP endpoints that perform asynchronous communication (AJAX) in Gestor modules.
- **SKIP ONLY IF**: Pure local visual utility Scripts (e.g. simple CSS animations without network calls).
- **CONSEQUENCE OF IGNORING**: 403 Forbidden Errors (Token CSRF invalid or missing) for not activating core AJAX mode, broken JSON envelopes, dimmer/spinner locking and silent session failures (401).

---

## 🔍 1. Diagnosis: Like Gestor Detects AJAX & 403 Calls

At the core of the framework (`gestor.php`), the AJAX mode is only activated when the request POST/GET explicitly sends `ajax: 'sim'`:
* **With `ajax: 'sim'`**: The Gestor popula `$_GESTOR['ajax'] = 'sim'`, reads `$_GESTOR['ajax-opcao']` (from the `ajaxOpcao` field) and **disables token CSRF synchronous form requirement HTML**.
* **No `ajax: 'sim'`**: Gestor assumes that this is a traditional HTML form submission, requires `$_GESTOR['token']` and **rejects the request immediately with 403 Forbidden (`{"status":"error","message":"Token CSRF inválido ou ausente."}`)**.

### Automatic CSRF and 401 coverage by `global.js`

`gestor/assets/global/global.js` injects `X-CSRF-Token` into changeable requests (`POST`, `PUT`, `PATCH`, `DELETE`) from **same origin** on ALL channels — do not type the header by hand:

|Channel|Mechanism|
| --- | --- |
|`$.ajax`|`jQuery.ajaxPrefilter`|
|`fetch`|`window.fetch` envelope|
|Forms|`submit` listener in capture + `HTMLFormElement.prototype.submit` envelope + jQuery delegate handler|
|**Raw `XMLHttpRequest`** (req-163)|`XMLHttpRequest.prototype.open` / `setRequestHeader` / `send` (guard `__c2fCsrf`)|

- **Uploads with progress bar**: `fetch` does not expose `upload.onprogress`; use `new XMLHttpRequest()` normally — the token enters alone. Before req-163 this path returned **403** with the logged-in user.
- Token manually defined (`xhr.setRequestHeader('X-CSRF-Token', ...)`, in any box) **is not duplicated or overwritten**. `GET` and cross-origin never receive the token.
- **401** response with `X-Gestor-Auth-Redirect` redirects to login in `$.ajax`, `fetch` and `XMLHttpRequest`. Still treat the 401 in your handler to unlock dimmers/spinners.

---

## 🏆 2. Frontend Canon Standard in JavaScript Vanilla (Gold Standard)

In modern modules with pure JavaScript (Vanilla JS), always use the canonical standard with `URLSearchParams` or `FormData`:

### A) Structured Data Requests (`application/x-www-form-urlencoded`):
```javascript
/**
 * Padrão Canônico de Requisição AJAX no Gestor (Vanilla JS)
 * @param {Object} state - Estado do módulo (deve conter opcao e moduleBaseUrl)
 * @param {string} ajaxOpcao - Ação a ser executada no backend (ex: 'salvar-dados', 'listar')
 * @param {Object} [extraData] - Parâmetros adicionais (objetos/arrays são serializados em JSON)
 * @returns {Promise<Object>} Resposta JSON do backend
 */
function gestorAjax(state, ajaxOpcao, extraData) {
    var params = new URLSearchParams({
        opcao: state.opcao || 'dashboard',
        ajax: 'sim',
        ajaxOpcao: ajaxOpcao
    });

    if (extraData) {
        Object.keys(extraData).forEach(function (key) {
            var val = extraData[key];
            params.set(key, typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
        });
    }

    return fetch(state.moduleBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    .then(function (response) {
        if (response.status === 401) {
            window.location.href = (window.gestor && window.gestor.raiz ? window.gestor.raiz : '/') + 'signin/';
            throw new Error('Sessão expirada. Redirecionando...');
        }
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    })
    .then(function (json) {
        if (!json || json.status !== 'Ok') {
            throw new Error((json && json.message) || 'Erro na resposta do servidor.');
        }
        return json;
    });
}
```

### B) Multipart File Uploads (`FormData`):
```javascript
/**
 * Padrão Canônico para Uploads de Arquivo Multipart (Vanilla JS)
 */
function gestorUpload(state, ajaxOpcao, extraData, file) {
    var form = new FormData();
    form.append('opcao', state.opcao || 'dashboard');
    form.append('ajax', 'sim');
    form.append('ajaxOpcao', ajaxOpcao);

    if (extraData) {
        Object.keys(extraData).forEach(function (key) {
            var val = extraData[key];
            form.append(key, typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
        });
    }
    if (file) {
        form.append('file', file);
    }

    return fetch(state.moduleBaseUrl, {
        method: 'POST',
        body: form
    })
    .then(function (response) {
        if (response.status === 401) {
            window.location.href = (window.gestor && window.gestor.raiz ? window.gestor.raiz : '/') + 'signin/';
            throw new Error('Sessão expirada. Redirecionando...');
        }
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    })
    .then(function (json) {
        if (!json || json.status !== 'Ok') {
            throw new Error((json && json.message) || 'Erro no upload.');
        }
        return json;
    });
}
```

---

## 🏛️ 3. PHP Backend Canon Pattern (`modulo.php`)

In the module PHP controller, the entire AJAX route should be intercepted at the beginning of the cycle with `interface_ajax_iniciar()` and completed with `interface_ajax_finalizar()`:

```php
function modulo_start() {
    global $_GESTOR;

    gestor_incluir_bibliotecas();

    // 1. Interceptador de Chamadas AJAX
    if (!empty($_GESTOR['ajax'])) {
        interface_ajax_iniciar();

        switch ($_GESTOR['ajax-opcao']) {
            case 'minha-acao':
                modulo_ajax_minha_acao();
                break;
            default:
                $_GESTOR['ajax-json'] = array(
                    'status' => 'Erro',
                    'message' => 'Ação AJAX desconhecida: ' . ($_GESTOR['ajax-opcao'] ?? '')
                );
                break;
        }

        interface_ajax_finalizar();
        return;
    }

    // 2. Roteamento de Páginas Síncronas Normais
    switch ($_GESTOR['opcao']) {
        case 'dashboard':
        default:
            modulo_dashboard();
            break;
    }
}

function modulo_ajax_minha_acao() {
    global $_GESTOR;

    // Recupera dados enviados
    $param1 = $_REQUEST['param1'] ?? '';

    // Lógica de negócio / banco
    // ...

    // Retorno de Sucesso padronizado
    $_GESTOR['ajax-json'] = array(
        'status' => 'Ok',
        'data' => array(
            'id' => 123,
            'resultado' => 'Processado com sucesso'
        )
    );
}
```

---

## 📦 4. Legacy pattern with jQuery (`ajaxDefault`)

For legacy modules and interfaces using jQuery and Semantic UI:

```javascript
var ajaxDefault = {
    type: 'POST',
    url: gestor.raiz + gestor.moduloCaminho + '/',
    ajaxOpcao: 'ajaxOpcao',
    data: {
        opcao: gestor.moduloOpcao,
        ajax: 'sim'
    },
    dataType: 'json',
    beforeSend: function () {
        loadDimmer(true);
        msg_erro_resetar();
    },
    success: function (dados) {
        if (dados.status === 'Ok') {
            this.successCallback(dados);
        } else {
            this.successNotOkCallback(dados);
            console.log('ERROR - ' + this.ajaxOpcao + ' - ' + dados.status);
        }
        loadDimmer(false);
    },
    error: function (txt) {
        if (txt.status === 401) {
            window.open(gestor.raiz + (txt.responseJSON.redirect ? txt.responseJSON.redirect : "signin/"), "_self");
        } else {
            console.log('ERROR AJAX - ' + this.ajaxOpcao + ' - Dados:', txt);
            loadDimmer(false);
        }
    },
    successCallback: function (response) { },
    successNotOkCallback: function (response) { }
};

// Uso:
var ajax = Object.assign({}, ajaxDefault);
ajax.ajaxOpcao = 'minha-acao';
ajax.data = Object.assign({}, ajaxDefault.data, {
    ajaxOpcao: ajax.ajaxOpcao,
    param1: 'valor1'
});
ajax.successCallback = function (response) {
    // response.data ...
};
$.ajax(ajax);
```

---

## 5. `<head>` (`gestor_pagina_javascript_incluir`) Injection Trap

The PHP `gestor_pagina_javascript_incluir()` function injects module scripts into the `<head>` element of the HTML page. This means the script is **run before `<body>` is parsed**.

### 5.1 Prohibition of Direct DOM Queries on Script Root

```javascript
// ❌ ERRADO — DOM ainda não foi parseado, retorna null
var form = document.getElementById('form-checkout');
form.addEventListener('submit', handler); // TypeError: null

// ✅ CORRETO — aguardar DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('form-checkout');
    form.addEventListener('submit', handler);
});
```

### 5.2 Event Delegation Preferences

For elements that can be inserted dynamically (widgets, AJAX components), use **delegation of events** in `document`:

```javascript
// ✅ CORRETO — delegação funciona mesmo para elementos futuros
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-adicionar-carrinho')) {
        adicionarAoCarrinho(e.target.dataset.produtoId);
    }
});

// ✅ CORRETO — submit com delegação
document.addEventListener('submit', function(e) {
    if (e.target.matches('#form-checkout')) {
        e.preventDefault();
        processarCheckout(e.target);
    }
});
```

> [!WARNING]
> Without `DOMContentLoaded` or delegation, the form will be submitted natively (synchronous POST) instead of being intercepted via AJAX, causing full page reload and state loss.

---

## ⛔ AJAX Inviolable Rules:
1. **Always send `ajax: 'sim'`**: Without this field, the backend fires `403 Forbidden` error by CSRF.
2. **Always send `opcao` and `ajaxOpcao`**: Identify the context of the page and the action to be routed in `switch ($_GESTOR['ajax-opcao'])`.
3. **Backend MUST use `interface_ajax_iniciar()` and `interface_ajax_finalizar()`**: Ensures headers Correct JSON, buffer cleaning and standardized envelope.
4. **Treat error 401 (Unauthorized)**: Redirect immediately to `signin/` in case of expired session.
5. **Required version Bump**: By changing any JavaScript script in `resources/`, increase the version (`versao: "X.Y.Z"`) in `<id>.json` or in the module manifest before running `c2f resources:sync` to invalidate the browser cache.

## Asynchronous traffic clearance with Chrome DevTools MCP

In an isolated local session prepared according to `c2f-agent-visual-inspection`, play the actual action of the interface before evaluating console and network. See the schema negotiated by the installed server; do not suppose that the parameters are identical between versions.

1. Collect `list_console_messages` before/after action. Use `get_console_message` by ID to detail available errors and stack traces; register relevant file, line, and frames, including source maps when solved. A bug-free console doesn't prove AJAX worked.
2. Use `list_network_requests` to locate `fetch`/XHR of the action, including `/_ajax/`, `/_api/` and module routes. Correlate ID, method, URL and sequence; scan each failure with `get_network_request`, checking HTTP status, headers, payload and response body.
3. In Gestor, check `ajax=sim`, `opcao` and `ajaxOpcao` where the route contract requires them. In changeable methods of the same origin, check the presence of `X-CSRF-Token` injected by `global.js` and valid session. The `ajax=sim` field does not eliminate CSRF protection; do not disable protection to fix a 403. Do not expose token, Authorization, Cookie or Set-Cookie values in the records.
4. Differentiate 401 (session/`X-Gestor-Auth-Redirect`), 403 (authorization/CSRF), 500 (backend) and HTTP 200 with invalid HTML login, PHP warns or JSON. Check Content-Type and JSON envelope expected by the route, and release loading/dimmer after success and failure.
5. For multipart, check fields and browser-generated boldness; do not manually set Content-Type on `FormData`. Register observed latency and duplicate requests after repeated clicks. Check DOM results with new snapshot/screenshot.

Prefer to observe the original request. Resending mutations like `fetch()` can duplicate recordings/payments and requires authorized testing scope. Evidence should contain IDs and sanitized data, never dumps comprehensive sensitive headers. Reference: [official tools](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md).

## REP-002 — observable HTTP failures

Callbacks `.fail()` calls AJAX critical must explicitly register `xhr.status`, step and time to correlate with access log, without tokens or sensitive content:
```javascript
.fail(function (xhr) {
    console.error('HTTP', xhr.status);
});
```
Preserve spinner release and session treatment/CSRF. Message “Failure” alone does not support timeout diagnosis or memory.

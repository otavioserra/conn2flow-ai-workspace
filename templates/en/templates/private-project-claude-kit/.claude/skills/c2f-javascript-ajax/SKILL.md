---
name: c2f-javascript-ajax
description: "MANDATORY READ before writing AJAX calls, fetch requests, multipart uploads or backend AJAX handlers in the Gestor. Prevents 403 Forbidden CSRF errors, broken JSON envelopes and frozen UI spinners."
user-invocable: false
---

# AJAX Integration Governance & Architecture in Conn2Flow Gestor

# ⚡ Mandatory Trigger
- **TRIGGER**: Writing, editing or migrating frontend JavaScript code (Vanilla Fetch, jQuery) or backend PHP endpoints that perform asynchronous communication (AJAX) in Gestor modules.
- **SKIP ONLY IF**: Purely visual utility scripts (e.g. simple CSS animations with no network calls).
- **CONSEQUENCE OF IGNORING**: 403 Forbidden errors (Invalid or missing CSRF Token) from not activating the core AJAX mode, broken JSON envelopes, frozen dimmers/spinners and silent session failures (401).

---

## 🔍 1. Diagnosis: How the Gestor Detects AJAX Calls & 403 Prevention

In the framework core (`gestor.php`), AJAX mode is only activated when the POST/GET request explicitly sends `ajax: 'sim'`:
* **With `ajax: 'sim'`**: The Gestor populates `$_GESTOR['ajax'] = 'sim'`, reads `$_GESTOR['ajax-opcao']` (from the `ajaxOpcao` field) and **disables the synchronous HTML form CSRF token requirement**.
* **Without `ajax: 'sim'`**: The Gestor assumes it is a traditional HTML form submission, requires `$_GESTOR['token']` and **immediately rejects the request with 403 Forbidden (`{"status":"error","message":"Token CSRF inválido ou ausente."}`)**.

---

## 🏆 2. Canonical Frontend Pattern in Vanilla JavaScript (Gold Standard)

In modern modules with pure JavaScript (Vanilla JS), always use the canonical pattern with `URLSearchParams` or `FormData`:

### A) Structured Data Requests (`application/x-www-form-urlencoded`):
```javascript
/**
 * Canonical AJAX Request Pattern for the Gestor (Vanilla JS)
 * @param {Object} state - Module state (must contain opcao and moduleBaseUrl)
 * @param {string} ajaxOpcao - Action to execute on the backend (e.g. 'save-data', 'list')
 * @param {Object} [extraData] - Additional parameters (objects/arrays are JSON-serialized)
 * @returns {Promise<Object>} JSON response from the backend
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
            throw new Error('Session expired. Redirecting...');
        }
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    })
    .then(function (json) {
        if (!json || json.status !== 'Ok') {
            throw new Error((json && json.message) || 'Server response error.');
        }
        return json;
    });
}
```

### B) Multipart File Uploads (`FormData`):
```javascript
/**
 * Canonical Multipart File Upload Pattern (Vanilla JS)
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
            throw new Error('Session expired. Redirecting...');
        }
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    })
    .then(function (json) {
        if (!json || json.status !== 'Ok') {
            throw new Error((json && json.message) || 'Upload error.');
        }
        return json;
    });
}
```

---

## 🏛️ 3. Canonical Backend Pattern in PHP (`module.php`)

In the module's PHP controller, every AJAX route MUST be intercepted at the beginning of the lifecycle with `interface_ajax_iniciar()` and finalized with `interface_ajax_finalizar()`:

```php
function modulo_start() {
    global $_GESTOR;

    gestor_incluir_bibliotecas();

    // 1. AJAX Call Interceptor
    if (!empty($_GESTOR['ajax'])) {
        interface_ajax_iniciar();

        switch ($_GESTOR['ajax-opcao']) {
            case 'my-action':
                modulo_ajax_my_action();
                break;
            default:
                $_GESTOR['ajax-json'] = array(
                    'status' => 'Erro',
                    'message' => 'Unknown AJAX action: ' . ($_GESTOR['ajax-opcao'] ?? '')
                );
                break;
        }

        interface_ajax_finalizar();
        return;
    }

    // 2. Normal Synchronous Page Routing
    switch ($_GESTOR['opcao']) {
        case 'dashboard':
        default:
            modulo_dashboard();
            break;
    }
}

function modulo_ajax_my_action() {
    global $_GESTOR;

    // Retrieve sent data
    $param1 = $_REQUEST['param1'] ?? '';

    // Business logic / database
    // ...

    // Standardized success response
    $_GESTOR['ajax-json'] = array(
        'status' => 'Ok',
        'data' => array(
            'id' => 123,
            'result' => 'Processed successfully'
        )
    );
}
```

---

## 📦 4. Legacy jQuery Pattern (`ajaxDefault`)

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
            console.log('ERROR AJAX - ' + this.ajaxOpcao + ' - Data:', txt);
            loadDimmer(false);
        }
    },
    successCallback: function (response) { },
    successNotOkCallback: function (response) { }
};

// Usage:
var ajax = Object.assign({}, ajaxDefault);
ajax.ajaxOpcao = 'my-action';
ajax.data = Object.assign({}, ajaxDefault.data, {
    ajaxOpcao: ajax.ajaxOpcao,
    param1: 'value1'
});
ajax.successCallback = function (response) {
    // response.data ...
};
$.ajax(ajax);
```

---

## ⛔ Inviolable AJAX Rules:
1. **ALWAYS send `ajax: 'sim'`**: Without this field, the backend triggers a `403 Forbidden` CSRF error.
2. **ALWAYS send `opcao` and `ajaxOpcao`**: They identify the page context and the action to be routed in `switch ($_GESTOR['ajax-opcao'])`.
3. **Backend MUST use `interface_ajax_iniciar()` and `interface_ajax_finalizar()`**: Ensures correct JSON headers, buffer cleanup and standardized envelope.
4. **Handle 401 (Unauthorized) errors**: Immediately redirect to `signin/` on expired session.

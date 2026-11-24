# Vanilla frontend: `fetch` and `FormData` — full recipe

Subskill of `c2f-javascript-ajax`. Read it when writing the request function of a modern module (data or upload). The inviolable rules are also in the parent skill.

## Canonical functions

In modern modules with pure JavaScript (Vanilla JS), always use the canonical standard with `URLSearchParams` or `FormData`:

### A) Structured Data Requests (`application/x-www-form-urlencoded`):
```javascript
/**
 * Padrão Canônico de Requisição AJAX no Gestor (Vanilla JS)
 * @param {Object} state - Estado do módulo (deve conter opcao e moduleBaseUrl)
 * @param {string} ajaxOpcao - Backend action (e.g. 'salvar-dados', 'listar-itens')
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

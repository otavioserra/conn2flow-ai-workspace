# Legacy jQuery pattern (`ajaxDefault`) — full recipe

Subskill of `c2f-javascript-ajax`. Read it when maintaining legacy modules built on jQuery and Semantic UI. The inviolable rules are also in the parent skill.

## The `ajaxDefault` object and its use

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

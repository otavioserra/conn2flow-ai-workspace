# PHP backend: the module's AJAX dispatcher — full recipe

Subskill of `c2f-javascript-ajax`. Read it when creating or changing a controller's `switch ($_GESTOR['ajax-opcao'])`. The inviolable rules are also in the parent skill.

## Reference dispatcher and handler

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

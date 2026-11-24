# PayPal: authorize on the client, capture on the server — full recipe

Subskill of `c2f-payment-gateways`. Read it when integrating PayPal (or another two-phase gateway). The critical rule (capture only on the backend, with proof of possession) is also in the parent skill.

## Reference flow

```javascript
// Frontend — PayPal SDK (apenas AUTORIZA)
paypal.Buttons({
    createOrder: (data, actions) => {
        return fetch('/api/paypal/create-order', { method: 'POST' })
            .then(res => res.json())
            .then(data => data.order_id);
    },
    onApprove: (data, actions) => {
        // ❌ ERRADO: actions.order.capture() captura no frontend
        // ✅ CORRETO: enviar para backend capturar
        return fetch('/api/paypal/capture-order', {
            method: 'POST',
            body: JSON.stringify({ order_id: data.orderID })
        });
    }
}).render('#paypal-button-container');
```

```php
// Backend — captura com prova de posse
function capturar_ordem_paypal($order_id, $pedido) {
    $response = $paypal->captureOrder($order_id);
    // Validar prova de posse (§3) antes de atualizar o pedido
    validar_prova_de_posse($response, $pedido);
    atualizar_status_pedido($pedido['id'], 'pago');
}
```

---
name: c2f-payment-gateways
description: "READ BEFORE implementing, integrating or testing payment gateways such as Stripe or PayPal. Requires trusted server-side prices, idempotent webhooks, lazy SDK loading and sandbox or mock tests."
user-invocable: true
---

# Secure Payment Gateways (`c2f-payment-gateways`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Request to implement, configure, test or audit integration with payment gateways (Stripe, PayPal, PagSeguro, etc.); create checkout endpoints; process payment webhooks; add payment methods to e-commerce.
- **SKIP ONLY IF**: Editing modules unrelated to financial transactions or product pages without checkout.
- **CONSEQUENCE OF IGNORING**: Customer tampering prices, charges duplicated by resent webhooks, leaking credentials on logs, unnecessarily loaded heavy SDKs and impossible tests without production keys.

---

## 1. Strict Server Authority

The unit price, currency, discounts and fees are defined and validated **only in the backend**. The frontend client traffics only **identifiers and quantities**.

### 1.1 Frontend Price Prohibition

```php
// ❌ ERRADO — preço vindo do frontend é adulterável
$preco = $_POST['preco'];
$gateway->criarCobranca($preco);

// ✅ CORRETO — preço lido do banco no backend
$produto = banco_select_registro('products', "WHERE id = '$produto_id'");
$preco = (float) $produto['preco'];
$gateway->criarCobranca($preco);
```

### 1.2 Dual Validation (Frontend + Backend)

- The frontend can display prices for UX, but **all financial transaction** must recalculate values on the server from the source of canonical data (database).
- Discounts, coupons and freight must be validated on the backend before creating the payment intention on the gateway.

---

## 2. Cryptographic Request Tokens HMAC

Public access to an order (e.g. confirmation page, link by email) is protected by HMAC with single salt per request.

### 2.1 Token Generation

```php
// Gerar salt único por pedido
$salt = bin2hex(random_bytes(16));
banco_update_campo('salt', $salt);
banco_update_executar('orders', "WHERE numero = '$numero_pedido'");

// Gerar token HMAC para URL pública
$token = hash_hmac('sha256', $numero_pedido . '|' . $salt, OPENSSL_PASSWORD);
$url_publica = "/pedido/$numero_pedido?token=$token";
```

### 2.2 Token Validation

```php
function validar_token_pedido($numero, $token_recebido) {
    $pedido = banco_select_registro('orders', "WHERE numero = '$numero'");
    $token_esperado = hash_hmac('sha256', $numero . '|' . $pedido['salt'], OPENSSL_PASSWORD);
    return hash_equals($token_esperado, $token_recebido);
}
```

> [!IMPORTANT]
> **salt** is the only secret stored in database. The `OPENSSL_PASSWORD` constant is the HMAC key of the environment and should NEVER be exposed to the frontend. Use `hash_equals()` for timing-safe comparison.

---

## 3. Proof of Posse in State Checks

Payment status is read **directly from the official gateway API** with proof of mandatory possession.

### 3.1 Triple Verification

When checking the status of a payment (e.g. after checkout return, webhook, polling), the system MUST confirm:

1. **Application identifier in metadata**: The `metadata.order_id` (Stripe) or `custom_id` (PayPal) field corresponds to the internal request.
2. **Value charged**: The `amount` returned by the gateway corresponds exactly to the value calculated in the backend.
3. **Currency**: The returned `currency` corresponds to the order currency.

```php
// ✅ Prova de posse completa
function verificar_pagamento_gateway($payment_intent_id, $pedido) {
    $pi = $stripe->paymentIntents->retrieve($payment_intent_id);

    // 1. Prova de posse: metadados
    if ($pi->metadata->order_id !== $pedido['id']) {
        throw new Exception('Payment intent não pertence a este pedido');
    }
    // 2. Prova de posse: valor
    if ($pi->amount !== (int)($pedido['total'] * 100)) {
        throw new Exception('Valor divergente');
    }
    // 3. Prova de posse: moeda
    if ($pi->currency !== strtolower($pedido['moeda'])) {
        throw new Exception('Moeda divergente');
    }
    return $pi->status === 'succeeded';
}
```

> [!CAUTION]
> NEVER trust only the `payment_intent_id` or `order_id` of the checkout return. An attacker can replace the ID with a legitimate payment of lower value. The triple check is **mandatory**.

---

## 4. Backend Mandate Capture

For two-phase gateways (authorization + capture), such as PayPal, **effective financial catch** must occur exclusively on the server.

### 4.1 PayPal Standard: Authorize to Client, Capture to Server

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

---

## 5. Minimal and Impotent Webhooks

Webhook acts primarily as **flag**, not as a business rule processor.

### 5.1 Webhook Flow

1. **Receive** the gateway event.
2. **Validate** signature (Strip: `Webhook::constructEvent()`; PayPal: certificate check).
3. **Identify** internal request via event metadata.
4. **Fire resynchronization** via official gateway API (§3 — Posse Test).
5. **Register** the event with `gateway_event_id` for idempotence.

### 5.2 Absolute Impotence

```php
function processar_webhook($event_id, $pedido_id) {
    // Verificar idempotência
    $existente = banco_select_registro('gateway_events',
        "WHERE gateway_event_id = '$event_id'");
    if ($existente) {
        return; // Evento já processado — ignorar silenciosamente
    }

    // Registrar evento ANTES de processar
    banco_insert_registro('gateway_events', [
        'gateway_event_id' => $event_id,
        'pedido_id' => $pedido_id,
        'processado_em' => date('Y-m-d H:i:s')
    ]);

    // Ressincronizar via API oficial (prova de posse)
    verificar_e_atualizar_pagamento($pedido_id);
}
```

> [!WARNING]
> The webhook **should not contain complex business logic**. It signals that something has changed; the update logic uses the official gateway API to get the real state with proof of ownership.

### 5.3 Public and Safe Endpoint

The webhook endpoint uses the `<modulo>.ajax.public.php` standard (see `c2f-gestor-functions` §11) to receive requests without login, but **Mandatory** validates the gateway cryptographic signature.

---

## 6. Conditional SDK loading

Heavy-duty third-party SDKs (Stripe.js ~40 KB, PayPal SDK ~200 KB) **only to be loaded** when the request selects that payment method.

### 6.1 Loading Under Demand

```javascript
// ✅ CORRETO — carregar SDK apenas quando necessário
function carregarGatewaySDK(gateway) {
    if (gateway === 'stripe' && !window.Stripe) {
        return carregarScript('https://js.stripe.com/v3/');
    }
    if (gateway === 'paypal' && !window.paypal) {
        return carregarScript(`https://www.paypal.com/sdk/js?client-id=${clientId}`);
    }
    return Promise.resolve();
}

// Ao selecionar método de pagamento
seletorGateway.addEventListener('change', async (e) => {
    await carregarGatewaySDK(e.target.value);
    inicializarFormularioPagamento(e.target.value);
});
```

### 6.2 Network Traffic Audit

- In E2E (Playwright) tests, intercept network requests via `page.on('request')` to make sure that **not selected** gateway SDKs are not being loaded.
- CSS classes of unselected gateway containers must receive `hidden` to avoid rendering from the iframe.

---

## 7. Default Gateway (Safe Fallback)

In the absence of explicit selection by the buyer, the system assumes the **default storekeeper gateway**.

### 7.1 Fallback Settings

```php
// Determinar gateway do pedido
$gateway = $pedido['gateway'] ?? $config_loja['gateway_padrao'] ?? 'stripe';

// Validar que o gateway é suportado
$gateways_ativos = ['stripe', 'paypal']; // Do JSON de configuração
if (!in_array($gateway, $gateways_ativos)) {
    throw new Exception("Gateway '$gateway' não está configurado");
}
```

### 7.2 Priority Rule

1. Explicit gateway selected by the buyer at checkout.
2. Default Gateway set by the shopkeeper in the administrative panel.
3. First active gateway in the configured gateway list.

> [!NOTE]
> Secure fallback ensures that **No request no gateway assigned**, even if the frontend does not send the selection.

---

## 8. Unitary Tests Without Credentials

The checkout test strategy is based on **test doubles/mocks** of the gateway library functions.

### 8.1 Test double (Test Double) Pattern

```php
// Biblioteca do gateway com injeção de dependência
class GatewayStripe {
    private $client;

    public function __construct($client = null) {
        $this->client = $client ?? new \Stripe\StripeClient(STRIPE_SECRET_KEY);
    }

    public function criarIntencao($valor, $moeda, $metadata) {
        return $this->client->paymentIntents->create([
            'amount' => $valor,
            'currency' => $moeda,
            'metadata' => $metadata
        ]);
    }
}

// No teste — sem credenciais reais
class GatewayStripeTest extends TestCase {
    public function testCriarIntencao() {
        $mock = $this->createMock(\Stripe\StripeClient::class);
        // Configurar mock para retornar resposta simulada
        $gateway = new GatewayStripe($mock);
        $resultado = $gateway->criarIntencao(1000, 'brl', ['order_id' => '123']);
        $this->assertNotNull($resultado);
    }
}
```

### 8.2 E2E Tests with Test Cards

- Stripe: use test cards (`4242 4242 4242 4242`) in test mode.
- PayPal: use PayPal Developer Sandbox accounts.
- **Absolute Prohibition**: Production credentials **NEVER** must appear in test files, IC environment variables, or execution logs.

### 8.3 Webhooks Simulation

```bash
# Stripe CLI — enviar webhook de teste localmente
stripe trigger payment_intent.succeeded --override payment_intent:metadata.order_id=pedido-123

# Teste manual — POST direto no endpoint
curl -X POST https://meusite.com/ecommerce/ecommerce.ajax.public.php \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test","metadata":{"order_id":"123"}}}}'
```

> [!CAUTION]
> In production environments, **always validate the webhook signature** (`Stripe-Signature` header). Tests with direct `curl` should be restricted to development/staging environments.

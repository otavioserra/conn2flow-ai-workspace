# Testing gateways without credentials — full recipe

Subskill of `c2f-payment-gateways`. Read it when writing unit or E2E checkout tests or simulating webhooks. The critical prohibitions are also in the parent skill.

## Strategy

The checkout test strategy is based on **test doubles/mocks** of the gateway library functions.

## 8.1 Test double (Test Double) Pattern

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

## 8.2 E2E Tests with Test Cards

- Stripe: use test cards (`4242 4242 4242 4242`) in test mode.
- PayPal: use PayPal Developer Sandbox accounts.
- **Absolute Prohibition**: Production credentials **NEVER** must appear in test files, IC environment variables, or execution logs.

## 8.3 Webhooks Simulation

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

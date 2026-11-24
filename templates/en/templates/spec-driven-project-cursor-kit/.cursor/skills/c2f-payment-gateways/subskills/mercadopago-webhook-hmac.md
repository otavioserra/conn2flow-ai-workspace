# Subskill — Resending/Testing a Signed Mercado Pago Webhook (HMAC-SHA256)

> Parent skill: `c2f-payment-gateways` (§5.4). Read it before resending, simulating or debugging a signed Mercado Pago webhook in the test environment.

Source of truth in the Core: `mercadopago_validar_webhook()` in `gestor/bibliotecas/mercadopago.php`, called by `plataforma_gateways_webhook_universal()` in `gestor/controladores/plataforma-gateways/plataforma-gateways.php`. There the Core validates the Mercado Pago signature on modular routes as well, so the module does not revalidate it. Checked on 2026-11-24 on the Core branch `feat/req-305-mercadopago-orders-api` (REQ-305), not yet merged into `main`: recheck the code after the merge.

1. **Route**: `POST /_gateways/mercadopago/webhook` (broadcast) or `POST /_gateways/<modulo-id>/mercadopago/webhook` (target module). The Core accepts a JSON body or just the query `?data.id=<id>&type=<type>`. PHP exposes `data.id` as `$_GET['data_id']`.
2. **Required headers**: `x-signature: ts=<timestamp>,v1=<hmac-hex>` and `x-request-id: <uuid>`. Without `x-signature`, a numeric `ts` or `v1`, validation fails.
3. **Manifest**: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`. Missing parts are left out of the manifest. An alphanumeric `data.id` is lowercased in the manifest and keeps its original spelling for the lookup.
4. **HMAC**: `hash_hmac('sha256', $manifest, <webhook_secret>)` as lowercase hex. The secret is the `webhook_secret` of the active Mercado Pago gateway in the test environment. Read it from the local configuration without printing or logging it, and use fictitious or sandbox IDs, never real order IDs.
5. **Send and check the response**:

```bash
TS=$(date +%s); RID=$(uuidgen); ID="<id-sandbox>"
SIG=$(printf 'id:%s;request-id:%s;ts:%s;' "$(echo "$ID" | tr 'A-Z' 'a-z')" "$RID" "$TS" \
  | openssl dgst -sha256 -hmac "$MP_WEBHOOK_SECRET" | sed 's/^.* //')
curl -i -X POST "https://<host-de-teste>/_gateways/mercadopago/webhook?data.id=$ID&type=payment" \
  -H "x-signature: ts=$TS,v1=$SIG" -H "x-request-id: $RID" -H "Content-Type: application/json" \
  -d "{\"type\":\"payment\",\"data\":{\"id\":\"$ID\"}}"
```

The `tr` only applies to an alphanumeric `data.id`, as in step 3.

- **HTTP 200** (`processed: true`): signature accepted and event handled by a module.
- **401** `Invalid webhook signature`: wrong manifest, secret or headers, or no active Mercado Pago gateway.
- **400** `Invalid Order ID` or **503** `Order temporarily unavailable`: valid signature, but the Order was not confirmed by the authenticated API.
- **503** `Webhook processing incomplete`: no module returned `processed`. Mercado Pago would redeliver the event.

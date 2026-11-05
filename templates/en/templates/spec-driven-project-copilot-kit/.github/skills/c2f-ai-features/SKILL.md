---
name: c2f-ai-features
description: "Implement and review Conn2Flow Pro AI features: unified providers, credits, modes, data isolation, safe rendering and response validation. Use when integrating AI into product modules."
---

# AI Features in Conn2Flow Pro

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Implement or review AI features in Conn2Flow Pro modules.
- **SKIP ONLY IF**: The task does not integrate or alter AI features of the product.
- **CONSEQUENCE OF IGNORING**: Duplicate billing, exposure of sensitive data and unsafe response rendering.

Origin: BL-028, REQ-067 / BATCH-069 (2026-10-09). Before implementing, check the `conn2flow/gestor/bibliotecas/ia-provedores.php` library, the hooks and the real module features. Living examples: `conn2flow-site/gestor/modulos/ai-assistant/`, `ai-agents/` and `ai-writer/`. Path names start from their respective roots; do not confuse the matrix with the core.

## Eight pillars

1. **Unified provider.** Call `ia_provedor_gerar_texto($servidor, $pedido, $tempo = 120)` or `ia_provedor_gerar_imagem($servidor, $pedido, $tempo = 180)`. Inform `recurso` and `referencia` on request. Modules must neither call the LLM directly over HTTP nor duplicate the adapter. Treat `status`, `message` and `bloqueado` as per the current library.
2. **Credits for hooks.** The `ia-provedores` point uses the `pedido.autorizar` filter before the call and the `pedido.concluido` action later, with status/use. The module doesn't charge again. Check that Pro Credit Control is registered: core can run without hooks and wrapper registers exceptions without blocking by itself; callback requiring failure refusal should implement it. Never suppose automatic billing in installation without integration.
3. **Editable modes, fixed security.** The writing rule lies in `ai_modes` with the target of the editable module in the panel. Permissions, limits, sanitization and privacy remain in the code and cannot be removed by editable mode. Use the resource and variable system for configurable instructions/labels.
4. **Data isolation.** Wrap the screen context between `<dados>` and `</dados>`, with fixed instruction to never obey commands found in this block. Treat delimiters coming from the user to prevent early closing. The envelope does not replace authorization, minimum selection of fields and output validation.
5. **Safe rendering.** Answer never enters as raw HTML. Create text nodes in the DOM; if the product allows formatting, apply whitelist of tags/attributes on the server and client, with parity test and adverse content. Do not use `innerHTML` with unsanitized response.
6. **Telemetry without raw content.** Register user/context allowed, resource, reference, provider/model, tokens and status. Do not persist prompt, generated text, key or `resposta_completa` in usage logs. Validation inspections use masked data and restricted retention.
7. **Graceful degradation.** Exercise lack of server/provider, lack of credits, refusal, timeout and error. The screen communicates the condition using variables and maintains independent AI actions; local guard checks continue. Don't invent a successful response.
8. **Sensitive data and database.** Do not read password/hash for context; mask e-mail and username, which can also be email. Release connection MySQL before waiting with `ia_provedor_banco_soltar()`; unified HTTP already calls this function. Apply the same discipline to another request Long HTTP and check persistence after reconnection.

## Validation before delivery

Follow `project-validation`: Inspect masked request and real response, with criteria supported by source; use menu screen, user with name in email format and component created after hook. Check permissions, hostile content, credits and no raw text in telemetry. Fixtures are removed in `finally`, with confirmation of cleaning. Without accessible provider, register tests with test double and the actual unexercised path without assigning real human acceptance.

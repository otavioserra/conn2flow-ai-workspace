---
name: c2f-interface-v2-architecture
description: "READ BEFORE rendering administrative modals, card lists, breadcrumbs or visual components. Preserves mobile layout, reactivity and compatibility with the v2 styling pipeline."
user-invocable: false
---

# V2 Interface Architecture (`gestor/bibliotecas/interface.php`)

## Validation of live components with Chrome DevTools MCP

Prepare the local sandbox as per `c2f-agent-visual-inspection`. Use `take_snapshot` to locate updated controls and UIDs, open dropdowns/abas/modals with `click` or keyboard and wait for the expected dynamic state. Validate selection, focus, Escape closure, loading and reopening without handles or duplicate nodes.

With `resize_page` and `take_screenshot`, check desktop/mobile, overlay, scroll, dimensions and order of controls. Use read-only DOM measurements to detect cut or invisible content. Test Fomantic/Semantic and Tailwind variants according to the actual screen framework, including Lucide icons. Collect console/network by `c2f-javascript-ajax` script when the interaction loads data; do not fire actual deletions only to validate a modal.

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Develop or refactor administrative interfaces, complex forms, confirmation modals or dynamic Gestor lists.
- **SKIP ONLY IF**: Headless API endpoints (pure JSON) without visual interface rendering.
- **CONSEQUENCE OF IGNORING**: Inconsistency in user experience, accessibility/responsiveness failures and conflicts between CSS frameworks in administration.

---

See and apply the following conventions when using the admin interface builder in Conn2Flow:

## 1. Route Patterns CRUD V2

Screens managed by `interface.php` follow standardized events:
* `adicionar`: Renders inclusion form (GET) / Validate and executes INSERT on database (POST).
* `editar`: Render pre-filled edition form with `banco_select_campos_antes_iniciar` (GET) / Validate and run UPDATE on database (POST).
* `listar`: Displays record table with pagination and search Semantic UI.
* `clonar`: Duplicate an existing record (GET/POST).
* `status`: Toggle registration status (`A`=Active, `I`=Inactive, `E`=Deleted).

---

## 2. Alerts and Notifications (`interface_alerta`)

```php
interface_alerta([
    'redirect' => true,
    'msg' => gestor_variaveis(['modulo' => 'interface', 'id' => 'alert-success-saved'])
]);
```

---

## 3. Automatic Shooting of Native Hooks

The interface library automatically triggers the following hooks per module:
- `{modulo-id}.adicionar.pre-banco` / `{modulo-id}.adicionar.banco`
- `{modulo-id}.editar.pre-banco` / `{modulo-id}.editar.banco`
- `{modulo-id}.excluir.banco`
- `{modulo-id}.status.banco`

---

## 4. Tailwind Variants in the Administrative Panel

With the activation of `layout-administrativo-tailwind` and `framework_css: tailwindcss`, the `interface_componente_variante()` engine provides `-tailwind` variants for:

|Component|Tailwind Variant|Status|
|---|---|---|
|**edition** Forms| ✅ Available|Production|
|**inclusion** forms (new)| ✅ Available|Production|
|Modals (loading, confirmation, alerts)| ✅ Available|Production|
|Header/wheel buttons (`interface_botoes_html`)| ✅ Available (Lucide icons)|Production|
|**List of records**| ❌ Fomantic (`layout-administrativo-do-gestor`)|Backlog BL-026|

### 4.1 Tailwind Component Traps

1. **Delete Button**: The deletion button in Tailwind requires the inclusion of the `gestor/assets/interface/interface-tailwind.js` script, which listens to `.excluir[data-href]` and injects token CSRF in modal confirmation.
2. **`tooltip` Key**: The missing `tooltip` key in the `$botoes` **must be initialised** array to prevent PHP warns (`Undefined index: tooltip`):
```php
// ✅ Inicialização defensiva de tooltip
$botao['tooltip'] = $botao['tooltip'] ?? '';
```
3. **Lucide Icons**: Tailwind buttons use icons Lucide instead of Fomantic/Semantic icons. When adding custom buttons, use Lucide's SVG inline format.

> [!IMPORTANT]
> The **list of records remains in the Fomantic layout** (`layout-administrativo-do-gestor`) page until the implementation of the BL-026 backlog item. Don't try to force Tailwind classes into the listing.

---
name: c2f-widget-development
description: "READ BEFORE developing or modifying widgets and their renderers. Preserves scope isolation, unique DOM IDs and public rendering."
user-invocable: false
---

# Conn2Flow widget development

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create or modify widgets (`*.widget.php`, `*.widget.js`), `@[[widgets#...]]@` tags or rendering widget drivers.
- **SKIP ONLY IF**: Static visual components that do not have an autonomous widget life cycle.
- **CONSEQUENCE OF IGNORING**: Collapse of identifiers in the DOM by instantiating multiple widgets, data loss in injecting dynamic parameters and breaking rendering on the end site.

---

1. Inject CSS, head and JavaScript by `gestor_pagina_recursos_incluir([...])`; centralize inclusion and preserve helper deduplication.
2. Do not call again resource controllers that render widget already includes.
3. In the frontend send `ajaxOpcao`; in the backend treat the same action in `$_GESTOR['ajax-opcao']` and avoid names reserved by generic AJAX closure.
4. For item tokens, accept optional wrappers with `/@?\[\[item#([a-zA-Z0-9_\-]+)\]\]@?/` and replace all occurrences.
5. Keep repeat blocks, empty and controls compatible with the AI contract mode/ widget template.
6. Validate two renderings on the same page to detect duplicate asset beyond the happy and error path AJAX.

---

## 7. Modular Grid Contract (Dynamic Dimensions and Drag-and-Drop)

Every widget that participates in modular panels, dashboards or customizable layouts must comply with **modular grid contract**:

### 7.1 Dynamic Dimensions (`width` and `height`)
- The widgets shall be declared with resizing support in grid units (columns and lines):
  - `grid_w` (width in columns, e.g. `1` to `12`).
  - `grid_h` (height in lines/height units, e.g. `1` to `6`).
- **Resizing Strict Limits**:
  - `min_w`: minimum width for rendering readable without truncation of controls.
  - `max_w`: maximum width allowed in container.
  - `min_h`: Minimum height that ensures display of essential content without broken vertical overflow.
  - `max_h`: maximum recommended height to avoid proportion distortion.
- The HTML and CSS of the widget must use flexible containers (`w-full h-full`) and respect internal overflow with subtle scrollbars (`overflow-y-auto overflow-x-hidden`) when the content exceeds the useful area.

### 7.2 Drag-and-Drop and State Preservation
- When moving or resizing widgets in an interactive layout, the client library issues layout events.
- The widget must maintain selectors with isolated data attributes (e.g. `data-widget-id="<id>"`, `data-widget-instance="<hash>"`) to prevent clones or multiple widgets on the same screen colliding event listers or style properties.

---

## 8. Life Cycle and Re-rendering AJAX (`ajaxOpcao: 'widget-render'`)

Dynamic widgets that update their content asynchronously (filters, internal pagination, polling or post-resize update) must adopt the standardized endpoint:

### 8.1 Frontend Call
```javascript
gestorAjax(state, 'widget-render', {
    widget_id: 'meu-widget',
    instance_id: instanceId,
    width: currentGridWidth,
    height: currentGridHeight,
    params: { /* parâmetros específicos do widget */ }
}).then(function(response) {
    if (response.status === 'Ok' && response.data.html) {
        container.innerHTML = response.data.html;
        if (response.data.css) {
            // Injeção dinâmica ou atualização de estilos
        }
        // Reinicializar listeners específicos da instância
        widgetInit(container, response.data);
    }
});
```

### 8.2 Backend Manipulator in Module/Control
```php
if (!empty($_GESTOR['ajax'])) {
    interface_ajax_iniciar();

    switch ($_GESTOR['ajax-opcao']) {
        case 'widget-render':
            $widget_id = $_REQUEST['widget_id'] ?? '';
            $width = (int)($_REQUEST['width'] ?? 1);
            $height = (int)($_REQUEST['height'] ?? 1);
            $params = $_REQUEST['params'] ?? [];

            $render = widget_renderizar([
                'id' => $widget_id,
                'width' => $width,
                'height' => $height,
                'params' => $params,
                'return_css' => true
            ]);

            $_GESTOR['ajax-json'] = [
                'status' => 'Ok',
                'data' => [
                    'html' => $render['html'] ?? '',
                    'css' => $render['css'] ?? ''
                ]
            ];
            break;
    }

    interface_ajax_finalizar();
    return;
}
```

> [!IMPORTANT]
> Re-rendering via `ajaxOpcao: 'widget-render'` should not reinject global script dependencies (`<script>` on the head) already loaded; use `gestor_pagina_recursos_incluir()` with native deduplication.

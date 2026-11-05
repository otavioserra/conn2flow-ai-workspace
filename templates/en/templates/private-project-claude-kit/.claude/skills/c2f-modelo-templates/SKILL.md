---
name: c2f-modelo-templates
description: "READ BEFORE rendering or modifying templates with modelo.php. Follow the actual placeholder, cell and replacement contracts rather than assuming generic template-engine behavior."
user-invocable: false
---

# Model and Cell Handling (`modelo.php`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Manipulate repeat structures, conditional cells or exchange of markers in templates HTML via `modelo.php` library.
- **SKIP ONLY IF**: Direct rendering of data without use of Gestor template engine.
- **CONSEQUENCE OF IGNORING**: `modelo_tag_val()` returning empty and deleting sections of the screen without explicit error, `#[id]#` raw markers exposed to the end user or block duplication.

---

See and apply the following agreements when using template functions and template processing in Conn2Flow (`gestor/bibliotecas/modelo.php`):

1. **Variables Replacement (`modelo_var_troca` / `modelo_var_troca_tudo`)**:
   - Replace first occurrence of marker array: `$modelo = modelo_var_troca($modelo, ['#nome#' => 'JoÃ£o', '#local#' => 'Conn2Flow'])`.
   - Replace first single marker occurrence: `$modelo = modelo_var_troca($modelo, '#nome#', 'Maria')`.
   - Replace **all** with the following: `$modelo = modelo_var_troca_tudo($modelo, $variaveis)`.

2. **Repetitive Cell Extraction and Preparation with Comment Tags**:
   - Delimitation standard § in the model: `<!-- cel < --> CONTEÃšDO DA CÃ‰LULA <!-- cel > -->`.
   - Extract from the cell, storage in `$cel['cel']` and exchange in the original model for a neutral marker `<!-- cel -->`:
     ```php
     $cel_nome = 'cel';
     $cel[$cel_nome] = modelo_tag_val($modelo_texto, '<!-- '.$cel_nome.' < -->', '<!-- '.$cel_nome.' > -->');
     $modelo_texto = modelo_tag_troca_val($modelo_texto, '<!-- '.$cel_nome.' < -->', '<!-- '.$cel_nome.' > -->', '<!-- '.$cel_nome.' -->');
     ```

3. **Iteration and Progressive Injection of Processed Cells (`modelo_var_in`)**:
   - Iterate on the data collection and inject each processed item into the cell marker:
     ```php
     foreach ($itens as $item) {
         $cel_nome = 'cel';
         $cel_aux = $cel[$cel_nome];
         $cel_aux = modelo_var_troca($cel_aux, $item);
         $modelo_processado = modelo_var_in($modelo_processado, '<!-- '.$cel_nome.' -->', $cel_aux);
     }
     // Limpar o marcador residual ao final da iteraÃ§Ã£o
     $modelo_processado = modelo_var_troca($modelo_processado, '<!-- '.$cel_nome.' -->', '');
     ```

4. **Conditional Cell/Block Element (`modelo_tag_del`)**:
   - If the list is empty or the conditional block should not be displayed:
     ```php
     $cel_nome = 'cel';
     $modelo_texto = modelo_tag_del($modelo_texto, '<!-- '.$cel_nome.' < -->', '<!-- '.$cel_nome.' > -->');
     ```


---

## 5. Defensive Widget Mockup (`<!-- widgets#SIG < -->`)

- When a widget can return empty content (e.g. list widget without items, conditional widget), use **defensive mockup pattern** to avoid blank screens and preserve Tailwind classes in build:
```html
<!-- widgets#formulario-contato < -->
<div class="p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-4">Formulário de Contato</h2>
  <p class="text-gray-500">Carregando formulário...</p>
</div>
<!-- widgets#formulario-contato > -->
```

- **Operation**: The widget engine replaces the content between `<!-- widgets#ID < -->` and `<!-- widgets#ID > -->` markers with the actual widget output. If the widget returns empty, the original mockup is preserved.
- **Double Benefit**:
  1. **UX**: The user never sees a blank screen — the mockup serves as a visual placeholder.
  2. **Tailwind Build**: The CSS classes of the mockup (`p-6`, `bg-white`, `rounded-lg`, etc.) are detected by the Tailwind scanner and included in the build, avoiding loss of classes that only exist in the dynamic output of the widget.

> [!WARNING]
> Without the defensive mockup, Tailwind classes used exclusively by the widget can be deleted from the compiled CSS, causing visual break when the widget finally renders.

---

## 6. Form Fragments Insulation with `<template>`

- HTML fragments that serve as client-side templates (e.g. select options, password toggles, cloneable blocks) should be involved in `<template>` for **do not leak into the living DOM**:
```html
<!-- ❌ ERRADO — fragmento visível no DOM, pode causar estilos indesejados -->
<div id="opcoes-template" style="display:none">
  <option value="#[valor]#">#[label]#</option>
</div>

<!-- ✅ CORRETO — <template> não renderiza no DOM, conteúdo inerte -->
<template id="opcoes-template">
  <option value="#[valor]#">#[label]#</option>
</template>
```

- **Technical Reason**: The `<template>` element is inert — its content is not rendered, internal scripts do not run, styles do not apply and internal forms are not submitted. This prevents:
  - `#[...]#` tags not replaced appearing on the screen.
  - Elements `<option>` ghosts polluting selects.
  - Event listeners being triggered prematurely.
  - Orphaned CSS classes affecting layout.

- **JavaScript access**:
```javascript
const template = document.getElementById('opcoes-template');
const clone = template.content.cloneNode(true);
// Processar marcadores no clone antes de inserir no DOM
select.appendChild(clone);
```

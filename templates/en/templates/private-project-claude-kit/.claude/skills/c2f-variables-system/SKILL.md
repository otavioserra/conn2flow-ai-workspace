---
name: c2f-variables-system
description: "READ BEFORE adding user-facing text, labels, titles, tooltips, errors or alerts in code. Uses the variables system for localization and tenant customization."
user-invocable: false
---

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Write, change or add any visible text, label, validation message, title or alert in PHP, HTML or JavaScript files.
- **SKIP ONLY IF**: Strict technical identifiers (names of SQL columns, array keys, CSS classes or internal slugs).
- **CONSEQUENCE OF IGNORING**: Summary rejection of the PR by inclusion of hardcoded text, breach of internationalization (i18n) and impossibility of text alteration via variable panel.

---

﻿---
name: c2f-variables-system
description: "Always use to write text, error messages, alerts, labels or any interface string. See BEFORE you use literal text in PHP, HTML or JS."
user-invocable: false
---

# Conn2Flow Multilingual Message and Variable System

> [!CAUTION]
> **WRITER PROGRAMME FIXED LITERAL TEXT PROHIBITED**:
> It is strictly prohibited to insert fixed literal texts (hardcoded strings) into PHP, HTML or JavaScript code for:
> - Error or success messages
> - Interface Alerts and Warnings
> - Labels of forms and buttons
> - Titles, descriptions and placeholders
> - Any text visible to the final user
>
> ALL texts MUST be declared in the **Variable System** and consumed via the API.

## 1. Declaration of Variables

### 1.1. Global Variables
File: `gestor/resources/<lang>/variables.json`

```json
{
  "minha-variavel": {
    "valor": "Texto visÃ­vel ao usuÃ¡rio",
    "descricao": "DescriÃ§Ã£o interna para o administrador"
  },
  "erro-permissao": {
    "valor": "VocÃª nÃ£o tem permissÃ£o para acessar este recurso.",
    "descricao": "Mensagem de erro de permissÃ£o"
  }
}
```

### 1.2. Modulu Variables
File: `modulos/<modulo-id>/<modulo-id>.json`, inside `resources.<lang>.variables` key:

```json
{
  "resources": {
    "pt-br": {
      "variables": {
        "titulo-listagem": {
          "valor": "Lista de Registros",
          "descricao": "TÃ­tulo da pÃ¡gina de listagem"
        }
      }
    }
  }
}
```

---

## 2. Variable Consumption

### 2.1. PHP
```php
// VariÃ¡vel global
$texto = gestor_variaveis(['id' => 'minha-variavel']);

// VariÃ¡vel de mÃ³dulo
$texto = gestor_variaveis(['modulo' => 'meu-modulo', 'id' => 'titulo-listagem']);
```

### 2.2. HTML / Resource Templates
```html
<!-- SubstituiÃ§Ã£o direta no template engine -->
<h1>@[[titulo-listagem]]@</h1>
<p>[[descricao-pagina]]</p>

<!-- Alternativa: substituiÃ§Ã£o via modelo_var_troca() no PHP que renderiza o template -->
```

### 2.3. In JavaScript (via date attributes or PHP variables injected)
```html
<div data-msg-erro="@[[erro-permissao]]@"></div>
```
```javascript
const msg = element.dataset.msgErro;
```

---

## 3. Compilation Flow

1. Edit `variables.json` (global) or `<modulo>.json` (module)
2. `atualizacao-dados-recursos.php` compiles for `VariaveisData.json`
3. `atualizacoes-banco-de-dados.php` applies Upsert in the `variaveis` table
4. Runtime consumes via `gestor_variaveis()` or template replacement

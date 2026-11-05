---
name: c2f-gestor-functions
description: "READ BEFORE calling gestor.php core functions for layouts, sessions, redirects or components. Prevents unexpected exit(), component scope failures and incorrect session handling."
user-invocable: false
---

# Gestor Library Functions (`gestor.php`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Invoke or refactor calls to central functions of `gestor/bibliotecas/gestor.php` (`gestor_componente`, `gestor_redirecionar`, `gestor_pagina_*`, `gestor_usuario`).
- **SKIP ONLY IF**: Isolated code in pure utilitarian libraries without coupling to the Gestor runtime.
- **CONSEQUENCE OF IGNORING**: Execution-flow breaks (e.g. `gestor_redirecionar_raiz()` aborting recordings), session state loss or page mount failures.

---

See and apply the following conventions when using Gestor central functions in Conn2Flow (`gestor/bibliotecas/gestor.php`):

1. **Acquisition of Dynamic Components (`gestor_componente`)**:
   - Current module component: `gestor_componente(['id' => 'id-comp', 'modulo' => $_GESTOR['modulo-id']])`.
   - Component of another module: `gestor_componente(['id' => 'formulario-login', 'modulo' => 'autenticacao'])`.
   - Separate HTML and CSS return: `gestor_componente(['id' => 'comp-id', 'return_css' => true])` (return `['html' => ..., 'css' => ...]` array).

2. **System Variable Management (`gestor_variaveis` / `gestor_variaveis_alterar`)**:
   - Global variable: `gestor_variaveis(['id' => 'id-var'])`.
   - Module variable: `gestor_variaveis(['modulo' => $_GESTOR['modulo-id'], 'id' => 'id-var'])`.
   - Complete set of variables: `gestor_variaveis(['modulo' => 'meu-modulo', 'conjunto' => true])`.
   - Filter by prefix/regex: `gestor_variaveis(['modulo' => 'admin-env', 'conjunto' => true, 'padrao' => 'email-'])`.
   - Change variable: `gestor_variaveis_alterar(['modulo' => 'id-modulo', 'id' => 'id-var', 'tipo' => 'string', 'valor' => 'novo valor'])`.

3. **Secure Library Inclusion (`gestor_incluir_biblioteca`)**:
   - Ensure idempotent file loading in `gestor/bibliotecas/{nome}.php`: `gestor_incluir_biblioteca('comunicacao')`, `gestor_incluir_biblioteca('pdf')`.

4. **HTTP redirects (`gestor_redirecionar`)**:
   - Internal route: `gestor_redirecionar('dashboard')`.
   - With Query string: `gestor_redirecionar('produtos', 'categoria=eletronicos&pagina=1')`.
   - External URL: `gestor_redirecionar('https://www.google.com', '', true)`.

5. **Session Handling (`gestor_sessao_variavel`)**:
   - Set: `gestor_sessao_variavel('usuario_id', 123)`.
   - Get: `$id = gestor_sessao_variavel('usuario_id')` (return `null` if missing).
   - Remove Item: `gestor_sessao_variavel_del('chave')`.
   - Clear session: `gestor_sessao_del_all()`.

6. **Page Component Inclusion (`gestor_componentes_incluir`)**:
   - Include single or multiple: `gestor_componentes_incluir(['id' => 'menu-principal'])` or `gestor_componentes_incluir(['id' => ['header', 'footer']])`.

7. **Validation Assistant (`existe`)**:
   - Use `if(existe($var))` to validate whether strings, arrays, numbers or collections are defined and not empty.

8. **Page Layouts (`gestor_layout`)**:
   - Return layout Full HTML: `gestor_layout(['id' => 'layout-administrativo'])` or with `'return_css' => true`.

---

## 9. `nome_especifico` Contract in Interface

- When the table of a **does not have the `nome` column** module (e.g. tables with `titulo`, `descricao` or only technical fields), the interface array (`interface.php`) **should** declare `'nome_especifico'` pointing to the equivalent field:
```php
$_GESTOR_INTERFACE = [
    'tabela' => 'minha_tabela',
    'nome_especifico' => 'titulo',  // ← Obrigatório se a tabela não tem coluna 'nome'
    // ...
];
```
- **Omission Consequence**: Without `nome_especifico`, Gestor executes `SELECT nome FROM tabela` that fails with SQL error or returns empty values, causing silent deviations in the listing and in the breadcrumbs.

---

## 10. `gestor_redirecionar()` with Relative Paths

- The function`gestor_redirecionar()` **already prefix automatically**o`url-raiz`Doprojectand the active language. So,**Always pass relative paths**:
```php
// ✅ CORRETO — caminho relativo (a função adiciona url-raiz + idioma)
gestor_redirecionar('modulo/acao');
gestor_redirecionar('dashboard', 'mensagem=ok');

// ❌ ERRADO — caminho absoluto duplica o prefixo
gestor_redirecionar('/pt-br/modulo/acao');
gestor_redirecionar($_GESTOR['url-raiz'] . '/modulo/acao');
```
- **Exception**: For external URLs, pass the third parameter as `true`: `gestor_redirecionar('https://externo.com', '', true);`

---

## 11. Public AJAX routing (`<modulo>.ajax.public.php`)

- For AJAX endpoints that should work **no authentication** (e.g. public forms, gateway webhooks, anonymous APIs), use the `<modulo>.ajax.public.php` file instead of `<modulo>.ajax.php`.
- **Reason**: The default `.ajax.php` file goes through `interface_ajax_iniciar()`, which requires authenticated session. `.ajax.public.php` is routed by Gestor with the `without_permission` flag, ignoring the session check.

```
modulos/
  meu-modulo/
    meu-modulo.ajax.php           ← AJAX autenticado (padrão)
    meu-modulo.ajax.public.php    ← AJAX público (without_permission)
```

- **Mandate Security**: Even in public endpoints, **always validate and sanitize** input data. `without_permission` removes only the session requirement, not the validation responsibility:
```php
// meu-modulo.ajax.public.php
$acao = isset($_REQUEST['acao']) ? banco_escape_field($_REQUEST['acao']) : '';
switch ($acao) {
    case 'webhook-gateway':
        // Validar assinatura do webhook, processar dados
        break;
    default:
        echo json_encode(['erro' => 'Ação inválida']);
}
```

---

## 12. Session Rule on Public Pages (`without_permission: true`)

- On pages marked with `without_permission: true`, the `gestor.php` **does not execute** `gestor_permissao()`, causing `gestor_usuario()` to return empty even to authenticated buyers.
- **Normative Directive**: To identify the user logged into public pages, call `gestor_permissao_token()`, **but strictly on the condition that the authentication cookie exists**:

```php
// ✅ CORRETO — verificação condicional do cookie antes de gestor_permissao_token()
function identificar_usuario_publico() {
    global $_CONFIG;
    if (isset($_COOKIE[$_CONFIG['cookie-authname']])) {
        gestor_permissao_token();
        return gestor_usuario();
    }
    return null; // Visitante anônimo — sem redirecionamento
}
```

```php
// ❌ ERRADO — chamada incondicional força redirecionamento de visitantes anônimos
function identificar_usuario_publico() {
    gestor_permissao_token(); // Dispara gestor_cookie_verificacao() → redireciona para _gestor-cookie-verify
    return gestor_usuario();
}
```

> [!CAUTION]
> Without the `isset($_COOKIE[...])` check, the `gestor_cookie_verificacao()` function can trigger a **forced redirection** from the anonymous visitor to `_gestor-cookie-verify`, breaking the public browsing experience (shop, landing pages, checkout).

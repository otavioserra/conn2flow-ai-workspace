---
name: c2f-environment-configuration
description: "MANDATORY READ before adding or modifying credentials, environment variables (.env), and core settings in config.php. Prevents credential leaks in public Git, missing production configs, and fatal errors."
user-invocable: false
---

# Environment Configuration and Sensitive Variables in Conn2Flow

# ⚡ Mandatory Trigger
- **TRIGGER**: Declaring, reading, or modifying environment variables (`$_ENV`), constants in `gestor/config.php`, or templates in `autenticacoes.exemplo/`.
- **SKIP ONLY IF**: UI/presentation copy values that strictly belong in the variables system (`variables.json`).
- **CONSEQUENCE OF IGNORING**: Leaking private secrets to public repositories, fatal runtime errors from undefined production configs, or polluting `.env` with UI copy.

---

> [!CAUTION]
> **MANDATORY PROTOCOL FOR SECRETS AND CREDENTIALS**:
> NEVER embed API keys, secrets, tokens, or passwords directly inside PHP source code!
> All sensitive variables MUST follow the pipeline: `.env` -> `config.php` -> `$_CONFIG` or `$_GESTOR`.

## 1. Mandatory Workflow for Sensitive Variables

### Step 1: Register in `.env` Template
File: `gestor/autenticacoes.exemplo/dominio/.env`

```env
# === My New Integration ===
MY_API_KEY=
MY_API_SECRET=
MY_WEBHOOK_URL=
```

> [!IMPORTANT]
> The `autenticacoes.exemplo/` directory is the version-controlled reference template. Live installations use `gestor/autenticacoes/<domain>/.env` (gitignored). Registering keys in the template ensures new deployments and developers know which keys to configure.

### Step 2: Map in `gestor/config.php`
```php
// In gestor/config.php, within the configuration loading block:
$_CONFIG['my_api_key']     = $_ENV['MY_API_KEY'] ?? '';
$_CONFIG['my_api_secret']  = $_ENV['MY_API_SECRET'] ?? '';
$_CONFIG['my_webhook_url'] = $_ENV['MY_WEBHOOK_URL'] ?? '';
```

### Step 3: Consume in Application Code
```php
// In any PHP module:
$apiKey = $_CONFIG['my_api_key'];
$secret = $_CONFIG['my_api_secret'];

// Verification before use:
if (empty($_CONFIG['my_api_key'])) {
    // Log error or apply safe fallback
}
```

---

## 2. Governance for `HTML_SANITIZE` Variable

Conn2Flow uses the `HTML_SANITIZE` flag in `.env` to control HTML minification and comment removal:

```env
# Enables HTML minification and sanitization for public visitors (default: true)
HTML_SANITIZE=true
```

* **`HTML_SANITIZE=true` (Production Default)**:
  - Strips HTML comments (`<!-- ... -->`), CSS (`/* ... */`), and JS (`// ...`), compressing whitespace for public anonymous visitors.
  - **Automatic Bypass**: Authenticated Gestor sessions or active Live Editor requests (`gestor_dashboard_toolbar_ativo() === true`) automatically disable sanitization (100% bypass) to preserve widget boundaries (`<!-- widgets#... -->`) and architectural notes.
* **`HTML_SANITIZE=false` (Global Debug)**:
  - Unconditionally disables sanitization for all visitors during deep layout debugging.

---

## 3. Configuration Categories in `$_CONFIG`

| Category | Key Examples | Source |
|---|---|---|
| **Database** | Via `$_BANCO['host']`, `$_BANCO['nome']` | `.env` |
| **Sessions/Cookies** | `session_lifetime`, `cookie_secure`, `cookie_httponly` | `.env` / hardcoded |
| **Security CSP/CORS** | `csp_policy`, `cors_origins` | `config.php` |
| **HTML Performance** | `html_sanitize` | `.env` |
| **OAuth** | `oauth_google_client_id`, `oauth_google_secret` | `.env` |
| **Email/SMTP** | `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass` | `.env` |
| **Internationalization / Languages** | `LANGUAGES` (`$_GESTOR['languages']`), `LANGUAGE_DEFAULT`, `LANGUAGE_COOKIE`, `LANGUAGE_WIDGET_ACTIVE`, `LANGUAGE_AUTO_DETECT` | `.env` → `config.php` |
| **Payments** | `paypal_client_id`, `stripe_key` | `.env` |
| **External APIs** | `openai_api_key`, `anthropic_api_key` | `.env` |

---

## 4. Directory Structure

```
gestor/
  autenticacoes.exemplo/    <-- Template (Version-controlled in Git)
    dominio/
      .env                  <-- Example template with all documented keys
  autenticacoes/            <-- Live installation (GITIGNORED)
    mysite.com/
      .env                  <-- Live secret values
  config.php                <-- Bootstrap: loads .env and populates $_CONFIG, $_BANCO, $_GESTOR
```

## 5. `APP_ENV` and email communication

- The example template `gestor/autenticacoes.exemplo/dominio/.env` declares `APP_ENV=` and documents `production`, `staging`, and `development`. In `gestor/config.php`, a nonempty value is trimmed, lowercased, and stored in `$_CONFIG['email']['ambiente']` without an allowlist. If it is absent or blank, the default is `production`, or `development` when `DEVELOPMENT_ENV` is true.
- In `gestor/bibliotecas/comunicacao-fila.php`, `comunicacao_config()` reads that email setting first, then tries `$_ENV['APP_ENV']` and falls back to `$_GESTOR['development-env']`.
- The redirect guard in `gestor/bibliotecas/comunicacao.php` treats exactly `production`, `prod`, and `producao` as production. All other nonempty values are treated as non-production. Set `APP_ENV=development` explicitly for local development and `APP_ENV=staging` for staging.
- A valid `MAIL_REDIRECT_TO` replaces TO/CC/BCC with a single test mailbox and the message carries a test subject prefix and the `X-Original-To` header. In production, the guard blocks a valid redirect and the send path logs a warning once per request unless `MAIL_REDIRECT_ALLOW_PRODUCTION=true`. The template defaults that override to `false`.

## 6. Internationalization / Languages

- `LANGUAGES` is the CSV list of active language codes, for example `pt-br,en,es`. The `gestor/config.php` file loads the list from `.env` into `$_GESTOR['languages']`.
- `LANGUAGE_DEFAULT` sets the installation's default language, for example `pt-br`.
- `LANGUAGE_COOKIE` sets the name prefix for the language preference cookie. Core appends the host suffix.
- `LANGUAGE_WIDGET_ACTIVE` enables or disables the language selector widget.
- `LANGUAGE_AUTO_DETECT` enables automatic language detection from the browser.

**Activation is required** — pages, modules and variables for a language missing from `LANGUAGES` remain unavailable in the admin panel's language selector, in `/admin-environment/` and in Core routing even after SQL synchronization.

Follow `c2f-multilingual-system` for the full checklist, including `resources.map.php`, `language-label-<codigo>` for every active language, and the batch receipt reminder to update `.env` manually in Dev/Staging/Production.

---
name: c2f-multilingual-system
description: "READ BEFORE adding languages, localized routes or multilingual queries. Prevents cross-language content leakage and broken international URLs."
user-invocable: false
---

# Conn2Flow Multilingual Hybrid System (`CONN2FLOW-MULTILINGUAL-HYBRID-SYSTEM.md`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Manipulate tables with `language` column, register internationalized routes (`/en/`, `/pt-br/`) or manage language dictionaries.
- **SKIP ONLY IF**: Global utility modules agnostic the language.
- **CONSEQUENCE OF IGNORING**: Leaking of English records in the Portuguese view (and vice versa), failure in the resolution of translated slugs and SEO desigradation.

---

See and apply the following conventions when developing for multiple language support in Conn2Flow:

## 1. Language Structure and Resolution

* **Active Languages** — `LANGUAGES` in `.env` defines `$_GESTOR['languages']` at runtime. The typical baseline is `pt-br` (default) and `en`. Any additional language (`es`, `de`, `fr`) requires the full checklist to appear in the interface.
* **Active Language Code**: Accessible via `$_GESTOR['linguagem-codigo']`.
* **Physical Structure of Folders**:
  - Global resources: `gestor/resources/<idioma>/` (e.g. `pt-br/pages/`, `en/pages/`).
  - Module resources: `modulos/<modulo>/resources/<idioma>/`.

---

## 2. Relational Tables and Natural Key (`language`)

* Tables with multilingual support have the `language VARCHAR(10) NOT NULL DEFAULT 'pt-br'` column.
* The natural single key is usually composed of `['id', 'language']` (or `['language', 'module', 'id']`).

---

## 3. Translation Tools

* `ai-workspace/en/scripts/translates/` automation Scripts for generating and synchronizing dictionaries and features in new languages.

## 4. Mandatory New Language Activation Checklist

When starting translation or activation for `<lang>`, check the requirements and validate the workflow before delivery.

1. **Enable `LANGUAGES` in `.env`**. Check `gestor/autenticacoes/<dominio>/.env` for the local Lab and `gestor/autenticacoes.exemplo/dominio/.env` as the template. In `gestor/config.php`, `$_GESTOR['languages'] = $_ENV['LANGUAGES'] ? explode(',', $_ENV['LANGUAGES']) : [];`. Add the code to the CSV list, for example `LANGUAGES=pt-br,en,es`. When the code is absent, the admin panel, `/admin-environment/` and the router's language filter ignore its resources even after SQL synchronization. Flag the manual `.env` update for Dev/Staging/Production in the batch receipt.
2. **Check `resources.map.php`**. Declare `<lang>` in the project's `gestor/resources/resources.map.php` and check the Core map when activation depends on Core resources.
3. **Register `language-label-<codigo>` in `variables.json` for every active language**. Both `admin-environment.php` and the admin panel selector in `gestor.php` look up the display name via `gestor_variaveis(['id' => 'language-label-' . $lang])`.
4. **Scan for hardcoded lists**. Audit modules, layouts, topbars and profile screens such as `user-settings`. Replace fixed lists such as `['pt-br', 'en']` with reads from `$_GESTOR['languages']`.
5. **Run an E2E test through the actual workflow in an authenticated browser**. Open the Language tab in `/admin-environment/` and confirm that `#language_default` lists `<lang>`. Use the admin panel's language selector to switch `pt-br → <lang> → pt-br` and verify the translated interface displays no raw keys. Delivery requires both checks in addition to any direct URL/cookie tests.

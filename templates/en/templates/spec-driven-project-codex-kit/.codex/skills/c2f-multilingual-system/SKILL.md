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

* **Supported Languages**: `pt-br` (default), `en`, `es`.
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

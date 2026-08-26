---
name: c2f-resources-system
description: "MANDATORY READ before creating or editing any of the 11 native resource types (pages, layouts, components, templates, variables, ai_prompts, etc.). Prevents resources missing from build, stale JS/CSS cache, and broken deployments."
user-invocable: false
---

# Conn2Flow Resource System (`resources/`)

# ⚡ Mandatory Trigger
- **TRIGGER**: Creating, structuring, or modifying files inside `resources/<lang>/` directories in modules or projects.
- **SKIP ONLY IF**: Editing files unmanaged by the resource system (e.g. scripts in the root of `scripts/`).
- **CONSEQUENCE OF IGNORING**: Unsynchronized resources in SQL database, missing compilation in `*Data.json`, bugs masked by stale JavaScript/CSS cache, and broken layouts.

---

> [!WARNING]
> **MANDATORY HTML, CSS AND MARKDOWN RULE**:
> NEVER create loose `.html`, `.css`, or `.md` files at project root, public static folders, or PHP module roots!
> ANY HTML, CSS, or Markdown content for pages, layouts, components, templates, or prompts MUST be created inside the **Resource System** (`resources/`) structure so it can be compiled into `*Data.json` and synchronized into the database.

## 1. Resource Architecture (Physical Edit -> Compilation -> Database)

* **Source**: Developers edit physical files in `resources/<lang>/<type>/<id>/<id>.<ext>`.
* **Module Resources**: `modulos/<module-id>/resources/<lang>/<type>/<id>/<id>.<ext>`.
* **Natural Key**: The resource folder name (`<id>`) is the natural primary key in the Database.
* **Compilation**: `c2f resources:sync` reads sources and generates static files in `gestor/db/data/*Data.json` (`PaginasData.json`, `LayoutsData.json`, `ComponentesData.json`).
* **Synchronization**: Runtime applies Upsert in the Database respecting `user_modified = 1` and `project` protections.

---

## 2. The 11 Native Resource Types

| Type | SQL Table | Source File | Usage |
|---|---|---|---|
| `pages` | `paginas` | `<id>/<id>.html` + `<id>.css` | Pages with URL, linked to layout via `id_layouts` |
| `layouts` | `layouts` | `<id>/<id>.html` + `<id>.css` | Outer structure (header/footer) with insertion slot |
| `components` | `componentes` | `<id>/<id>.html` + `<id>.css` | Reusable HTML/CSS blocks |
| `templates` | `templates` | `<id>/<id>.html` | Email and notification templates |
| `variables` | `variaveis` | `variables.json` | Multilingual messages, labels, and UI copy |
| `ai_prompts` | `prompts` | `<id>/<id>.md` | AI prompts and instructions in Markdown |
| `ai_modes` | `modos` | `<id>/<id>.md` | AI system prompts and modes |
| `ai_prompts_targets` | `prompts_targets` | `<id>/<id>.md` | AI prompt targets |
| `forms` | `formularios` | `<id>/<id>.html` | Reusable HTML forms |
| `widgets` | `widgets` | `<id>/<id>.html` + `<id>.css` | Visual UI widgets |

---

## 🏷️ 3. Mandatory Version Bump Rule (Cache-Busting)

When creating or modifying any JavaScript script (`<id>.js`) or stylesheet (`<id>.css`) in `resources/`:
* The agent MUST perform a **version bump** (e.g., `"versao": "1.0.0"` ➔ `"1.0.1"`) in the resource metadata file (`<id>.json`) or the module manifest (`<modulo>.json`).
* This ensures that running `c2f resources:sync` updates the query string `<script src="...&v=1.0.1">`, immediately invalidating stale browser cache and preventing runtime bugs from outdated assets.

---

## 4. HTML and Section Conventions

* In page files (`pages/<id>/<id>.html`), add mandatory attributes to `<section>` tags:
  ```html
  <section class="text-center mb-16" data-id="1" data-title="hero">
      <!-- Section content -->
  </section>
  ```
  - `data-id`: Sequential numeric index starting at 1.
  - `data-title`: Simple semantic section name (e.g. `hero`, `features`, `contact`).

---

## 5. Dynamic Resource Extensibility

Custom tables can become new resource types automatically using `sync_resources: true` in `tables_config.json` or `<modulo>.json`.

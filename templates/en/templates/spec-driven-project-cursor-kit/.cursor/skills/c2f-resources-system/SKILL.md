---
name: c2f-resources-system
description: "READ BEFORE creating or editing native resources such as pages, layouts, components, templates, variables or AI prompts. Keeps builds, bindings, cache versions and deployments consistent."
user-invocable: false
---

# Conn2Flow Resource System (`resources/`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create, structure or change files within the `resources/<lang>/` folders of modules or projects.
- **SKIP ONLY IF**: Editing files not managed by the resource system (e.g. scripts at the root of `scripts/`).
- **CONSEQUENCE OF IGNORING**: Unsynchronised features for database SQL, no build on `*Data.json`, bug masking by JavaScript/CSS stale cache, and layout breaking on the published site.

---

> [!WARNING]
> **HTML, CSS, AND MARKDOWN ARCHIVE MANAGEMENT**:
> NEVER create files `.html`, `.css` or `.md` loose at the root of project, in static public folders or at the root of PHP modules!
> ALL and ANY HTML, CSS or Markdown content for pages, layouts, components, templates or prompts in Conn2Flow It must be created within the structure of the **Resource System** (`resources/`), so that it can be compiled in `*Data.json` and synchronized in the Database SQL by runtime.

## 1. Resource Architecture (Physical Edition -> Compilation -> Database)

### Proportionality of recovery — REQ-075 / Core REQ-269

Rate diff before compiling:

- **Category A:** PHP/APIS backend/migrations/business rules without HTML change, Tailwind classes, CSS or sources/compilation configuration. Don't reward Tailwind. If local synchronization is required, use `./c2f project:deploy <id>` or `./c2f manager:update-all --skip-css`. Isolated color uses the system pipeline.
- **Category B:** documentation, skills, unit tests and MDD memory. Run only relevant local tests/checks; no deploy pipeline in the Lab.
- **Category C:** screens/HTML templates/components/classes/authoral CSS/sources compilation. Run the complete pipeline without `--skip-css`; mixed changes with visual impact are also C.

Ignore CSS does not mean ignoring data: changed features still need to generate your `*Data.json` and reach database by pipeline. The flag dispenses Tailwind and derived CSS, preserving the other steps. The Core/database surgical route does not compile project resources. Keep version bump and cache invalidation for changed scripts/styles. Do not build full in A or deploy in B; do not promise duration <45 seconds without measuring in the real environment.

* **Source (Source)**: Developers create/edit physical files in `resources/<idioma>/<tipo>/<id>/<id>.<ext>`.
* **Module Resources**: `modulos/<modulo-id>/resources/<idioma>/<tipo>/<id>/<id>.<ext>`.
* **Natural Key**: The name of the resource folder (`<id>`) is the natural primary key in Database.
* **Build**: The `c2f resources:sync` command reads sources and generates static files in `gestor/db/data/*Data.json` (`PaginasData.json`, `LayoutsData.json`, `ComponentesData.json`).
* **Synchronization**: Runtime applies Upsert to Database respecting `user_modified = 1` and `project` protections.

---

## 2. The 11 Types of Native Resources

|Type|SQL Table|Source File|Usage|
|---|---|---|---|
|`pages` (pagins)|`paginas`|`<id>/<id>.html` + `<id>.css`|URL pages linked to layout via `id_layouts`|
|`layouts`|`layouts`|`<id>/<id>.html` + `<id>.css`|External structure (header/footer) with insertion slot|
|`components` (components)|`componentes`|`<id>/<id>.html` + `<id>.css`|Reusable HTML/CSS Blocks|
|`templates`|`templates`|`<id>/<id>.html`|Email templates, notification, etc.|
|`variables` (variable)|`variaveis`|`variables.json`|Messages, labels and multilingual texts|
|`ai_prompts`|`prompts`|`<id>/<id>.md`|Prompts and instructions for AI in Markdown|
|`ai_modes`|`modos`|`<id>/<id>.md`|System prompts and AI modes|
|`ai_prompts_targets`|`prompts_targets`|`<id>/<id>.md`|AI Prompt Targets|
|`forms` (formulas)|`formularios`|`<id>/<id>.html`|Reusable HTML Forms|
|`widgets`|`widgets`|`<id>/<id>.html` + `<id>.css`|Visual interface widgets|

---

## 🏷️ 3. Version Bump Mandate Rule (Cache-Busting)

When creating or editing any JavaScript script (`<id>.js`) or stylesheet (`<id>.css`) in `resources/`:
* THE AGENT MUST THANKLY DO THE**version bump** (version increment, e.g.`"versao": "1.0.0"` ➔ `"1.0.1"`) in the metadata file ofresource (`<id>.json`) or the module manifest (`<modulo>.json`).
* This ensures that when running `c2f resources:sync`, the query string `<script src="...&v=1.0.1">` is updated, forcing the browser to invalidate the old cache immediately and preventing errors by running obsolete assets (*sale cache*).

---

## 🗄️ 3.1. Source of Truth in Runtime (Database vs Disk)

> [!IMPORTANT]
> Conn2Flow runtime serves HTML and CSS exclusively from **DATA BANK** (`gestor.php:2782`). The `resources/` directory is read directly only under `DEVELOPMENT_ENV=true`.

**Architecture Flow**:
```
resources/ (disco) → c2f resources:sync → *Data.json → Upsert no Banco SQL → Runtime serve do Banco
```

* **Disk (`resources/`)**: It's **Compilation seed** — the source author where developers create and edit.
* **Database**: It is the **source of truth in runtime** — what the visitor sees and what the Gestor edits.
* **Official Pipeline**: Disk changes Only reach runtime after running `c2f manager:update-all` (for the system) or `c2f project:deploy <id>` (for projects).

**When investigating the behavior of a published page:**
1. Inspect database FIRST (tables `paginas`, `layouts`, `componentes`).
2. Compare with `resources/` to identify differences.
3. NEVER assume that disk content is what is being served.

---

## 4. HTML Conventions and Sections

* In page files (`pages/<id>/<id>.html`), you must add attributes to the `<section>` tags:
  ```html
  <section class="text-center mb-16" data-id="1" data-title="hero">
      <!-- Conteúdo da seção -->
  </section>
  ```
  - `data-id`: Sequential numerical index starting at 1.
  - `data-title`: Simple semantic name of the section (e.g. `hero`, `recursos`, `contato`).

---

## 5. Dynamic Resource Extendability

Custom tables can become new types of features automatically using `sync_resources: true` in `tables_config.json` or `<modulo>.json`:

```json
{
  "tabelas": {
    "minha_tabela": {
      "nome": "minha_tabela",
      "config": {
        "sync_resources": true,
        "resources_dir": "minha_tabela",
        "metadata_file": "minha_tabela.json",
        "field_types": {
          "html": "file:html",
          "css": "file:css",
          "conteudo": "file:md",
          "config": "json"
        }
      }
    }
  }
}
```

The supported `field_types` are:
* `file:html` — Physical HTML file in `<id>/<id>.html`
* `file:css` — Physical CSS file in `<id>/<id>.css`
* `file:md` — Physical Markdown archive in `<id>/<id>.md`
* `json` — Inline JSON data in the metadata

The compilation generates `[PascalCase]Data.json` (e.g. `MinhaTabelaData.json`) automatically.

Author note: in the surgical route Core/database, --core-resources preserves the owner of Core seeds. Data and own resources of project require your specific synchronization; do not use this flag to transfer authorship.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

## Rep-002 — manifests per layer and clashes

Precedence: `projeto` > `plugin:<id>` > `core`. Files use `installation/manifests/<camada>.json`; data use `recursos-<dono>.json`. Same name data in `db/data/` does not change owner: step Core reads the delivery Core; the project step reads the project delivery.

|Shock|Situation|
| --- | --- |
|`editado`|Local file differs from the version delivered by the layer|
|`sobreposto`|Top layer takes precedence over delivery|
|`retirado`|Owner stopped delivering; keep even human decision|
|`retirado-editado`|Removed file also has local edition|
|`original-ausente`|Original required for comparison is not available|

Register clashes before recording the manifest; new versions are in `backups/overrides/<versão>/`. Never reconcile in mass without human simulation and confirmation (DEC-136).

Note REQ-077: `--skip-css` refers to the commands that implement it (`manager:update-all` and the exception `project:update-all`). The `ProjectDeployCommand.php` wrapper passes only project and `--contents`; do not prescribe this flag to `project:deploy`.

---
name: c2f-documentation
description: "READ BEFORE writing, fixing, migrating or publishing Conn2Flow documentation. Keeps documentation grounded in code, with required frontmatter, pt-br/en pairs and publication through /docs/."
user-invocable: true
---

# Conn2Flow Documentation: Code → Markdown → Website (`c2f-documentation`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Request to document, correct or migrate documentation (library, module, API, CLI, hook, guide); run the periodic doc routine; publish docs on the `/docs/` site; create or change `docs.config.json` of a project.
- **SKIP ONLY IF**: Edit SDD (`sdd/`) artifacts, repository README or code docblocks unrelated to `ai-workspace/<idioma>/docs/`.
- **CONSEQUENCE OF IGNORING**: Delayed or hallucinated documentation (written from the old text), docs without `verified_at` invisible to ranking, divergent translation, and pages edited in the panel overwritten in the next build.

Complements `c2f-documentation-governance` (code authority principle). This skill is **procedure**.

---

## 1. Where documentation lives (single source)

- **Source:** `conn2flow/ai-workspace/<idioma>/docs/` in the Core repository. Languages: `pt-br` and `en`.
- **Tree:** `guides/`, `concepts/`, `reference/{libraries,modules,api,cli,hooks}/`, `whats-new/` and the root `index.md`.
- **Mirroring:** folders and filenames are **equal in both languages**. The relative path defines the translation pair and the public URL (`/docs/<caminho>/`).
- **Legacy:** files in MAIUSCULAS at the root of `docs/` (and old subfolders like `bibliotecas/`, `modulos/`, `manual/`). When migrating a subject, the new doc is born in the tree and the corresponding legacy is removed in the same passage.
- **Complete contract:** `ai-workspace/pt-br/docs/guides/documentation.md`, which is itself a system doc.

## 2. Required Frontmatter

```yaml
---
title: "Biblioteca modelo.php"
description: "Uma frase — índices, compartilhamento e llms.txt."
section: reference          # guides | concepts | reference | whats-new (= pasta); home só no index.md raiz
order: 20                   # opcional (padrão 100)
visibility: public          # public (padrão) | restricted (reservado: o build não publica)
module: menus               # opcional
sources:                    # obrigatório em reference/
  - gestor/bibliotecas/modelo.php
verified_at: 5b4348ab       # git rev-parse --short HEAD do Core no momento da conferência
---
```

## 3. Procedure for each documentation pass

1. **Ranking:** `php cli/c2f.php docs:audit` (in Core). Take the N items from the top. `missing:` means that doc does not exist.
2. **Skeleton** (new library only): `php cli/c2f.php docs:extract <lib> --create`. This creates and en with the function block.
3. **Deep code reading, BEFORE any old text:**
   - **Library:** the entire file, the callers (`grep -rn "funcao(" gestor`), the tests in `tests/`.
   - **Module:** `<id>.php` (Option switch and AJAX), `<id>.json` (table, resources, hooks), JS, `<id>.widget.php`/`.widget.js`, `resources/<idioma>/` (pages, templates, `ai_modes`), migrations from the table, `hooks`/`api`.
   - **System/CLI/API:** the controller or command and the actual call flow.
4. **Write the actual behavior:**
   - letter box;
   - first occurrence;
   - *defaults*;
   - what happens when something's missing;
   - safety risks.
   If the code contradicts the docblock itself, the doc follows the code and points to the divergence. **Mark the legacy** (function without callers, called the non-existent function). Use examples taken from real uses of the core.
5. **Bilingual in the same passage:** write in and in together. No "translate later."
6. **Close doc:**
   - fill in `sources` and `verified_at`;
   - turn `php cli/c2f.php docs:extract --all`;
   - Turn again `php cli/c2f.php docs:audit` until the item exits the ranking (score 0).
7. **Publish (local):**
   - `php cli/c2f.php docs:build --project=conn2flow-site-local`, then `php cli/c2f.php project:deploy conn2flow-site-local`;
   - Check the pages (HTTP 200, `c2f page:inspect ... --screenshot`).
   - The deploy of **production is of the operator**.
8. Register on the batch SDD and update the execution memory.

## 4. Writing

- Callouts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` (first line alone).
- Links between docs: relative to `.md` (`../modules/menus.md`). Broken link **abort** the build.
- Links to code: relating to doc (`../../../../../gestor/bibliotecas/x.php#L10`). The build converts to GitHub.
- Gestor (`@[[grupo#var]]@`, `<!-- widgets#... -->`, `<!-- item < -->`) markers can be shown in code or text. The build neutralizes the arroba; do not "run" it in doc.
- Do not edit inside `<!-- c2f:extract:start -->` ... `<!-- c2f:extract:end -->`. `docs:audit` warns when a code function is not quoted outside the block.

## 5. Publication in a project (`docs:build`)

- **Settings:** `<gestor do projeto>/docs.config.json` defines:
  - `languages`, `base_path`, `layout`;
  - `article_template` (template `target=publisher`);
  - `menu` (id + template `target=menus`);
  - `publishers` (sections → publisher, `index_path` and `index_widget` of the entry page with `publisher-index`);
  - `repository`/`branch`, `site_url` and `labels` by language.
- **Request:** `resources/project_tables_config.json` with `sync_resources` for `publisher`, `publisher_pages`, `publisher_index` and `menus`.
- **What is generated** (IDs `docs` and `docs-*`, **managed by build**, which should never be edited by hand or in the panel):
  - `pages/`;
  - `publisher_pages/`;
  - `menus/<menu>/`;
  - the entries in `pages.json`, `publisher-pages.json` and `menus.json`;
  - `assets/docs/llms*.txt`.
- The build is idempotent. Running twice without changing Markdown does not change file.
- Implementation Reference: `conn2flow-site` (REQ-057 / BATCH-050) and Core `cli/src/Support/Docs/`.

## ⛔ Prohibitions

- Document from memory, legacy text or other doc without opening the code.
- Post only one language, or leave `verified_at` empty.
- Edit `docs*` pages through the dashboard or directly into `resources/` of project (the next build overwrites).
- Publish sensitive information (hosts, IPs, credentials, VPS paths, tokens). In doubt, `visibility: restricted`.
- Deploy of production by the agent.

## How to use: literal interface terms for RAG (BL-028)

Each documented screen receives a standardized section "How to use" ("How to use" in English). Check actual labels in resources/ and current handlers before writing. Describe entry/route and permission, mandatory/optional fields with their literal names, sequence of buttons with their literal names, expected result and error recovery. Keep the language pair aligned and use the terms displayed in that language.

Do not replace visible name with SQL column or invent flow from old manual. The assistant consults this section via RAG: Undocumented behavior cannot be promised. Preserve technical reference separately and check the use against the actual screen when the flow changes.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

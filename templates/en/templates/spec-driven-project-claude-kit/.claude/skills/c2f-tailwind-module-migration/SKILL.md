---
name: c2f-tailwind-module-migration
description: "READ BEFORE migrating a panel module from Fomantic-UI to Tailwind under req-219. Prevents legacy JavaScript breakage and inverted responsive behavior."
user-invocable: false
---

# Panel module migration to Tailwind (req-219, DEC-132)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: swap pages from a `layout-administrativo-do-gestor` module to `layout-administrativo-tailwind`, create component `-tailwind` variant, or tap the control library.
- **SKIP ONLY IF**: The module is already in Tailwind and the change does not touch HTML, screen JS or components.
- **CONSEQUENCE OF IGNORING**: Actionless button, unchanged tab, footer open modal, `grid-cols-1` winning `md:grid-cols-2`, save with 403.

## Alive reference

- Full implementation: `admin-paginas` (commits `7cf44d27` and `435fd83c`, `sdd/implementation/BATCH-227.md` report).
- Native Tailwind Module: `perfil-usuario`.
- Library: `gestor/assets/interface/controles.js` and `gestor/bibliotecas/controles.php` headers.
- Contract tested: `tests/Unit/PHP/HtmlEditorTailwindReq219Test.php`. Model browser script: `conn2flow-site/sdd/validation/core/req219-controles-e2e.cjs`.

## Step by step per module

1. **Metadata** (`<modulo>.json`, en and en) on each migrated page: `layout: layout-administrativo-tailwind`, `framework_css: tailwindcss`, `tailwind_bundle: true`, `tailwind_dependencies` (the panel globals — `menu-principal-sistema-tailwind`, `interface-formulario-edicao-tailwind` or `-inclusao-tailwind`, `interface-carregando/alerta/delecao-modal-tailwind`, `interface-formulario-autorizacao-provisoria-tailwind` — plus all variant mounted on runtime) and `tailwind_sources` for PHP/JS writing utilities. Up page `version` and `versao` of the module.
2. **PHP of option**: `$_GESTOR['tailwind-page-bundle'] = true;` at the beginning of the option function. Without that the sidecars of the components enter after the bundle and the responsives reverse.
3. **Page HTML**: fields in standard `c2fc-campo` / `c2fc-campo-rotulo` / `c2fc-campo-entrada`, grid with `grid grid-cols-1 gap-4 md:grid-cols-2`, key with `c2fc-chave` (native checkbox + `c2fc-chave-trilho`), warning in box `rounded-lg border … bg-sky-50`. Keep `name`, `id`, `#…#` placeholders, `@[[…]]@` variables and `<!-- x < -->` markers exactly. `data-checked="#x#"` becomes the direct attribute `#x#` (the PHP swaps for `checked`). The status stamp of the metadata comes out by `interface_status_selo($status)` (already applied in almost all modules); other pieces written in the PHP module also change.
4. **Module components** mounted on runtime: create `<id>-tailwind` and choose with `interface_componente_variante('<id>')` (guard with `function_exists` in library running without `interface`). Register in the JSON module (or `resources/<lang>/components.json` if global) with `framework_css: tailwindcss`.
5. **Module JS**: continues to operate through the bridge (`dropdown`, `checkbox`, `tab`, `modal`, `dimmer`, `popup`, `form`, `transition`). Change only what depends on visual class: selectors `.ui.form`, `.x.button`, `.closest('.field')`, `$.formSubmitNormal` (use `form.requestSubmit()`), `alert/confirm/prompt` (use `c2fControles.dialogo`). New code is pure JavaScript.
6. **Modals in the variant** are born with `hidden`, guard `header/content/actions` and the `approve`/`cancel`/`deny` hooks; the bridge leads them to the `body`. Charging coverage: `ui dimmer c2fc-cobertura` (JS legacy connects `.active`).
7. **List** (root page): the Tailwind list of the req-220 is already in `main`. Change root layout/bundle, put `interface-listar-tailwind` on dependencies and `$_GESTOR['tailwind-page-bundle'] = true;` on `case 'listar'`. Own top filter goes on `tabela.cabecalho` as `-tailwind` variant (example: `lista-pagina-ou-sistema-tailwind` `admin-paginas`). The component has `id="_gestor-interface-listar"`, so the JS of the module that connects filters still finds the list.

## House rules

- Tailwind Utility only in resource HTML (this is what the compiler sees). Element created by generic JS/PHP uses `c2fc-*` class in `controles.css`.
- Icons: Lucide (`<i data-lucide="nome" class="size-4">`); inside `<template>` not renders.
- Tooltips: `data-c2f-dica` (`data-tooltip` is CSS of Fomantic).
- Do not touch `controles.js`/`controles.css`/`controles.php`, `interface.php` or `html-editor.php` out of its scope: ask the owner of the req-219 to report.
- Comment on resource never cites placeholder (`#x#`, `@[[x]]@`): the exchange takes the first occurrence, within the comment.
- project Pipeline: a round of `project:deploy <id>`; check assets mined on delivery. `project:update-all` only for mixed batch Core + project.
- Minimum validation: PHP contract test (original x variable, metadata, HTML without `class="ui `), Vitest move on JS, Playwright script on Lab (without Fomantic asset in the main document — `request.frame() === page.mainFrame()` —, save without 403, 390 px without scrolling, no visible `.ui.modal` loose) and the same Fomantic control module without change.
- Shared Lab: beam with `mkdir C:/Users/otavi/OneDrive/Documentos/GIT/.c2f-lab-lock` (failed = another agent using; wait), `git merge origin/main` in your branch before `project:deploy conn2flow-site-local` (rode 2 times when changing JS) and script, and release with `rmdir` at the end.
- Human pendency goes to `conn2flow-site/sdd/PENDENCIAS-HUMANAS.md`, item of the unique script of the req-219.

## Main scope and late boot by hooks (BL-028)

Reading screen fields/labels is restricted to main, because the search menu also uses label. Do not scan all document labels to form AI context. If there is no main, wait for mounting or reporting no context; do not fall into the entire document.

Script included by hook can run before the editor/components are created. Make initial attempt after DOM ready and observe main with MutationObserver (childList/subtree); use debounce/limited interval for further attempts, without tight loop. Initialization should be idempotent, prevent duplicate handles/buttons and disconnect observer/timer when no longer required or dismount screen. Validate with editor created after hook and repeated opening.

The historical orientation of two JS publications does not apply to the current pipeline: with lock, update timestamps of modified versioned files and run project:deploy <id> once by project sequentially. Two projects with the same origin need a round each.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

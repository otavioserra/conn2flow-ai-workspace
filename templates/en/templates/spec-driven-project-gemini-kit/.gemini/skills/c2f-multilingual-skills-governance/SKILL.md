---
name: c2f-multilingual-skills-governance
description: "READ when creating, renaming or editing skills, or adding template languages. Keeps reviewed translations paired with source SHA-256 hashes without overwriting translated content."
user-invocable: false
---

# Multilingual governance of skills — REQ-078

## MANDATORY TRIGGER

- **TRIGGER**: Create, rename or edit a skill; add a language to the templates.
- **SKIP ONLY IF**: Change without impact on skills or the translation catalogue.
- **CONSEQUENCE OF IGNORING**: Unupdated translation silently protected or overwritten by content in the wrong language.

## Triad of authorship

1. PT-BR Matrix: `.gemini/skills/<nome>/SKILL.md` is the canonical source of the procedure.
2. Translated templates: `templates/<idioma>/templates/<kit>/<cliente>/skills/<nome>/SKILL.md` receive revised translation. skill name, PHP functions, c2f commands, constants, paths and superglobals remain intact. Translate explanations, triggers and description YAML; preserve keys, control values and Markdown alerts.
3. Satellites: `node scripts/skills/sync-skills.cjs --apply --all` propagates the matrix through existing kits and preserves registered translations and local skills. Do not manually copy to test mirrors.

## Matrix-only sync

Use these commands for local batches approved for the matrix. The selection includes all five matrix kits and the templates. The EN templates keep their registered translations.

```sh
node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace
node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json
```

## Selective writes and customized variants

`--apply <skills>` restricts writes to the selected skills. The audit still inspects the full catalog at the selected destinations and may report pre-existing differences in other skills. That is why exit code `1` can appear after the selective write has finished: validate the scope by filtering the selected skills in the JSON report (`--report`) before concluding that the write failed.

Review the variant against the source and incorporate the update while preserving the legitimate customization. Acknowledge the new hash pair with `mdd sync --customize <kit>/skills/<skill>/SKILL.md --matrix <matrix> --path <destination>` and run the audit again.

## Hash pairing and review

The record `scripts/skills/translated.json` maps language → skill → `source_sha256`, `translated_at` and `translator`. The SHA-256 identifies the reviewed PT-BR source. The synchronizer converts CRLF to LF in memory before hashing the source and comparing skill copies. Written copies retain the source bytes, and hashes for acknowledged customizations still use the exact bytes.

Before updating hashes, check the branch and working tree with `git branch --show-current` and `git status --short`. Use `git ls-files --eol -- .gemini/skills` to compare the index (`i/`) and working tree (`w/`), and `git diff --ignore-cr-at-eol -- .gemini/skills` to review content changes. Raw file hashes can change solely because of CRLF/LF, including in files with mixed endings. Review translations before acknowledging actual source changes.

Before changing the matrix, inspect its active translations. After the change, update the translations in the scope or explicitly record the pending in the batch. Standard audit and `mdd sync --audit --matrix <raiz> --path <destino>` emit `[DRIFT-WARNING]`/`DRIFT_WARNING` if source diverges. Warning is non-blocking; actual copy differences continue FAIL.

After reviewing the content translated into all relevant kits, recognize the new source:

```sh
node scripts/skills/sync-skills.cjs --update-translation-hash <skill> <idioma> --translator mdd-agent
node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json
```

Tests that read the matrix (e.g. `pytest -q tools/mdd-client/tests`) must run **after** the translation hashes are acknowledged (`--update-translation-hash`), to avoid a transient `DRIFT_WARNING` during the round. Order: sync → hashes → audit → `pytest`.

Never update hashes automatically during normal sync, before content review, or merely to obtain PASS. Overwrite protection remains active even when drift is detected. Rename requires migrating the name in the kits and registration, preserving the history and reviewing hashes; do not create a second source of authorship.

## New language

Create the language kits with the same structure; translate each complete procedure and its descriptive metadata. Register only existing and revised translations, with SHA-256, ISO date and responsible. Check equivalence of rules, code blocks, functions, commands, variables, and links. Run audit, sync tests, and a source mutation in a fixture to demonstrate a warning without overwriting content. Include the language in the synchroniser template selection before claiming propagation support. This maintenance does not authorize production changes or human acceptance.

## Subskills, index and aliases — REQ-088

- **`<skill>/subskills/<topic>.md`**: a long recipe, or one specific to a provider or rare case, lives inside the parent skill and is read on demand without inflating the initial system prompt. The parent skill keeps a pointer with the reading trigger and the critical rules. `sync-skills.cjs` propagates subskills only where the parent skill exists and audits each file (`subskill ausente` or `subskill diferente` is FAIL).
- **Translation**: the translated subskill sits at the same relative path in the language template. The skill's `source_sha256` covers `SKILL.md` and all its subskills, so changing a PT-BR subskill raises `DRIFT_WARNING` until the EN review and `--update-translation-hash`.
- **Index**: `node scripts/skills/generate-skills-index.cjs` generates `.gemini/skills/index.md` (personas, core, governance, lines, bytes, budget and subskills). Run it after creating, renaming or resizing a skill; `--check` fails when the index is stale.
- **Renaming**: register the legacy → canonical pair in `renamedSkills` in `sync-skills.cjs` and rename the key in `translated.json`. The synchroniser moves the whole folder, never copies it, only when the new name is selected, and refuses to migrate when both names coexist. Active aliases: `c2f-architect-master` → `c2f-persona-architect`, `c2f-executor-agent` → `c2f-persona-executor`, `c2f-reviewer-agent` → `c2f-persona-reviewer`, plus the four `sdd-*` → `mdd-*` aliases from REQ-075. **Mandatory order (REP-010)**: rename the key in `scripts/skills/translated.json` (and register the translation of a new skill) **before** the first `--apply`; if the sync runs first, it moves the EN folder through the alias and writes PT-BR over the translation.

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

`--apply <skills>` restricts writes to the selected skills. The audit still inspects the full catalog at the selected destinations and may report pre-existing differences in other skills.

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

Never update hashes automatically during normal sync, before content review, or merely to obtain PASS. Overwrite protection remains active even when drift is detected. Rename requires migrating the name in the kits and registration, preserving the history and reviewing hashes; do not create a second source of authorship.

## New language

Create the language kits with the same structure; translate each complete procedure and its descriptive metadata. Register only existing and revised translations, with SHA-256, ISO date and responsible. Check equivalence of rules, code blocks, functions, commands, variables, and links. Run audit, sync tests, and a source mutation in a fixture to demonstrate a warning without overwriting content. Include the language in the synchroniser template selection before claiming propagation support. This maintenance does not authorize production changes or human acceptance.

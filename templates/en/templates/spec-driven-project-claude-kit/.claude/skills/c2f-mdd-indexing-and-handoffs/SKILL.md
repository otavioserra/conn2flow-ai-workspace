---
name: c2f-mdd-indexing-and-handoffs
description: "Use when creating MDD metadata, rebuilding index.md, changing status or preparing handoffs among Executor, Reviewer, Architect and human. Does not replace normative approval or human acceptance."
---

# Indexation and handoffs MDD — ARCH-015 / REQ-072

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create MDD artifacts, change frontmatter/status, regenerate indexes or transfer a batch between roles.
- **SKIP ONLY IF**: Work without memory artifacts or role transition.
- **CONSEQUENCE OF IGNORING**: Out-of-date indices, loss of handoff scope and false human acceptance.

Read CURRENT.md and the approved request in the target repository. In the matrix and migrated satellites use memory/; legacy boilerplates use sdd/ until migration is authorized. Existing code/configuration prevails over historical memory.

## Canon Frontmatter

New governance documents begin with this YAML mapping of strings. Use double quotation marks with JSON (also valid in YAML); do not use lists, objects, anchors or tags. `|`, `|-`, `|+`, `>`, `>-`, `>+` are accepted for reading; prefer strings with `\n` for deterministic writing.

```yaml
---
id: "BATCH-074"
title: "Implementação da Trava Tripla MDD"
status: "ready-for-review"
date: "2026-10-09"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Entrega dos comandos de metadados, índices e handoffs da Trava Tripla MDD."
summary_medium: "Paridade PHP/Python, skill canônica e inbox de revisão.\nEvidências no lote e no recibo."
---
```

|Field|Rule|
| --- | --- |
|id|preserved canonical ID; do not renumber history|
|title|Descriptive title of the artifact|
|status|Verifiable status; never invent approval|
|date|Date YYYY-MM-DD|
|author|architect, executable, reviewer or human|
|target_repo|Target repository identifier|
|summary_short|A line with 30–140 characters; used directly in the index|
|summary_medium|Summary of two or three lines, escaped or YAML block|

CLIs preserve additional string fields. A legacy document receives inferred defaults, with empty date/author when unknown; fill them with verifiable facts. The tools do not validate the status vocabulary or editorial limits of the abstracts.

## Self-healing and mutation

In the core, the commands solve the core root; use `--repo=RAIZ_ABSOLUTA` for the matrix or other project. In Python, `--path RAIZ_ABSOLUTA` selects project; default is the current directory.

```sh
php cli/c2f.php memory:index [pasta] --repo=RAIZ_ABSOLUTA
php cli/c2f.php memory:set req-072 --status=IN-PROGRESS --repo=RAIZ_ABSOLUTA
php cli/c2f.php memory:get req-072 status --json --repo=RAIZ_ABSOLUTA
mdd index [pasta] --path RAIZ_ABSOLUTA
mdd meta set req-072 status IN-PROGRESS --path RAIZ_ABSOLUTA
mdd meta get req-072 status --json --path RAIZ_ABSOLUTA
```

Without folder, index regenerates all existing index.md under memory/ including historical files. With explicit folder, create/rebuild only the local index. Targets accept path in memory/ or single file name/ID; ambiguity fails and requires explicit path. Do not change the index as if it were source authorship: regeneration replaces its content with table and links to child indexes. README, CURRENT, BATCH-INDEX, DECISION-LOG and VALIDATION-CHECKLIST are infrastructure and do not enter as records.

Fallback: first `# Título`; standard ID `# ID — Título` or file name; first run paragraph, ignoring headers, tables, lists and code fences, up to 120 characters including `...`; line status Status or `indexed`/`archived`. Incomplete or unsupported YAML does not block index/get: uses valid fields and defaults. Mutation refuses invalid/duplicated header without discarding information. Fallback does not modify the document.

Set preserves body, GOOD, end line, comments and unaltered fields. New Strings are serialized with quotation marks. PHP accepts multiple `--campo=valor`; Python API accepts a dictionary; Python command changes a field by call. Each replacement is atomic; the writers cooperate with the unique memory/.mdd.lock lock. Save index failed restores document. Crash between the two substitutions requires memory:index/mdd index; no filesystem transaction between two files. Inspect orphan lock before removing it; never remove lock from another process.

Reusable API: `mdd_client.core.indexer.index(repo, target=None)`, `get(repo, target, field=None)` and `set_metadata(repo, target, updates)`. Do not shoot indexing concurrent with compact/init on the same root. External paths, symlinks and junctions are refused for mutation.

## Handoffs per event

|Topology|Event and Next Role|
| --- | --- |
|soil|Executor completes tests and self-review against checklist; prepares human review|
|double|Executor delivery batch, executive summary and continuity command to Macro-Architecture|
|triade|Executor issues completions/<batch-id>-receipt.json and triggers Independent Reviewer; Reviewer creates memory/human-reviews/rev-XXX.md|

|Autonomy|Paper transition|
| --- | --- |
|supervised|Prepare complete prompt and wait explicit human input before triggering next role|
|autonomo_monitorado|Activate next authorized role with Live All visible and verifiable receipt|
|autonomo_headless|Dispatch via available mechanism and persist receipt/evidence; stop before lack of authorization or contract|

Combine one row of each table. Topology does not expand autonomy; no combination authorizes human fictional human acceptance or production. If MCP Hub is not available, register the limitation and use receipt in file; do not claim remote dispatch.

Every prompt contains: project, absolute root, REQ, BATCH, topology, autonomy, scope, paths of evidence, technical status, pending and expected action. For BATCH-074 declare both: conn2flow-ai-workspace in C:/Users/otavi/OneDrive/Documents/GIT/conn2flow-ai-workspace and conn2flow in C:/Users/otavi/OneDrive/Documents/GIT/conn2flow.

## human acceptance Inbox

memory/human-reviews/ keeps up to ten rev-XXX.md active, as well as README/index. The Reviewer issues executive summary, security audit/variables/regression, evidence/tests, opinion RECOMMEND-APPROVAL or RECOMMEND-REVISION and `[ ] Homologado por: _____`. Only identified human signs human acceptance. File old homologated chips with original integrity in archive/original/ and traceable synthesis in archive/compacted/; update indexes and repair links. Do not file to-dos to artificially fulfill the ceiling.

Stage/commits list specific paths. Skills are propagated exclusively by scripts/skills/sync-skills.cjs; do not overwrite local skills or declared translations. Can't healthy memory to close batch.

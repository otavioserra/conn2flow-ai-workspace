# MDD Governance for [PROJECT-NAME]

This directory defines the local Memory-Driven Development governance for the project.

## Minimum normative order

1. `memory/README.md`
2. `memory/00-baseline-architecture.md`
3. `memory/SPEC.md`
4. `memory/process/00-START-HERE.md`
5. `memory/process/01-WORKFLOW.md`
6. `memory/implementation/BATCH-INDEX.md`
7. `memory/validation/VALIDATION-CHECKLIST.md`
8. `memory/decisions/DECISION-LOG.md`

## Golden rules

- `memory/human-requests/` is non-normative human intake.
- The executor may update operational artifacts such as `implementation/` and `validation/`.
- Normative changes should be consolidated into `SPEC.md`, the baseline, or other numbered SDD files only when the requirement really changes.
- Each round should pursue the smallest plausible batch and the cheapest validation capable of falsifying the current slice.

## Initial state

- `BATCH-000`: SDD boilerplate installed.
- `BATCH-001`: first functional batch waiting for classification.
- Active pointer: `memory/human-requests/CURRENT.md`.

## Five canonical root documents

| File | Purpose |
| --- | --- |
| [00-baseline-architecture.md](00-baseline-architecture.md) | Architecture and context router |
| [01-general-memory.md](01-general-memory.md) | Memory mechanics and lifecycle |
| [02-policy.md](02-policy.md) | Governance and agent policy |
| [03-memory-engineering-chief.md](03-memory-engineering-chief.md) | Chief engineering directives and strategic journal |
| [04-memory-engineering-execution.md](04-memory-engineering-execution.md) | Dated execution sessions and technical lessons |

Numbering standardizes filenames; historical content may remain multilingual. SPEC.md and index.md are supporting infrastructure.

## Raw observations and execution archives

Use [raw/active/](raw/active/index.md) for temporary scratchpads, observable logs and shareable decision summaries, without secrets or private reasoning transcripts. Raw observations have no normative authority.

Execution memory has a preventive 50 KiB ceiling and a critical alert at 75 KiB. Plan maintenance at 50 KiB; never prune healthy memory merely to close a session. When authorized maintenance is needed, preserve the complete original in [raw/archive/original/](raw/archive/original/index.md) and a traceable summary in [raw/archive/compacted/](raw/archive/compacted/index.md) before reducing the active document to about 25 KiB with the 20–25 most recent records and all unresolved items. Repair links and update hierarchical indexes in the same operation.

## MDD metadata and handoffs

New governance documents start with scalar YAML frontmatter: id, title, status, date (YYYY-MM-DD), author, target_repo, summary_short (30–140 characters), summary_medium (two or three lines). Quote strings; escape multiline values. Use the language-specific rev-example.template.md under templates/. Legacy documents remain readable through title/first-paragraph fallback.

The human-reviews/ inbox holds ten active reviews plus README/index, with dual original/compacted archives. Handoffs include project, absolute root, REQ, BATCH, topology, autonomy, scope, evidence and next action. solo: self-review; dupla: return to Architect; triade: receipt then Independent Reviewer. supervisionado waits for human input at every role transition; autonomo_monitorado shows Live Todo and triggers authorized transitions; autonomo_headless persists dispatch and receipts. Only humans sign homologation. These MDD kits use memory/.

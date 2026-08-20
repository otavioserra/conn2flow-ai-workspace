# Spec-Driven Development Project

- Treat `sdd/README.md` and numbered sdd documents as the normative source of truth.
- Before editing code or SDD files, read `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the current batch, `sdd/validation/VALIDATION-CHECKLIST.md`, and `sdd/decisions/DECISION-LOG.md`.
- Treat `sdd/human-requests/` solely as human intake. If a request is provided as a Markdown path or folder, read that material first and classify it into the correct SDD artifact.
- **Engineering Memories**: At the start of each session, mandatorily read `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` and `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` to align context before making any changes.
- **Execution Memory Maintenance**: At the end of each task, update `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` with new findings, resolved bugs, and environment quirks. Never modify `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` without explicit human instruction.
- Classify the request early: change request, batch implementation, review, or validation.
- Do not rewrite numbered SDD files for minor review feedback.
- Edit numbered SDD files only when requirements, contracts, acceptance criteria, or approved decisions actually change.
- Keep work in small batches with explicit validation targets.

## MANDATORY Skills by Workflow Milestone

Explicitly invoke the corresponding skill BEFORE editing code or closing batches:
- **Task Start**: `/start-sdd-slice` (new intake), `/continue-sdd-batch` (resume batch), `sdd-workflow` (workflow alignment).
- **During Implementation**: invoke relevant Core Skills (`c2f-*`) for the stack being touched (database, variables, resources, layout, etc.).
- **Closing & Validation**: `project-validation` (testing strategy), `/review-current-batch` (findings-first review), `sdd-memory-gardening` (memory pruning).
- **Normative Changes**: `/raise-spec-change` (if contracts/requirements change).

## Context Optimization and Archiving

- Keep `sdd/decisions/DECISION-LOG.md`, `sdd/implementation/BATCH-INDEX.md`, and `sdd/validation/VALIDATION-CHECKLIST.md` at a maximum of 10 active items.
- Keep `sdd/human-requests/` lean, preserving at most 10 active requests outside of `archive/`.
- Move older history to the corresponding `archive/` subfolder: `sdd/decisions/archive/`, `sdd/human-requests/archive/`, `sdd/implementation/archive/`, or `sdd/validation/archive/`.
- In the main files, replace archived history with clean Markdown summary tables linking directly to the archived files.
- When loading initial context, prioritize active files and load archived files only when referenced by the active batch or requirement.

## Backlog Intake Gate

- `sdd/backlog/` is an incubator draft space managed by the User and the Architect AI.
- The Executor may read items for context, but is strictly prohibited from implementing them or editing code directly from backlog files.
- An item becomes executable only after explicit human promotion to `sdd/human-requests/req-XXX.md`, updating `CURRENT.md`, and associating it with an active batch.


## 📋 Transparency Protocol & Live Todo List

- Upon starting any request or batch, immediately render the full task list (`Todo List`) with checkboxes `[ ]`.
- After each relevant step or command finishes, update and re-display the list marking `[x]` on completed steps and highlighting the current step (`⏳ [IN PROGRESS]`).
- Never execute long sequences of actions without updating visual progress for the user.

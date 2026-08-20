# Copilot Instructions — Spec-Driven Development

- Treat `sdd/README.md` and numbered specifications as normative sources of truth.
- Read `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the active batch, and `sdd/validation/VALIDATION-CHECKLIST.md` before editing code.
- Engineering Memories: read `sdd/MEMORIA-ENGENHARIA-CHEFIA.md` and `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` at session start.

## MANDATORY Skills by Workflow Milestone

Explicitly invoke the corresponding skill BEFORE editing code or closing batches:
- **Task Start**: `start-sdd-slice`, `continue-sdd-batch`, `sdd-workflow`.
- **During Implementation**: invoke relevant Core Skills (`c2f-*`) for the stack being touched.
- **Closing & Validation**: `project-validation`, `review-current-batch`, `sdd-memory-gardening`.
- **Normative Changes**: `raise-spec-change`.

## Backlog Intake Gate

- `sdd/backlog/` is an incubator draft space. Implementing items directly from it is strictly prohibited.
- An item becomes executable only after human promotion to `sdd/human-requests/req-XXX.md` and batch association.


## 📋 Transparency Protocol & Live Todo List

- Upon starting any request or batch, immediately render the full task list (`Todo List`) with checkboxes `[ ]`.
- After each relevant step or command finishes, update and re-display the list marking `[x]` on completed steps and highlighting the current step (`⏳ [IN PROGRESS]`).
- Never execute long sequences of actions without updating visual progress for the user.

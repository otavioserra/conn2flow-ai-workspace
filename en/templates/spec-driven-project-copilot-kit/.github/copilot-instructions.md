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

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

## 🛡️ AI Autonomy Modes & Deploy Guardrail

- **SUPERVISED Mode (Mandatory Default)**:
  * The agent implements code and runs tests, but **DOES NOT commit or deploy automatically**.
  * The human developer reviews and approves diffs in the chat/IDE.

- **AUTONOMOUS Mode (Only when explicitly requested)**:
  * Allowed only when the request specifies `mode: autonomous` or the user explicitly authorizes it.
  * The agent may: create branch/worktree (`feat/req-XXX`), code, compile (`c2f resources:sync`), run tests (`c2f db:test`), commit, and execute **DEPLOY EXCLUSIVELY TO LOCAL TEST ENVIRONMENT** (`c2f manager:update-all` or local Docker).
  * ⛔ **STRICT SAFETY RULE: NEVER PERFORM AUTOMATED DEPLOYS TO PRODUCTION OR REMOTE SERVERS.**

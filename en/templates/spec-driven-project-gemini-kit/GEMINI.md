# SDD Executor — {{AGENT_NAME}}

Act as Micro-Operator. Read SDD context before modifying files and implement only the batch authorized by the User.

@./.gemini/styleguide.md

## MANDATORY Skills by Workflow Milestone

Explicitly invoke the corresponding skill BEFORE editing code or closing batches:
- **Task Start**: `start-sdd-slice`, `continue-sdd-batch`, `sdd-workflow`.
- **During Implementation**: invoke relevant Core Skills (`c2f-*`) for the stack being touched.
- **Closing & Validation**: `project-validation`, `review-current-batch`, `sdd-memory-gardening`.
- **Normative Changes**: `raise-spec-change`.

## Backlog Intake Gate

- `sdd/backlog/` is an incubator draft space managed by the User and Architect AI.
- You may read backlog items for context, but are strictly prohibited from implementing them or creating code directly from them.
- Even with `READY` status, an item becomes executable only after human promotion to `sdd/human-requests/req-XXX.md`, updating `CURRENT.md`, and associating it with an active batch.


## 📋 Transparency Protocol & Live Todo List

- Upon starting any request or batch, immediately render the full task list (`Todo List`) with checkboxes `[ ]`.
- After each relevant step or command finishes, update and re-display the list marking `[x]` on completed steps and highlighting the current step (`⏳ [IN PROGRESS]`).
- Never execute long sequences of actions without updating visual progress for the user.

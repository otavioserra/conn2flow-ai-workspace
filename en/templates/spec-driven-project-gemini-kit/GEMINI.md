# SDD Executor — {{AGENT_NAME}}

Act as a Micro-Operator. Read SDD context before changing files and implement only the batch authorized by the User.

@./.gemini/styleguide.md

## Backlog Intake Gate

- `sdd/backlog/` is a draft incubator managed by the User and AI Architect.
- You may read backlog items for context, but must never turn them directly into code, an execution batch, or a normative change.
- Even when marked `READY`, an item becomes executable only after human promotion to `sdd/human-requests/req-XXX.md`, a `CURRENT.md` update, and assignment to a batch.

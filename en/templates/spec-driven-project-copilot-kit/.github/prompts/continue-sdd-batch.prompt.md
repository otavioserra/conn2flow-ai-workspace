---
name: continue-sdd-batch
description: Resumes work on the current batch of an SDD repository without losing context from the SDD files and incremental artifacts.
agent: sdd-coordinator
argument-hint: 'Optionally describe what changed or pass a .md file in sdd/human-requests/.'
---

Resume the work considering SDD artifacts, the current batch, decisions, validation, and files manually changed since the last round.

If the update comes as a path in `sdd/human-requests/`, reread that human intake first. If it comes only as the folder, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.

Update:

${input:update:No additional update}
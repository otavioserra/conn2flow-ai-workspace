---
name: continue-private-work
description: Resumes an interrupted task in a Conn2Flow private project without losing operational context.
agent: agent
argument-hint: 'Optionally describe what changed or pass a .md file in project/<workstream>/human-requests/.'
---

Resume the ongoing work considering:

- decisions already made
- files already touched
- pending validations
- separation between the private layer and the core

If the user changed files manually in the middle of the process, reread those files before continuing.
If the update comes as a path in `project/<workstream>/human-requests/`, reread that human intake first. If it comes only as the folder, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
If the task is inside a `project/<workstream>/` scope with local SDD, also reread `00-START-HERE.md`, `01-WORKFLOW.md`, the main spec, the batch index, and the validation checklist before resuming.
If no file is cited explicitly, first discover the smallest set of relevant files instead of assuming that the context is still valid.

User update:

${input:update:No additional update}
---
name: private-project-kickoff
description: Starts a request in a Conn2Flow private project with scope decision, short plan, and execution when there is enough context.
agent: agent
argument-hint: 'Describe the request or objective, or pass a .md file in project/<workstream>/human-requests/. If you pass the folder, the workflow uses CURRENT.md, then README.md, then the most recent .md file.'
---

Use the skill [private-project-context](../skills/private-project-context/SKILL.md) if there is doubt between the private repository and `conn2flow`.
If the task anchor is in `project/<workstream>/` and that workstream already has `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md`, also use the skill [project-sdd-context](../skills/project-sdd-context/SKILL.md) before planning or editing.

For the request below:

1. Decide whether the change belongs to the private repository, `conn2flow`, or both.
2. If the request comes as a path in `project/<workstream>/human-requests/`, read that intake first as non-normative material. If the request points only to the folder, choose `CURRENT.md`, then `README.md`, then the most recent `.md` file.
3. If the task is anchored in a local SDD scope inside `project/`, reread `00-START-HERE.md`, `01-WORKFLOW.md`, the main spec, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md` first.
4. Identify the smallest initial set of files to inspect.
5. Declare a falsifiable local hypothesis and a cheap validation.
6. If the task is large, build a short practical plan.
7. If the context is already sufficient, start implementation instead of only discussing it.

Request:

${input:task:Describe the task}
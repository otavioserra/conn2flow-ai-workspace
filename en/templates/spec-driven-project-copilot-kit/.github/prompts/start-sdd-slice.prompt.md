---
name: start-sdd-slice
description: Starts a request in an SDD repository by identifying relevant SDD files, the current batch, the correct artifact, and the minimum validation.
agent: sdd-coordinator
argument-hint: 'Describe the request or pass a .md file in sdd/human-requests/. If you pass the folder, the workflow uses CURRENT.md, then README.md, then the most recent .md file.'
---

For the request below:

1. If the request is a path inside `sdd/human-requests/`, read that intake first as non-normative material. If the request points only to the folder, choose `CURRENT.md`, then `README.md`, then the most recent `.md` file.
2. Read the project's entry-point SDD artifacts.
3. Identify the relevant numbered SDD files.
4. Classify the request: change request, batch implementation, review, or validation.
5. Determine the smallest set of files to read after the SDD artifacts.
6. Declare one falsifiable local hypothesis and the smallest available validation.
7. If the context is already sufficient, start execution instead of only planning.

Request:

${input:task:Describe the task}
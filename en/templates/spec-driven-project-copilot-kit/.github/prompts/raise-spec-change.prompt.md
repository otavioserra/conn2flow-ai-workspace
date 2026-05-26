---
name: raise-spec-change
description: Opens or updates a requirement change in the SDD flow before moving on to implementation.
agent: sdd-coordinator
argument-hint: 'Describe the requirement change or pass a .md file in sdd/human-requests/.'
---

For the change below:

1. If the change comes as a path in `sdd/human-requests/`, read that human intake first. If it comes only as the folder, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
2. Identify which numbered SDD files would be impacted.
3. Evaluate whether the change should enter `sdd/change-requests/`, `sdd/decisions/`, and `sdd/implementation/`.
4. Propose the smallest change request coherent with the current flow.
5. Do not implement code until the normative change becomes explicit.

Proposed change:

${input:change:Describe the change}
---
name: review-private-work
description: Reviews recent changes in a Conn2Flow private project with focus on bugs, regression, wrong scope, and missing validation.
agent: agent
argument-hint: 'Optionally cite files, a suspected risk, or a .md file in project/<workstream>/human-requests/.'
---

Review the most recent change in this Conn2Flow private project.

If the additional context points to `project/<workstream>/human-requests/`, use that file only as non-normative briefing about the human expectation for the round.

Response rules:

1. List findings first, in severity order.
2. Treat a change in the wrong repository as a relevant risk.
3. Point out missing validation when it exists.
4. If the change is inside a `project/<workstream>/` scope with local SDD, also review consistency between the spec, current batch, and validation checklist.
5. If there are no findings, say that explicitly and record residual risks.

Additional context:

${input:context:No additional context}
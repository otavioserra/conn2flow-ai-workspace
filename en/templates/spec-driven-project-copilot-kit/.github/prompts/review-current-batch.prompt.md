---
name: review-current-batch
description: Reviews the current batch of an SDD repository with focus on SDD drift, batch drift, bugs, and validation.
agent: sdd-reviewer
argument-hint: 'Optionally cite files, a suspected risk, or a .md file in sdd/human-requests/.'
---

Review the most recent change in the current batch.

If the additional context points to `sdd/human-requests/`, use that file only as non-normative briefing about the human expectation for the round.

Additional context:

${input:context:No additional context}
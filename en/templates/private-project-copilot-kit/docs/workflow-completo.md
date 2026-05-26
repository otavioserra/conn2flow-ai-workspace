# Complete workflow

## Recommended flow for new requests

1. Start with `/private-project-kickoff`.
2. Let the coordinator decide whether the change belongs to the private repository, `conn2flow`, or both.
3. If the task is clear, move to implementation with small edits and validation right after the first substantive change.
4. Before closing, run `/review-private-work` or ask the current agent for a findings-first review.
5. If the task grows in the middle of the round, go back to the coordinator instead of stacking ad hoc context.

## Local scopes with SDD

This repository is not fully SDD, but some workstreams inside `project/` may operate with that model.

Practical rule:

1. If the task anchor is in `project/<workstream>/` and that workstream has `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md`, treat the workstream as local SDD.
2. If `project/<workstream>/human-requests/` exists, use that folder only as non-normative human intake.
3. In those cases, keep entering through `/private-project-kickoff`, but reread the local artifacts before proposing code or rewriting docs.
4. If the input comes only as the `human-requests/` folder, resolve it in this order: `CURRENT.md`, then `README.md`, then the most recent `.md` file.
5. Do not try to retrofit SDD to the entire repository just because that workstream uses batches, reviews, and validation.

## When the user changes scope in the middle of execution

1. Interrupt with a direct instruction: describe what changed.
2. Explicitly cite the files changed manually or attach them.
3. Ask for those files to be reread before continuing.
4. Use `/continue-private-work` if you want to resume the same task with new operational context.

## Practical rule

The agent works better when you point to the mentally important diff. Do not rely on it to discover every recent alteration by itself without any hint.

## Complementary reading

- `copilot-casos-de-uso-operacionais.md`: when to use prompt, agent, skill, hook, handoff, and subagent.
- `gestor-modulos-integracao-pratica.md`: practical case to avoid creating a gestor module disconnected from runtime.
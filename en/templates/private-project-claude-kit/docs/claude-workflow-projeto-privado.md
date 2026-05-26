# Private project workflow in Claude Code

## Recommended flow for new requests

1. Start with `/private-project-kickoff`.
2. Let the flow decide early whether the change belongs to the private repository, `conn2flow`, or both.
3. If the task is clear, move to implementation with small diffs and validation right after the first substantive change.
4. Before closing, run `/review-private-work` or use the reviewer subagent.
5. If the task grows in the middle of the round, resume with `/continue-private-work` instead of stacking loose context.

## Local scopes with SDD

This repository is not fully SDD, but some workstreams inside `project/` may operate with that model.

Practical rule:

1. If the task anchor is in `project/<workstream>/` and that workstream has `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md`, treat the workstream as local SDD.
2. If `project/<workstream>/human-requests/` exists, use that folder only as non-normative human intake.
3. If the input comes only as the `human-requests/` folder, resolve it in this order: `CURRENT.md`, then `README.md`, then the most recent `.md` file.
4. Do not try to retrofit SDD to the whole repository just because that workstream uses batches, reviews, and validation.

## Available subagents

- `private-project-coordinator`: coordination and split between private, core, and local SDD.
- `private-project-implementer`: implementation with a small diff and early validation.
- `private-project-reviewer`: findings-first review.

You can invoke them through natural language or with an `@` mention when you want to force that posture.
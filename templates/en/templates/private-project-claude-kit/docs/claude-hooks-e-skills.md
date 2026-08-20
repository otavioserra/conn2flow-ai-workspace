# Hooks and skills in Claude Code

## When to use skills

Use skills for workflows or runbooks that you want to trigger with a slash command or make available for Claude to load automatically.

Examples from this kit:

- `/private-project-kickoff`
- `/continue-private-work`
- `/review-private-work`
- `private-project-context`
- `project-sdd-context`

## When to use subagents

Use subagents for short, focused delegation inside the same task, such as coordination, implementation, or review in separate context.

## When to use hooks

Use hooks for small deterministic automations, not to replace reasoning.

Good hook jobs:

- remind context after `/compact`
- block edits in sensitive files
- run a formatter or validator after certain tools

Bad hook jobs:

- decide architecture
- investigate business logic
- replace `CLAUDE.md`, rules, skills, or subagents
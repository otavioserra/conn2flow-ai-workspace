# Operational use cases in Claude Code

## Quick mental map

- `CLAUDE.md`: always-on rules.
- `.claude/rules/`: path-based rules.
- `/skills`: reusable workflow entry points.
- `.claude/agents/`: specialized subagents.
- `.claude/settings.json`: permissions, language, and small hooks.
- `/hooks`: deterministic automation when you need to reinforce a workflow point.

## When to use each piece

### New request in a private project

Use `/private-project-kickoff`.

### Resume after a pause or manual change

Use `/continue-private-work` and say explicitly what changed.

### Review before closing the task

Use `/review-private-work`.

### Rules that should apply in every session

Put them in `CLAUDE.md`.

### Rules that matter only for certain files

Put them in `.claude/rules/` with `paths`.

### Recurring runbooks

Put them in `.claude/skills/`.

### Focused delegation

Use subagents in `.claude/agents/`.

### Small deterministic automation

Use hooks in `.claude/settings.json`.
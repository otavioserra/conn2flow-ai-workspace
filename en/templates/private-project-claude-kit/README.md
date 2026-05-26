# Private Project Claude Kit

This kit is a starting point for private Conn2Flow-based projects using Claude Code.

## What the kit includes

- `CLAUDE.md`: always-on rules for the private repository.
- `.claude/settings.json`: shared Claude Code settings for the project.
- `.claude/rules/*.md`: path-specific rules for gestor PHP and local SDD inside `project/`.
- `.claude/skills/*/SKILL.md`: slash commands and on-demand runbooks.
- `.claude/agents/*.md`: lightweight subagents for coordination, implementation, and review.
- `docs/*.md`: operational documentation for the human workflow.

## Workflow structure

- `CLAUDE.md` replaces always-on instructions.
- `.claude/rules/` replaces path-specific rules.
- `.claude/skills/` replaces reusable prompts and on-demand runbooks.
- `.claude/agents/` replaces lightweight agents for coordination, implementation, and review.
- `.claude/settings.json` centralizes language, permissions, and small hooks.

## Installation

1. From the root of `conn2flow-ai-workspace`, run `scripts/install-private-project-claude-kit.ps1 -TargetRepoPath <repo>` on Windows or `scripts/install-private-project-claude-kit.sh <repo>` in Bash.
2. If you prefer a manual setup, copy `CLAUDE.md`, `.claude/`, and `docs/` to the target repository root.
3. Open Claude Code in VS Code and validate the load with `/memory`, `/skills`, `/agents`, `/hooks`, and `/status`.

## Optional agent prefix

If you want project-named subagents, use the installer with the optional prefix.

- PowerShell: `scripts/install-private-project-claude-kit.ps1 -TargetRepoPath <repo> -AgentPrefix transformamp`
- Bash: `scripts/install-private-project-claude-kit.sh <repo> --agent-prefix transformamp`

This automatically renames `private-project-*` subagents to `<prefix>-*` without changing skill names.
# Spec-Driven Project Claude Kit

This kit is a starting point for repositories that use `sdd/` as the normative source of truth and want to operate that workflow in Claude Code.

## What the kit includes

- `CLAUDE.md`: always-on SDD workflow rules.
- `.claude/settings.json`: shared Claude Code configuration.
- `.claude/rules/sdd.md`: path-specific rule for artifacts under `sdd/`.
- `.claude/skills/*/SKILL.md`: reusable slash commands and SDD runbooks.
- `.claude/agents/*.md`: lightweight subagents for coordination, implementation, and review.

## Installation

1. From the root of `conn2flow-ai-workspace`, run `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath <repo>` on Windows or `scripts/install-spec-driven-claude-kit.sh <repo>` in Bash.
2. If you prefer a manual setup, copy `CLAUDE.md` and `.claude/` to the target repository root.
3. If the target repo does not already have `sdd/`, the installer also copies the clean SDD boilerplate for the selected language.
4. Validate the load in Claude Code with `/memory`, `/skills`, `/agents`, `/hooks`, and `/status`.
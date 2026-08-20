# Private Project Copilot Kit

This kit is a starting point for private Conn2Flow-based projects.

## What the kit includes

- `.github/copilot-instructions.md`: always-on rules for the private repository.
- `.github/instructions/php-gestor.instructions.md`: specific conventions for gestor PHP files.
- `.github/instructions/project-sdd.instructions.md`: rules for local workstreams that already use SDD inside `project/`.
- `.github/agents/*.agent.md`: lightweight agents for coordination, implementation, and review.
- `.github/prompts/*.prompt.md`: quick entry points for kickoff and continuation.
- `.github/skills/*/SKILL.md`: reusable runbooks for scope decisions, gestor module integration, local validation, and local SDD.
- `docs/*.md`: operational documentation for the human workflow with the agent.

## Recommended additional documentation

- `docs/workflow-completo.md`: main flow for kickoff, continuation, and review.
- `docs/copilot-casos-de-uso-operacionais.md`: map of when to use prompt, agent, skill, hook, handoff, and subagent.
- `docs/gestor-modulos-integracao-pratica.md`: guide to avoid structurally incomplete gestor modules.

## Additional kit skills

- `gestor-module-integration`: protects gestor modules against incomplete bootstrap, JSON, dispatch, or AJAX wiring.
- `project-sdd-context`: helps operate batches, reviews, and validation in local workstreams inside `project/`.

## Recommended flow

1. Install this kit with `scripts/install-private-project-copilot-kit.ps1 -TargetRepoPath <repo>` or `scripts/install-private-project-copilot-kit.sh <repo>` from the root of `conn2flow-ai-workspace`.
2. If you prefer a manual setup, copy `.github`, `docs`, and `scripts/hooks` to the private repository root.
3. Adjust names, paths, and examples for the real project.
4. Validate the load in Chat Diagnostics.
5. Start new requests with `/private-project-kickoff`, resume with `/continue-private-work`, and review with `/review-private-work`.

## Optional agent prefix

If you want project-named agents, use the installer with the optional prefix.

- PowerShell: `scripts/install-private-project-copilot-kit.ps1 -TargetRepoPath <repo> -AgentPrefix transformamp`
- Bash: `scripts/install-private-project-copilot-kit.sh <repo> --agent-prefix transformamp`

This automatically renames the agents and updates internal references from `private-project-*` to `<prefix>-*`.
# SDD Agents — OpenAI Codex Multi-Agent Configuration

## Double Agent Roles

### Architect (Macro-Orchestrator)
- **Responsibility**: Translate human needs into standardized technical requirements in `sdd/`.
- **Tools**: Gemini / Antigravity / GPT in planning mode.
- **Rule**: Never commits or pushes code directly.

### Executor (Micro-Operator)
- **Responsibility**: Implement code, run tests, and log validation evidence.
- **Tools**: OpenAI Codex / GPT in VS Code.
- **Rule**: Reads the briefing in `sdd/human-requests/CURRENT.md` before making any changes.

### Human-in-the-Loop (You)
- **Responsibility**: Direct the Architect and review code diffs before merging.

## Skills Configuration

All 33 framework skills are available in `.codex/skills/` and should be consulted according to the workflow milestone described in `CODEX.md`.

## Naming Conventions

- Core Framework Skills: `c2f-*` (26 skills).
- SDD Workflow Skills: `sdd-*`, `start-*`, `continue-*`, `raise-*`, `review-*`, `project-*` (7 skills).

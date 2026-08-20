# Conn2Flow Private Project

- Treat this private repository as the project layer that overlays the open core in `conn2flow`.
- Before changing anything in the system, first check whether the change can live only in the private repository.
- When a file exists in both private and core layers, prioritize reading and editing the private file.
- If a file does not yet exist in the private layer and the feature is project-specific, create it in the private repository instead of editing the core.
- Edit `conn2flow` only when the fix or feature is generic, reusable, and useful to other projects.
- When touching `gestor` code, preserve Conn2Flow patterns and avoid broad refactors without need.
- When using examples or snippets from `gestor`, `db`, `javascript/ajax`, or `models`, confirm syntax and field correspondence; avoid copying a structural snippet mistake into the final code.
- If the request is anchored in `project/<workstream>/` and that workstream has `00-START-HERE.md`, `01-WORKFLOW.md`, batches, and a validation checklist, treat it as local SDD.
- Treat `project/<workstream>/human-requests/` only as non-normative human intake; read that material first and then classify the request into the correct SDD artifact.

## Main skills

- Use `/private-project-kickoff` for a new request or when the split between private and core is still unclear.
- Use `/continue-private-work` when the task is already in progress and there is new operational delta.
- Use `/review-private-work` for findings-first review.

## Automatic skills

- `private-project-context`: decide between the private repository, `conn2flow`, or a split.
- `project-sdd-context`: operate local workstreams inside `project/` that already use SDD.
- `gestor-module-integration`: avoid structurally incomplete gestor modules.
- `local-validation`: use when the task requires Docker, logs, JWT, Phinx, DB, or environment work.
- `local-tests`: use when the task requires local tests in the Conn2Flow ecosystem after implementing modules, pages, or features.

## Human docs

- `docs/claude-workflow-projeto-privado.md`
- `docs/claude-casos-de-uso-operacionais.md`
- `docs/claude-continuidade-e-interrupcoes.md`
- `docs/claude-hooks-e-skills.md`

## Final rule

- Use `CLAUDE.md` for always-on rules, `.claude/rules/` for path-based rules, `.claude/skills/` for workflows and on-demand runbooks, `.claude/agents/` for specialized subagents, and `.claude/settings.json` for language, permissions, and small hooks.

## Backlog Intake Gate

- `sdd/backlog/` is a draft incubator managed by the User and AI Architect.
- Executors may read items for context, but must never implement them, open an execution batch, or change code directly from them.
- An item, including `READY`, becomes executable only after explicit human promotion to `sdd/human-requests/req-XXX.md`, a `CURRENT.md` update, and batch assignment.


## 📋 Transparency Protocol & Live Todo List

- Upon starting any request or batch, immediately render the full task list (`Todo List`) with checkboxes `[ ]`.
- After each relevant step or command finishes, update and re-display the list marking `[x]` on completed steps and highlighting the current step (`⏳ [IN PROGRESS]`).
- Never execute long sequences of actions without updating visual progress for the user.

## 🛡️ 3-Tier AI Autonomy Spectrum

1. **Tier 1: SUPERVISED (Mandatory Default / Human-in-the-Loop)**:
   - The agent implements code and runs tests, but **DOES NOT commit, push, or deploy automatically**.
   - The human developer reviews and approves diffs in the chat/IDE before merging.

2. **Tier 2: MONITORED AUTONOMOUS (Live Autopilot / Glass-Box in Chat)**:
   - Activated when the request specifies `mode: monitored_autonomous` (or `autonomo_monitorado`) or the user explicitly authorizes live execution.
   - The agent executes the entire pipeline with a **Live Todo List (`[ ]` ➔ `[x]`) visible and updated in real time**:
     * Branch or worktree isolation (`feat/req-XXX`).
     * Code implementation and resource compilation (`c2f resources:sync`).
     * Automated unit test suite execution (`c2f db:test`).
     * **DEPLOY EXCLUSIVELY TO LOCAL TEST ENVIRONMENT** (`c2f manager:update-all` or local Docker).
     * ⛔ **STRICT SAFETY RULE: NEVER PERFORM AUTOMATED DEPLOYS TO PRODUCTION OR REMOTE SERVERS.**
     * Semantic commit and push to the working branch.
     * Final executive report with validation evidence.

3. **Tier 3: HEADLESS AUTONOMOUS (Silent Background / Black-Box)**:
   - Activated when the request specifies `mode: headless_autonomous` (or `autonomo_headless`).
   - The agent executes the entire pipeline in isolated background processes via MCP Hub / Git Worktrees, delivering a completion notification and final report upon completion.


# Main private project instructions

- Treat the private repository as the project layer that overlays the open core in `conn2flow`.
- Before changing anything in the system, first check whether the change can live only in the private repository.
- When a file exists in both the private project and the core, prioritize reading and editing the private file.
- If a file does not yet exist in the private layer and the feature is project-specific, create the file in the private repository instead of editing the core.
- Edit `conn2flow` only when the fix or feature is generic, reusable, and useful to all projects.
- When touching `gestor` code, preserve existing Conn2Flow patterns and avoid broad refactors without need.
- For structural gestor module creation or refactor, load the skill [gestor-module-integration](./skills/gestor-module-integration/SKILL.md).
- When using examples or snippets from `gestor`, `db`, `javascript/ajax`, or `models`, confirm syntax and field correspondence; avoid copying snippet mistakes into the final code.
- For multi-step tasks, prefer coordinating the work with specialized agents, prompts, and skills instead of concentrating everything into a single long prompt.
- When the request falls under `project/<workstream>/` and that workstream already has `00-START-HERE.md`, `01-WORKFLOW.md`, batches, and a validation checklist, treat it as local SDD for that scope and use the skill [project-sdd-context](./skills/project-sdd-context/SKILL.md).
- When `project/<workstream>/human-requests/` exists, treat that folder only as non-normative human intake. If the request comes as a Markdown file or as the folder itself, read that material first and then classify the request into the correct SDD artifact.
- For environment tasks, local validation, Docker, JWT tokens, Phinx, and logs, load the skill [local-validation](./skills/local-validation/SKILL.md).
- To decide correctly between the private repository and `conn2flow`, use the skill [private-project-context](./skills/private-project-context/SKILL.md).
- Also consult [workflow-completo.md](../docs/workflow-completo.md), [copilot-casos-de-uso-operacionais.md](../docs/copilot-casos-de-uso-operacionais.md), [continuidade-e-interrupcoes.md](../docs/continuidade-e-interrupcoes.md), and [gestor-modulos-integracao-pratica.md](../docs/gestor-modulos-integracao-pratica.md).
- The hook [private-project-session-start.json](./hooks/private-project-session-start.json) injects a short scope reminder at session start; keep that hook small and audible.

## Backlog Intake Gate

- `sdd/backlog/` is a read-only draft incubator managed by the User and AI Architect.
- Executors may inspect items, but cannot implement them, open an executable batch, or change code directly from them.
- Even a `READY` item requires human promotion to `sdd/human-requests/`, an updated `CURRENT.md`, and an assigned batch.


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


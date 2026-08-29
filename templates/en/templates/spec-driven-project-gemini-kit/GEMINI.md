# SDD Executor — {{AGENT_NAME}}

Act as Micro-Operator. Read SDD context before modifying files and implement only the batch authorized by the User.

@./.gemini/styleguide.md

## MANDATORY Skills by Workflow Milestone

Explicitly invoke the corresponding skill BEFORE editing code or closing batches:
- **Task Start**: `start-sdd-slice`, `continue-sdd-batch`, `sdd-workflow`.
- **During Implementation**: invoke relevant Core Skills (`c2f-*`) for the stack being touched.
- **Closing & Validation**: `project-validation`, `review-current-batch`, `sdd-memory-gardening`.
- **Normative Changes**: `raise-spec-change`.

## Backlog Intake Gate

- `sdd/backlog/` is an incubator draft space managed by the User and Architect AI.
- You may read backlog items for context, but are strictly prohibited from implementing them or creating code directly from them.
- Even with `READY` status, an item becomes executable only after human promotion to `sdd/human-requests/req-XXX.md`, updating `CURRENT.md`, and associating it with an active batch.


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
   - **Goal Mode (`/goal`) for Continuous Execution**:
     * For complex slices requiring multiple test-and-repair iterations, activate `/goal` in Gemini / Antigravity prompt.
     * The agent maintains a continuous execution loop until deterministically fulfilling all technical criteria in `VALIDATION-CHECKLIST.md`.

3. **Tier 3: HEADLESS AUTONOMOUS (Silent Background / Black-Box)**:
   - Activated when the request specifies `mode: headless_autonomous` (or `autonomo_headless`).
   - The agent executes the entire pipeline in isolated background processes via MCP Hub / Git Worktrees, delivering a completion notification and final report upon completion.

## 🔒 Mandatory Multi-Agent Concurrency Rules

1. **Strict Prohibition of `git add -A` and `git commit -a`**:
   - The agent MUST execute `git add <path-1> <path-2>` strictly listing the files touched in its approved batch, preventing commits from capturing concurrent code or uncommitted changes from other agents.
2. **Atomic Numbering Check for `req-XXX.md`**:
   - The agent must re-read `sdd/human-requests/` immediately before creating request files to prevent number collision and accidental overwrites.

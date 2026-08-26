---
name: sdd-workflow
description: "MANDATORY READ before creating or modifying any file in the sdd/ directory (process, implementation, validation, decisions). Prevents breaking the Double Agent pattern and governance decay."
user-invocable: false
---

# SDD Workflow

# ⚡ Mandatory Trigger
- **TRIGGER**: Starting any SDD framework task, interpreting human intake, or classifying artifacts in control directories.
- **SKIP ONLY IF**: Tasks completely outside the SDD lifecycle (e.g. direct infrastructure git commits).
- **CONSEQUENCE OF IGNORING**: Disalignment between Architect and Executor, mislocated artifacts, and collapse of Double Agent governance.

---

Use this skill when developing against versioned SDD specifications.

## Minimum Initial Context Reading

Start with `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the active batch, `sdd/validation/VALIDATION-CHECKLIST.md`, and `sdd/decisions/DECISION-LOG.md`.

If assigned to `sdd/human-requests/*.md` or the `sdd/human-requests/` folder, read this intake first in deterministic order:

1. `CURRENT.md`
2. `README.md`
3. the most recent `.md` file

## Request Classification

1. Requirement or contract change:
   - log in `sdd/change-requests/`
   - evaluate impact on numbered SDDs, decisions, batches, and validation
2. Review feedback without normative change:
   - log in `sdd/reviews/`
   - keep numbered SDDs stable
3. Incremental implementation:
   - check active batch in `sdd/implementation/`
   - implement smallest approved slice
   - validate and update `sdd/validation/`
4. Validation or spec drift check:
   - start with smallest automated check
   - log evidence and gaps in proper artifacts

## Golden Rules

- Numbered SDD files are the normative truth.
- `sdd/human-requests/` is never normative; it feeds change requests, reviews, batches, decisions, or validation.
- Never rewrite numbered SDDs for minor review feedback.
- Never start the next batch before the current one is stable and reviewable.


## 📋 Transparency Protocol & Live Todo List

- Upon starting any request or batch, immediately render the full task list (Todo List) with checkboxes [ ].
- After each relevant step or command finishes, update and re-display the list marking [x] on completed steps and highlighting the current step (⏳ [IN PROGRESS]).
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

## 🔒 Concurrency Rules & Atomic Request Reservation Protocol (`req-XXX.md`)

1. **Strict Prohibition of `git add -A` and `git commit -a`**:
   - The agent MUST execute `git add <path-1> <path-2>` strictly listing the files touched in its approved batch, preventing commits from capturing concurrent code or uncommitted changes from other agents.
2. **Atomic Request Reservation Protocol for `req-XXX.md`**:
   - Any agent (Architect or Executor) is authorized to create new `req-XXX.md` request files when instructed by the human operator in chat or when uncovering an essential technical requirement, strictly following:
     1. Run `git pull origin <branch>` to fetch the latest state.
     2. Scan `sdd/human-requests/` to identify the next available sequential number.
     3. Create `req-XXX.md`, update `sdd/human-requests/CURRENT.md`, and commit/push immediately:
        ```bash
        git add sdd/human-requests/req-XXX.md sdd/human-requests/CURRENT.md
        git commit -m "docs(sdd): reserve REQ-XXX for <title>"
        git push origin <branch>
        ```

## 🧠 Canonical Memory Layers

1. **Repository Memory (`sdd/ENGINEERING-MEMORY-EXECUTION.md` — Shared Git)**:
   - Objective technical facts about the software: core bugs fixed, build/database hacks, CSS/Tailwind compilation nuances, discovered CLI commands, and lessons learned. Visible to all agents and developers.
2. **Private AI Tool Memory (Local)**:
   - Subjective operator preferences (chat style, prompt shortcuts, preferred language).

## ⚖️ Principle of Source Code and SPEC Authority over Memories

- Every technical constraint noted in memory must include its timestamp (`YYYY-MM-DD`).
- The live source code, active configurations (`settings.json`, `.env`), schemas, and normative documents (`sdd/SPEC.md`, `sdd/0X-*.md`) hold **absolute authority** over historical memory notes. When a project configuration changes, conflicting legacy notes in memory must be immediately invalidated and updated.

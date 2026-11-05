---
name: mdd-workflow
description: "READ BEFORE creating or changing memory/ files for process, implementation, validation or decisions. Preserves the dual-agent workflow and governance artifacts."
user-invocable: false
---

# MDD workflow

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Start any task of the MDD framework, interpret human requests, or sort artifacts in the control folders.
- **SKIP ONLY IF**: Tasks completely outside the MDD governance cycle (e.g. direct infrastructure git commits).
- **CONSEQUENCE OF IGNORING**: Disalignment between Architect and Executor, creation of files in wrong locations and collapse of Double Agent methodology.

---

Use this skill when project is guided by versioned MDD documents.

> 🚫 **Memory Gardening Lock**: do not invoke nor can the execution memory just by terminating a session or completing a batch. Below 50 KB and 200 lines the file is healthy and should not be rewritten; in 50 KB / 200 lines there is only preventive alert, and pruning is mandatory only in 75 KB / 300 lines.

## Initial minimum reading

Start with `memory/README.md`, `memory/process/00-START-HERE.md`, `memory/process/01-WORKFLOW.md`, `memory/implementation/BATCH-INDEX.md`, the current batch, `memory/validation/VALIDATION-CHECKLIST.md` and `memory/decisions/DECISION-LOG.md`.

If the task points to `memory/human-requests/*.md` or to the `memory/human-requests/` folder, first read this human intake. When only the folder comes, use the following deterministic order:

1. `CURRENT.md`
2. `README.md`
3. the latest `.md` file

## Classification of demand

1. Change of requirement or contract:
   - register in `memory/change-requests/`
   - evaluate impact on numbered normative documents, decisions, batches and validation
2. Review feedback without normative change:
   - register in `memory/human-reviews/`
   - keep numbered normative documents stable
3. Incremental implementation:
   - Check the current batch on `memory/implementation/`
   - implement the lowest approved slice
   - validate and update `memory/validation/` when needed
4. Validation or spec drift check:
   - Start with the smallest automated check
   - register evidence and to-dos on the right artifacts

## Gold rules

- The normative documents numbered are the normative source.
- `memory/human-requests/` is never source normative; it only feeds change requests, reviews, drums, decisions or validation.
- Do not rewrite numbered normative documents for small review comments.
- Do not open the next batch before the current batch is stable and re-reviewable.

## 10 Active Link Root and Integrity Rule

- The root of `memory/human-requests/` keeps at most **10 requests** loose (beyond `CURRENT.md` and `README.md`); the root of `memory/implementation/` keeps at most **10 batch reports** (beyond `BATCH-INDEX.md`). The oldest surplus lives in `archive/`.
- Archive without rewriting links is prohibited: any markdown link in `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `DECISION-LOG.md` and `CURRENT.md` must continue solving after moving.
- At the MDD root, audit with `mdd compact --path RAIZ_ABSOLUTA` and apply only authorized maintenance with `mdd compact --path RAIZ_ABSOLUTA --apply`; dual preservation and link repair are required. Don't invent a command there:archive-mdd.
- Do not move these files with `mv`/`Move-Item` manually.


## 📋 Transparency Protocol & Live Checklist (Live Todo List)

- When starting any request or batch, immediately render the full list of tasks (All List) with checkboxes [ ].
- At each end of the relevant step/command, update and re-show the list by marking [x] in the completed steps and highlighting the current step (
- Never run long command sequences without updating visual status to the user.

## 🛡️ Spectrum of 3 AI Autonomy Levels

1. **Level 1: SUPERVISIONATED (Mandate Standard / Human-in-the-Loop)**:
   - The agent implements code and performs tests, but **DO NOT commit, push or automatically deploy**.
   - The developer reviews and approves changes in chat/IDE before consolidation.

2. **Level 2: MONITORED AUTONOME (Live Autopilot / Glass-Box in Chat)**:
   - Activated when the request contains `modo: autonomo_monitorado` or the user expressly authorizes continuous monitoring on the screen.
   - The agent executes the pipeline complete with **Live Todo List (`[ ]` ➔ `[x]`) visible and updated in real time**:
     * Branch creation (`feat/req-XXX`); worktree only under proven concurrency as REQ-077.
     * Resource encoding and compilation (`c2f resources:sync`).
     * Execution of automated tests (`c2f db:test`).
     * **DEPLOY ONLY IN A LOCAL TEST ENVIRONMENT** (`c2f manager:update-all` or local Docker).
     * **INVIOLABLE SAFETY PROGRAMME: NEVER DO AUTOMATIC DEPLOY IN THE ENVIRONMENT OF REMOTE PRODUCTION OR SERVANTS.**
     * Semantic commit and push on the work branch.
     * Final report with execution logs and validation evidence.
   - **Goal Mode (`/goal`) for Continuous Run**:
     * In complex tasks or slices that require multiple test and correction cycles, use the `/goal` command in Claude / IDE prompt.
     * Example of instruction: `"/goal Execute o lote BATCH-XXX até que todos os testes do VALIDATION-CHECKLIST.md passem e o relatório esteja preenchido."`
     * The agent remains in continuous standalone loop until deterministically satisfy all conditions of closure of the technical checklist, preventing premature stops.

3. **Level 3: AUTONOMOUS HEADLESS (Silent Background / Black Box)**:
   - Activated when the request contains `modo: autonomo_headless`.
   - The agent executes pipeline via MCP Hub, issuing consolidated notification and report at the end; worktree only under proven concurrency and with secure cleanup when closing the batch.

## 🔒 Concurrency & Atomic Request Reserve (`req-XXX.md`)

1. **Absolute Prohibition of `git add -A` and `git commit -a`**:
   - The agent MUST execute `git add <caminho-1> <caminho-2>` by listing strictly the files played in your approved batch, preventing commits from dragging concurrent code or files from other agents.
2. **Atomic Reserve Protocol for Creation of `req-XXX.md`**:
   - Any agent (Architect or Executor) is allowed to create new `req-XXX.md` files when instructed by the user in the chat or when raising an essential technical demand, strictly following:
     1. Run `git pull origin <branch>` to get the latest status.
     2. Atomically reload the `memory/human-requests/` directory to identify the next vague sequential number.
     3. Create `req-XXX.md` file, update `memory/human-requests/CURRENT.md` and commit/pull immediately:
        ```bash
        git add memory/human-requests/req-XXX.md memory/human-requests/CURRENT.md
        git commit -m "docs(mdd): reserve REQ-XXX for <titulo>"
        git push origin <branch>
        ```
3. **Mandatory identification of Repository in Handoffs**:
   - Every human-agent handoff or inter-agent shall state at the top of the message the identifier and absolute path of the root of the target repository:
     * **Project**: `<nome-do-projeto>`
     * **Root Path**: `<caminho-absoluto-da-raiz>`
     * **Request**: `REQ-XXX` | **Batch**: `BATCH-YYY`
   - Prevents execution agents or reviewers operating in the incorrect repository in environments with multiple open workspaces.

## 🧠 Canon Memory Layers

1. **Repository Memory (`memory/04-memory-engineering-execution.md` — Shared Git)**:
   - Objective technical facts of the software: core solved bugs, temporary build/database hacks, CSS/Tailwind compilation particularities, discovered CLI commands and lessons learned. Visible to all agents and developers.
2. **AI Tool Private Memory (Local)**:
   - Subjective operator interaction preferences (response style, prompt shortcuts, preferred language).

## ⚖️ Code and SPEC Authority Principle on Memories

- Every technical restriction note in memory must load the registration date (`YYYY-MM-DD`).
- The actual source code, current settings (`settings.json`, `.env`), schemas and normative files (`memory/SPEC.md`, `memory/0X-*.md`) have **absolute authority** on past memory annotations. If a restriction changes in project, the old annotation in memory should be invalidated and updated.

---

## 🧯 Shared tree: what to check before each commit

Another agent can change the branch of the tree and leave files in stage without warning. Before **all** commit to a tree that is not just yours:

```bash
git branch --show-current          # é a branch em que você pretende commitar?
git diff --cached --name-only      # há stage que não é seu?
```

If the branch is not expected, or there are others' stages, **does not commit to the tree**. Mount the commit by separate index without touching the files or branch:

```bash
export GIT_INDEX_FILE="$TEMP/idx-meu-lote"
git read-tree origin/main
git add -- <caminho-1> <caminho-2>
commit=$(git commit-tree "$(git write-tree)" -p origin/main -F mensagem.txt)
unset GIT_INDEX_FILE
git push origin "$commit:refs/heads/main"
```

Shared file (`pages.json`, MDD indexes) enters this commit as "`main` version plus my entries", never as the copy of the tree, which loads the work of the other.

### Forbidden in Shared Tree

- `git checkout -- <arquivo>` and `git restore <arquivo>`: delete change without commit from any batch, not just its editing. To undo the change itself, do the reverse editing.
- `git reset` move the branch, `git stash` and `git clean`.
- `git add -N` and any `git add` without path list.

### Two agents in the same file-source

When two batches need to write in the same content file, separate by file (one channel, one folder) and let the generator join. When not, the editing tool rereads the file at the time of recording and swaps only the blocks that are yours.

### Leave a sign where the other one will read

Coordination between agents is written in the request of the other batch (a block "Coordination", with date and author), not only said in the chat.

---

## 🧾 Before you claim something is pre-existing

Test failure "that already existed" needs proof: run the same test without its change, or point to the batch in which the failure was registered. Without it, she's yours until proven otherwise.

## MDD, external links and booking via git ls-remote (BL-028)

In the conn2flow-ai-workspace matrix and migrated satellites, use memory/; read 00-baseline-architecture.md, 01-general-memory.md and 02-policy.md and navigate the index.md. Governance skills exclusively use their MDD names; legacy boilerplates require explicit migration. Do not run ai:archive-sdd over memory/ without explicit CLI support. The ceiling of ten decisions/validations requires self-checking, not assumed by the exit of the command.

CURRENT.md can point to external request: resolve the link against source, identify repository/root and read the approval there. Do not create local fake copy or execute in incorrect repo. Repairers only rewrite internal paths; links leaving the repository are classified and preserved. If legacy tool rejects the external link, register the incompatibility and do not remove the pointer just to get PASS.

Before reserving new number, see refs with git ls-remote --heads origin for all branches involved, relevant ref patch and check the sequence including archived files. Chained grep output code does not prove reservation or remote absence. Create the intake with explicit paths, push and recheck the exact ref via git ls-remote; in concurrent rejection or movement, reread the sequence and resolve the collision without force push. ls-remote is verification, not atomic lock by itself; the push conditioned to the previous ref and the booking conference are the guarantee. In this delivery REQ-067 is already booked: do not book new number.

## REQ-077 — Pipeline, worktrees and preservation (DEC-136)

- Project: `./c2f project:deploy <id>` is the default (95% of cases). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` is prohibited in the routine of project; allowed exclusively in batch altering Core and project simultaneously.
- Before deploy, check `git branch --show-current` and `git status --short` at the origin; do not publish other/unfinished work. Check your destination and your clearance. Category B (skills/documentation/tests/memory): only local checks, without deploy. Sequence execution, foreground, logs and locks remain mandatory.
- Worktrees for convenience are forbidden. Only create with concurrency multi-agent proven in the same repository; in doubt consult the human before. Register original root, temporary path and concurrency on request and batch. When completing/homologing, audit unique work, integration into main and junctions, then `git worktree remove <caminho>` and `git worktree prune`. Never use force to destroy unintegrated work; preserve and report impediments.
- DEC-136: maintain by default; nothing is removed (file, `status='D'`, `DELETE`) without explicit confirmation from the human operator. Withdrawal turns clash pending; `--confirmar-retirada` only when requested by the operator. Source incomplete does not authorize withdrawal.

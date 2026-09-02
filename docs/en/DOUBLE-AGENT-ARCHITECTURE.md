# 🏛️ Double Agent Architecture (Double Agent SDD Framework)

AI-assisted software engineering in enterprise codebases often fails when a single model attempts to act simultaneously as a high-level strategic planner and a low-level code executor.

The **Double Agent Model with Spec-Driven Development (SDD)** solves this problem by dividing intelligence into two complementary roles anchored on a single source of truth in Git (`sdd/`).

---

## 👥 1. The Two Core Roles

```mermaid
flowchart TD
    Human["👨‍💻 Human Chief Engineer"] -->|Vision, Decisions & Prompts| Architect["🏛️ Macro-Architect (Antigravity / Gemini 3.7 Flash)"]
    Architect -->|Specifications & Batches (sdd/)| SingleTruth[("📁 Local Git Repository (SDD)")]
    SingleTruth -->|Consumes Atomic Tasks| Executor["⚡ Micro-Executors (Claude Code / Cursor / Copilot)"]
    Executor -->|Clean Code, Tests & Execution Logs| Codebase[("💻 Source Code & Test Suite")]
    Codebase -->|Evidence & Verification| Human
```

### 🧠 A. The Macro-Architect (Antigravity / Gemini 3.7 Flash)
* **Scope**: High-level abstraction, business domain planning, system design, data governance, and **living documentation**.
* **Inputs**: Voice memos, rough architectural notes, feature requests, business rules, and batch completion receipts from executors.
* **Outputs**: Formal SDD artifacts and Living Public Documentation:
  - `sdd/SPEC.md`: Living technical specification of the project.
  - `sdd/decisions/DECISION-LOG.md`: Formal architectural decision records.
  - `sdd/human-requests/req-XXX.md`: Atomic, execution-ready requirement packages.
  - `README.md` & `README-PT-BR.md`: Living documentation of the workspace synced after every batch.
  - `docs/`: Comprehensive technical manuals, skills catalogs, and future roadmaps.
* **Golden Rule**: The Architect **never edits source code files directly**. When auditing executor output, the Architect performs a **high-level diff review** (touched files, components, test pass rates), avoiding micro-level rabbit holes and maintaining strategic focus.

### ⚡ B. The Micro-Executors (Claude Code / Cursor / Copilot)
* **Scope**: Low-level implementation, tactical file editing, CLI commands, migrations, and automated unit testing.
* **Inputs**: Atomic requirements (`req-XXX.md`), framework governance skills (`c2f-*`), and execution memories.
* **Outputs**: Code modifications, compiled resource data (`*Data.json`), Phinx migrations, and batch completion reports (`sdd/implementation/batch-YYY.md`).
* **Golden Rule**: The Executor **never modifies architectural specifications or decisions**. Any architectural discrepancy discovered during implementation must trigger a formal Change Request (`CR-XXX.md`).

---

## 🛡️ 2. Methodological Pillars

1. **Ping-Pong Writing Boundary**: The Architect and the Executor enforce strict write permissions across repository folders.
2. **The Architect as Documentation Guardian**: Living documentation (`READMEs` and `docs/`) is authored and maintained by the Architect upon closing each batch, eliminating stale documentation.
3. **Skill Harvesting**: When an executor encounters an error or discovers a framework idiom, the rule is harvested into an atomic on-demand Skill (`.claude/skills/`, etc.) rather than bloating system prompts.
4. **Idempotent Memory Gardening**: Pruning is prohibited below 50 KB / 200 lines. That threshold raises a warning, the mandatory ceiling is 75 KB / 300 lines, and post-pruning targets ~25 KB while preserving 20 to 25 recent tasks. Session or batch completion does not trigger gardening.
5. **Backlog Intake Gate (`sdd/backlog/`)**: Incubation items (`ICEBOX` and `IN-DISCUSSION`) are shielded from premature agent execution until explicit human promotion.
6. **The AI Orchestration Triad**:
   - **`c2f` (Core CLI)**: Native PHP 8.2+ OOP CLI in the core repository for resources, database, Docker, and AI.
   - **`conn2flow-mcp-hub` (Docker)**: Local MCP Server for asynchronous messaging between Architect and Executors across Supervised and Headless modes.
   - **`Git Worktrees`**: Automated provisioning of isolated branches and working trees allowing concurrent agent execution without workspace collisions.
7. **3-Tier AI Autonomy Spectrum**:
   - **Level 1 (`SUPERVISIONADO` / Supervised — Mandatory Default)**: The agent does not commit or deploy; the human developer reviews diffs in the chat before consolidation.
   - **Level 2 (`AUTONOMO_MONITORADO` / Live Monitored Autopilot)**: The agent runs the full pipeline (code, tests, local test deploy, and branch commit/push) with a **Live Todo List (`[ ]` ➔ `[x]`)** visible in real-time on screen.
   - **Level 3 (`AUTONOMO_HEADLESS` / Silent Headless Autopilot)**: The agent executes in the background via MCP Hub in a dedicated Git Worktree without interactive popups, emitting a final completion report.
   - ⛔ **Inviolable Security Rule**: In any autonomous mode, **automatic deployment to production environments is strictly prohibited**.
8. **Atomic Reservation Protocol for `req-XXX.md` Creation**: Any agent (Architect or Executor) is formally authorized to create new `req-XXX.md` files upon human instruction or technical discovery, provided it performs `git pull`, atomic sequential number check in `sdd/human-requests/`, and immediate commit/push to lock the reservation against concurrent agents.
9. **Princípio da Autoridade do Código e da SPEC (Code & SPEC Absolute Authority)**: Active configurations (`.env`, `settings.json`), live schemas, and normative specifications (`sdd/SPEC.md`) have absolute authority over past engineering memories. If a technical restriction changes, obsolete memory entries must be invalidated and updated immediately.
10. **Periodic Living Documentation Routine (Living Infrastructure)**: From time to time, the Architect executes a proactive discovery routine scanning the live documentation indexes of the 3 primary AI ecosystems:
    - **Anthropic Claude Code**: `https://code.claude.com/docs/llms.txt`
    - **OpenAI Codex**: `https://developers.openai.com/codex/llms.txt`
    - **Google Antigravity (AGY)**: `https://antigravity.google/docs` and built-in customization references (`agy-customizations`).
    This routine ensures early detection of emerging native capabilities (hooks, worktrees, autoVerify, MCP channels, skill formats, and sandboxing), incorporating them into project templates and the 5 repositories to keep Conn2Flow's AI infrastructure continuously at the global state of the art.

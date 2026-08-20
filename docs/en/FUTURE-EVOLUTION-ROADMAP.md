# 🚀 Future Evolution Roadmap & AI Innovations

This document outlines the strategic long-term vision of the **Conn2Flow AI Workspace**, detailing incubated architecture backlog initiatives and educational expansion plans.

---

## 🔮 1. Strategic Architecture Backlog

### A. Skills Centralization & Inter-Agent Bridge via MCP Server (`ARCH-002`) — ✅ COMPLETED (BATCH-015)
* **Delivered**: Node.js/TypeScript MCP Server in `mcp-hub/` running via Docker (`conn2flow-mcp-hub`), Dual-Mode support (Supervised/Headless), and endpoints `c2f_run_command`, `dispatch_task`, `report_completion`.

### B. Native PHP 8.2+ OOP Core CLI (`FEAT-003`) — ✅ COMPLETED (BATCH-015)
* **Delivered**: `/cli` subsystem in `conn2flow` core with root wrappers `./c2f` and `./c2f.ps1`, integrating `resources:sync`, `ai:sync`, `module:create`, `docker:*`, and `db:*`.

### C. Git Autonomy & Concurrent Worktrees (`ARCH-003`) — ✅ COMPLETED (BATCH-015)
* **Delivered**: `scripts/git/create-agent-worktree.ps1` and `.sh` utilities for automated provisioning of isolated working trees under `worktrees/feat-req-XXX`.

### D. Self-Healing CI/CD Pipeline Loop (`FEAT-002`) — 🧊 ICEBOX
* **Problem**: PR errors require manual developer intervention to run tests and fix resource compilation discrepancies.
* **Solution**: A GitHub Action workflow executing migrations, resource compilation, and PHPUnit test harnesses. On failure, an autonomous subagent is dispatched to diagnose logs, refactor code, and push fixes before final human review.

### E. Semantic Template Refactoring (`ARCH-001`) — 🧊 ICEBOX
* Rename `gestor/autenticacoes.exemplo/` to `gestor/autenticacoes.template/`, standardizing authentication templates across the framework.

---

## 🎓 2. Educational Strategy: The AI Engineering Course

The Conn2Flow ecosystem provides the live codebase for hands-on AI engineering education:

1. **Foundational Module (Mindset & Chats)**:
   - AI Chat landscape (ChatGPT, Claude, Gemini, Copilot).
   - Why simple copy-pasting fails in production (The Architect & The Builder metaphor).

2. **Intermediate Module (Spec-Driven Development)**:
   - Structuring repositories with SDD (specifications, decisions, atomic requests).
   - Preventing file hallucinations and maintaining Git control.

3. **Advanced Module (Double Agent Architecture & Skills)**:
   - Orchestration using Google Antigravity and execution subagents (Claude Code / Cursor).
   - Designing declarative Skills to teach custom proprietary frameworks to AI models.

# SDD Agents — OpenAI Codex & Antigravity Multi-Agent Configuration

## 👥 Double Agent Roles

### 🏛️ Architect (Macro-Orchestrator)
- **Responsibility**: Translate human needs and briefings into normative specifications (`sdd/SPEC.md`), decision records (`sdd/decisions/`), and formal requests (`sdd/human-requests/req-XXX.md`).
- **Tools**: Antigravity / Gemini / GPT in planning mode.
- **Rule**: Never commits or pushes code directly in the core or project modules.

### ⚙️ Executor (Micro-Operator)
- **Responsibility**: Implement code, compile resources, execute tests, and log verification receipts in `sdd/implementation/batch-YYY.md` and `sdd/validation/VALIDATION-CHECKLIST.md`.
- **Tools**: OpenAI Codex / GPT in VS Code / Claude Code.
- **Rule**: Reads the briefing in `sdd/human-requests/CURRENT.md` before making changes and maintains the Live Todo List (`[ ]` ➔ `[x]`).

### 👨‍💻 Human-in-the-Loop (You)
- **Responsibility**: Direct the Architect and inspect code diffs before final consolidation.

---

## 📦 Skills Configuration (36 Official Skills)

All **36 skills** are available in `.codex/skills/` (as well as `.claude/skills/`, `.gemini/skills/`, `.github/skills/`, `.cursor/skills/`) following the open progressive disclosure standard (`SKILL.md`):

### 1. Core Framework Skills (29 Skills):
- `c2f-agent-visual-inspection`
- `c2f-database-operations`
- `c2f-dev-scripts`
- `c2f-docker-environment`
- `c2f-documentation-governance`
- `c2f-environment-configuration`
- `c2f-file-system-operations`
- `c2f-gestor-functions`
- `c2f-global-variables`
- `c2f-hooks-system`
- `c2f-html-css-pages-and-components`
- `c2f-interface-v2-architecture`
- `c2f-javascript-ajax`
- `c2f-layout-engine-architecture`
- `c2f-modelo-templates`
- `c2f-module-crud-scaffolding`
- `c2f-multilingual-system`
- `c2f-plugin-architecture`
- `c2f-preview-modals-system`
- `c2f-project-pipeline-and-tasks`
- `c2f-projects-system`
- `c2f-resources-system`
- `c2f-shell-and-windows-traps`
- `c2f-system-tasks`
- `c2f-tailwind-css-architecture`
- `c2f-variables-system`
- `c2f-widgets-system`
- `c2f-quill-editor`
- `c2f-assets-management`

### 2. SDD Governance & Workflow Skills (7 Skills):
- `sdd-workflow`
- `start-sdd-slice`
- `continue-sdd-batch`
- `raise-spec-change`
- `review-current-batch`
- `project-validation`
- `sdd-memory-gardening`

---

## 🛡️ Inviolable Governance Rules

1. **Absolute Prohibition of `git add -A` and `git add .`**: Commits must ALWAYS list explicit paths (`git add <specific-paths>`).
2. **Prohibition of Manual Synchronization**: NEVER copy files manually (`cp`, `copy`, `Copy-Item`) to test/mirror directories (`dev-environment/data/sites/`). Always execute `./c2f manager:update-all` (system) or `./c2f project:update-all <id>` (project).
3. **Exclusive Sequential Execution**: Batch compilation commands (`manager:update-all`, `project:update-all`, `css:rebuild`, `resources:sync`) must execute sequentially in foreground with unbuffered logs.
4. **Runtime Source of Truth**: Runtime strictly serves HTML and CSS from the SQL database. `resources/` is the authoring seed.
5. **Mandatory Version Bump**: When editing JS scripts or static CSS, increment the version in the resource metadata `<id>.json`.
6. **Goal Mode (`/goal`)**: Use `/goal` in the prompt for continuous execution in Monitored Autonomous mode until all checks in `VALIDATION-CHECKLIST.md` are fulfilled.

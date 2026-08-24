# 🧩 Skills Catalog — Conn2Flow AI Workspace

This catalog lists the **32 Skills** (25 Core Framework Skills + 7 SDD Workflow Skills) standardized and universally synchronized across **Claude Code (`.claude/skills/`)**, **Cursor IDE (`.cursor/skills/`)**, **GitHub Copilot (`.github/skills/`)**, and **Gemini Antigravity (`.gemini/skills/`)**.

---

## 🛠️ 1. Core Framework Skills (`c2f-*`) — 25 Skills

| Skill | Trigger & Core Purpose |
| :--- | :--- |
| **`c2f-module-crud-scaffolding`** | **[NEW]** Canonical guide and scaffolding for new CRUD modules based on the `modulos-grupos` pattern. |
| **`c2f-variables-system`** | **[NEW]** Governance for interface copy, error messages, alerts, and i18n via `variables.json`. Prohibits hardcoded strings. |
| **`c2f-environment-configuration`** | **[NEW]** Management of sensitive credentials and `.env` templates via `config.php` and `$_CONFIG`. Prohibits exposed secrets. |
| **`c2f-resources-system`** | Declarative compilation of 11 resource types (`layouts`, `pages`, `components`, `templates`, etc.) and dynamic tables. |
| **`c2f-global-variables`** | Guide to superglobals `$_GESTOR` (runtime), `$_CONFIG` (system), `$_BANCO` (database), and `$_ENV` (infra). |
| **`c2f-database-operations`** | Safe database operations via helper libraries (`banco_select`, `banco_insert_name`, `banco_update`, `banco_escape_field`). |
| **`c2f-database-migrations`** | Deterministic database migrations using Phinx (`db/migrations/`). |
| **`c2f-database-schema`** | Schema metadata and declarative synchronization via `schema-metadata.json`. |
| **`c2f-module-structure`** | Anatomy and lifecycle of modules in `gestor/modulos/`. |
| **`c2f-module-configuration`** | Internal configuration screens and tables for modules. |
| **`c2f-html-css-pages-and-components`** | HTML/CSS rendering patterns, layout slots, and section metadata (`data-id`, `data-title`). |
| **`c2f-system-tasks`** | Execution of system routines, bash scripts, and infrastructure automations. |
| **`c2f-auth-system`** | User authentication, 2FA, secure sessions, and JWT tokens. |
| **`c2f-access-control`** | User profiles, modular permissions, and hierarchical role-based access control. |
| **`c2f-form-processing`** | Form handling, CSRF token validation, and input sanitization. |
| **`c2f-api-endpoints`** | Building REST endpoints, JSON responses, and API contracts. |
| **`c2f-ajax-handling`** | Handling asynchronous AJAX requests on frontend and backend. |
| **`c2f-crawlers-and-bots`** | Detecting search bots, scrapers, and social media crawlers (OpenGraph). |
| **`c2f-cookie-management`** | Cookie manipulation with hashing and LGPD/GDPR compliance. |
| **`c2f-tailwind-css-architecture`** | **[NEW/UPDATED]** Tailwind CSS v4 governance, cascade collision avoidance, database `css_compiled` clearing, dynamic templates (`tailwind_dependencies`), and `c2f resources:sync` compilation. |
| **`c2f-library-system`** | Dynamic inclusion and versioning of system libraries (`gestor_incluir_biblioteca`). |
| **`c2f-url-routing`** | Canonical URL resolution, dynamic routing, and URL rewrites. |
| **`c2f-i18n-translations`** | Translation and internationalization of interfaces and dictionaries (`__t()`). |
| **`c2f-file-system-operations`** | Secure uploads, file system operations, and absolute path resolution. |
| **`c2f-log-system`** | Unified disk logging (`log_disco()`) and runtime debugging. |

---

## 🚦 2. SDD Workflow Skills (`sdd-*`) — 7 Skills

| Skill | Purpose in Development Lifecycle | Activation Milestone |
| :--- | :--- | :--- |
| **`start-sdd-slice`** / **`sdd-classify-intent`** | Classifies human intent and initializes slice operational context. | 🟢 **Task Initiation** |
| **`sdd-workflow`** | Step-by-step guide for Spec-Driven Development. | 🟢 **Task Initiation** |
| **`sdd-update-spec`** | Updates living technical specifications (`sdd/SPEC.md`). | ⚙️ **During Execution** |
| **`sdd-record-decision`** | Records formal architectural decisions in `sdd/decisions/DECISION-LOG.md`. | ⚙️ **During Execution** |
| **`sdd-plan-batch`** | Decomposes complex requirements into atomic, executable batches. | ⚙️ **During Execution** |
| **`project-validation`** / **`sdd-validate-acceptance`** | Validates acceptance criteria, executes test suites, and audits specs. | 🏁 **Review & Validation** |
| **`review-current-batch`** / **`sdd-log-implementation`** | Logs implementation receipts and test evidence in `batch-YYY.md`. | 🏁 **Review & Validation** |
| **`sdd-memory-gardening`** | Idempotent pruning and archiving of operational memories. | 🏁 **Review & Validation** |
| **`raise-spec-change`** / **`sdd-process-change-request`** | Processes formal scope change requests (`CR-XXX.md`). | ⚠️ **Normative Change** |

---

## ⚡ 3. The Execution Contract Pattern (`TRIGGER` & `SKIP`)

All 32 skills enforce a mandatory contract clause at the top of the file to ensure deterministic model activation:

```markdown
# ⚡ Mandatory Trigger
- **TRIGGER**: Exact observable action requiring prior reading of this skill.
- **SKIP ONLY IF**: Strict exemption condition (e.g., read-only investigation).
- **CONSEQUENCE OF IGNORING**: High technical risk of silent regression or rejected pull requests.
```

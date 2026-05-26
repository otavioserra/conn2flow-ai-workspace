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
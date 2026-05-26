---
paths:
  - "project/**/*.md"
---

# Local SDD Inside project/

- Some scopes in `project/<workstream>/` already operate with local SDD even if the whole repository does not follow that model.
- When `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md`, and `validation/VALIDATION-CHECKLIST.md` exist, treat that scope as local SDD.
- Treat `project/<workstream>/human-requests/` only as non-normative human intake; any consolidation should go to the main spec, reviews, change-requests, decisions, implementation, or validation.
- Edit the main spec only when a requirement, acceptance criterion, or structural decision really changes.
- Use reviews, change-requests, decisions, implementation, and validation for the rest of the incremental work.
- Treat `antigo/` as historical material, not as the current source of truth.
- Do not try to retrofit SDD to the entire repository from a single local workstream.
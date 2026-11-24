---
name: raise-spec-change
description: "READ BEFORE changing normative rules, functional requirements or contracts in memory/SPEC.md. Requires explicit change tracking to preserve MDD governance."
user-invocable: true
---

# Standard change

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Detect that implementation requires contract change, new data model, requirement change or premise break in `memory/SPEC.md`.
- **SKIP ONLY IF**: The change is only technical implementation detail within the limits of the current specification.
- **CONSEQUENCE OF IGNORING**: Violation of MDD normative flow, illegal editing of restricted files of the Head office and deviation of the scope of the project.

---

Treat `$ARGUMENTS` as a normative change request.

## Procedure

1. Load `mdd-workflow`.
2. Confirm impact on `memory/`, decisions, implementation and validation.
3. Register the change in `memory/change-requests/` before consolidating into the numbered normative documents in `memory/`.
4. Only implement after the normative change becomes explicit.

## Current request

$ARGUMENTS

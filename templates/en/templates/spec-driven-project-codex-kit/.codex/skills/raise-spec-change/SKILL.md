---
name: raise-spec-change
description: "READ BEFORE changing normative rules, functional requirements or contracts in sdd/SPEC.md. Requires explicit change tracking to preserve SDD governance."
user-invocable: true
---

# Standard change

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Detect that implementation requires contract change, new data model, requirement change or premise break in `sdd/SPEC.md`.
- **SKIP ONLY IF**: The change is only technical implementation detail within the limits of the current specification.
- **CONSEQUENCE OF IGNORING**: Violation of SDD normative flow, illegal editing of restricted files of the Head office and deviation of the scope of the project.

---

Treat `$ARGUMENTS` as a normative change request.

## Procedure

1. Load `mdd-workflow`.
2. Confirm impact on `sdd/`, decisions, implementation and validation.
3. Register the change in `sdd/change-requests/` before consolidating in numbered sdd.
4. Only implement after the normative change becomes explicit.

## Current request

$ARGUMENTS

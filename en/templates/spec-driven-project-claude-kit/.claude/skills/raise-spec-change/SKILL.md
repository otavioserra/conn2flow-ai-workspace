---
name: raise-spec-change
description: Opens a normative change round in an SDD repository. Use when a requirement, contract, acceptance criterion, or structural decision really needs to change.
disable-model-invocation: true
argument-hint: "[requested-change]"
---

# Normative change

Treat `$ARGUMENTS` as a normative change request.

## Procedure

1. Load `sdd-workflow`.
2. Confirm the impact on `sdd/`, decisions, implementation, and validation.
3. Register the change in `sdd/change-requests/` before consolidating it into the numbered SDD file.
4. Only implement after the normative change becomes explicit.

## Current request

$ARGUMENTS
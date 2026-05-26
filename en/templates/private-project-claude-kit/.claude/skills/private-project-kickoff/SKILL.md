---
description: Starts a new request in a Conn2Flow private project. Use when the task is new, when the split between the private repository and conn2flow is still unclear, or when a local scope in project/ can control the round.
disable-model-invocation: true
argument-hint: "[request]"
---

# Private project kickoff

Treat `$ARGUMENTS` as the new request to coordinate and execute.

## Before acting

1. Identify the most concrete anchor of the task: file, module, error, behavior, screen, command, spec, batch, or local workstream.
2. If the split between private and `conn2flow` is uncertain, load `private-project-context`.
3. If the task is anchored in `project/<workstream>/` with local SDD artifacts, load `project-sdd-context`.
4. If it touches `gestor/**/*.php`, load `gestor-module-integration`.
5. If the dominant step is environment, logs, Docker, JWT, Phinx, or DB, load `local-validation`.
6. If the dominant step is local tests in the Conn2Flow ecosystem, load `local-tests`.

## How to conduct it

1. Classify early: private only, core only, or split.
2. Read only the minimum context needed to form a falsifiable local hypothesis.
3. Move to the smallest plausible change as soon as there is enough anchor.
4. Validate in the smallest possible scope right after the first substantive edit.
5. If the task grows, keep batches small and do not stack ad hoc context.

## Current input

$ARGUMENTS
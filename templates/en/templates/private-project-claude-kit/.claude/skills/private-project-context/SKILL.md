---
name: private-project-context
description: Use when you need to decide whether a change in the Conn2Flow ecosystem belongs to the private repository, the conn2flow core, or both.
user-invocable: false
---

# Private project context

Use this skill whenever the task touches code that exists or may exist in both the private repository and `conn2flow`.

## Repository roles

- `conn2flow`: the open and generic system core.
- private repository: the project layer, with project-specific modules, customizations, themes, and overrides.

## Decision rules

1. Look for the solution in the private repository first.
2. If the file already exists in the private repository, prioritize that file.
3. If the feature is private and does not yet exist, create it in the private repository.
4. Edit `conn2flow` only when the change is generic, reusable, and useful to all projects.
5. If the fix touches both sides, separate what is core from what is project-specific.

## Quick checklist

- Does the change serve only this client or project?
- Is there a corresponding override in the private repository?
- Does creating the file in the private repository solve it without touching the core?
- Would moving it to the core reduce real duplication across projects?
- Is there a risk of overwriting existing private behavior?
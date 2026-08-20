# Hooks and handoffs

## When to use handoffs

Use handoffs when you want a guided transition between stages with human approval in between.

Examples:

- coordination -> implementation
- implementation -> review
- review -> final fixes

## When to use subagents

Use subagents for short, focused delegation inside the same task, such as:

- researching recent external documentation
- reviewing regression risks
- listing likely files before implementation

## When to use hooks

Use hooks for small deterministic automations, not for complex reasoning.

Good hook ideas:

- warn about sensitive files before editing
- remind to validate when certain paths are touched
- suggest a continuation prompt at the end of a long task

Avoid using hooks to:

- decide architecture
- perform broad research
- replace prompts, skills, or agents

## Practical rule

Prompts start flows, skills load runbooks, agents shape behavior, and handoffs stitch stages together. Hooks should remain small and predictable guardrails.

## Kit hook

The file `.github/hooks/private-project-session-start.json` injects a short reminder at session start. The matching scripts live in `scripts/hooks/` so the kit can be installed by copy or by script without depending on external paths.
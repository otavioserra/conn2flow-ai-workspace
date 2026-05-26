# Continuity and interruptions

## What to report when you change files in the middle of the process

Use a short, objective message, for example:

- I manually changed `gestor/modulos/x/y.php`; reread that file and continue.
- I changed the business rule: now this needs to stay only in the private layer.
- I already fixed the HTML; now adjust only the JS and revalidate.

## What the agent usually perceives well

- The history of the current conversation.
- Files explicitly cited, attached, or opened in the task.
- Instructions, prompts, agents, and skills loaded automatically.

## What you should not assume

- That every manually changed file will be reread without you mentioning it.
- That an implicit scope change will be inferred correctly.
- That the agent will distinguish on its own what is a private override and what should move to the core without enough context.

## Golden rule

If you changed files or assumptions, say that explicitly and point to the smallest set of files that must be reread.
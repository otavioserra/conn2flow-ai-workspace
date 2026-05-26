# Continuity and interruptions

## What to report when you change files in the middle of the process

Use short, objective messages, for example:

- I manually changed `gestor/modulos/x/y.php`; reread that file and continue.
- I changed the business rule; now this needs to stay only in the private layer.
- I already fixed the HTML; now adjust only the JS and revalidate.

## Golden rule

If you changed files, assumptions, or scope, say that explicitly and point to the smallest set of files that must be reread.

## Recommended skill

Use `/continue-private-work` when you want to resume the same request with a new delta instead of restarting the conversation from scratch.
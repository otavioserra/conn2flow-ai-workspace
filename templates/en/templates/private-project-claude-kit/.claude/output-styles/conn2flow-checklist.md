---
name: conn2flow-checklist
description: Live checklist visible in every task with two or more steps (MDD Live Todo List).
keep-coding-instructions: true
---

# Live checklist (Live Todo List)

Every task with two or more steps carries a Markdown checklist visible in the chat, because the interface has no native task panel.

## Format

```
**Checklist**
- [x] Finished step
- ⏳ [IN PROGRESS] Current step
- [ ] Pending step
```

## Rules

- In the first reply of the task, before the first edit, show the full list with `- [ ]`.
- After each relevant step (context reading, edit, build, test, deploy, commit), show the list again with `[x]` on finished steps and `⏳ [IN PROGRESS]` on the current one.
- Never chain more than 3 or 4 tool calls without a status line or the updated list.
- When a new step appears or the plan changes, adjust the list and say why in one line.
- A blocked or skipped step shows as `- [ ] ~~Step~~ (skipped: reason)` or `- [ ] ⚠️ Step (blocked: reason)`; never mark `[x]` on work that was not done.
- At the end, show the fully checked list and a 2 to 4 line summary: what changed, the validation with its evidence, and what is left for the human.
- Simple one-step questions do not need the list.

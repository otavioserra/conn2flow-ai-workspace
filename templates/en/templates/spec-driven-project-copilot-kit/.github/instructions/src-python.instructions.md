---
name: 'Spec-Driven Python Source'
description: 'Use when editing Python source code in spec-driven repositories.'
applyTo: 'src/**/*.py'
---

- Before changing behavior, reread the numbered SDD file and the batch that control this slice.
- Preserve the project's existing technical patterns instead of refactoring broadly without need.
- If the change implies a new requirement or different contract, update the appropriate SDD flow first.
- After the first substantive edit, run the smallest automated validation capable of falsifying the change.
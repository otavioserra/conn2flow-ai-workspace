---
name: sdd-memory-gardening
description: "READ BEFORE ending a session or whenever execution memory exceeds thresholds (50 KB / 150 lines). If ignored: prompt bloat degrades AI model attention and wastes tokens."
user-invocable: false
---

# SDD Memory Gardening

# ⚡ Mandatory Trigger
- **TRIGGER**: Ending a work session, completing a batch, or whenever `ENGINEERING-MEMORY-EXECUTION.md` or `MEMORIA-ENGENHARIA-EXECUCAO.md` exceeds 50 KB or 150 lines (preventive alert at 35 KB / 100 lines).
- **SKIP ONLY IF**: Simple read-only query session with no context change or operational learnings.
- **CONSEQUENCE OF IGNORING**: Agent cognitive degradation from context bloat, increased inference costs, and loss of critical guidelines.

---

1. Measure bytes and line count and read the full execution memory (or run `c2f ai:prune-memories`).
2. Preserve 12 to 15 recent tasks and active pending items.
3. Distill recurrent rules into Core or project-specific skills.
4. Never modify Leadership Memory without explicit human instruction.
5. Rewrite memory targeting ~15 KB (preventive alert at 35 KB and strict maximum ceiling of 50 KB).
6. Validate frontmatter, skill discovery, and recoverable Git history.
7. Record final metrics and validation evidence in the batch checklist.

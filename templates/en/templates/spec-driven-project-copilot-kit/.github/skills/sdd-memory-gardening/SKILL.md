---
name: sdd-memory-gardening
description: "READ ONLY when execution memory reaches the 50 KB / 200-line warning or the 75 KB / 300-line ceiling. Never prune healthy files or invoke this skill merely because a session ends."
user-invocable: false
---

# SDD Memory Gardening

> 🚫 DO NOT PRUNE when execution memory is below 50 KB or 200 lines. Ignore this skill at the end of a session while the file remains healthy.

# ⚡ Mandatory Trigger
- **TRIGGER**: When `ENGINEERING-MEMORY-EXECUTION.md` or `MEMORIA-ENGENHARIA-EXECUCAO.md` reaches 50 KB or 200 lines (preventive warning). Pruning becomes mandatory at 75 KB or 300 lines.
- **SKIP ONLY IF**: The file is below 50 KB and 200 lines. Ending a session or completing a batch never triggers this skill by itself.
- **CONSEQUENCE OF IGNORING**: Agent cognitive degradation from context bloat, increased inference costs, and loss of critical guidelines.

---

1. Measure bytes and line count and read the full execution memory (or run `c2f ai:prune-memories`).
2. If the file is below 50 KB and 200 lines, stop and record that memory is healthy; do not rewrite it.
3. Between 50 KB / 200 lines and 75 KB / 300 lines, issue a preventive warning and schedule maintenance without automatic pruning.
4. At 75 KB or 300 lines, perform mandatory pruning.
5. Preserve the 20 to 25 most recent tasks, learnings, and active pending items.
6. Distill recurrent rules into Core or project-specific skills.
7. Never modify Leadership Memory without explicit human instruction.
8. Rewrite memory targeting approximately 25 KB.
9. Validate frontmatter, skill discovery, and recoverable Git history.
10. Record final metrics and validation evidence in the batch checklist.

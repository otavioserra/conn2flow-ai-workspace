---
name: mdd-memory-gardening
description: "READ ONLY when execution memory reaches the 50 KB / 200-line warning or the 75 KB / 300-line ceiling. Never prune healthy files or invoke this skill merely because a session ends."
user-invocable: false
---

# MDD Memory Gardening

> 🚫 DO NOT PRUNE when execution memory is below 50 KB and 200 lines. Ignore this skill at the end of a session while the file remains healthy.

# ⚡ Mandatory Trigger
- **TRIGGER**: When `04-memory-engineering-execution.md` or `memory/04-memory-engineering-execution.md` reaches 50 KB or 200 lines (preventive warning). Pruning becomes mandatory at 75 KB or 300 lines.
- **SKIP ONLY IF**: The file is below 50 KB and 200 lines. Ending a session or completing a batch never triggers this skill by itself.
- **CONSEQUENCE OF IGNORING**: Agent cognitive degradation from context bloat, increased inference costs, and loss of critical guidelines.

---

## 📦 Rule of 10 Active Files in the MDD Root

Beyond execution memory, the control folders keep a fixed window of **10 active files** in their root:

- `memory/human-requests/`: at most **10 loose requests**, plus `CURRENT.md` and `README.md`. Everything older moves to `memory/human-requests/archive/`.
- `memory/implementation/`: at most **10 loose batch reports**, plus `BATCH-INDEX.md`. Everything older moves to `memory/implementation/archive/`.
- `DECISION-LOG.md`, `BATCH-INDEX.md` and `VALIDATION-CHECKLIST.md` keep at most 10 current items, with the archived history summarized in a table linking to `archive/`.

**Never move these files by hand**: when a file is archived, every markdown link that pointed to the old path in `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `DECISION-LOG.md` and `CURRENT.md` must be rewritten to `archive/`. Use the deterministic Core command, which moves files and rewrites links in a single operation:

```sh
mdd compact --path ABSOLUTE_ROOT          # audit, no writes
mdd compact --path ABSOLUTE_ROOT --apply  # authorized maintenance only
```

Preserve the full original and a traceable summary in memory/raw/archive/original/ and memory/raw/archive/compacted/ before pruning memory/04-memory-engineering-execution.md. Rebuild indexes with mdd index and check links. mdd compact produces structural extracts and partitions; it does not replace authorized semantic summaries. Never assume the legacy archiver supports the migrated tree.

---

## 🧠 Execution Memory Pruning

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

## MDD: safe worktree maintenance

Worktree maintenance is independent of memory pruning. Never prune healthy memory at session end. The matrix uses memory/ and a 50 KB active-document ceiling; satellites still use memory/. Do not assume ai:archive-sdd supports memory/.

1. Inventory worktrees and absolute roots; protect the main tree and environment/pipeline source trees.
2. Fetch refs and verify no commits outside origin/main, no real staged or unstaged changes (ignore CR at EOL), and no untracked files. Report pending work; never force removal.
3. On Windows inspect junctions and incoming links. Validate literal targets first. Use CMD end to end to list links with dir /AL and unlink each junction with rmdir WITHOUT /S. Repoint incoming dependencies first; never compose deletion across shells.
4. Confirm links are gone, then git worktree remove the verified literal path; preserve trees Git refuses to remove.
5. Check vendor/node_modules in surviving trees, delete only integrated local branches with git branch -d (never -D), then prune metadata.
6. Record removed/preserved trees and integrity checks. Fast-forward a clean main tree only when authorized; never merge divergent work automatically.

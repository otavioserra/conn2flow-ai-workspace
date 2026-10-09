# MDD Policy

## Five canonical root documents

| File | Purpose |
| --- | --- |
| [00-baseline-architecture.md](00-baseline-architecture.md) | Architecture and context router |
| [01-general-memory.md](01-general-memory.md) | Memory mechanics and lifecycle |
| [02-policy.md](02-policy.md) | Governance and agent policy |
| [03-memory-engineering-chief.md](03-memory-engineering-chief.md) | Chief engineering directives and strategic journal |
| [04-memory-engineering-execution.md](04-memory-engineering-execution.md) | Dated execution sessions and technical lessons |

Numbering standardizes filenames; historical content may remain multilingual. SPEC.md and index.md are supporting infrastructure.

## Raw observations and execution archives

Use [raw/active/](raw/active/index.md) for temporary scratchpads, observable logs and shareable decision summaries, without secrets or private reasoning transcripts. Raw observations have no normative authority.

Execution memory has a preventive 50 KiB ceiling and a critical alert at 75 KiB. Plan maintenance at 50 KiB; never prune healthy memory merely to close a session. When authorized maintenance is needed, preserve the complete original in [raw/archive/original/](raw/archive/original/index.md) and a traceable summary in [raw/archive/compacted/](raw/archive/compacted/index.md) before reducing the active document to about 25 KiB with the 20–25 most recent records and all unresolved items. Repair links and update hierarchical indexes in the same operation.
Keep explicit git staging paths. Preserve chief directives; executors may not rewrite them without explicit authorization.

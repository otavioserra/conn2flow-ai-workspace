# 00 Baseline Architecture

## Objective

Record the approved legacy state before major structural changes.

## How to fill this file

- List directories, modules, and flows already considered stable.
- Identify compatibility constraints, external integrations, and sensitive areas.
- Clearly declare what cannot be simplified or removed without an approved normative change.

## Suggested initial structure

- Main product surfaces:
- External integrations:
- Operational constraints:
- Accepted technical debt areas:

## Operational rule

The executor should reread this file before proposing broad refactors, structural removals, or aggressive consolidations.

## Five canonical root documents

| File | Purpose |
| --- | --- |
| [00-baseline-architecture.md](00-baseline-architecture.md) | Architecture and context router |
| [01-general-memory.md](01-general-memory.md) | Memory mechanics and lifecycle |
| [02-policy.md](02-policy.md) | Governance and agent policy |
| [03-memory-engineering-chief.md](03-memory-engineering-chief.md) | Chief engineering directives and strategic journal |
| [04-memory-engineering-execution.md](04-memory-engineering-execution.md) | Dated execution sessions and technical lessons |

Numbering standardizes filenames; historical content may remain multilingual. SPEC.md and index.md are supporting infrastructure.

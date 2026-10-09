---
verified_at: 2afd000
sources:
  - ../../memory/00-baseline-architecture.md
  - ../../memory/01-general-memory.md
  - ../../memory/02-policy.md
---


# MDD framework specification

[Português](../pt-br/ESPECIFICACAO-FRAMEWORK-MDD.md) · [Documentation index](README.md)

MDD adds persistent, retrievable project memory to specification-driven engineering. This guide describes the approved memory policy; it does not introduce a new normative contract. The [baseline router](../../memory/00-baseline-architecture.md), [mechanics](../../memory/01-general-memory.md) and [policy](../../memory/02-policy.md) govern the matrix.

## Four memory layers

| Layer | Purpose | Location | Authority |
| --- | --- | --- | --- |
| Episodic | Dated requests, batches, checks, handoffs and session reports | human-requests/, implementation/, validation/, handoffs/, sessions/, reports/ | Evidence of what happened; not a new requirement |
| Semantic / normative | Approved architecture, specifications, decisions and policies | Root documents, decisions/, change-requests/ | Approved requirements; technical descriptions must follow current code |
| Procedural | Reusable engineering methods and operational traps | .gemini/skills/ and memory/process/ | Task procedures within approved scope |
| Raw | Intermediate observations, notes and shareable artifacts | raw/active/ and raw/archive/ | No normative authority |

Do not store credentials, unnecessary personal information or private reasoning transcripts. Record shareable evidence and concise decision summaries. A raw observation becomes a verified episode only after its source is checked; a recurring rule needs approval before promotion to a skill or contract.

## Lifecycle and retention

1. **Capture:** record origin, date, state and the request/batch relationship.
2. **Active retention:** keep the working set small and retrieve through indexes.
3. **Preventive pruning:** identify limits before adding more content; preserve originals before distilling or splitting.
4. **Dual archiving:** store the original and summary, update indexes and repair references in the same operation.

A completed session is not a reason to prune healthy memory. Code, schemas and current configuration prevail over historical descriptions of behavior; approved specifications govern intended requirements. Report contradictions rather than silently rewriting a contract.

## Rule of 10 active items

The active roots of **human-requests/, implementation/, decisions/ and reports/** retain at most **10 items each**. Indexes, README files and pointers are infrastructure and do not count as items. DECISION-LOG, BATCH-INDEX and VALIDATION-CHECKLIST present at most 10 current entries; historical records stay accessible through indexes.

Archive the oldest excess eligible items with their references intact. Do not relocate an active dependency merely because its filename has the smallest number. Legacy archives remain indexed until an authorized migration; the policy does not authorize bulk historical rewriting.

## Preventive 50 KB ceiling

Active documents stay below **50 × 1024 = 51,200 bytes**. The baseline router stays below **30 KB**. Execution memory also raises an alert at **200 lines**. At the ceiling, preserve the original and distill or split into indexed nodes before expanding the active document.

The historical 75 KB / 300-line gardening threshold does not permit exceeding the MDD active ceiling. Do not rewrite healthy memory simply to finish a batch, and do not change Chief Engineering memory without explicit authorization.

## Hierarchical index tree

```text
memory/
├── index.md
├── 00-baseline-architecture.md
├── 01-general-memory.md
├── 02-policy.md
├── implementation/
│   ├── index.md
│   ├── batch-YYY.md
│   └── archive/
│       ├── index.md
│       ├── compacted/index.md
│       └── original/index.md
└── raw/
    ├── index.md
    ├── active/index.md
    └── archive/
        ├── index.md
        ├── compacted/index.md
        └── original/index.md
```

Every active folder and archive node has an index with **ID, Title, one-line Executive Summary, Relative Link and Status**. Start with the [root index](../../memory/index.md), then read the relevant area index. Use compacted records for historical scanning and originals to verify details. Partition large archives into archive-1/, archive-2/ with an index at every node when hundreds of entries impair navigation.

## Dual archive and link integrity

| Destination | Required content | Use |
| --- | --- | --- |
| archive/original/ | Original bytes and full evidence | Verification and traceability |
| archive/compacted/ | Summary with provenance, original link and explicit gaps | Economical context retrieval |

Compaction is not deletion. A summary must distinguish confirmed facts, obsolete behavior and unresolved questions. Repair links from CURRENT, indexes, batch/checklist records and decisions whenever a file moves. Existing legacy history can coexist with dual archives; do not imply that every historical artifact has already been converted.

## Agent cycle and scope

The Architect prepares the approved contract and acceptance criteria; the Executor reads CURRENT, implements, checks and records the Live Todo List; the Reviewer issues independent findings before consolidation. The human directs and approves. See the [triad guide](DOUBLE-AGENT-ARCHITECTURE.md).

The matrix uses memory/. Existing boilerplates and satellite discovery still support sdd/; the separate migration workstream must validate each repository. A future mdd compact implementation must be checked against these requirements before being described as compliant.

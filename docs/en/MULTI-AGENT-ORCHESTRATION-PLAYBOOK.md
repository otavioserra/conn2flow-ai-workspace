---
verified_at: 2afd000
sources:
  - ../../memory/02-policy.md
  - ../../mcp-hub/src/server.ts
  - ../../mcp-hub/src/tools/dispatchTask.ts
  - ../../.gemini/skills/c2f-shell-and-windows-traps/SKILL.md
---


# Multi-agent MDD orchestration playbook

[Português](../pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md) · [Documentation index](README.md)

## Prepare the slice

The human defines the need. The Architect reads current source and memory, defines the contract and acceptance criteria, and prepares an approved request and batch. Backlog ideas remain non-executable until promotion. Use memory/human-requests/CURRENT.md and the relevant index in this matrix; verify each satellite's actual governance root.

## Execute with visible evidence

The Executor reads CURRENT, the request, batch and checklist; selects the relevant procedures from the **45-skill catalog**; displays the Live Todo List; and implements the smallest approved slice. Update progress after meaningful steps, run appropriate checks and record concrete results and limitations.

```text
Project: <repository identifier>
Root: <absolute repository path>
Request: <approved request path>
Batch: <batch path>
Autonomy: <approved mode>
Acceptance: <checks and expected results>
Stop conditions: <scope conflict, missing required access, failed checks>
```

This handoff template works across models without depending on a claimed vendor version or slash-command capability. /goal is a client workflow option where supported; it does not grant permissions or replace acceptance criteria.

## Review and homologate

The Reviewer independently reads diffs and authoritative source, checks task-specific risks and reports findings by severity with file evidence. Distinguish executed checks from missing checks. The human/Architect homologates after review; no agent invents that approval. Dual topology combines review with the Architect; the triad keeps the Reviewer separate.

## MCP task queue and receipts

Use dispatch_task with the repository, request and actionable prompt. Select supervised, live_autonomous or headless_autonomous; the call writes a task record. report_completion records success/failed and logs, with task/request/role correlation when supplied. log_session_event records a shareable milestone. Queueing does not start an executor by itself; the VS Code watcher observes changes.

The [CLI/MCP guide](QUICKSTART-CLI-AND-MCP.md) documents actual tool inputs. The planned Python Hub has a different purpose: Client reports and documentation monitoring, with headless/monitored/reviewer evolution modes.

## Concurrency and memory hygiene

Separate authorized fronts by explicit file ownership or isolated worktrees. Do not run resource compilation pipelines concurrently. Commit only explicit paths and verify the staged diff. Before removing Windows worktrees, inspect junctions and references; never force removal through unintegrated work. Read the shell skill for the full procedure.

Capture dated evidence, retrieve through indexes and preserve originals during authorized compaction. Respect the 10-item active windows and 50 KB ceiling; do not prune healthy memory at session end. See the [memory guide](MDD-FRAMEWORK-SPECIFICATION.md) and [triad responsibilities](DOUBLE-AGENT-ARCHITECTURE.md).

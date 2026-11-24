---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../memory/backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md
  - ../../vscode-extension/src/providers/mddHubManager.ts
  - ../../vscode-extension/package.json
  - ../../vscode-extension/src/providers/conn2flowTreeProvider.ts
  - ../../vscode-extension/src/providers/sddScopeManager.ts
  - ../../vscode-extension/src/providers/projectConflictsManager.ts
  - ../../vscode-extension/src/providers/commandRunner.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
  - ../../vscode-extension/src/providers/releaseManager.ts
---


# Conn2Flow Tools v1.2.0 panel

[Português](../pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md) · [Documentation index](README.md)

## Version and delivery state

The [manifest](../../vscode-extension/package.json) declares v1.2.0. Install the locally packaged VSIX and open **MDD Hub & Skills Control** from the Conn2Flow activity bar.

## How to use

1. Install a built VSIX and open the repository in VS Code. Select the intended repository scope and target project in Main Controls.
2. Choose language, topology and autonomy. Open CURRENT, its approved request, SPEC and validation before starting work.
3. Use Copy Executor Prompt or Start Claude Code (/goal) for the approved slice; follow task output, checks and receipts. Prepare Architect Review opens the handoff and Source Control, without committing or pushing.

Command execution depends on Workspace Trust where required. Missing repository context or an unconfigured project target must be resolved before contextual operations.

## Panel tree

| Section | Contents |
| --- | --- |
| Main Controls | Repository scope, target, language, topology, autonomy, HubTaskWatcher |
| MDD & Planning | Agent bridge, CURRENT, SPEC, checks, requests, batches, backlog, decisions, handoffs and gardening |
| Core & Releases | Core pipelines and guarded release preparation/execution |
| Projects & Test Environment | Project targeting, updates, scaffolding and delivery conflicts |
| Environment & Diagnostics | Docker, logs, CSS and skill synchronization |
| Documentation & Settings | Guides and configuration |

The tree uses progressive disclosure and persists expansion state. Native tooltips explain purpose and impact. Main Controls starts expanded; other sections start collapsed.

## Repository scope, language and autonomy

Repository discovery prefers `memory/` and falls back to legacy `sdd/`. A missing document does not silently fall back to another repository's governance. Documents support preview, source or side-by-side display. Backlog navigation reads BACKLOG-INDEX and reports index/file drift; promotion prepares context rather than authorizing execution.

conn2flow.language supports auto, pt-BR and en. Runtime labels update immediately; palette labels may need Reload Window. The panel supports solo/dual/triad topology and supervised/monitored/headless workflow selection. These differ from the Python MDD Hub evolution modes.

## Delivery conflicts

Select a configured project and open its delivery conflicts. The panel lists the CLI's conflict records, opens the live/received diff when both files exist, and offers only actions returned by the CLI: sobrescrever, manter or mesclar.

When mesclar is available, open and edit the merged file, save it, confirm continuation and choose whether to apply to the live delivery or local test environment (--local). Removed-file conflicts can show only the live file; database-record conflicts can proceed without files. If no action is available, the panel warns and does not invent a resolution. Invalid CLI JSON, missing files and CLI failures are surfaced to the user.

## Tasks, watcher and releases

Dedicated tasks run with an explicit directory and succeed only at exit code 0. Exclusive operations are guarded against concurrent execution. Remote/destructive actions show a review form; project actions require a valid target and the applicable trust check.

HubTaskWatcher observes tasks/*.json and completions/*.json and displays dispatch/receipt state; it does not execute queued work or scrape documentation. Core release preparation stores a draft, verifies GitHub permission and preflight conditions, and only then enables the separate execution phase.

## MDD Hub & Skills Control

1. Install MDD Client. Set `conn2flow.mddExecutable` to its absolute executable path if VS Code cannot find `mdd` on PATH.
2. Build `mcp-hub/` with `npm ci` and `npm run build` from that directory. The view starts the TypeScript `conn2flow-hub` from the matrix checkout and manages it alongside the MDD Client daemon.
3. Expand **Servers** to see status and use **Start**, **Stop** or **Restart**. Expand **Skill Feedback** to open inbox entries, optionally include GitHub Issues and triage eligible entries with a reason.

Feedback operations call the Client CLI. The [CLI and MCP guide](QUICKSTART-CLI-AND-MCP.md) covers connector setup and the [packaging guide](VSCODE-MARKETPLACE-PUBLISHING-GUIDE.md) covers the local VSIX.

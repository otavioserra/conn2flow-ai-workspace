---
verified_at: 2afd000
sources:
  - ../../vscode-extension/package.json
  - ../../vscode-extension/src/providers/conn2flowTreeProvider.ts
  - ../../vscode-extension/src/providers/sddScopeManager.ts
  - ../../vscode-extension/src/providers/projectConflictsManager.ts
  - ../../vscode-extension/src/providers/commandRunner.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
  - ../../vscode-extension/src/providers/releaseManager.ts
  - ../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md
---


# Conn2Flow Dev Tools panel: current behavior and v1.1.2 target

[Português](../pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md) · [Documentation index](README.md)

## Version and delivery state

The [extension manifest](../../vscode-extension/package.json) currently declares **v1.1.1**. **v1.1.2** is the release target in REQ-062; this guide does not claim a published release. Panel v2 is the interface design name, not the extension package version. The planned Python dual integration is ARCH-014 and remains ICEBOX.

## How to use

1. Install a built VSIX and open the repository in VS Code. Select the intended repository scope and target project in Main Controls.
2. Choose language, topology and autonomy. Open CURRENT, its approved request, SPEC and validation before starting work.
3. Use Copy Executor Prompt or Start Claude Code (/goal) for the approved slice; follow task output, checks and receipts. Prepare Architect Review opens the handoff and Source Control, without committing or pushing.

Command execution depends on Workspace Trust where required. Missing repository context or an unconfigured project target must be resolved before contextual operations.

## Panel tree

| Section | Contents |
| --- | --- |
| Main Controls | Repository scope, target, language, topology, autonomy, HubTaskWatcher |
| SDD & Planning | Agent bridge, CURRENT, SPEC, checks, requests, batches, backlog, decisions, handoffs and gardening |
| Core & Releases | Core pipelines and guarded release preparation/execution |
| Projects & Test Environment | Project targeting, updates, scaffolding and delivery conflicts |
| Environment & Diagnostics | Docker, logs, CSS and skill synchronization |
| Documentation & Settings | Guides and configuration |

The tree uses progressive disclosure and persists expansion state. Native tooltips explain purpose and impact. Main Controls starts expanded; other sections start collapsed.

## Repository scope, language and autonomy

The matrix resolves memory/. Current satellite discovery still searches sdd/; the migration workstream must update and verify each satellite. A missing document does not silently fall back to another repository's governance. Documents support preview, source or side-by-side display. Backlog navigation reads BACKLOG-INDEX and reports index/file drift; promotion prepares context rather than authorizing execution.

conn2flow.language supports auto, pt-BR and en. Runtime labels update immediately; palette labels may need Reload Window. The panel supports dual/triad topology and supervised/monitored/headless workflow selection. These differ from the planned Python Hub evolution modes.

## Delivery conflicts

Select a configured project and open its delivery conflicts. The panel lists the CLI's conflict records, opens the live/received diff when both files exist, and offers only actions returned by the CLI: sobrescrever, manter or mesclar.

When mesclar is available, open and edit the merged file, save it, confirm continuation and choose whether to apply to the live delivery or local test environment (--local). Removed-file conflicts can show only the live file; database-record conflicts can proceed without files. If no action is available, the panel warns and does not invent a resolution. Invalid CLI JSON, missing files and CLI failures are surfaced to the user.

## Tasks, watcher and releases

Dedicated tasks run with an explicit directory and succeed only at exit code 0. Exclusive operations are guarded against concurrent execution. Remote/destructive actions show a review form; project actions require a valid target and the applicable trust check.

HubTaskWatcher observes tasks/*.json and completions/*.json and displays dispatch/receipt state; it does not execute queued work or scrape documentation. Core release preparation stores a draft, verifies GitHub permission and preflight conditions, and only then enables the separate execution phase. This documentation batch does not execute a release.

## Planned dual integration

| Planned mode | Intended controls | State |
| --- | --- | --- |
| Client / general user | mdd init, status, sync, compact and report for any project | ARCH-014 proposal; no current mdd.mode setting asserted |
| Developer / Core | Hub watcher status, scraper queue, evolution modes, approval and global synchronization | Depends on Python Hub and access checks |

The proposal uses CLI subprocesses or local REST/IPC and should degrade to Client functions when Hub governance is unavailable. These are planned controls, distinct from current MCP task observation. Read the [Python guide](MDD-PYTHON-ECOSYSTEM-GUIDE.md) and [packaging guide](VSCODE-MARKETPLACE-PUBLISHING-GUIDE.md) before assuming availability.

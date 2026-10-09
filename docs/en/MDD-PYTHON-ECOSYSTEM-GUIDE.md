---
verified_at: 2afd000
sources:
  - ../../memory/human-requests/req-069.md
  - ../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md
  - ../../mcp-hub/src/server.ts
  - ../../vscode-extension/src/providers/hubTaskWatcher.ts
---


# MDD Python ecosystem guide

[Português](../pt-br/GUIA-ECOSSISTEMA-PYTHON-MDD.md) · [Documentation index](README.md)

## Availability and prerequisites

The Python ecosystem is **approved for implementation**, described in [REQ-069](../../memory/human-requests/req-069.md). At verification, tools/mdd-client/ and tools/mdd-hub/ do not exist in this checkout. Commands and API routes below are the requested interface, not tested installation instructions. No published package name, pip install command, server entry point, authentication scheme or extra flag is asserted here.

The target is **Python 3.11+**, two independent pyproject.toml packages and pytest suites. The Client targets Typer/Rich; the Hub targets FastAPI/Uvicorn/AsyncIO. Verify delivered --help output, package metadata and tests before running examples. Today, use the [existing skills synchronizer and MCP guide](QUICKSTART-CLI-AND-MCP.md).

## MDD Client: six commands

| Requested interface | Purpose and expected result |
| --- | --- |
| mdd init [path] [--type software|mobile|general] | Provision memory/, the three foundation files, hierarchical indexes, reports/, raw/ and dual archives; optional agent kits are requested, with no flag specified yet |
| mdd sync | Deterministically synchronize the 44 canonical skills and local rules from the matrix while preserving exclusive local files |
| mdd compact | Audit active memory, apply the 10-item window and 50 KB ceiling, preserve originals, create summaries and update indexes |
| mdd status | Show a Rich terminal view of memory health, files near limits and compliance |
| mdd report | Collect friction metrics and execution logs into memory/reports/; optionally submit through the Hub API |
| mdd daemon | Watch memory asynchronously and raise pruning alerts; mdd watch is also requested but not verified as an implemented alias |

### Planned first session

After installation of the delivered Client, confirm its help before using this sequence:

```sh
mdd init ./my-project --type software
# Continue from the initialized project directory.
mdd status
mdd sync
```

Confirm matrix selection and local preservation before synchronization. Use status to identify eligible retention work before compacting; do not prune healthy memory at session end. Consult the [memory specification](MDD-FRAMEWORK-SPECIFICATION.md) for original preservation and link repair. The interface for selecting a matrix, the Hub or daemon scheduling must come from delivered code; it is not invented by this guide.

## MDD Hub and API

The planned Hub receives Client reports and consolidates lessons in memory/reports/. It is distinct from the implemented TypeScript MCP Hub in mcp-hub/.

| Requested route | Responsibility |
| --- | --- |
| POST /api/v1/reports | Ingest Client reports |
| GET /api/v1/status | Expose ecosystem telemetry and status |

Request/response schemas, persistence mechanics, access control and Uvicorn launch arguments await implementation verification. Do not substitute MCP tool names for HTTP routes.

## Documentation Watcher and AI autoscrapers

The asynchronous watcher is intended to monitor official reference material for Gemini/Antigravity, Claude Code/MCP SDK, OpenAI Codex, Kimi and Cursor. It should extract structured changes such as CLI flags, tools, shell traps and parameters, with provenance. This describes the requested monitoring scope, not claims about current vendor features.

Detected material is candidate knowledge. Code and approved policy remain authoritative; a scraper result does not make a new rule executable. Source allowlists, polling cadence, deduplication and extraction behavior must be documented from implementation when delivered.

## Three Hub evolution modes

| Mode | Requested behavior | Output |
| --- | --- | --- |
| headless / totalmente_autonomo | Prepare documentation improvements on a dedicated Git branch, with atomic commit and PR preparation | Traceable proposal branch; no implied merge or production deployment |
| monitored / autonomo_com_report | Update documentation/skills and immediately report the work | Executive report in memory/reports/ |
| reviewer / supervisionado | Queue detected changes for Chief Engineering approval | Proposed inbox under memory/raw/inbox/ |

These are **Hub evolution modes**. The reviewer value is not the Reviewer agent role, and it is not a accepted dispatch_task mode in the current MCP Hub. Workflow autonomy uses supervised/monitored/headless; MCP uses supervised/live_autonomous/headless_autonomous. See the [triad guide](DOUBLE-AGENT-ARCHITECTURE.md).

## Daemon, validation and VS Code integration

The daemon should provide lightweight continuous observation; a warning does not itself authorize edits or external transmission. Reports must avoid credentials and unnecessary raw content. Stop conditions and scheduling remain to be checked in code.

Delivery validation requested in REQ-069 covers initialization in temporary directories, retention, local file preservation, API ingestion/status, and watcher parsing with mocks. This documentation batch does not certify that those Python tests have run.

The planned dual VS Code integration separates client memory controls from developer Hub governance. ARCH-014 remains incubated; the existing HubTaskWatcher only observes MCP task and receipt files. See the [panel guide](VSCODE-DEV-TOOLS-PANEL-GUIDE.md).

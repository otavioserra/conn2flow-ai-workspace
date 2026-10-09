---
verified_at: 2afd000
sources:
  - ../../scripts/skills/sync-skills.cjs
  - ../../scripts/install-spec-driven-codex-kit.ps1
  - ../../scripts/setup-mcp-connectors.ps1
  - ../../mcp-hub/src/server.ts
  - ../../mcp-hub/src/tools/dispatchTask.ts
  - ../../mcp-hub/src/tools/c2fCommand.ts
---


# Quick guide: Core CLI, MDD and MCP

[Português](../pt-br/GUIA-RAPIDO-CLI-E-MCP.md) · [Documentation index](README.md)

## Choose the repository and tool

| Tool | Repository | Purpose | Availability |
| --- | --- | --- | --- |
| c2f | conn2flow Core | Product resources, environment and project pipelines | Implemented in the separate Core repository |
| Skills synchronizer | conn2flow-ai-workspace | Audit/propagate canonical skills | Implemented |
| conn2flow-hub MCP | conn2flow-ai-workspace/mcp-hub | Run Core commands, queue tasks and record receipts | Implemented in TypeScript |
| mdd / MDD Hub | Planned tools/mdd-client and tools/mdd-hub | Local memory and documentation evolution | Approved; packages absent in this checkout |

## Core CLI

From the Core root, start with help. Its commands do not run from this workspace's cli/ folder.

```sh
./c2f help
./c2f resources:sync
./c2f manager:update-all
./c2f project:update-all <id>
```

PowerShell uses `.\c2f.ps1 help`; direct PHP uses `php cli/c2f.php help`. The pipeline examples require a configured test environment and the relevant Core skills. Run resource and update pipelines one at a time in the foreground with visible logs; never replace them with file copies into test mirrors. Confirm the target before project operations.

## Canonical skills and new projects

From the matrix root, use:

```sh
node scripts/skills/sync-skills.cjs
node scripts/skills/sync-skills.cjs --apply c2f-ai-features
```

The default is a read-only audit. Applying a named skill writes configured kits and preserves exclusive local skills and declared translations. The existing Codex installer accepts TargetRepoPath and Language:

```powershell
.\scripts\install-spec-driven-codex-kit.ps1 -TargetRepoPath "C:\projects\my-project" -Language en
```

That installer still provisions sdd/ and preserves an existing SDD folder. It does not implement mdd init or prove a satellite has migrated.

## Planned Python CLI

The six requested commands are mdd init, sync, compact, status, report and daemon. The initial interface is `mdd init [path] [--type software|mobile|general]`. Do not install an assumed package or infer options. See the [Python guide](MDD-PYTHON-ECOSYSTEM-GUIDE.md) for the interface and delivery status.

## MCP Hub setup

The [Hub server](../../mcp-hub/src/server.ts) speaks JSON-RPC over stdin/stdout. Install/build from mcp-hub/ using npm ci and npm run build, then configure the client to launch Node with an absolute path to mcp-hub/dist/index.js. The repository also supplies a Docker Compose configuration; Docker is optional for the local Node connector.

```json
{
  "mcpServers": {
    "conn2flow-hub": {
      "command": "node",
      "args": ["C:/projects/conn2flow-ai-workspace/mcp-hub/dist/index.js"]
    }
  }
}
```

This is the connector shape used by the repository injector; confirm the target client's configuration format before applying it. The current setup-mcp-connectors.ps1 also writes a legacy .agents/mcp_config.json entry. The matrix now requires .gemini/ configuration; do not treat that legacy entry as canonical. This documentation change leaves the helper unchanged and records the mismatch.

## Tools, modes and evidence

| Tool | Required input | Result |
| --- | --- | --- |
| c2f_run_command | command; optional args and absolute repoPath | Core CLI exitCode, stdout, stderr, duration and success |
| dispatch_task | repo, req_id, prompt; optional mode | JSON task record in tasks/ |
| report_completion | batch_id, status (success/failed), logs | Completion receipt; optional task_id/req_id/role correlate the work |
| log_session_event | batch_id, agent_id, role, summary | Shared session timeline event |

dispatch_task accepts **supervised**, **live_autonomous** and **headless_autonomous**; the default is supervised. It writes the queue record, rather than starting a Python daemon or autonomously executing a batch. The VS Code watcher observes task and receipt changes. Include the target project, absolute root, request, batch, scope and stop conditions in prompts.

The planned Python Hub evolution modes headless/monitored/reviewer are a separate interface. A success receipt describes executed checks; it does not replace independent review or human homologation. See the [workflow playbook](MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md).

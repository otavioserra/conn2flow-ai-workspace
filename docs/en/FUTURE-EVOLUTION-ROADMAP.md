---
verified_at: 2afd000
sources:
  - ../../memory/human-requests/CURRENT.md
  - ../../memory/backlog/BACKLOG-INDEX.md
  - ../../vscode-extension/package.json
  - ../../mcp-hub/src/server.ts
---


# MDD evolution roadmap

[Português](../pt-br/ROTEIRO-EVOLUCAO-FUTURA.md) · [Documentation index](README.md)

## Delivered foundation

The matrix has memory/, four-layer policy, hierarchical indexes, dual archive nodes and **44 canonical skills**, including c2f-ai-features. The TypeScript MCP Hub implements command execution, task records, receipts and session events. The VS Code panel supports topology/autonomy controls, repository scope, task observation and delivery conflicts.

## Approved workstreams

| Workstream | Target | Verified state |
| --- | --- | --- |
| REQ-068 / BATCH-070 | MDD migration in seven satellites | Separate approved workstream; completion is not asserted by this guide |
| REQ-069 / BATCH-071 | Python MDD Client and Hub | Approved; tools/ packages absent at verification |
| REQ-070 / BATCH-072 | Public bilingual docs and concise READMEs | Documentation scope of this revision |
| REQ-062 / BATCH-064 | Extension release v1.1.2 | Manifest currently 1.1.1; publication not asserted |

## Incubated architecture

ARCH-014 proposes dual Client/Developer VS Code access after the Python components. ARCH-013 explores vector/NoSQL memory for larger codebases. These backlog proposals do not authorize implementation. Dates and vendor capabilities are not promised here; follow [CURRENT](../../memory/human-requests/CURRENT.md) and the [backlog index](../../memory/backlog/BACKLOG-INDEX.md).

## Learning path

Start with the [memory specification](MDD-FRAMEWORK-SPECIFICATION.md), learn the [triad](DOUBLE-AGENT-ARCHITECTURE.md) and [44 procedures](SKILLS-CATALOG.md), then use the [CLI/MCP guide](QUICKSTART-CLI-AND-MCP.md) and [panel guide](VSCODE-DEV-TOOLS-PANEL-GUIDE.md). The [Python guide](MDD-PYTHON-ECOSYSTEM-GUIDE.md) separates approved interfaces from available tools. Teach specifications, retrieval, evidence and review before unattended automation.

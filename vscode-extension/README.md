# Conn2Flow Dev Tools

Project decisions, agent instructions, and validation results can get scattered across chats and tools. Conn2Flow Dev Tools brings them into VS Code using **Memory-Driven Development (MDD)**. Keep the work your team and its AI agents need in versioned files alongside the code, from the first request to the handoff.

Use MDD with Node.js, Python, PHP, Go, or any other stack. The `domains/` catalog lets you add framework-specific detection and skills. The generic domain gives any project a starting point, and the Conn2Flow domain adds native tools for the framework.

## What you can do

- **Browse project memory with MDD Explorer.** Open the active request, implementation batches, decisions, handoffs, and backlog for the selected workspace. The Explorer also supports older projects that use `sdd/`.
- **Operate MDD Hub & Skills Control.** Check the status of the MDD Client and the Conn2Flow MCP Hub. Start, stop, or restart servers managed by the extension. Browse the `FB-XXX` feedback queue, optionally include GitHub Issues, and triage skill feedback from the view.
- **Give each agent a defined role.** The **Architect** turns requests into specifications. The **Executor** implements and validates changes. The **Reviewer** audits the result. The **Curator** evaluates skill feedback and captures reusable lessons. The **Optimizer** trims and organizes the skill catalog.
- **Initialize and check your workflow.** `mdd bootstrap` detects a domain and sets up project memory and agent kits while preserving existing files. Run `mdd eval` against the skill catalog to verify its guidance.
- **Work outside VS Code too.** Project memory and skills are plain files. The MDD CLI and MCP tools let teammates and agents work with the same project context from other editors and clients.

## Quickstart

1. Install **Conn2Flow Dev Tools** in VS Code and open your project folder.
2. Clone the [AI Workspace repository](https://github.com/otavioserra/conn2flow-ai-workspace). From that checkout, use Python 3.11+ in a virtual environment and run `python -m pip install -e tools/mdd-client`. If VS Code cannot find `mdd` on its PATH, point `conn2flow.mddExecutable` to the installed executable.
3. In a trusted workspace, run **Initialize MDD in this Project** from the Command Palette. Pick automatic detection or an explicit domain, then open **MDD Explorer** to start working with your project memory.

## Keep your skills up to date

In a trusted workspace, Conn2Flow Dev Tools checks the GitHub matrix for skill updates every 24 hours. The default `conn2flow.autoSyncSkills` mode, `notify`, shows a status bar notice and an **Update Skills from GitHub** action in the Hub when updates are available. Choose `auto` to apply safe updates and see the results in the **Conn2Flow MDD Hub** output, or choose `off` to disable background checks.

Use **Sync Remote Skills (GitHub)** from the Hub or Command Palette to update on demand. Configure the interval with `conn2flow.autoSyncIntervalHours` and the HTTPS matrix source with `conn2flow.remoteMatrixUrl`. Install an MDD Client that supports `mdd sync --remote`. Your local skills and recognized customizations are preserved, and conflicts are reported for review.

## Conn2Flow projects

The Conn2Flow domain adds access to Core and project pipelines, resource synchronization, Tailwind CSS rebuilds and audits, Docker diagnostics, and guided releases. The project view shows the target for deployment, and remote deploys require confirmation. The MDD views are available in other domains.

The extension supports English and Brazilian Portuguese. The [VS Code guide](https://github.com/otavioserra/conn2flow-ai-workspace/blob/main/docs/en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md) covers the panel and MCP Hub setup. See the [domain catalog](https://github.com/otavioserra/conn2flow-ai-workspace/tree/main/domains) to add a domain or the [CLI and MCP quickstart](https://github.com/otavioserra/conn2flow-ai-workspace/blob/main/docs/en/QUICKSTART-CLI-AND-MCP.md) to work from another client.

[Changelog](https://github.com/otavioserra/conn2flow-ai-workspace/blob/main/vscode-extension/CHANGELOG.md) · [Report an issue](https://github.com/otavioserra/conn2flow-ai-workspace/issues)

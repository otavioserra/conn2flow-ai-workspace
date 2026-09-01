# Conn2Flow Dev Tools Panel v2 — Operational Guide

This guide documents the current `conn2flow-tools` extension. Code in `vscode-extension/src/` is authoritative if it differs from this document.

## Panel tree

The tree uses progressive disclosure and persists expansion state. **🎛️ Main Controls** is expanded by default; the other sections begin collapsed. Every native node shows a rich hover tooltip describing its purpose, when to use it, and its workspace or environment impact.

1. **🎛️ Main Controls**: SDD scope, target project, language, topology, autonomy, and HubTaskWatcher.
2. **📐 SDD & Planning**: agent bridge, CURRENT, SPEC, validation, requests, batches, backlog, decisions, handoffs, and Memory Gardening.
3. **⚡ Core & Releases**: Core pipelines and guarded preparation/execution of Gestor and Gestor Installer releases.
4. **📁 Projects & Test Environment**: targeting, updates, synchronization, scaffolding, and deployment through configured workflows.
5. **🩺 Environment & Diagnostics**: Docker, logs, CSS, and skills synchronization.
6. **📚 Documentation & Settings**: this v2 manual, CLI/MCP guide, SDD playbook, agent architecture, and skills catalog. The Marketplace guide and duplicate topology selector are intentionally not shown here.

## Scope, modes, and language

The selected SDD scope is repository-specific and persisted. Core, AI Workspace, and satellite projects never silently fall back to another repository's `sdd/`. Markdown can be shown as rendered preview, source, or side by side. The backlog browser reads `BACKLOG-INDEX.md`, reports index/file drift, and preserves the Intake Gate.

`conn2flow.language` supports `auto`, `pt-BR`, and `en`. Runtime labels update immediately; Command Palette entries may require Reload Window. Main Controls also select the dual-agent or triad topology and the supervised, autonomous monitored, or autonomous headless workflow mode.

## Safe execution

Commands run as dedicated VS Code tasks with an explicit working directory and only succeed after exit code `0`. Incompatible pipelines are serialized. Remote and destructive actions use a review form, custom project actions require Workspace Trust, and no contextual project command runs without an explicit target.

## Core releases in two phases

1. Run **🔐 Verify Release Permission** to check `gh auth status` and `viewerPermission`.
2. With `WRITE`, `MAINTAIN`, or `ADMIN`, open **🚀 Prepare Release** for Gestor or Gestor Installer. Phase 1 collects diagnostics and saves only an editable workspace-state draft.
3. Preflight requires the correct Core, Workspace Trust, a clean non-detached Git tree, a GitHub origin, canonical workflow and version source, an unused tag, and current release documentation.
4. When every gate passes, **▶️ Execute Release** unlocks phase 2 and invokes `c2f manager:release` or `c2f installer:release`; this phase can produce remote Git and GitHub effects.
5. **🐙 Open GitHub Actions** only opens the associated workflow and never starts a release.

## Integrated AI and SDD actions

In **📐 SDD & Planning**, **▶️ Start Claude Code (/goal)**, **📋 Copy Executor Prompt**, **🔗 Open Current Handoff**, and **🔍 Prepare Architect Review** derive their context from the selected SDD scope and active request. Preparing review opens the handoff and Source Control but never commits or pushes.

HubTaskWatcher is controlled from **🎛️ Main Controls**. When enabled, it observes MCP Hub task dispatches and executor receipts and exposes their state in the panel; it does not execute work itself. Executor prompts likewise prohibit commit, push, deploy, and release without explicit human authorization.

## Related guides

The CLI and MCP Quick Guide covers official commands and Hub setup. The Multi-Agent Orchestration Playbook describes architect, executor, reviewer, and MCP handoffs. The agent architecture guide defines dual-agent and triad responsibilities, while the Skills Catalog identifies the operational skills required before each kind of task.

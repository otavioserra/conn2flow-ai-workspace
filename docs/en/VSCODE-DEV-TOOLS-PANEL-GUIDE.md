# Conn2Flow Dev Tools Panel — Operational Guide

The panel has six progressive sections: Overview, SDD & Planning, Core & Releases, Projects & Test Environment, Environment & Diagnostics, and Agents, Documentation & Settings. Only Overview is expanded by default, and expansion state is persisted.

The selected SDD scope is repository-specific and persisted. Core, AI Workspace and satellite projects never fall back silently to another repository's `sdd/`. The backlog browser reads `BACKLOG-INDEX.md`, filters by status, reports index/file drift and preserves the Intake Gate.

`conn2flow.language` supports `auto`, `pt-BR` and `en`. Runtime labels update immediately; Command Palette entries may require Reload Window. Kit distribution receives the selected `-Language pt-br|en` value.

Commands run as dedicated VS Code tasks with an explicit working directory and are successful only after exit code `0`. Remote and destructive actions use a review form. Custom project actions require Workspace Trust, and no implicit target project is selected.

Release creation is hidden until GitHub CLI confirms `WRITE`, `MAINTAIN` or `ADMIN`. Gestor and Gestor Installer have separate forms and preflights for a clean tree, attached branch, GitHub origin, canonical workflow, version file and unused tag. They call the official `c2f manager:release` and `c2f installer:release` commands.

The agent bridge opens the active handoff and Source Control for human review. It never commits or pushes automatically.

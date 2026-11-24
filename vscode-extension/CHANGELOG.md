# Conn2Flow Tools changelog

## 1.2.1 — 2026-11-24

- Fixed garbled accents in feedback titles and tooltips: every `mdd` call now runs Python in UTF-8 mode (`PYTHONUTF8=1`, `PYTHONIOENCODING=utf-8`).
- **Triage Skill Feedback** is now also in the right-click menu of feedback items, next to the inline button.
- **Refresh** and **Toggle GitHub Issues** show progress on the view and report when they finish, including whether GitHub Issues are on or off.
- The MDD Hub shows a `conn2flow-hub` started by another client (such as the VS Code MCP client) as `RUNNING (external)` with its PID. The panel never stops a process it did not start.
- New **Initialize MDD in this Project** command: pick `auto` or any domain found in the matrix `domains/` folder, then run `mdd bootstrap`. Nothing that already exists is overwritten.
- New `conn2flow.projectDomain` setting (default `auto`, any domain id). Projects outside Conn2Flow hide the Core, Projects and Diagnostics sections and keep the MDD panels.

## 1.2.0 — 2026-11-24

- Added the **MDD Hub & Skills Control** view with status, Start, Stop and Restart for the MDD Client daemon and the TypeScript `conn2flow-hub`.
- Lists and triages `FB-XXX` skill feedback through the MDD Client CLI, with optional GitHub Issues.
- Uses MDD labels and prefers `memory/`, with a fallback to legacy `sdd/` projects.

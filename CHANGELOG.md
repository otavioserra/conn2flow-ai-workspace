# Conn2Flow AI Workspace changelog

## 1.2.4 — 2026-11-24

- Added mdd sync --remote and the mdd update alias, with a shallow shared cache and seed hashes for preserving local skill changes.
- Added periodic remote skill sync and a manual GitHub sync command to the VS Code MDD Hub.
- Added an optional weekly GitHub workflow through mdd bootstrap --with-ci-sync.

## 1.2.3 — 2026-11-24

- Updated the VS Code Marketplace overview, localized subtitles, and search keywords for framework-agnostic MDD and native Conn2Flow tools.
- Documented how to preserve line endings when editing files with Git Bash or Windows Python and added a bilingual skill evaluation.
- Added an isolated satellite skill rollout command with dry runs, scoped commits, and remote verification.

## 1.2.0 — 2026-11-24

- Added the **MDD Hub & Skills Control** view with status, Start, Stop and Restart for the MDD Client daemon and the TypeScript `conn2flow-hub`.
- Lists and triages `FB-XXX` skill feedback through the MDD Client CLI, with optional GitHub Issues.
- Uses MDD labels and prefers `memory/`, with a fallback to legacy `sdd/` projects.
- Completed [ARCH-018](memory/backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) with five canonical personas, a 48-skill index, `subskills/`, repository learnings, federated feedback with recurrence-based quarantine, Skill Budget and `mdd eval`.
- Updated the [English and Brazilian Portuguese guides](docs/README.md) for the available Client, MCP servers and local VS Code release.

See the [extension changelog](vscode-extension/CHANGELOG.md) for the VS Code package.

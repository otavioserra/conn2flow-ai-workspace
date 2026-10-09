---
verified_at: d052f32
sources:
  - ../../tools/mdd-client/pyproject.toml
  - ../../tools/mdd-client/src/mdd_client/cli.py
  - ../../tools/mdd-client/src/mdd_client/memory.py
  - ../../tools/mdd-hub/src/mdd_hub/api.py
  - ../../tools/mdd-hub/src/mdd_hub/watcher.py
  - ../../tools/mdd-hub/src/mdd_hub/evolution.py
---

# MDD Python ecosystem guide

[Português](../pt-br/GUIA-ECOSSISTEMA-PYTHON-MDD.md) · [Index](README.md)

## Availability and installation

MDD Client and MDD Hub are implemented as two independent Python 3.11+ packages. The Client maintains project memory; the Hub receives reports and monitors official AI documentation. Installation uses source code; neither package is published on PyPI.

From the repository root, create and activate a virtual environment and install the packages:

```sh
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install -e "tools/mdd-client[test]" -e "tools/mdd-hub[test]"
mdd --help
mdd-hub --help
```

Node.js is required for skill synchronization through the official pipeline. Git with a commit identity is required for headless mode. See the [complete manual](../../tools/README.md) for options, configuration and limitations.

## How to use the Client

```sh
mdd init ./my-project --type software
mdd sync --path ./my-project --matrix /path/to/conn2flow-ai-workspace
mdd status --path ./my-project
mdd compact --path ./my-project
mdd compact --path ./my-project --apply
mdd report --path ./my-project --log build.log
mdd watch --path ./my-project --once
```

| Command | Behavior |
| --- | --- |
| `init` | Creates the 00/01/02 triad, all memory areas, indexes and dual archives. Accepts software/mobile/general; `--kits` installs skills and rules into five kits. Preserves existing documents and configuration. |
| `sync` | Synchronizes 44 canonical skills and rules; preserves exclusive local skills/rules and configuration. Uses `--matrix`, `MDD_MATRIX` or the source checkout. `--audit` checks without propagating. |
| `compact` | Audits by default; `--apply` enforces the ten-item window, 50 KiB ceiling and 30 KiB router. Preserves original bytes, produces structural extracts and complete parts, repairs links and updates indexes. Chief memory and CURRENT-selected documents are protected. |
| `status` | Displays a Rich dashboard or `--json`; returns exit 1 for noncompliant memory. |
| `report` | Exports health and error/warning/timeout counters as JSON; includes no raw log text. `--hub URL` submits the saved report. |
| `daemon` / `watch` | Asynchronous foreground service; emits JSON when health changes. Supports `--interval` and `--once`; Ctrl+C stops it. A service manager can host it in the background. |

Healthy documents remain intact. Archived originals retain their bytes and recorded relative base; summaries are structural navigation extracts, not approved semantic summaries. Inline references, Markdown definitions and internal file URIs are repaired. Nested syntax and custom HTML anchors require review. Exclusive locks prevent concurrent mutations; an abandoned lock requires inspection before explicit removal.

## Hub and API

```sh
mdd-hub serve --root ./hub-project --port 8765
mdd report --path ./my-project --hub http://127.0.0.1:8765
mdd-hub serve --root ./hub-project --watch-docs --mode reviewer
```

The server binds to loopback by default. `MDD_HUB_TOKEN` enables Bearer authentication in both processes; external CLI binding requires a token. Use an HTTPS proxy for remote access. The [API schema](../../tools/mdd-hub/src/mdd_hub/models.py) specifies version 1, UUID, project, timezone-aware timestamp, health, nonnegative counters and bounded lessons. `/docs` provides the interactive reference.

| Route | Result |
| --- | --- |
| `POST /api/v1/reports` | 201 for new ingestion, 200 for an identical retry, 409 for conflicting ID reuse, 422 for invalid schema, 413 above 256 KiB and 401 without valid credentials. |
| `GET /api/v1/status` | Report/project counts, noncompliant reports and watcher state/errors. |

Reports persist under `memory/reports/clients/`; `consolidated.json` aggregates friction and recurring lessons. Deployment uses one worker and locked file storage, without a distributed database. The existing TypeScript MCP Hub is a separate service.

## Watcher and evolution modes

```sh
mdd-hub watch --root ./hub-project --mode reviewer --once
mdd-hub watch --root ./hub-project --mode monitored --interval 3600
mdd-hub watch --root ./hub-project --mode headless --once
```

The [seven configurable sources](../../tools/mdd-hub/src/mdd_hub/sources.py) cover Gemini, Antigravity, Claude Code, MCP SDK, Codex, Kimi and Cursor. `--sources file.yaml` overrides the HTTPS list. The first cycle establishes baselines; subsequent cycles extract added/removed flags, commands, parameters and shell notes. Extraction is bounded and heuristic, with a truncation indicator. Normalized snapshots live under `memory/raw/archive/watcher-state/`; fetch/evolution failures do not advance checkpoints. Up to three fetches run concurrently, with a 20-second timeout and 2 MiB response limit.

| Mode and alias | Output |
| --- | --- |
| `reviewer` / `supervisionado` | Queues observations under `memory/raw/inbox/` for human review. |
| `monitored` / `autonomo_com_report` | Reference documentation under `memory/proxies/ai-updates/` and an immediate executive report. |
| `headless` / `totalmente_autonomo` | Dedicated branch, isolated worktree, explicit-path commit and PR preparation manifest. `--publish` also pushes the branch to origin. |

The manifest includes branch, commit, title and body; it does not create a hosted GitHub PR. No mode executes scraped instructions or automatically promotes observations into normative policies/skills. Commit failures retain the worktree for recovery; incomplete branches are rejected on retries. The user's branch and staging area are preserved.

## Validation and VS Code integration

```sh
python -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95
python -m ruff check tools
python tools/verify_mdd.py --output temp/mdd-smoke.json --live-docs
```

63 tests passed with 97.23% coverage on Windows/Python 3.12.4: initialization, retention, local preservation, API, real HTTP submission, parsing, retries and three evolution modes with real Git. All 11 CLI checks and live collection of seven sources passed. See [evidence](../../completions/BATCH-071-smoke.json) and [implementation record](../../memory/implementation/batch-071.md). One Starlette/AnyIO deprecation warning remains, without failures. CI is configured for Windows/Linux and Python 3.11/3.12; remote results are tracked by the [PR checks](https://github.com/otavioserra/conn2flow-ai-workspace/pull/1).

The extension's dual integration [ARCH-014](../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md) remains future work. No extension changes/publication, merge, deployment or PyPI publication occurred.

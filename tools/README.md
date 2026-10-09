# MDD tools

MDD Client creates and maintains project memory. MDD Hub receives aggregate reports and monitors official AI documentation. Both packages require Python 3.11+. Source installations are available; packages have not been published to PyPI.

## Install

From this repository, create and activate a virtual environment, then install either package independently:

```sh
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install -e "tools/mdd-client[test]"
python -m pip install -e "tools/mdd-hub[test]"
mdd --help
mdd-hub --help
```

Node.js is required for Client skill synchronization; Git with a configured commit identity is required for headless Hub evolution. The Hub does not depend on the Client package. The cross-package integration suite requires both packages.

## Client

```sh
mdd init ./my-project --type software
mdd init ./my-project --kits --matrix /path/to/conn2flow-ai-workspace
mdd sync --path ./my-project --matrix /path/to/conn2flow-ai-workspace
mdd sync --path ./my-project --matrix /path/to/conn2flow-ai-workspace --audit
mdd status --path ./my-project
mdd status --path ./my-project --json
mdd compact --path ./my-project
mdd compact --path ./my-project --apply
mdd report --path ./my-project --log build.log
mdd daemon --path ./my-project --interval 30
mdd watch --path ./my-project --once
mdd index --path ./my-project
mdd index human-requests --path ./my-project
mdd meta set req-001 status IN-PROGRESS --path ./my-project
mdd meta get req-001 status --json --path ./my-project
```

`init` accepts `software`, `mobile` and `general`, preserves existing documents, and provisions the foundation triad plus all memory areas and archive indexes. `--kits` installs canonical skills and rules into `.gemini`, `.claude`, `.cursor`, `.codex` and `.github`. Existing configuration files and exclusive local skills/rules remain intact. Canonical names are updated from the matrix. Sync delegates to `scripts/skills/sync-skills.cjs --target`; it does not propagate to other repositories or templates. Matrix selection uses `--matrix`, then `MDD_MATRIX`, then the source checkout when installed editably.

`compact` previews by default; `--apply` archives the oldest excess files above ten in requests, implementation, decisions and reports. Infrastructure does not count. Aggregate validation sections and decision/batch tables retain ten current entries. Documents at 50 × 1024 bytes are partitioned; the baseline router uses a 30 KiB threshold. Oversized JSON records are archived whole, retaining valid JSON. Chief memory and IDs selected by CURRENT are protected. Healthy documents are unchanged.

Dual archiving preserves original bytes with SHA-256 and writes structural extracts explicitly labeled as incomplete summaries. Large Markdown documents retain their complete text in indexed parts and an active router; internal inline links, reference definitions and file URIs are relocated and active references repaired. External links are preserved. Original archive bytes are never rewritten: their original relative base is recorded in the summary. Nested link syntax and custom HTML anchors are not automatically repaired. Very large routers fail before active-file mutation and need manual division into smaller nodes.

Mutation commands use an exclusive `memory/.mdd.lock`; they refuse symlinks/junctions and paths outside the target. A lock left after a killed process must be inspected before explicit removal. Archive collisions fail rather than overwriting different originals. Status returns exit 1 for noncompliance; applied compaction also returns exit 1 when protected documents prevent compliance.

`report` writes versioned JSON with a UUID, UTC timestamp, memory health, friction counters and lessons. Only explicitly selected logs are scanned, at most 5 MiB each; counts of errors, warnings and timeouts are exported, without raw log text, absolute project paths or credentials. Relative `--log` paths resolve against `--path`. `--hub URL` submits the saved report and retains it if HTTP delivery fails.

`daemon` and `watch` are aliases. They run a foreground asynchronous service, emit JSON when health changes, stop with Ctrl+C (exit 130), and support `--once`. They neither compact memory nor upload reports automatically. Use an OS service manager to host them in the background.

## Hub API

Metadata/index commands share the PHP Core contract (`c2f memory:index/set/get --repo=PATH`). Indexing reads scalar YAML and falls back to legacy headings/prose without altering documents. Set preserves the body, updates string metadata and immediately rebuilds the local index. Per-file replacements are atomic; failure to write the index rolls back the document. A process crash between replacements requires index regeneration. Unsupported or malformed frontmatter is refused for mutation. The reusable API is `mdd_client.core.indexer`; init now also provisions human-reviews archive indexes. Pending human reviews are not automatically archived by compact.

```sh
mdd-hub serve --root ./hub-project --port 8765
mdd report --path ./my-project --hub http://127.0.0.1:8765
mdd-hub serve --root ./hub-project --watch-docs --mode reviewer --interval 3600
```

The default bind address is loopback. Set `MDD_HUB_TOKEN` on both Client and Hub to enable bearer authentication. Non-loopback CLI binding requires a token. For remote access, provide HTTPS through a reverse proxy. No credentials are embedded in project configuration.

| Route | Behavior |
| --- | --- |
| `POST /api/v1/reports` | Validates schema version 1, UUID, timezone-aware timestamp, health, nonnegative friction and bounded lessons. Returns 201 for new reports, 200 for an identical retry, 409 for conflicting reuse of an ID, 422 for invalid data, 413 above 256 KiB and 401 for invalid credentials. |
| `GET /api/v1/status` | Reports stored report/project counts, unhealthy reports and the last watcher cycle/errors. |
| `/docs` | FastAPI-generated schema and interactive API reference. |

Reports persist atomically under `memory/reports/clients/`. `consolidated.json` aggregates friction and counts recurring lessons; no lesson is automatically promoted into a normative skill. Start one Hub worker for this filesystem-backed deployment. Cross-process report/evolution locks reject competing mutations; this is not a distributed database.

## Documentation watcher

```sh
mdd-hub watch --root ./hub-project --mode reviewer --once
mdd-hub watch --root ./hub-project --mode monitored --interval 3600
mdd-hub watch --root ./hub-project --mode headless --once
mdd-hub watch --root ./hub-project --mode headless --publish --once
```

Default HTTPS sources cover Gemini, Antigravity, Claude Code, MCP Python SDK, Codex, Kimi CLI and Cursor. They are declared in [sources.py](mdd-hub/src/mdd_hub/sources.py). Pass `--sources sources.yaml` to override them:

```yaml
sources:
  - name: codex
    url: https://developers.openai.com/codex/changelog/
```

The first successful cycle establishes a baseline. Later cycles normalize HTML/text, compare SHA-256 digests and extract added/removed flags, slash commands, parameters, changed lines and shell notes. Extraction is bounded and heuristic; `truncated` identifies omitted observations. Original normalized snapshots persist in `memory/raw/archive/watcher-state/`. At most three fetches run concurrently, with 20-second request timeouts, three attempts for transient failures and a 2 MiB response limit. Empty content and HTTP errors are recorded per source; failures never replace a good checkpoint. Checkpoints advance only after the selected evolution mode succeeds.

| Mode (alias) | Result |
| --- | --- |
| `reviewer` (`supervisionado`) | Queues JSON observations in `memory/raw/inbox/`, with an index, for human review. |
| `monitored` (`autonomo_com_report`) | Writes dated/digested reference notes under `memory/proxies/ai-updates/` and immediate executive reports under `memory/reports/`. |
| `headless` (`totalmente_autonomo`) | Creates a dedicated `auto/docs-update-...` branch in an isolated Git worktree, commits explicit reference/report paths and prepares a PR manifest under `memory/raw/pull-requests/`. `--publish` pushes the branch to origin. |

Headless preserves the user's branch and staging area. An incomplete/conflicting existing branch fails; failed worktrees are retained for recovery. PR preparation creates a manifest containing branch, base commit, commit, title and body; it does not create a hosted GitHub PR. There is no automatic merge. Remote publication is opt-in. The watcher never executes scraped text or rewrites approved policies/skills from heuristic observations. The MCP Hub in `mcp-hub/` remains a separate TypeScript service; ARCH-014 VS Code integration is future work.

## Verification

```sh
python -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95
python -m ruff check tools
python tools/verify_mdd.py --output temp/mdd-smoke.json
python tools/verify_mdd.py --output temp/mdd-live-smoke.json --live-docs
```

Unit tests run in temporary projects, mock upstream documentation and exercise real Git repositories. Integration tests start a real authenticated Uvicorn server on a temporary loopback port and submit Client reports. CLI smoke checks invoke installed modules and audit sync idempotence. `--live-docs` additionally contacts the seven official sources and records baseline sizes/digests without storing external content in permanent evidence. CI runs Python 3.11/3.12 on Windows/Linux; local validation and exact versions are recorded in [BATCH-071 smoke evidence](../completions/BATCH-071-smoke.json).

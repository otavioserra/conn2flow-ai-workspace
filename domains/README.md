# MDD domains catalog

`mdd bootstrap` installs MDD (Memory-Driven Development) in any project folder. What it installs depends on the project's **domain**: the stack or framework the project is built on. Each domain is one folder here with a `domain.json` manifest. The CLI and the VS Code extension read this folder at runtime, so adding a domain needs no code change.

Shipped domains:

| Domain | Used for | Skills installed | Local project guide |
| --- | --- | --- | --- |
| [`generic`](generic/domain.json) | Any project (fallback when no other domain matches) | 5 personas + MDD governance skills | yes |
| [`conn2flow`](conn2flow/domain.json) | Conn2Flow Core, sites and plugins | all 48 canonical skills | no |

## Using it

```bash
mdd bootstrap --list-domains --path ./my-project          # what is available, and what "auto" picks
mdd bootstrap --path ./my-project                         # --domain auto (default)
mdd bootstrap --path ./my-project --domain generic --kits claude,copilot
mdd bootstrap --path ./my-project --dry-run --json        # detect and plan, write nothing
```

Bootstrap never overwrites a file. It creates `memory/` (with `memory/learnings/`) only where it is missing, installs a skill only when its folder has no `SKILL.md` yet, and keeps any rule or local guide you already edited. Running it again is safe.

Kits: `gemini` → `.gemini/`, `claude` → `.claude/`, `codex` → `.codex/`, `cursor` → `.cursor/`, `copilot` → `.github/`. All five by default.

In VS Code, run **Conn2Flow MDD: Initialize MDD in this Project**. The picker lists `auto` plus every domain in this folder; the choice is saved in the `conn2flow.projectDomain` setting.

## Remote skill updates

After bootstrap, run `mdd sync --remote --check-only --json` to preview available updates and local conflicts, or run `mdd update --apply` to apply safe changes. Remote sync uses existing kits, the domain chosen during bootstrap or automatic detection, and a shared shallow cache under `~/.mdd/cache/`. Override the domain with `--domain <id>` or choose another HTTPS matrix with `--source-url <url>`. A first run recognizes existing copies that match the source. An unknown baseline is reported as a conflict.

Use `mdd bootstrap --with-ci-sync` to add the optional [GitHub Actions workflow](../templates/ci/mdd-skills-autosync.yml) to the target project. It checks weekly and opens a pull request for review. Keep the seed hashes in `memory/skill-sync-state.json` under version control with the skills.

## Adding a domain (Pull Request)

1. Create `domains/<id>/domain.json`. The folder name must equal `id` (lowercase letters, digits and `-`).
2. Optionally add `domains/<id>/skills/<skill-name>/SKILL.md` for skills that belong only to this domain, and point `extra_skills_dir` to `skills`.
3. Check it: `mdd bootstrap --list-domains --path <a sample project>` must list your domain with no `invalid domain` line, and `auto` must pick it for that project.
4. Open the Pull Request with the sample project layout you tested against.

An invalid manifest is reported and skipped; it never breaks the other domains.

### `domain.json` fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Same as the folder name. |
| `name` | yes | Label shown in the CLI and the VS Code picker. |
| `description` | yes | One sentence: which projects it serves and what it installs. |
| `detectors` | no | How `auto` recognizes the project (see below). A domain without detectors is only chosen explicitly or as the fallback. |
| `skills_mode` | yes | `core-mdd-only` (personas + MDD governance), `all-canonical` (every skill in the matrix), or a list of canonical skill names. |
| `extra_skills_dir` | no | Folder inside the domain with its own skills (for example `skills`). |
| `generate_local_project_skill` | no | `true` writes `<kit>/skills/<project>-project-guide/SKILL.md` with the detected stack, layout and commands. Default `false`. |
| `priority` | no | Breaks ties when two domains match equally (higher wins). Default `50`; `generic` is `0`. |

`detectors` takes three lists, all checked against the project root:

- `files`: relative file paths, such as `artisan` or `next.config.js`.
- `dirs`: relative folder paths, such as `app/Http`.
- `markers`: `{ "file": "composer.json", "contains": "laravel/framework" }`, a case-insensitive text match inside a file.

The domain with the most hits wins. If nothing matches, `generic` is used.

### Example: Laravel

```json
{
  "id": "laravel",
  "name": "Laravel",
  "description": "Laravel applications: MDD core plus Laravel-specific skills.",
  "priority": 60,
  "detectors": {
    "files": ["artisan"],
    "dirs": [],
    "markers": [{ "file": "composer.json", "contains": "laravel/framework" }]
  },
  "skills_mode": "core-mdd-only",
  "extra_skills_dir": "skills",
  "generate_local_project_skill": true
}
```

Rules that only apply to one project belong in that project's local guide skill, not in a domain or in the canonical `c2f-*` skills.

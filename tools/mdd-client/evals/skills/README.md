# Skill evals (`mdd eval`)

One JSON file per scenario pins a critical Conn2Flow trap to the canonical skill text (`.gemini/skills/<skill>/SKILL.md` + `subskills/`) and, with `translations`, to every copy in `templates/<lang>/templates/*/*/skills/<skill>/`.

Fields: `id` (`EVAL-NNN-slug`, unique), `title`, `skill`, `trap`, and at least one of `must_include`, `must_match` (regex), `must_not_include`, `must_not_match` (regex). Optional: `subskills` (required files), `max_lines`, `translations` (`{"en": {assertions}}`).

```sh
mdd eval --matrix . --json                      # all scenarios, offline deterministic provider
mdd eval --matrix . --skill c2f-persona-executor   # one skill
```

Exit 1 on `EVAL-FAIL`. `--provider` is pluggable (`mdd_client.skill_eval.register_provider`); `deterministic` needs no network or API key. When a skill edit legitimately removes an anchored term, update the scenario in the same batch and say why.

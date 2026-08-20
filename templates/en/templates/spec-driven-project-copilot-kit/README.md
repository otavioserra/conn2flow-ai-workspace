# Spec-Driven Project Copilot Kit

This kit is a starting point for repositories that use `sdd/` as the normative source of truth.

## Expected prerequisites in the target repo

- `sdd/README.md`
- numbered SDD files with requirements and contracts
- `sdd/human-requests/` for non-normative human intake
- `sdd/process/`
- `sdd/change-requests/`
- `sdd/reviews/`
- `sdd/implementation/`
- `sdd/validation/`
- `sdd/decisions/`

## What the kit includes

- `.github/copilot-instructions.md`: always-on rules for SDD-anchored work.
- `.github/instructions/*.instructions.md`: rules for SDD, Python source, and tests.
- `.github/agents/*.agent.md`: coordination, batch implementation, and review.
- `.github/prompts/*.prompt.md`: kickoff, continuation, review, and change request entry points.
- `.github/skills/*/SKILL.md`: SDD workflow and local validation.
- `.github/hooks/*.json` and `sdd/scripts/hooks/*`: lightweight session-start reminder.

## Installation

1. From the root of `conn2flow-ai-workspace`, run `scripts/install-spec-driven-copilot-kit.ps1 -TargetRepoPath <repo>` or `scripts/install-spec-driven-copilot-kit.sh <repo>`.
2. If you prefer a manual setup, copy `.github` and `sdd/scripts/hooks` to the target repository root.
3. The installer automatically binds the generic prompts to `sdd-coordinator` and `sdd-reviewer`; if you copy manually, adjust that binding in the prompts.
4. Adjust agent names, validation commands, and project-specific paths.
5. If the repo already has a specialized SDD setup, do not reapply this generic kit with force; update the specialized files directly.
6. Validate the load in Chat Diagnostics.

## Human intake

Use `sdd/human-requests/` for human briefs, loose requests, round drafts, and input Markdown files.

Rules:

- `sdd/human-requests/` is not normative.
- approved requirements should still flow into `sdd/change-requests/`, `sdd/reviews/`, `sdd/implementation/`, `sdd/validation/`, and `sdd/decisions/`.
- numbered SDD files remain the normative source of truth.
- when the user passes only the `sdd/human-requests/` folder, the workflow should choose `CURRENT.md`, then `README.md`, then the most recent `.md` file.
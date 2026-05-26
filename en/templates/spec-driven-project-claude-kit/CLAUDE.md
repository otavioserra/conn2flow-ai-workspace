# Spec-Driven Development Project

- Treat `sdd/README.md` and the numbered SDD files as the normative source of truth.
- Before editing code or SDD artifacts, read `sdd/README.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`, `sdd/implementation/BATCH-INDEX.md`, the current batch, `sdd/validation/VALIDATION-CHECKLIST.md`, and `sdd/decisions/DECISION-LOG.md`.
- Use `sdd/human-requests/` only as non-normative human intake. If the request arrives as a Markdown file path or as the folder itself, read that material first and then classify it into the correct SDD artifact.
- Classify the request early: change request, batch implementation, review, or validation.
- Do not rewrite numbered SDD files for small review comments.
- Edit numbered SDD files only when a requirement, contract, acceptance criterion, or approved decision really changes.
- Keep the work in small batches with an explicit validation target.

## Main skills

- Use `/start-sdd-slice` for a new request or intake coming from `sdd/human-requests/`.
- Use `/continue-sdd-batch` to resume an in-progress batch.
- Use `/review-current-batch` for findings-first review of the current batch.
- Use `/raise-spec-change` for a normative change round.

## Automatic skills

- `sdd-workflow`: choose the correct artifact and keep the batch aligned with the workflow.
- `project-validation`: choose the smallest executable validation for the current slice.
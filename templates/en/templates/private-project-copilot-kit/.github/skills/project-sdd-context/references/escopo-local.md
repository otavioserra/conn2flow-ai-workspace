# Local SDD scope checklist

Consider that a workstream in `project/` uses local SDD when at least these signals exist:

- `00-START-HERE.md`
- `01-WORKFLOW.md`
- a main spec file
- `implementation/BATCH-INDEX.md`
- `validation/VALIDATION-CHECKLIST.md`

## How to act

- read the local artifacts before touching code or docs in that workstream
- treat the batch and validation as the operational unit
- keep the main spec clean
- use `antigo/` only as historical material

## How not to act

- do not try to impose SDD on the entire repository just because one workstream uses that model
- do not mix round comments with requirement changes in the main spec
- do not ignore batch and validation when they already exist
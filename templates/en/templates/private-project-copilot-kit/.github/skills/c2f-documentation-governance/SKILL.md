---
name: c2f-documentation-governance
description: "READ BEFORE writing or updating technical documentation, specifications and manuals. Verifies documentation against real source code to prevent drift and misleading future agents."
user-invocable: false
---

# Governance and Documentation Verification (`c2f-documentation-governance`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create, update or validate any technical document in `docs/`, `sdd/` or architecture guides.
- **SKIP ONLY IF**: Correction of small typing errors (typos) in files that do not change normative contracts.
- **CONSEQUENCE OF IGNORING**: Doc drift (out-of-date document), spread of false premises and breach of the Source Code Authority Principle.

---

See and apply this verification protocol to ensure the code sync and authority for technical documentation:

## 1. Source Code Authority Principle

* **Documentations (`docs/`, `*.md`)**: They express the architectural, historical and manual intention of use.
* **Source code (`gestor/`, `modulos/`, `scripts/`, `db/`)**: This is **Source Supreme Truth**.
* **Golden Rule**: NEVER assume that function signatures, file paths, API parameters or table structures in documentation are 100% updated without first inspecting the corresponding authoritative PHP/JS/SQL code via `view_file` or `grep_search`.

---

## 2. Audit and Verification Protocol

Whenever you use documentation to guide an implementation or create a Skill:
1. **Path Check**: Confirm that the files from the aforementioned drivers, libraries or scripts actually exist on the disk.
2. **Signature Verification**: Open the actual `.php` / `.js` file and check the exact name of the function, order of arguments and return types.
3. **Database Metadata Verification**: See the Phinx migration files (`gestor/db/migrations/`) and `schema-metadata.json` manifests to validate the existence of tables and columns.
4. **Divergence Resolution**: If there is divergence between the documentation and the actual source code, **source code prevails** and the documentation should be corrected.

---

## 3. Documentation Maintenance in SDD Tasks

- When adding new parameters, central functions, hooks or routes, update the corresponding documentation under `ai-workspace/` or `sdd/`.
- Register depreciations or contract breaks in the batch log (`batch-XXX.md`) and update the affected technical guides.

---

## 4. Post-Code Change Mandatory Flow (`docs:audit`)

Modify any code file listed in the `sources:` header of a normative technical document invalidates the `verified_at` field, generating divergent source warnings in the ecosystem.

### 4.1 Sequence of 5 Executor Steps

After completing code changes affecting public procurement or documented libraries:

1. **Audit Affected Fonts**:
   ```bash
   ./c2f docs:audit
   ```
   *List all documents whose coded sources has been modified. *

2. **Synchronize Text Content**:
   Update the body of documentation describing altered behaviors, parameters or returns.

3. **Update Metadata `verified_at`**:
   Update the `verified_at:` field on the frontmatter of the document with the latest commit hash corresponding to the verified code.

4. **Extract New Functions (if applicable)**:
   Whether new functions have been introduced into libraries or controllers:
   ```bash
   ./c2f docs:extract <biblioteca>
   ```

5. **Build Documentation for Publication**:
   Rebuild project document manifests and HTML:
   ```bash
   ./c2f docs:build --project=<id>
   ```

> [!IMPORTANT]
> Never change public function subscriptions or database tables without running `c2f docs:audit`. Documents with obsolete `verified_at` induce other agents to error by hallucination based on old contracts.


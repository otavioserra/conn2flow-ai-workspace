# BATCH-060 — Skill `c2f-documentation` e Propagação

Execução da [REQ-058](../human-requests/req-058.md).

## Entregue

- [x] `.claude/skills/c2f-documentation/SKILL.md` canônica, replicada nas outras 18 posições da Matriz (kits da raiz e templates `en`/`pt-br`).
- [x] Cópia cirúrgica para `.claude/.cursor/.github/.gemini/.codex` de `conn2flow`, `conn2flow-site`, `transformamp` e `lumix`.
- [x] Core: `REQUIRED_SKILLS` com `c2f-documentation` e contagem 37 (`AiSyncCommand.php`, `cli/CLAUDE.md`); os templates `cli/CLAUDE.md` da Matriz também foram atualizados.

## Evidências

- `sha256sum` das 39 cópias: um único hash (`625f1c279cfa…`).
- `php cli/c2f.php ai:sync` (Core): `.claude/.cursor/.gemini/.github/.codex` com 37/37 ✔.
- Commits:
  - Core `40225d1f` (`main`);
  - `conn2flow-site` `3781391` (`feat/req-055`);
  - `transformamp` `798787d` (`main`).
- `lumix`: arquivos copiados e **não commitados** (regra do projeto).

## Notas

- O `.claude/skills/` é *gitignored* no Core e no `lumix`. A cópia local existe, mas só `.cursor/.github/.gemini/.codex` entram no git desses repositórios.
- A distribuição automática de atualizações de skill às instalações é o [ARCH-007](../backlog/ARCH-007-atualizacao-automatica-kits-ia-nas-instalacoes.md) (backlog).

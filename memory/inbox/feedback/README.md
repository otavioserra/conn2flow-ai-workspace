# Inbox de Feedback de Skills (ARCH-018 Fase 2)

Barramento federado de retroalimentação das skills `c2f-*`. Cada registro é um arquivo atômico `FB-XXX-<slug>.md` com frontmatter canônico (`id`, `status`, `verdict`, `date`, `repo`, `request`, `batch`, `persona`, `skill`, `kind`, `severity`, `scope`, `evidence`, `summary_short`, `github_issue`).

## Envio (personas operacionais)

```sh
mdd feedback submit --persona executor --skill c2f-persona-executor --kind gap --severity medium \
  --summary "..." --evidence "arquivo:linha / comando / teste" --proposal "..." \
  --repo conn2flow-site --req REQ-XXX --batch BATCH-YYY [--matrix <raiz-da-matriz>] [--github] --json
```

Via MCP `conn2flow-hub`: `submit_skill_feedback`. Sem acesso ao disco da matriz, use `--github` (Issue com label `skill-feedback`).

## Triagem (`c2f-persona-curator`)

```sh
mdd feedback list --verdict PENDING --json
mdd feedback triage FB-001 --verdict ACCEPT|NEEDS_EVIDENCE|QUARANTINE|REJECT|LOCAL_ONLY --reason "..." [--reviewer curator]
```

Via MCP: `list_skill_feedback`. A triagem registra `status: TRIAGED`, `verdict`, `triage_reason`, `triage_reviewer` e `triage_date`.

## Regras

- Não edite IDs nem crie `FB-XXX` à mão: o CLI aloca o próximo número sob `memory/.mdd.lock`, inclusive considerando `archive/`.
- `index.md` é gerado pelo indexador genérico (`mdd index`), compatível com o restante de `memory/`.
- O banco `memory/.mdd.sqlite` é atualizado somente quando já existe (`mdd db sync`).
- Triagem não é homologação humana: `ACCEPT` apenas autoriza o Curador a propor a mudança em um lote.

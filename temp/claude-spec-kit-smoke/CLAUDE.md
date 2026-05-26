# Projeto Spec-Driven Development

- Trate `specs/README.md` e os specs numerados como fonte normativa.
- Antes de editar codigo ou specs, leia `specs/README.md`, `specs/process/00-START-HERE.md`, `specs/process/01-WORKFLOW.md`, `specs/implementation/BATCH-INDEX.md`, o batch atual, `specs/validation/VALIDATION-CHECKLIST.md` e `specs/decisions/DECISION-LOG.md`.
- Use `specs/human-requests/` apenas como intake humano nao normativo. Se a demanda vier como caminho de arquivo Markdown ou como a propria pasta, leia esse material primeiro e depois classifique a demanda no artefato SDD correto.
- Classifique a demanda cedo: change request, implementacao de batch, review ou validacao.
- Nao reescreva os specs numerados para comentarios pequenos de review.
- Edite specs numerados apenas quando requisito, contrato, criterio de aceite ou decisao aprovada realmente mudar.
- Mantenha o trabalho em batches pequenos com alvo de validacao explicito.

## Skills principais

- Use `/start-sdd-slice` para nova demanda ou entrada em `specs/human-requests/`.
- Use `/continue-sdd-batch` para retomar um batch em andamento.
- Use `/review-current-batch` para review findings-first do batch atual.
- Use `/raise-spec-change` para rodada de mudanca normativa.

## Skills automaticas

- `sdd-workflow`: decidir o artefato certo e manter o batch alinhado ao fluxo.
- `project-validation`: escolher a menor validacao executavel para o slice atual.
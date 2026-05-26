# Workflow de projeto privado no Claude Code

## Fluxo recomendado para novas demandas

1. Comece com `/private-project-kickoff`.
2. Deixe o fluxo decidir cedo se a mudança pertence ao repositório privado, a `conn2flow` ou aos dois.
3. Se a tarefa estiver clara, parta para implementação com diffs pequenos e validação logo após a primeira mudança substantiva.
4. Antes de concluir, rode `/review-private-work` ou use o subagente revisor.
5. Se a tarefa crescer no meio do caminho, retome com `/continue-private-work` em vez de empilhar contexto solto.

## Escopos locais com SDD

Este repositório não é SDD por inteiro, mas algumas frentes dentro de `project/` podem operar com esse modelo.

Regra pratica:

1. Se a âncora da tarefa estiver em `project/<frente>/` e essa frente tiver `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`, trate a frente como SDD local.
2. Se existir `project/<frente>/human-requests/`, use essa pasta apenas como intake humano não normativo.
3. Se a entrada vier so como pasta `human-requests/`, resolva em ordem: `CURRENT.md`, depois `README.md`, depois o `.md` mais recente.
4. Não tente retrofitar SDD para o repositório inteiro só porque aquela frente usa batches, reviews e validation.

## Subagentes disponíveis

- `private-project-coordinator`: coordenação e split entre privado, core e SDD local.
- `private-project-implementer`: implementação com diff pequeno e validação cedo.
- `private-project-reviewer`: review findings-first.

Você pode invocá-los por linguagem natural ou com `@`-mention quando quiser forçar a postura.
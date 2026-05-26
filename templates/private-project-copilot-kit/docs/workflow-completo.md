# Workflow completo

## Fluxo recomendado para novas demandas

1. Comece com `/private-project-kickoff`.
2. Deixe o coordenador decidir se a mudança pertence ao repositório privado, a `conn2flow` ou aos dois.
3. Se a tarefa estiver clara, parta para implementação com edições pequenas e validação logo após a primeira mudança substantiva.
4. Antes de concluir, rode `/review-private-work` ou peça ao agente atual um review em modo findings-first.
5. Se a tarefa ficar maior no meio do caminho, volte ao coordenador em vez de empilhar contexto ad hoc.

## Escopos locais com SDD

Este repositório não é SDD por inteiro, mas algumas frentes dentro de `project/` podem operar com esse modelo.

Regra prática:

1. Se a âncora da tarefa estiver em `project/<frente>/` e essa frente tiver `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`, trate a frente como SDD local.
2. Se existir `project/<frente>/human-requests/`, use essa pasta apenas como intake humano não normativo.
3. Nesses casos, continue entrando pelo `/private-project-kickoff`, mas releia os artefatos locais antes de propor código ou reescrever docs.
4. Se a entrada vier só como pasta `human-requests/`, resolva em ordem: `CURRENT.md`, depois `README.md`, depois o `.md` mais recente.
5. Não tente retrofitar SDD para o repositório inteiro só porque aquela frente usa batches, reviews e validation.

## Quando o usuário muda o escopo no meio da execução

1. Interrompa com uma instrução direta: descreva o que mudou.
2. Cite explicitamente os arquivos alterados manualmente ou anexe-os.
3. Peça para reler esses arquivos antes de continuar.
4. Use `/continue-private-work` se quiser retomar a mesma tarefa com novo contexto operacional.

## Regra prática

O agente trabalha melhor quando você aponta o diff mentalmente importante. Não dependa de ele descobrir sozinho toda alteração recente sem nenhuma pista.

## Leituras complementares

- `copilot-casos-de-uso-operacionais.md`: quando usar prompt, agent, skill, hook, handoff e subagente.
- `gestor-modulos-integracao-pratica.md`: caso prático para não criar módulo do gestor desconectado do runtime.
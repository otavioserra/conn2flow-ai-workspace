---
name: private-project-kickoff
description: Inicia uma demanda em projeto privado Conn2Flow com decisão de escopo, plano curto e execução quando houver contexto suficiente.
agent: agent
argument-hint: 'Descreva a demanda, objetivo, ou passe um .md em project/<frente>/human-requests/. Se passar a pasta, o fluxo usa CURRENT.md, depois README.md, depois o .md mais recente.'
---

Use a skill [private-project-context](../skills/private-project-context/SKILL.md) se houver dúvida entre o repositório privado e `conn2flow`.
Se a âncora da tarefa estiver em `project/<frente>/` e essa frente já tiver `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`, use também a skill [project-sdd-context](../skills/project-sdd-context/SKILL.md) antes de planejar ou editar.

Para a demanda abaixo:

1. Decida se a mudança pertence ao repositório privado, a `conn2flow` ou aos dois.
2. Se a demanda vier como caminho em `project/<frente>/human-requests/`, leia primeiro esse intake como material não normativo. Se a demanda apontar só para a pasta, escolha `CURRENT.md`, depois `README.md`, depois o `.md` mais recente.
3. Se a tarefa estiver ancorada em um escopo SDD local dentro de `project/`, releia primeiro `00-START-HERE.md`, `01-WORKFLOW.md`, spec principal, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`.
4. Identifique o menor conjunto inicial de arquivos para inspecionar.
5. Declare uma hipótese local falsificável e uma validação barata.
6. Se a tarefa for grande, monte um plano curto e prático.
7. Se o contexto já for suficiente, comece a implementação em vez de apenas discutir.

Demanda:

${input:task:Descreva a tarefa}
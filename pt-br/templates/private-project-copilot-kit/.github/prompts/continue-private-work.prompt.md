---
name: continue-private-work
description: Retoma uma tarefa interrompida em projeto privado Conn2Flow sem perder o contexto operacional.
agent: agent
argument-hint: 'Opcionalmente descreva o que mudou ou passe um .md em project/<frente>/human-requests/.'
---

Retome o trabalho em andamento considerando:

- decisões já tomadas
- arquivos já tocados
- validações pendentes
- separação entre camada privada e núcleo

Se o usuário alterou arquivos manualmente no meio do processo, releia esses arquivos antes de continuar.
Se a atualização vier como caminho em `project/<frente>/human-requests/`, releia primeiro esse intake humano. Se vier apenas a pasta, use `CURRENT.md`, depois `README.md`, depois o `.md` mais recente.
Se a tarefa estiver dentro de um escopo `project/<frente>/` com SDD local, releia também `00-START-HERE.md`, `01-WORKFLOW.md`, spec principal, batch index e validation checklist antes de retomar.
Se nenhum arquivo for citado explicitamente, descubra primeiro o menor conjunto de arquivos relevantes em vez de assumir que o contexto continua válido.

Atualização do usuário:

${input:update:Sem atualização adicional}
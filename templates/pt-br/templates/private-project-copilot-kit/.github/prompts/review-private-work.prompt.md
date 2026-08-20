---
name: review-private-work
description: Revisa as mudanças recentes do projeto privado Conn2Flow com foco em bugs, regressão, escopo errado e validação ausente.
agent: agent
argument-hint: 'Opcionalmente cite arquivos, risco suspeito ou um .md em project/<frente>/human-requests/.'
---

Revise a mudança mais recente deste projeto privado Conn2Flow.

Se o contexto adicional apontar para `project/<frente>/human-requests/`, use esse arquivo apenas como briefing não normativo sobre a expectativa humana da rodada.

Regras da resposta:

1. Liste findings primeiro, em ordem de severidade.
2. Trate mudança no repositório errado como risco relevante.
3. Aponte validação ausente quando houver.
4. Se a mudança estiver em um escopo `project/<frente>/` com SDD local, revise também coerência entre spec, batch atual e validation checklist.
5. Se não houver findings, diga isso explicitamente e registre riscos residuais.

Contexto adicional:

${input:context:Sem contexto adicional}
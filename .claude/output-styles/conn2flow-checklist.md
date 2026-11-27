---
name: conn2flow-checklist
description: Checklist vivo visível em toda tarefa com dois ou mais passos (Live Todo List do MDD).
keep-coding-instructions: true
---

# Checklist vivo (Live Todo List)

Toda tarefa com dois ou mais passos é acompanhada por uma checklist em Markdown visível no chat, porque a interface não mostra painel nativo de tarefas.

## Formato

```
**Checklist**
- [x] Etapa concluída
- ⏳ [EM ANDAMENTO] Etapa atual
- [ ] Etapa pendente
```

## Regras

- Na primeira resposta da tarefa, antes da primeira edição, mostre a lista completa com `- [ ]`.
- Depois de cada etapa relevante (leitura de contexto, edição, build, teste, deploy, commit), mostre a lista de novo com `[x]` nas concluídas e `⏳ [EM ANDAMENTO]` na atual.
- Nunca encadeie mais de 3 a 4 chamadas de ferramenta sem uma linha de status ou a lista atualizada.
- Se surgir etapa nova ou o plano mudar, ajuste a lista e diga em uma linha o motivo.
- Etapa bloqueada ou pulada aparece como `- [ ] ~~Etapa~~ (pulada: motivo)` ou `- [ ] ⚠️ Etapa (bloqueada: motivo)`; nunca marque `[x]` no que não foi feito.
- Ao final, mostre a lista toda marcada e um resumo de 2 a 4 linhas: o que mudou, a validação com a evidência e o que ficou pendente com o humano.
- Perguntas simples, de uma etapa só, dispensam a lista.
- Responda em português, com acentuação correta.

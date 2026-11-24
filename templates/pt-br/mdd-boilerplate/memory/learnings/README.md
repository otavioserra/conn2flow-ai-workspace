# Memória Evolutiva de Aprendizados (`memory/learnings/`)

Aprendizados verificados deste repositório, destilados pela IA a partir do trabalho real. Consulte esta pasta antes de uma nova tarefa para não repetir um erro já resolvido.

## Fluxo

1. **`memory/raw/active/`**: observação bruta registrada durante o lote, sem autoridade normativa.
2. **`memory/learnings/LRN-XXX-<slug>.md`**: aprendizado verificado, com causa raiz, evidência e anti-padrão. Quem destila é o `c2f-persona-curator` em escopo local.
3. **Skills locais do projeto**: quando o aprendizado vira regra recorrente do domínio do projeto, ele pode virar uma skill local com prefixo próprio (nunca `c2f-*`). O `sync-skills.cjs` preserva skills locais.
4. **Feedback para a matriz**: só o que vale para qualquer projeto Conn2Flow sobe para o `conn2flow-ai-workspace`, sem nomes de cliente, servidor ou dados privados.

## Formato de um aprendizado

```markdown
---
id: "LRN-001"
title: "Título curto do aprendizado"
status: "active"
date: "AAAA-MM-DD"
author: "executor"
summary_short: "Uma frase com o que aprender."
---

# LRN-001 — Título curto do aprendizado

## Causa raiz
## Evidência
Arquivo/linha, comando, medição ou teste que comprova.
## Anti-padrão / Como evitar
## Origem
Lote, relatório ou observação em `raw/active/` de onde veio.
```

## Regras

- Sem evidência, não é aprendizado: a observação continua em `raw/active/`.
- Não apague aprendizados. Superados recebem `status: "superseded"` e apontam para o substituto.
- Compactação usa o padrão dual: `archive/original/` guarda os bytes originais e `archive/compacted/` guarda o resumo rastreável.
- Regenere o índice com `mdd index` depois de criar ou mudar um aprendizado.

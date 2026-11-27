---
paths:
  - "memory/**/*.md"
---

# Regras de artefatos MDD (`memory/`)

> Regra complementar ao `CLAUDE.md`, que é a fonte única do protocolo (leitura inicial, skills por marco, autonomia, DEC-136). Este arquivo não repete aquele conteúdo; só vale ao tocar `memory/`.

- `memory/README.md` e os artefatos numerados são normativos; edite-os apenas quando requisito, contrato, critério de aceite ou decisão aprovada mudar.
- `memory/human-requests/` é intake humano não normativo; consolide em `change-requests/`, `reviews/`, `implementation/`, `validation/` ou `decisions/`.
- `memory/backlog/` não é executável sem promoção humana para `req-XXX.md`, `CURRENT.md` e batch.
- Memórias de engenharia: leia `memory/03-memory-engineering-chief.md` e `memory/04-memory-engineering-execution.md`; atualize só a 04 ao fim da tarefa; a 03 só com instrução explícita do humano.
- Skills de fluxo: `start-mdd-slice`, `continue-mdd-batch`, `mdd-workflow`, `mdd-memory-gardening` e `c2f-mdd-indexing-and-handoffs` (nomes legados `*-sdd-*` e `MEMORIA-ENGENHARIA-*` estão aposentados).

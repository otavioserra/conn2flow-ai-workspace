---
paths:
  - "project/**/*.md"
---

# SDD local dentro de project/

- Alguns escopos em `project/<frente>/` já operam com SDD local, mesmo que o repositório inteiro não siga esse modelo.
- Quando existirem `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`, trate esse escopo como SDD local.
- Trate `project/<frente>/human-requests/` apenas como intake humano não normativo; qualquer consolidação deve ir para spec principal, reviews, change-requests, decisions, implementation ou validation.
- Edite a spec principal somente quando requisito, critério de aceite ou decisão estrutural realmente mudar.
- Use reviews, change-requests, decisions, implementation e validation para o restante do trabalho incremental.
- Trate `antigo/` como histórico, não como fonte atual de verdade.
- Não tente retrofitar SDD para o repositório inteiro a partir de uma única frente local.
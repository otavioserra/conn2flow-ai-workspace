# 01 Workflow

Este arquivo descreve o fluxo de transição dos artefatos SDD para o desenvolvimento seguro do repositório `conn2flow-ai-workspace`.

---

## 1. Fluxo de Estados

```
[Intake Humano] ➔ [req-XXX.md] ➔ [Change Request / Batch] ➔ [Handoff ao Executor] ➔ [Código & Validação] ➔ [Review & Aceite]
```

---

## 2. Regras de Edição de Arquivos (Fronteiras)
Para manter o modelo de Agente Duplo operando de forma resiliente:

*   **Normativo (Arquiteto gerencia, Executor lê)**:
    - `sdd/SPEC.md`
    - `sdd/00-baseline-architecture.md`
    - `sdd/decisions/DECISION-LOG.md`
    - O executor **não** edita estes arquivos diretamente para evitar desvio arquitetural.
*   **Operacional (Executor atualiza, Arquiteto monitora)**:
    - `sdd/implementation/BATCH-INDEX.md` e lotes associados.
    - `sdd/validation/VALIDATION-CHECKLIST.md`.
    - O executor edita estes arquivos para marcar tarefas concluídas e colar relatórios de execução de testes locais.

---

## 3. Fluxo de Mudança de Código
1. O Arquiteto atualiza os planos na pasta `sdd/` e atualiza `sdd/human-requests/CURRENT.md` apontando para o arquivo `req-XXX.md` correspondente.
2. O usuário roda o Executor.
3. O Executor lê a demanda ativa e modifica os códigos dos scripts ou arquivos de templates.
4. O Executor executa os testes de instalação locais.
5. O Executor atualiza o status de progresso das tarefas no lote e adiciona a evidência do resultado dos testes em `sdd/validation/VALIDATION-CHECKLIST.md`.
6. O Executor avisa o usuário sobre a conclusão das modificações locais de baixo nível.
7. O usuário inspeciona o Git Diff e faz o commit dos arquivos no repositório.

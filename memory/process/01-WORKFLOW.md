# 01 Workflow

Este arquivo descreve o fluxo de transição dos artefatos MDD para o desenvolvimento seguro do repositório `conn2flow-ai-workspace`.

---

## 1. Fluxo de Estados

```
[Intake Humano] ➔ [req-XXX.md] ➔ [Change Request / Batch] ➔ [Handoff ao Executor] ➔ [Código & Validação] ➔ [Review & Aceite]
```

---

## 2. Regras de Edição de Arquivos (Fronteiras)
Para manter o modelo de Agente Duplo operando de forma resiliente:

*   **Normativo (Arquiteto gerencia, Executor lê)**:
    - `memory/SPEC.md`
    - `memory/00-baseline-architecture.md`
    - `memory/decisions/DECISION-LOG.md`
    - O executor **não** edita estes arquivos diretamente para evitar desvio arquitetural.
*   **Operacional (Executor atualiza, Arquiteto monitora)**:
    - `memory/implementation/BATCH-INDEX.md` e lotes associados.
    - `memory/validation/VALIDATION-CHECKLIST.md`.
    - O executor edita estes arquivos para marcar tarefas concluídas e colar relatórios de execução de testes locais.

---

## 3. Fluxo de Mudança de Código
1. O Arquiteto atualiza os planos na pasta `memory/` e atualiza `memory/human-requests/CURRENT.md` apontando para o arquivo `req-XXX.md` correspondente.
2. O usuário roda o Executor.
3. O Executor lê a demanda ativa e modifica os códigos dos scripts ou arquivos de templates.
4. O Executor executa os testes de instalação locais.
5. O Executor atualiza o status de progresso das tarefas no lote e adiciona a evidência do resultado dos testes em `memory/validation/VALIDATION-CHECKLIST.md`.
6. O Executor avisa o usuário sobre a conclusão das modificações locais de baixo nível.
7. O usuário inspeciona o Git Diff e faz o commit dos arquivos no repositório.

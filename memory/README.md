# Conn2Flow AI Workspace MDD Governance

Este diretório gerencia a governança de engenharia e a evolução do próprio repositório `conn2flow-ai-workspace` utilizando **MDD (Memory Driven Development)**. A entrada atual é a tríade [arquitetura](00-baseline-architecture.md), [mecânica](01-general-memory.md) e [política](02-policy.md), seguida dos índices e do ponteiro ativo.

---

## 1. Ordem Normativa de Leitura
Qualquer alteração ou nova demanda neste projeto deve seguir a seguinte ordem de leitura:
1. `memory/README.md` (este arquivo)
2. `memory/00-baseline-architecture.md` (arquitetura base e legado aprovado)
3. `memory/process/00-START-HERE.md` (runbook de entrada de novas demandas)
4. `memory/process/01-WORKFLOW.md` (workflow e regras de transição de estado)
5. `memory/SPEC.md` (especificação normativa unificada dos templates e scripts)
6. `memory/implementation/BATCH-INDEX.md` (lote operacional ativo)
7. `memory/validation/VALIDATION-CHECKLIST.md` (critérios de aceite e logs de testes)
8. `memory/decisions/DECISION-LOG.md` (registro de decisões arquiteturais)

---

## 2. Modelo de Agente Duplo Local

Para o desenvolvimento deste repositório, os papéis são divididos estritamente:

*   **Arquiteto IA (Antigravity / Gemini 3.5 Flash)**: Opera em alto nível. Edita as especificações e decisões na pasta `memory/` e escreve as requisições em `memory/human-requests/`. **Nunca realiza commits**.
*   **Executor IA (Claude Code / Copilot)**: Opera em baixo nível. Lê `memory/` e a requisição humana ativa, realiza as alterações de scripts e arquivos em `en/`, `pt-br/` ou `scripts/`, roda testes de validação local e preenche os logs de progresso e validação.
*   **Engenheiro Chefe (Você)**: Revisa os diffs gerados pelo Executor no VS Code Git Controller e realiza o commit.

---

## 3. Estado Inicial (Dogfooding)
*   **BATCH-000**: Implantação e Onboarding do SDD local concluído (histórico anterior à fundação MDD).
*   **BATCH-001**: Reorganização do repositório em estrutura bilingue (`en/` e `pt-br/`), criação dos boilerplates correspondentes e atualização dos instaladores em `scripts/` para suportar idiomas e prefixação.
*   **Ponteiro Ativo**: [CURRENT.md](human-requests/CURRENT.md); fundação REQ-067 / BATCH-069. REQ-001 permanece no histórico de onboarding.

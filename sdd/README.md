# Conn2Flow AI Workspace SDD Governance

Este diretório gerencia a governança de engenharia e a evolução do próprio repositório `conn2flow-ai-workspace` utilizando a metodologia **Spec-Driven Development (SDD)**.

---

## 1. Ordem Normativa de Leitura
Qualquer alteração ou nova demanda neste projeto deve seguir a seguinte ordem de leitura:
1. `sdd/README.md` (este arquivo)
2. `sdd/00-baseline-architecture.md` (arquitetura base e legado aprovado)
3. `sdd/process/00-START-HERE.md` (runbook de entrada de novas demandas)
4. `sdd/process/01-WORKFLOW.md` (workflow e regras de transição de estado)
5. `sdd/SPEC.md` (especificação normativa unificada dos templates e scripts)
6. `sdd/implementation/BATCH-INDEX.md` (lote operacional ativo)
7. `sdd/validation/VALIDATION-CHECKLIST.md` (critérios de aceite e logs de testes)
8. `sdd/decisions/DECISION-LOG.md` (registro de decisões arquiteturais)

---

## 2. Modelo de Agente Duplo Local

Para o desenvolvimento deste repositório, os papéis são divididos estritamente:

*   **Arquiteto IA (Antigravity / Gemini 3.5 Flash)**: Opera em alto nível. Edita as especificações e decisões na pasta `sdd/` e escreve as requisições em `sdd/human-requests/`. **Nunca realiza commits**.
*   **Executor IA (Claude Code / Copilot)**: Opera em baixo nível. Lê `sdd/` e a requisição humana ativa, realiza as alterações de scripts e arquivos em `en/`, `pt-br/` ou `scripts/`, roda testes de validação local e preenche os logs de progresso e validação.
*   **Engenheiro Chefe (Você)**: Revisa os diffs gerados pelo Executor no VS Code Git Controller e realiza o commit.

---

## 3. Estado Inicial (Dogfooding)
*   **BATCH-000**: Implantação e Onboarding do SDD local concluído.
*   **BATCH-001**: Reorganização do repositório em estrutura bilingue (`en/` e `pt-br/`), criação dos boilerplates correspondentes e atualização dos instaladores em `scripts/` para suportar idiomas e prefixação.
*   **Ponteiro Ativo**: A demanda ativa está descrita em [sdd/human-requests/req-001.md](file:///C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/sdd/human-requests/archive/req-001.md).

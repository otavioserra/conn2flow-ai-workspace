---
id: BATCH-075
title: Consolidação Harmônica das Branches MDD (REQ-071 e REQ-072), Resolução de Conflitos e Unificação na main
status: in-progress
date: 2026-10-09
author: architect
target_repo: conn2flow-ai-workspace
summary_short: Live Todo List para merge de feat/req-071 e feat/req-072, testes e consolidação na main
summary_medium: Rastreamento detalhado da resolução de conflitos de governança entre as frentes MDD e unificação com suíte 100% verde na branch main.
---

# BATCH-075 — Consolidação Harmônica das Branches MDD (REQ-071 e REQ-072), Resolução de Conflitos e Unificação na `main`

- **Projeto**: Multi-Repositório: `conn2flow-ai-workspace` (Matriz Central) e `conn2flow` (Core)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Raiz Core**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`
- **Requisição**: [REQ-073](../human-requests/req-073.md)
- **Status**: `in-progress`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. Resolução de Conflitos e Fusão das Branches**:
  - [x] 1.1 Iniciar merge de `feat/req-071` em `feat/req-072`
  - [x] 1.2 Reconciliar `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` (preservar 45 skills e memórias 00 a 04)
  - [x] 1.3 Reconciliar `memory/01-general-memory.md` e `memory/02-policy.md` (unir Trava Tripla com regras das memórias 03/04)
  - [x] 1.4 Reconciliar `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md` e `templates/`
  - [ ] 1.5 Concluir commit de merge em `feat/req-072`
- [ ] **2. Validação e Testes Automatizados**:
  - [ ] 2.1 Executar auto-cura de índices via CLI `mdd index memory/`
  - [ ] 2.2 Executar suíte de testes do MDD Client Python (`pytest`: 111/111 PASS)
  - [ ] 2.3 Executar suíte de testes da extensão VS Code (`node --test`: 124/124 PASS)
  - [ ] 2.4 Executar lint nos arquivos PHP do Core (`php -l`: PASS)
- [ ] **3. Merge na Branch `main` e Limpeza**:
  - [ ] 3.1 Fazer checkout na branch `main` e realizar merge fast-forward / sem conflitos
  - [ ] 3.2 Efetuar `git push origin main` na matriz e no Core
  - [ ] 3.3 Remover worktrees temporárias de entrega (`temp/mdd-pr-review`, `req-071-worktrees`)
  - [ ] 3.4 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **Preservação Integral de Escopos**: A resolução de conflitos deve manter ambos os ganhos (as memórias renomeadas 03/04 da REQ-071 e a Trava Tripla/CLI/skill #45 da REQ-072).
2. **Proibição de `git add .` e `-A`**: Commits devem listar exclusivamente os arquivos modificados.
3. **Regressão Zero**: Todos os 111 testes do Python e 124 da extensão devem passar antes de fazer o merge na `main`.

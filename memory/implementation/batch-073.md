# BATCH-073 — Padronização Canônica das Memórias de Engenharia em Inglês (03 e 04), Integração com `memory/raw/` e Atualização dos Boilerplates

- **Projeto**: Multi-Repositório (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-071](../human-requests/req-071.md)
- **Status**: `ready-for-intake`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. Matriz (`conn2flow-ai-workspace`)**:
  - [ ] 1.1 Renomear `memory/MEMORIA-ENGENHARIA-CHEFIA.md` ➔ `memory/03-memory-engineering-chief.md` via `git mv`
  - [ ] 1.2 Renomear `memory/MEMORIA-ENGENHARIA-EXECUCAO.md` ➔ `memory/04-memory-engineering-execution.md` via `git mv`
  - [ ] 1.3 Atualizar `memory/01-general-memory.md` e `memory/02-policy.md` com os 5 arquivos de raiz e uso de `memory/raw/`
  - [ ] 1.4 Atualizar referências em `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` e skills de governança
  - [ ] 1.5 Atualizar boilerplates e skeletons em `templates/` (en e pt-br)
- [ ] **2. Propagação nos 7 Repositórios Satélites**:
  - [ ] 2.1 `conn2flow`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.2 `conn2flow-site`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.3 `conn2flow-nexus`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.4 `conn2flow-app`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.5 `lumix`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.6 `transformamp`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [ ] 2.7 `conn2flow-mkt`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito local
- [ ] **3. Auditoria & Validação**:
  - [ ] 3.1 Verificar integridade de links e referências cruzadas
  - [ ] 3.2 Rodar suíte da extensão VS Code para assegurar regressão zero (124/124 testes)
  - [ ] 3.3 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **Preservação Integral de Conteúdo**: Nenhum registro histórico deve ser apagado no rename.
2. **Proibição de `git add .` e `-A`**: Em todos os repositórios, listar exclusivamente os arquivos modificados.
3. **Padrão Kebab-case em Inglês**: Nomes dos arquivos de raiz rigorosamente padronizados (`00` a `04`).

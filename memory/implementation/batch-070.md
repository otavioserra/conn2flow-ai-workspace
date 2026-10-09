# BATCH-070 — Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites do Ecossistema Conn2Flow

- **Projeto**: Multi-Repositório (`conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-068](../human-requests/req-068.md)
- **Status**: `ready-for-intake`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. conn2flow (Core Framework)**:
  - [ ] 1.1 `git mv sdd memory`
  - [ ] 1.2 Injetar Tríade Fundamental adaptada (`00-baseline-architecture.md`, `01-general-memory.md`, `02-policy.md`)
  - [ ] 1.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 1.4 Atualizar referências em `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.codex/`
  - [ ] 1.5 Validar `php cli/c2f.php ai:sync` (44 skills)
  - [ ] 1.6 Commit atômico com arquivos explícitos (sem `git add .`) e push
- [ ] **2. conn2flow-site (Site Oficial)**:
  - [ ] 2.1 `git mv sdd memory`
  - [ ] 2.2 Injetar Tríade Fundamental adaptada
  - [ ] 2.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 2.4 Atualizar referências de governança
  - [ ] 2.5 Preservar as 9 skills locais e sincronizar as 44 canônicas
  - [ ] 2.6 Commit atômico com arquivos explícitos e push
- [ ] **3. conn2flow-nexus (Nexus Hub)**:
  - [ ] 3.1 `git mv sdd memory`
  - [ ] 3.2 Injetar Tríade Fundamental adaptada
  - [ ] 3.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 3.4 Atualizar referências de governança e sincronizar skills
  - [ ] 3.5 Commit atômico com arquivos explícitos e push
- [ ] **4. conn2flow-app (App / API)**:
  - [ ] 4.1 `git mv sdd memory`
  - [ ] 4.2 Injetar Tríade Fundamental adaptada
  - [ ] 4.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 4.4 Atualizar referências de governança e sincronizar skills
  - [ ] 4.5 Commit atômico com arquivos explícitos e push
- [ ] **5. lumix**:
  - [ ] 5.1 `git mv sdd memory`
  - [ ] 5.2 Injetar Tríade Fundamental adaptada
  - [ ] 5.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 5.4 Preservar as 8 skills locais e sincronizar as 44 canônicas
  - [ ] 5.5 Commit atômico com arquivos explícitos e push
- [ ] **6. transformamp (Transform MP)**:
  - [ ] 6.1 `git mv sdd memory`
  - [ ] 6.2 Injetar Tríade Fundamental adaptada
  - [ ] 6.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 6.4 Preservar as 19 skills locais e sincronizar as 44 canônicas
  - [ ] 6.5 Commit atômico com arquivos explícitos e push
- [ ] **7. conn2flow-mkt (Marketing)**:
  - [ ] 7.1 `git mv sdd memory`
  - [ ] 7.2 Injetar Tríade Fundamental adaptada
  - [ ] 7.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [ ] 7.4 Atualizar referências de governança e sincronizar skills
  - [ ] 7.5 Commit atômico com arquivos explícitos e push
- [ ] **8. Auditoria Geral do Ecossistema**:
  - [ ] 8.1 Verificar que nenhum repositório satélite mantém pastas `sdd/` órfãs
  - [ ] 8.2 Rodar suite da extensão VS Code na matriz confirmando descoberta multirepo
  - [ ] 8.3 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **PROIBIDO `git add .` e `git add -A`**: Em todos os repositórios, liste estritamente os arquivos modificados.
2. **Preservação de Skills Locais**: As skills privadas (36 nos satélites) não podem ser removidas ou corrompidas.
3. **Preservação Histórica**: `git mv` garante que os logs e blame de Git sejam mantidos de ponta a ponta.

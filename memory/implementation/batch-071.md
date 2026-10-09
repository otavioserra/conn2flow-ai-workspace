# BATCH-071 — Implementação das Aplicações em Python: MDD Client CLI & Daemon (ARCH-010) e MDD Hub & Documentation Watcher (ARCH-011)

- **Projeto**: `conn2flow-ai-workspace`
- **Raiz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-069](../human-requests/req-069.md)
- **Status**: `ready-for-intake`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. Estruturação do Ambiente Python**:
  - [ ] 1.1 Criar diretórios modulares `tools/mdd-client/` e `tools/mdd-hub/`
  - [ ] 1.2 Configurar `pyproject.toml` para cada pacote com dependências declaradas (Typer, Rich, FastAPI, Uvicorn, PyYAML, httpx, pytest)
- [ ] **2. Implementação do MDD Client CLI & Daemon (`tools/mdd-client/`)**:
  - [ ] 2.1 Implementar comando `mdd init` (injeção completa de `memory/` com Tríade 00, 01, 02 e `index.md` hierárquico)
  - [ ] 2.2 Implementar comando `mdd sync` (sincronização determinística das 44 skills)
  - [ ] 2.3 Implementar comando `mdd compact` (aplicação da Regra dos 10 e teto de 50 KB, dual archive)
  - [ ] 2.4 Implementar comando `mdd status` (dashboard Rich de saúde da memória)
  - [ ] 2.5 Implementar comando `mdd report` (coleta e exportação estruturada em `memory/reports/`)
  - [ ] 2.6 Implementar comando `mdd daemon` / `mdd watch` (loop assíncrono leve de vigilância)
- [ ] **3. Implementação do MDD Hub & Documentation Watcher (`tools/mdd-hub/`)**:
  - [ ] 3.1 Implementar servidor FastAPI com endpoints `/api/v1/reports` e `/api/v1/status`
  - [ ] 3.2 Implementar Documentation Watcher (scrapers assíncronos para Gemini, Claude, Codex, Kimi, Cursor)
  - [ ] 3.3 Implementar os 3 modos de autonomia (`headless`, `monitored`, `reviewer`)
  - [ ] 3.4 Implementar módulo de despacho Git para automações seguras em branches
- [ ] **4. Testes Automatizados & Qualidade**:
  - [ ] 4.1 Criar suíte de testes `pytest` para o MDD Client (init, compact, sync, status)
  - [ ] 4.2 Criar suíte de testes `pytest` para o MDD Hub (endpoints API, watchers, modos de autonomia)
  - [ ] 4.3 Executar `pytest` e assegurar 100% de cobertura nos fluxos críticos
- [ ] **5. Documentação & Handoff para Extensão VS Code (ARCH-014)**:
  - [ ] 5.1 Redigir documentação de uso e CLI em `tools/README.md`
  - [ ] 5.2 Emitir relatório de implementação e evidências de execução

---

## 🛡️ Regras Invioláveis de Execução

1. **Python 3.11+ e Clean Architecture**: Código modular, tipado (`type hints`), assíncrono onde apropriado.
2. **Proibição de `git add .`**: Listar exclusivamente os arquivos adicionados ou alterados no commit.
3. **Isolamento de Diretórios**: A injeção de memória do `mdd init` deve ser puramente local e não alterar arquivos fora do diretório alvo.

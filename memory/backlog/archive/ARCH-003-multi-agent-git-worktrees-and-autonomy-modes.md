# ARCH-003: Modos de Autonomia de Git (Supervisionado vs. Transparente) & Worktrees Concorrentes

*   **Status**: `ICEBOX` (Pronto para Planejamento de Lote)
*   **Tipo**: Arquitetura / Governança de Git & Agentes Concorrentes
*   **Data de Registro**: 2026-08-19
*   **Solicitante**: Chief Architect / User
*   **Prioridade**: Média (Evolução para Multi-Agente Concorrente)

---

## 🎯 Contexto e Justificativa

Atualmente, o framework opera sob travas de segurança rígidas (Human-in-the-Loop), onde agentes não comitam diretamente na branch principal sem inspeção prévia de diffs.

Conforme a maturidade dos agentes e a cobertura de testes aumentam, o ecossistema precisa de **dois modos de governança de Git**:

---

## 🛡️ Os Dois Modos de Operação de Git

### 1. 🔍 Modo Supervisionado (Padrão Atual / Seguro)
* O agente implementa o código, mas não altera a branch `main` diretamente.
* As alterações ficam como diff pendente ou em branch de homologação para o humano inspecionar no Git do VS Code antes do merge.
* Ideal para refatorações críticas de arquitetura e novas regras de negócio.

### 2. ⚡ Modo Transparente / Autônomo (Branching & Worktrees Concorrentes)
* **Git Worktrees / Branches Isoladas**: O agente cria automaticamente uma branch de trabalho (`feat/req-XXX-descricao`) ou um `git worktree` isolado em disco.
* **Múltiplos Agentes Paralelos**: Vários agentes podem trabalhar simultaneamente em diferentes módulos do core sem conflitos de arquivo (`git checkout` concorrente).
* **Esteira Autônoma**:
  1. Criação da branch isolada.
  2. Execução das modificações de código e compilação de recursos (`*Data.json`).
  3. Execução da suíte de testes unitários (PHPUnit / Vitest).
  4. Commit semântico e criação automática de Pull Request (ou merge determinístico se 100% dos testes passarem).

---

## 📋 Checklist de Implementação

- [ ] Implementar flag de governança nos kits: `git_autonomy_mode: "supervised" | "autonomous"`.
- [ ] Criar utilitário `scripts/git/create-agent-worktree.ps1` e `.sh` para provisionamento rápido de worktrees.
- [ ] Configurar regras de proteção de branch no GitHub para aceitar PRs automáticos validados por CI.
- [ ] Integrar com o Servidor MCP (`ARCH-002`) e o CLI (`FEAT-003`).

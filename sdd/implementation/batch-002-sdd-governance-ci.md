# BATCH-002 - Validador de Governança SDD (GitHub Actions CI/CD)

## Escopo do Lote
Este lote foca na criação de uma barreira de CI/CD via GitHub Actions para validar commits e Pull Requests que tocam em arquivos do SDD. Ele garante que qualquer alteração em arquivos de especificação normativa (como `sdd/SPEC.md` ou `sdd/0X-*.md`) seja validada contra a presença de uma Change Request (`CR-XXX.md`) aprovada e correspondente, protegendo o baseline arquitetural.

---

## Checklist de Implementação

### 1. Template de Workflow de Governança
- [ ] Criar o template `.github/workflows/sdd-governance.yml` dentro de `templates/spec-driven-project-copilot-kit/` e `templates/spec-driven-project-claude-kit/` (versões `en` e `pt-br`).
- [ ] Implementar a lógica de script (Bash) para:
  - [ ] Obter a lista de arquivos modificados no commit/Pull Request.
  - [ ] Identificar se algum arquivo modificado está sob a raiz de `sdd/` (excluindo `sdd/implementation/`, `sdd/validation/` e `sdd/human-requests/`).
  - [ ] Se arquivos normativos foram alterados, verificar se há uma proposta de alteração `sdd/change-requests/CR-*.md` incluída na lista de modificações ou criada recentemente.
  - [ ] Lançar erro de build e rejeitar a validação caso haja desvio normativo direto (edição de especificação sem Change Request aberta).

### 2. Documentação e Instruções de Integração
- [ ] Adicionar orientações de ativação da governança de CI/CD em `sdd/README.md` dos kits.
- [ ] Criar instruções de fallback caso o usuário queira rodar o validador como um Git Hook local (`.git/hooks/pre-commit`).

---

## Validação Realizada
*(A ser preenchida pelo Executor IA após os testes de execução)*

# BATCH-002 - Otimização de Contexto e Governança de Arquivamento

## Escopo do Lote
Este lote implementa a política física e operacional de arquivamento histórico do SDD. O objetivo é manter os arquivos principais de controle com no máximo 10 itens correntes ou ativos, movendo histórico antigo para subpastas `archive/` com índices Markdown resumidos e links diretos.

---

## Checklist de Implementação

### 1. Estrutura de Arquivo nos Boilerplates
- [x] Criar `archive/README.md` em `pt-br/sdd-boilerplate/sdd/decisions/`.
- [x] Criar `archive/README.md` em `pt-br/sdd-boilerplate/sdd/human-requests/`.
- [x] Criar `archive/README.md` em `pt-br/sdd-boilerplate/sdd/implementation/`.
- [x] Criar `archive/README.md` em `pt-br/sdd-boilerplate/sdd/validation/`.
- [x] Criar os equivalentes em `en/sdd-boilerplate/sdd/`.

### 2. Regras de IA nos Templates
- [x] Atualizar `pt-br/templates/spec-driven-project-claude-kit/CLAUDE.md`.
- [x] Atualizar `pt-br/templates/spec-driven-project-claude-kit/.claude/rules/sdd.md`.
- [x] Atualizar `pt-br/templates/spec-driven-project-copilot-kit/.github/copilot-instructions.md`.
- [x] Atualizar `pt-br/templates/spec-driven-project-copilot-kit/.github/instructions/sdd.instructions.md`.
- [x] Atualizar os quatro equivalentes em Inglês sob `en/templates/`.

### 3. Governança Local
- [x] Criar `archive/README.md` sob `sdd/decisions/`, `sdd/human-requests/`, `sdd/implementation/` e `sdd/validation/`.
- [x] Atualizar `sdd/implementation/BATCH-INDEX.md` para inserir este lote como `BATCH-002`.
- [x] Atualizar `sdd/validation/VALIDATION-CHECKLIST.md` com a checklist de aceite do `BATCH-002`.

---

## Validação Realizada
- Verificada por busca local a presença dos 12 arquivos `archive/README.md` esperados entre boilerplates PT-BR, boilerplate EN e SDD local.
- Verificada por busca local a presença das seções de otimização de contexto nos 8 arquivos de instruções dos templates SDD Claude/Copilot.
- Verificada a renumeração pública do índice para `BATCH-000` a `BATCH-005`, com este lote registrado como `BATCH-002`.

# LOCAL-BATCH-004 - Migração do 3D-Catalog e Isolamento de Governança Local

## Escopo do Lote
Este lote gerencia a migração dos 48 históricos do `antigo/` do `3d-catalog` e seus lotes ativos para a raiz de `/sdd/` do `conn2flow-site`, além da configuração do sistema de ignore local por Git no `conn2flow-ai-workspace`.

---

## Checklist de Implementação

### 1. Migração 3D-Catalog (no conn2flow-site)
- [ ] Criar subpastas modulares `/sdd/human-requests/3d-catalog/` e `/sdd/implementation/3d-catalog/`.
- [ ] Migrar os 48 históricos do `antigo/` para `/sdd/human-requests/3d-catalog/req-XXX.md` e `/sdd/implementation/3d-catalog/batch-XXX.md` (status: `complete`, checklists `[x]`).
- [ ] Mover as especificações e decisões ativas de `sdd/3d-catalog/` para as pastas de governança da raiz:
  - [ ] `decisions/DECISION-001/002/003.md` ➔ `sdd/decisions/3d-catalog/`
  - [ ] `implementation/BATCH-001/002/003/004.md` ➔ `sdd/implementation/3d-catalog/`
  - [ ] `validation/VALIDATION-CHECKLIST.md` ➔ `sdd/validation/3d-catalog/`
  - [ ] `3d-catalog.spec.md` ➔ `sdd/3d-catalog.specs.md`
- [ ] Excluir a pasta antiga `sdd/3d-catalog/` (agora vazia).
- [ ] Atualizar o arquivo `sdd/implementation/BATCH-INDEX.md` do site.

### 2. Isolamento de Governança Local (no conn2flow-ai-workspace)
- [ ] Adicionar regras de ignore ao final do `.gitignore` para a máscara `sdd/**/local-*` e `sdd/**/local/`.
- [ ] Remover do rastreamento Git os arquivos privados antigos sem excluí-los fisicamente:
  - [ ] `git rm --cached sdd/human-requests/req-002.md`
  - [ ] `git rm --cached sdd/human-requests/req-003.md`
  - [ ] `git rm --cached sdd/implementation/batch-002-engineering-memories.md`
  - [ ] `git rm --cached sdd/implementation/batch-003-legacy-migration-site.md`
- [ ] Renomear os arquivos em disco adicionando o prefixo `local-`:
  - [ ] `sdd/human-requests/local-req-002.md`
  - [ ] `sdd/human-requests/local-req-003.md`
  - [ ] `sdd/implementation/local-batch-002-engineering-memories.md`
  - [ ] `sdd/implementation/local-batch-003-legacy-migration-site.md`
- [ ] Remover referências locais no `sdd/implementation/BATCH-INDEX.md` público (a tabela pública deve ter apenas BATCH-000, BATCH-001 e os lotes futuros abertos).
- [ ] Remover seções locais do `sdd/validation/VALIDATION-CHECKLIST.md` público.
- [ ] Atualizar o `CURRENT.md` local para apontar para `local-req-004.md`.

---

## Validação Realizada
*(A ser preenchida pelo Executor IA após os testes de execução)*

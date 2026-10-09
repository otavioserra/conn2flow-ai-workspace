# LOCAL-BATCH-005 - Otimização de Contexto e Governança de Arquivamento

## Escopo do Lote
Este lote implementa a estrutura física de arquivamento (/archive/) nos boilerplates de idioma do `conn2flow-ai-workspace`, atualiza as regras de IA nos kits Claude/Copilot para impor o limite de 10 itens correntes e o arquivamento de histórico, e alinha a governança do nosso próprio workspace local, preenchendo o BATCH-002 público.

---

## Checklist de Implementação

### 1. Criação das Pastas de Arquivos nos Boilerplates
- [x] Criar subpastas e arquivos `README.md` explicativos em Português (`pt-br/sdd-boilerplate/sdd/`):
  - [x] `decisions/archive/README.md`
  - [x] `human-requests/archive/README.md`
  - [x] `implementation/archive/README.md`
  - [x] `validation/archive/README.md`
- [x] Criar subpastas e arquivos `README.md` explicativos em Inglês (`en/sdd-boilerplate/sdd/`):
  - [x] `decisions/archive/README.md`
  - [x] `human-requests/archive/README.md`
  - [x] `implementation/archive/README.md`
  - [x] `validation/archive/README.md`

### 2. Atualização de Regras nos Templates de Kits
- [x] Em Português (`pt-br/templates/`):
  - [x] Atualizar `CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md`, `.github/instructions/sdd.instructions.md`.
  - [x] Adicionar seção explicando o limite de 10 itens correntes e uso compulsório do `/archive/`.
- [x] Em Inglês (`en/templates/`):
  - [x] Atualizar equivalentes de regras/instruções para incluir a mesma seção de otimização de contexto em inglês.

### 3. Alinhamento de Governança Local no Workspace
- [x] Criar pastas `archive/` com `README.md` locais sob o nosso próprio `sdd/`:
  - [x] `sdd/decisions/archive/README.md`
  - [x] `sdd/human-requests/archive/README.md`
  - [x] `sdd/implementation/archive/README.md`
  - [x] `sdd/validation/archive/README.md`
- [x] Atualizar o [sdd/implementation/BATCH-INDEX.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/implementation/BATCH-INDEX.md) público:
  - [x] Renomear os lotes para reinserir este como `BATCH-002` de forma sequencial.
  - [x] Marcar o `BATCH-002` como `in-progress`.
- [x] Atualizar o [sdd/validation/VALIDATION-CHECKLIST.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/validation/VALIDATION-CHECKLIST.md) público adicionando a seção para o `BATCH-002`.

---

## Validação Realizada
- Criados os 12 `archive/README.md` esperados nos boilerplates PT-BR, EN e no SDD local.
- Atualizadas as 8 instruções SDD Claude/Copilot em PT-BR e EN com a política de limite de 10 itens e arquivamento em `archive/`.
- Atualizado o índice público para inserir este lote como `BATCH-002`, manter Monitor como `BATCH-003`, MCP como `BATCH-004` e CI como `BATCH-005`.
- Atualizada a checklist pública de validação do `BATCH-002`.

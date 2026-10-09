# LOCAL-BATCH-006 - Rollout da Governança de Arquivamento nos Projetos Alvo

## Escopo do Lote
Este lote atualiza os instaladores de kits SDD em `scripts/` para injetar subpastas de arquivos (`archive/`) em repositórios preexistentes, realiza o rollout real nos quatro repositórios (Core, Nexus, Lumix e Site), e registra o BATCH-003 público de controle de alto nível.

---

## Checklist de Implementação

### 1. Atualização dos Instaladores em `scripts/`
- [x] Atualizar os scripts de instalação do Claude Kit (`.ps1` e `.sh`):
  - [x] Implementar a rotina para criar `decisions/archive/`, `human-requests/archive/`, `implementation/archive/` e `validation/archive/` com seus respectivos `README.md` se a pasta `sdd/` já existir.
- [x] Atualizar os scripts de instalação do Copilot Kit (`.ps1` e `.sh`):
  - [x] Implementar a mesma rotina de criação de pastas de arquivos para o Copilot.

### 2. Rollout de Atualização nos Repositórios
- [x] Executar o instalador atualizado no **Conn2Flow Core**:
  - [x] Caminho: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`
  - [x] Comando: Rodar com `-Force` e `-Language pt-br`.
- [x] Executar o instalador atualizado no **Conn2Flow Nexus**:
  - [x] Caminho: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-nexus`
  - [x] Comando: Rodar com `-Force` e `-Language pt-br`.
- [x] Executar o instalador atualizado no **Lumix**:
  - [x] Caminho: `C:\Users\otavi\OneDrive\Documentos\GIT\lumix`
  - [x] Comando: Rodar com `-Force` e `-Language pt-br`.
- [x] Executar o instalador atualizado no **Conn2Flow Site**:
  - [x] Caminho: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site`
  - [x] Comando: Rodar com `-Force` e `-Language pt-br`.

### 3. Alinhamento de Governança Local no Workspace
- [x] Atualizar o [sdd/implementation/BATCH-INDEX.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/implementation/BATCH-INDEX.md) público:
  - [x] Cadastrar o `BATCH-003` (Otimização de Contexto nos Projetos Alvo).
  - [x] Marcar o `BATCH-003` como `in-progress`.
- [x] Atualizar o [sdd/validation/VALIDATION-CHECKLIST.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/validation/VALIDATION-CHECKLIST.md) público adicionando a seção para o `BATCH-003`.

---

## Validação Realizada
- **Rollout Core**: `install-spec-driven-claude-kit.ps1 -TargetRepoPath C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow -Force -Language pt-br` executado com sucesso.
- **Rollout Nexus**: `install-spec-driven-claude-kit.ps1 -TargetRepoPath C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-nexus -Force -Language pt-br` executado com sucesso.
- **Rollout Lumix**: `install-spec-driven-claude-kit.ps1 -TargetRepoPath C:\Users\otavi\OneDrive\Documentos\GIT\lumix -Force -Language pt-br` executado com sucesso.
- **Rollout Site**: `install-spec-driven-copilot-kit.ps1 -TargetRepoPath C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site -Force -Language pt-br` executado com sucesso.
- **Archives**: validação confirmou 16 ocorrências esperadas de `sdd/<section>/archive/README.md` nos quatro projetos alvo.
- **Regras de contexto**: validação confirmou a política de otimização de contexto em `CLAUDE.md` e `.claude/rules/sdd.md` nos três projetos Claude, e em `.github/copilot-instructions.md` e `.github/instructions/sdd.instructions.md` no projeto Copilot.
- **Sintaxe Bash**: `C:\Program Files\Git\bin\bash.exe -n` executado com sucesso nos scripts `.sh` alterados.

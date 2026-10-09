# LOCAL-REQ-006: Rollout da Governança de Arquivamento nos Projetos Alvo

## 1. Problema
No BATCH-002, implementamos as subpastas `/archive/` e as regras de otimização de contexto (limite de 10 itens correntes) nos boilerplates e templates do `conn2flow-ai-workspace`. No entanto, os projetos reais do usuário que já usam o SDD (Core, Nexus, Lumix e Site) ainda não possuem estas pastas de arquivos criadas nem as novas diretrizes lógicas configuradas.

Como os instaladores atuais preservam a pasta `sdd/` se ela já existe, precisamos:
1. Atualizar a lógica dos scripts instaladores para injetar as subpastas `/archive/` mesmo se a pasta `sdd/` já existir no destino.
2. Rodar os instaladores com a flag `-Force` para atualizar os arquivos de regras de sistema (`CLAUDE.md` e `.github/copilot-instructions.md`) de todos os projetos alvo.

---

## 2. Ajustes Requeridos

### A. Atualização dos Instaladores em `scripts/`
Atualizar os quatro scripts:
*   `scripts/install-spec-driven-claude-kit.ps1`
*   `scripts/install-spec-driven-claude-kit.sh`
*   `scripts/install-spec-driven-copilot-kit.ps1`
*   `scripts/install-spec-driven-copilot-kit.sh`

**Nova Rotina (PowerShell e Bash):**
*   Verificar se a pasta `sdd/` de destino existe.
*   Se existir, criar recursivamente as subpastas `decisions/archive/`, `human-requests/archive/`, `implementation/archive/` e `validation/archive/` se estiverem ausentes.
*   Copiar os arquivos `README.md` explicativos de cada pasta do boilerplate correspondente ao idioma se não existirem no destino.

### B. Rollout nos Repositórios Reais
Rodar os instaladores atualizados utilizando a flag `-Force` (ou `--force`) e a linguagem `pt-br` nos seguintes caminhos de destino no computador do usuário:
1.  **Conn2Flow Core**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow` (Claude Kit)
2.  **Conn2Flow Nexus**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-nexus` (Claude Kit)
3.  **Lumix**: `C:\Users\otavi\OneDrive\Documentos\GIT\lumix` (Claude Kit)
4.  **Conn2Flow Site**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site` (Copilot Kit)

### C. Alinhamento da Governança Local no Workspace
1.  Atualizar o [sdd/implementation/BATCH-INDEX.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/implementation/BATCH-INDEX.md) público do workspace para adicionar o **BATCH-003** como `in-progress` (Otimização de Contexto nos Projetos Alvo).
2.  Atualizar o [sdd/validation/VALIDATION-CHECKLIST.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/validation/VALIDATION-CHECKLIST.md) público para adicionar a seção do `BATCH-003`.

---

## 3. Plano de Validação
*   Verificar se as pastas `archive/` e os respectivos `README.md` constam sob as subpastas do `sdd/` em cada um dos 4 repositórios.
*   Confirmar que os arquivos de regras (`CLAUDE.md` ou `.github/copilot-instructions.md`) de cada projeto foram atualizados para incluir as regras de otimização de contexto.

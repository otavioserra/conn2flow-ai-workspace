# LOCAL-REQ-005: Otimização de Contexto e Governança de Arquivamento (SDD Archive)

## 1. Problema
À medida que os projetos evoluem utilizando o modelo SDD, a quantidade de arquivos de log, decisões e checklists de testes aumenta progressivamente. Se as IAs lerem todo esse histórico desnecessário a cada nova conversa, o limite de contexto é saturado rapidamente, gerando perda de foco das regras essenciais e desperdício de tokens.

Para resolver isso, adotaremos uma **Política de Arquivamento Histórico**:
*   Reter no máximo **10 itens ativos/recentes** nos arquivos principais de controle (`DECISION-LOG.md`, `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md` e requisições).
*   Arquivar os itens antigos em subpastas de `/archive/` locais a cada conceito.
*   Indexar os itens arquivados via tabelas markdown resumidas de 1 linha ligando diretamente para o arquivo histórico.

---

## 2. Ajustes Requeridos

### A. Criação dos Diretórios de Arquivo nos Boilerplates
Criar as subpastas `archive/` contendo um arquivo `README.md` explicativo nos boilerplates de ambos os idiomas:
*   **Boilerplate PT-BR (`pt-br/sdd-boilerplate/sdd/`)**:
    *   `decisions/archive/README.md` (explicando o histórico de decisões).
    *   `human-requests/archive/README.md` (explicando o histórico de requisições).
    *   `implementation/archive/README.md` (explicando o histórico de lotes de tarefas).
    *   `validation/archive/README.md` (explicando o histórico de checklists e evidências).
*   **Boilerplate EN (`en/sdd-boilerplate/sdd/`)**:
    *   `decisions/archive/README.md`
    *   `human-requests/archive/README.md`
    *   `implementation/archive/README.md`
    *   `validation/archive/README.md`

### B. Atualização das Regras de IA nos Templates
Atualizar as instruções de sistema para que as IAs executoras saibam e respeitem o limite de context/arquivamento.

#### Arquivos Modificados nos Templates (`pt-br/templates/` e `en/templates/`):
*   `CLAUDE.md`
*   `.claude/rules/sdd.md`
*   `.github/copilot-instructions.md`
*   `.github/instructions/sdd.instructions.md`

#### Regras a Adicionar:
*   **Otimização de Contexto (Limite de 10 Itens)**: Limitar os arquivos principais (`DECISION-LOG.md`, `BATCH-INDEX.md` e `VALIDATION-CHECKLIST.md`) a apenas os 10 itens mais recentes/ativos. Mover os históricos antigos para a subpasta `/archive/` correspondente e linká-los como tabelas markdown resumidas (1 linha por item) no arquivo principal.

### C. Alinhamento da Governança no Nosso Workspace Local
Aplicar a estrutura no nosso próprio diretório `sdd/`:
1.  Criar as subpastas `archive/` com seus respectivos `README.md` sob `sdd/decisions/`, `sdd/human-requests/`, `sdd/implementation/` e `sdd/validation/`.
2.  Atualizar o [sdd/implementation/BATCH-INDEX.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/implementation/BATCH-INDEX.md) público, definindo esta tarefa como **BATCH-002** (corrigindo a sequência pública de lotes para 000, 001, 002, 003, etc.).
3.  Atualizar o [sdd/validation/VALIDATION-CHECKLIST.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/memory/validation/VALIDATION-CHECKLIST.md) público para adicionar a checklist do BATCH-002.

---

## 3. Plano de Validação
*   Verificar se todas as pastas `archive/` e seus `README.md` foram criados corretamente sob `pt-br/`, `en/` e localmente em `sdd/`.
*   Confirmar que as regras de 10 itens e arquivamento constam nos arquivos de instruções dos templates.
*   Confirmar a reorganização sequencial no `BATCH-INDEX.md` do workspace.

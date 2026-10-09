# LOCAL-REQ-007: Migração do SDD Legado e Governança no Transformamp

## 1. Problema
O repositório privado `transformamp` (localizado em `C:\Users\otavi\OneDrive\Documentos\GIT\transformamp`) possui seu SDD estruturado no modelo antigo sob a pasta `project/site-publico/`. 

Com a evolução do Double Agent SDD Framework, precisamos unificar a estrutura deste projeto com o novo padrão:
1. Mover toda a governança e histórico de especificações para a pasta `sdd/` na raiz do repositório.
2. Atualizar as configurações de IA e regras do Claude Code via instalador, configurando as novas regras de **Otimização de Contexto** (limite de 10 itens ativos e histórico em `/archive/`) e as **Memórias de Engenharia**.
3. Excluir a pasta legada `project/`.

---

## 2. Ajustes Requeridos

### A. Movimentação da Estrutura Física
Mover o conteúdo da pasta antiga `project/site-publico/` para a nova pasta `sdd/` na raiz do repositório `transformamp`:
1.  **Diretórios de Logs**:
    *   Mover `project/site-publico/decisions/` ➔ `sdd/decisions/`
    *   Mover `project/site-publico/human-requests/` ➔ `sdd/human-requests/`
    *   Mover `project/site-publico/implementation/` ➔ `sdd/implementation/`
    *   Mover `project/site-publico/validation/` ➔ `sdd/validation/`
    *   Mover `project/site-publico/change-requests/` ➔ `sdd/change-requests/` (se houver arquivos)
    *   Mover `project/site-publico/reviews/` ➔ `sdd/reviews/` (se houver arquivos)
2.  **Especificações e Manuais**:
    *   Mover `project/site-publico/SPEC.md` ➔ `sdd/SPEC.md`
    *   Mover `project/site-publico/00-START-HERE.md` ➔ `sdd/process/00-START-HERE.md` (criar pasta `process/` se necessário)
    *   Mover `project/site-publico/01-WORKFLOW.md` ➔ `sdd/process/01-WORKFLOW.md`
3.  **Remoção de Arquivos Obsoletos**:
    *   Excluir o arquivo antigo `project/site-publico/README.md` (um novo README moderno será instalado na raiz de `sdd/`).
    *   Garantir que a pasta `project/` esteja vazia e excluí-la permanentemente.

### B. Instalação do Novo Claude Kit
Executar o instalador do Claude Kit a partir do workspace `conn2flow-ai-workspace` apontando para o repositório `transformamp` com as flags `-Force` e `-Language pt-br`:
*   **Comando**:
    ```powershell
    C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\scripts\install-spec-driven-claude-kit.ps1 -TargetRepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\transformamp" -Force -Language pt-br
    ```
*   Isso fará com que o instalador:
    - Crie as pastas `archive/` ausentes em `sdd/decisions/`, `sdd/human-requests/`, `sdd/implementation/` e `sdd/validation/`, injetando os respectivos `README.md` explicativos.
    - Crie os templates das Memórias de Engenharia: `sdd/03-memory-engineering-chief.md` e `sdd/04-memory-engineering-execution.md`.
    - Sobrescreva o `CLAUDE.md` do repositório `transformamp` atualizando as diretrizes de IA para apontarem para a nova pasta `sdd/` e ativando as políticas de otimização de contexto e memórias de engenharia.

### C. Alinhamento de Otimização de Contexto (Saneamento Inicial)
Se o histórico migrado de `DECISION-LOG.md`, `BATCH-INDEX.md` ou `VALIDATION-CHECKLIST.md` contiver mais de 10 registros:
1.  Mover os registros mais antigos que o limite de 10 itens para arquivos indexados sob suas respectivas subpastas `archive/`.
2.  Garantir que os arquivos correntes contenham apenas os 10 itens ativos mais recentes e links de referência para os arquivos sob `archive/`.

---

## 3. Plano de Validação
O Engenheiro Executor deverá validar:
*   [ ] A pasta `project/` foi completamente removida.
*   [ ] A pasta `sdd/` existe na raiz do repositório com as especificações migradas (`sdd/SPEC.md`, `sdd/process/00-START-HERE.md`, `sdd/process/01-WORKFLOW.md`).
*   [ ] As memórias de engenharia (`03-memory-engineering-chief.md` e `04-memory-engineering-execution.md`) existem em `sdd/`.
*   [ ] As subpastas `archive/` com os respectivos `README.md` de apoio foram provisionadas em todas as 4 seções.
*   [ ] O arquivo `CLAUDE.md` na raiz foi atualizado com as novas regras do kit.
*   [ ] `git status` no repositório `transformamp` mostra a movimentação e criação dos arquivos de forma limpa.

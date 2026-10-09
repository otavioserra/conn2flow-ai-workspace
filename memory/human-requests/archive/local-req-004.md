# LOCAL-REQ-004: Migração do 3D-Catalog e Isolamento de Governança Local

## 1. Problema
1. O módulo `3d-catalog` em `conn2flow-site` possui 48 arquivos históricos sob `sdd/3d-catalog/antigo/` que precisam ser catalogados de forma modular no padrão SDD. Além disso, as especificações e decisões ativas que estavam rodando de forma autocontida em `sdd/3d-catalog/` devem ser integradas à raiz global do `/sdd` do site, sob subpastas modulares.
2. Como o repositório `conn2flow-ai-workspace` é um projeto open-source público, não devemos expor caminhos e históricos locais de projetos privados (como BATCH-002 e BATCH-003) no GitHub. Precisamos de uma barreira local de Git para manter esses arquivos em nosso disco, mas ignorados no repositório público.

---

## 2. Ajustes Requeridos

### A. Repositório: `conn2flow-site` (Migração 3D-Catalog)
1.  **Reorganização do Legado Histórico**:
    *   Mover os 48 arquivos históricos sob `sdd/3d-catalog/antigo/` para as pastas de destino:
        *   `sdd/human-requests/3d-catalog/req-XXX-[nome].md`
        *   `sdd/implementation/3d-catalog/batch-XXX-[nome].md`
    *   Marcar o status de cada lote de histórico criado como `complete` e todas as tarefas do checklist como concluídas `[x]`.
2.  **Integração do SDD Ativo**:
    *   Mover os arquivos de decisões ativas em `sdd/3d-catalog/decisions/DECISION-001/002/003.md` para `sdd/decisions/3d-catalog/DECISION-001/002/003.md`.
    *   Mover os lotes em `sdd/3d-catalog/implementation/BATCH-001/002/003/004.md` para `sdd/implementation/3d-catalog/BATCH-001/002/003/004.md`.
    *   Mover o checklist de validação em `sdd/3d-catalog/validation/VALIDATION-CHECKLIST.md` para `sdd/validation/3d-catalog/VALIDATION-CHECKLIST.md`.
    *   Mover a especificação `sdd/3d-catalog/3d-catalog.spec.md` para `sdd/3d-catalog.specs.md` (na raiz do `/sdd` global).
3.  **Limpeza**:
    *   Remover a pasta `sdd/3d-catalog/` antiga que ficará vazia.
    *   Atualizar o arquivo `sdd/implementation/BATCH-INDEX.md` do site para unificar todos os módulos e seus lotes históricos.

### B. Repositório: `conn2flow-ai-workspace` (Isolamento de Governança Local)
1.  **Adicionar Regras de Ignore**:
    *   Inserir no final de `.gitignore` as seguintes regras:
        ```gitignore
        # Local-only SDD governance files (custom local tasks)
        sdd/**/local-*
        sdd/**/local/
        ```
2.  **Remover Rastreamento Git e Renomear**:
    *   Executar `git rm --cached` para remover o rastreamento Git dos seguintes arquivos privados existentes (sem deletá-los fisicamente do disco):
        *   `sdd/human-requests/req-002.md`
        *   `sdd/human-requests/req-003.md`
        *   `sdd/implementation/batch-002-engineering-memories.md`
        *   `sdd/implementation/batch-003-legacy-migration-site.md`
    *   Renomear os arquivos em disco para:
        *   `sdd/human-requests/local-req-002.md`
        *   `sdd/human-requests/local-req-003.md`
        *   `sdd/implementation/local-batch-002-engineering-memories.md`
        *   `sdd/implementation/local-batch-003-legacy-migration-site.md`
3.  **Saneamento de Arquivos Públicos**:
    *   No arquivo `sdd/implementation/BATCH-INDEX.md` público, remover as linhas referentes a `BATCH-002` e `BATCH-003` locais. (A tabela pública deve pular de `BATCH-001` para os próximos lotes abertos do open-source).
    *   No arquivo `sdd/validation/VALIDATION-CHECKLIST.md` público, remover as seções referentes a `BATCH-002` e `BATCH-003` locais.

---

## 3. Plano de Validação
*   Confirmar exclusão da pasta legada `sdd/3d-catalog/` no `conn2flow-site`.
*   Executar `git status` no `conn2flow-ai-workspace` e validar que os arquivos renomeados para `local-` estão marcados como deletados no Git e que suas novas versões locais não aparecem como untracked (graças ao `.gitignore`).

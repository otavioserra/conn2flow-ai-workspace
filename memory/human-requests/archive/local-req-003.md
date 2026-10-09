# REQ-003: Migração Histórica e Saneamento do Legado no Conn2flow-site

## 1. Problema
O repositório `conn2flow-site` possui múltiplos arquivos de desenvolvimento histórico em formato markdown dispersos na pasta `project/` (sob as pastas `host-manager/`, `arquivos/` e `multiusuarios/`), acumulados antes da adoção da governança formal do Spec-Driven Development (SDD). 

Esses arquivos de evolução do código contêm briefings e checklists úteis que precisam ser catalogados como histórico de lotes concluídos. Além disso, existem documentações de integração financeira (`project/paypal/`), logs de sessões antigas de agentes (`project/documentacoes/`) e pastas obsoletas (`project/presentation/`) que poluem a raiz do repositório.

Precisamos estruturar a governança SDD formal na raiz do `conn2flow-site` e organizar todo o legado nas respectivas subpastas.

---

## 2. Ajustes Requeridos

### A. Setup de Governança SDD no `conn2flow-site`
1. Rodar o script instalador atualizado: `scripts/install-spec-driven-copilot-kit.ps1` direcionado para a pasta `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site`.
2. Isso fará a instalação da governança base, regras de agentes de memória de engenharia e migrará a pasta ativa `project/social-networks/` para `/sdd/` na raiz do site.

### B. Criação dos Diretórios Históricos Modulares
Criar os seguintes diretórios sob `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site\sdd\`:
*   `human-requests/host-manager/`, `human-requests/arquivos/`, `human-requests/multiusuarios/`
*   `implementation/host-manager/`, `implementation/arquivos/`, `implementation/multiusuarios/`

### C. Conversão e Cisão de Arquivos
Processar e cindir os arquivos legados de `project/` em arquivos SDD, marcando o status como `complete`:

1.  **Módulo `arquivos`** (Origem: `project/arquivos/`):
    *   `arquivos-v1.0.0.md` ➔ `sdd/human-requests/arquivos/req-001-v1.0.0.md` e `sdd/implementation/arquivos/batch-001-v1.0.0.md`.
    *   `arquivos.md` ➔ `sdd/human-requests/arquivos/req-002-feedback.md` e `sdd/implementation/arquivos/batch-002-feedback.md`.
2.  **Módulo `multiusuarios`** (Origem: `project/multiusuarios/`):
    *   `multiusuarios-v1.0.0.md` ➔ `sdd/human-requests/multiusuarios/req-001-v1.0.0.md` e `sdd/implementation/multiusuarios/batch-001-v1.0.0.md`.
    *   `multiusuarios-v1.0.1.md` ➔ `sdd/human-requests/multiusuarios/req-002-v1.0.1.md` e `sdd/implementation/multiusuarios/batch-002-v1.0.1.md`.
    *   `usuarios-acessos.md` ➔ `sdd/human-requests/multiusuarios/req-003-acessos.md` e `sdd/implementation/multiusuarios/batch-003-acessos.md`.
    *   `multiusuarios.md` ➔ `sdd/human-requests/multiusuarios/req-004-feedback.md` e `sdd/implementation/multiusuarios/batch-004-feedback.md`.
3.  **Módulo `host-manager`** (Origem: `project/host-manager/`):
    *   Cindir as versões `v0.0.1` a `v0.5.9-feedback` (17 arquivos no total) em `req-001` até `req-017` e `batch-001` até `batch-017` sob as subpastas `host-manager/`.

*Nota: Em cada arquivo de lote gerado (`batch-XXX.md`), certifique-se de marcar o status do lote como `complete` e todas as caixas de tarefas como marcadas `[x]`, pois se tratam de tarefas concluídas retroativamente.*

### D. Consolidação de Especificações
Criar um arquivo de especificação consolidado contendo as regras e escopos finais atuais de cada módulo com base nos seus estados finais após o histórico:
*   `sdd/host-manager.specs.md`

### E. Movimentação de Documentações e Históricos
1.  **PayPal Docs**: Mover arquivos de `project/paypal/` para `ai-workspace/pt-br/docs/`.
2.  **Histórico de Agente**: Mover `project/documentacoes/documentacoes.md` para `ai-workspace/pt-br/agents-history/documentacoes.md`.

### F. Remoção do Legado e Limpeza
1.  Excluir a pasta obsoleta `project/presentation/`.
2.  Garantir que a pasta `project/` ficou vazia após todas as migrações e excluí-la.

---

## 3. Arquivos Impactados
*   Estrutura física do repositório `conn2flow-site` sob a pasta `project/` (removida).
*   Nova pasta `sdd/` em `conn2flow-site`.
*   Nova pasta `ai-workspace/pt-br/docs/` e `ai-workspace/pt-br/agents-history/` no `conn2flow-site`.

---

## 4. Plano de Validação
*   O Executor deverá verificar a correta criação dos arquivos e verificar se a pasta `project/` foi completamente limpa.
*   Rodar `git status` no `conn2flow-site` para certificar de que as árvores de arquivos refletem as deleções e adições de forma correta.

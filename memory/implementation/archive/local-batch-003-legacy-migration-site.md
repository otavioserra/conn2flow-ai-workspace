# BATCH-003 - Migração Histórica e Saneamento de Legado no Conn2flow-site

## Escopo do Lote
Este lote gerencia a transição e a reorganização de arquivos legados de desenvolvimento, históricos de agentes, documentações de gateways e a governança SDD ativa no repositório `conn2flow-site`. O objetivo é separar fisicamente os escopos lógicos (como arquivos, multiusuarios, host-manager), arquivar os diários de bordo antigos e remover diretórios redundantes e vazios da raiz do projeto.

---

## Checklist de Implementação

### 1. Setup de Governança Base (sdd/)
- [x] Rodar o script instalador `scripts/install-spec-driven-copilot-kit.ps1` no destino `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site` para estabelecer a pasta `/sdd` e migrar o módulo ativo `social-networks/`.

### 2. Criação dos Diretórios Históricos
- [x] Criar os diretórios modulares sob `/sdd` do site:
  - [x] `human-requests/host-manager/`, `human-requests/arquivos/`, `human-requests/multiusuarios/`
  - [x] `implementation/host-manager/`, `implementation/arquivos/`, `implementation/multiusuarios/`

### 3. Migração do Histórico (Cisão de Arquivos Legados)
- [x] **Módulo `arquivos`**:
  - [x] Cindir `project/arquivos/arquivos-v1.0.0.md` para `sdd/human-requests/arquivos/req-001-v1.0.0.md` e `sdd/implementation/arquivos/batch-001-v1.0.0.md` (status: `complete`, tarefas marcadas como `[x]`).
  - [x] Cindir `project/arquivos/arquivos.md` para `sdd/human-requests/arquivos/req-002-feedback.md` e `sdd/implementation/arquivos/batch-002-feedback.md` (status: `complete`, tarefas marcadas como `[x]`).
- [x] **Módulo `multiusuarios`**:
  - [x] Cindir `project/multiusuarios/multiusuarios-v1.0.0.md` ➔ `req-001-v1.0.0.md` e `batch-001-v1.0.0.md`.
  - [x] Cindir `project/multiusuarios/multiusuarios-v1.0.1.md` ➔ `req-002-v1.0.1.md` e `batch-002-v1.0.1.md`.
  - [x] Cindir `project/multiusuarios/usuarios-acessos.md` ➔ `req-003-acessos.md` e `batch-003-acessos.md`.
  - [x] Cindir `project/multiusuarios/multiusuarios.md` ➔ `req-004-feedback.md` e `batch-004-feedback.md`.
- [x] **Módulo `host-manager`**:
  - [x] Converter as 17 versões (do `v0.0.1` ao `v0.5.9-feedback`) sob as subpastas `host-manager/` (requisições de `req-001` a `req-017` e lotes de `batch-001` a `batch-017` marcados como `complete`).

### 4. Consolidação de Especificação
- [x] Criar o arquivo consolidado de especificações atuais do módulo:
  - [x] `sdd/host-manager.specs.md` com as regras vigentes do módulo.

### 5. Saneamento de Documentos e Histórico de Agente
- [x] Mover arquivos do PayPal de `project/paypal/` para `ai-workspace/pt-br/docs/`:
  - [x] `paypal-instrucoes.md`
  - [x] `pacotes.md`
  - [x] `paypal.md`
- [x] Mover diário de agente de `project/documentacoes/documentacoes.md` para `ai-workspace/pt-br/agents-history/documentacoes.md`.

### 6. Limpeza de Legado
- [x] Excluir a pasta obsoleta `project/presentation/`.
- [x] Excluir a pasta `project/` raiz assim que todas as migrações forem concluídas e ela estiver vazia.

---

## Validação Realizada
Validado localmente via script. Todos os arquivos legados (`arquivos`, `multiusuarios`, `host-manager`) foram cindidos e arquivados no novo padrão `/sdd/`. A pasta `project/` foi validada como vazia e removida, garantindo que a base legada do site foi inteiramente migrada.

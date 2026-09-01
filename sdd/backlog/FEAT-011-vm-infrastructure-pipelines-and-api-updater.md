# FEAT-011 — Adaptação e Resiliência dos Pipelines de Projeto e Diagnóstico para Ambientes VM (HestiaCP / Sem Docker)

* **Status**: `ICEBOX`
* **Tipo**: Infraestrutura / Arquitetura / Pipelines / DX
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Repositórios Alvo**: `conn2flow` (Core / CLI) e `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Historicamente, os comandos de sincronização de projetos (`c2f project:update-all`, `project:sync-core`) e a seção de diagnóstico da extensão foram concebidos assumindo um ambiente local baseado em containers Docker com volumes montados no host Windows (`dev-environment/data/sites/`).

Com a transição para a nova infraestrutura em **Máquinas Virtuais (VMs HestiaCP / Linux dedicado)**:
1. Os sites não vivem em pastas locais do Windows (`path_tests` vazio), fazendo o `project:update-all` falhar por falta de diretório local.
2. O script de atualização via API (`c2f project:update-system` / `update-system.sh`) aborta no Step 1/4 (`Starting update session...`) sem imprimir o erro real retornado pelo cURL/endpoint (ex: certificado autoassinado em domínios `.local`, headers SSL ou payload de erro da API).
3. Várias ações da árvore Dev Tools (como logs do Apache/PHP no Docker, status do Docker) continuam atreladas ao Docker mesmo quando o desenvolvedor opera em ambiente VM.

---

## 📋 Escopo Proposto

### 1. Diagnóstico e Correção do `update-system.sh` / Endpoint `/_api/system/update`
- Adicionar tratamento de cURL resiliente (flag `--insecure` / `-k` para domínios locais de teste `.local` com certificados autoassinados da VM).
- Desbufferizar e exibir o corpo da resposta HTTP / JSON de erro caso o Step 1/4 falhe, eliminando saídas silenciosas.
- Tratar e registrar o ciclo completo de 4 etapas do update via API.

### 2. Polimorfismo de Ambiente no CLI (`c2f`)
- Nos comandos `project:update-all` e `project:sync-core`:
  * Detectar automaticamente se o projeto alvo é **Local / Docker** (possui `path_tests` válido em disco) ou **VM / Remoto** (`path_tests` vazio e `url` configurada).
  * Se for VM, encaminhar de forma transparente para o fluxo de API (`project:update-system`) ou instruir o desenvolvedor com clareza.

### 3. Adaptação na Extensão Dev Tools (VS Code)
- Permitir configurar no `environment.json` ou nos Controles Principais o tipo de ambiente do projeto alvo (`vm` vs `docker`).
- Na árvore de `📁 Projetos Satélites`:
  * Exibir ações contextualizadas para o tipo de ambiente ativo.
- Na seção `🩺 Diagnóstico & Infraestrutura`:
  * Ocultar ou adaptar comandos exclusivos de Docker quando a infraestrutura ativa for VM.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

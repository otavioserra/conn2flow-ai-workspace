# 00 Baseline Architecture

## 1. Objetivo
Este arquivo registra o estado estável aprovado do repositório `conn2flow-ai-workspace` após a consolidação do BATCH-001 (reestruturação bilingue e melhorias nos instaladores). Ele serve como referência para quaisquer novos lotes ou propostas de mudança normativa.

---

## 2. Estrutura de Arquivos do Workspace
O repositório está organizado de forma bilingue na raiz:
- **`pt-br/`**: Diretório contendo os recursos localizados em Português do Brasil:
  - `templates/`: Os quatro kits de IA (`spec-driven` e `private-project` para Claude e Copilot).
  - `sdd-boilerplate/`: Esqueleto inicial limpo da pasta de governança `sdd/`.
- **`en/`**: Diretório contendo os recursos traduzidos e adaptados em Inglês:
  - `templates/`: Os quatro kits de IA correspondentes.
  - `sdd-boilerplate/`: Esqueleto inicial limpo da pasta de governança `sdd/`.
- **`scripts/`**: Pasta contendo os utilitários do workspace:
  - `install-*.ps1` e `install-*.sh`: Scripts de instalação dos kits de IA.
  - `sync-back-template.ps1` e `sync-back-template.sh`: Scripts utilitários de sincronização reversa.
- **`sdd/`**: O diretório de governança local (este diretório).
- **`README.md` & `README-PT-BR.md`**: Documentação de entrada bilingue.

---

## 3. Comportamento dos Instaladores e Sincronizadores
*   **Seleção de Idioma**: Os instaladores aceitam a flag `-Language` (PowerShell) ou `--language` (Bash) e leem os templates correspondentes de `pt-br/` ou `en/`. O padrão é `pt-br`.
*   **Instalação Condicional do Boilerplate**: Se a pasta `sdd/` estiver ausente no destino, o esqueleto de `sdd-boilerplate/sdd` é copiado integralmente. Se já existir, é preservado e apenas hooks de suporte são instalados.
*   **Prefixo de Agente**: O parâmetro `-AgentPrefix` (ou `--agent-prefix`) renomeia os agentes e substitui recursivamente os bindings internos nos kits privados e SDD.
*   **Sync-Back**: Os utilitários de sincronização reversa em `scripts/` puxam alterações locais de prompts e regras em repositórios de clientes de volta para a pasta de templates correspondente no workspace, limpando e normalizando o prefixo de agente.

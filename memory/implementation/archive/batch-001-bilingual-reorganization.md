# BATCH-001 - Reorganização Bilingue & Melhoria dos Instaladores

## Escopo do Lote
Este lote reestrutura o repositório do workspace para suportar os idiomas Inglês e Português em diretórios separados (`en/` e `pt-br/`), traduz os quatro kits de IA para inglês, cria as pastas de boilerplate para os dois idiomas e atualiza os scripts de instalação e sincronização para suportar flags de linguagem e rebatismo de agentes (prefixação).

---

## Checklist de Implementação

### 1. Reorganização das Pastas do Workspace
- [x] Mover templates legados em português para `pt-br/templates/`.
- [x] Criar a pasta `en/templates/` contendo as versões em Inglês de todos os quatro kits.
- [x] Traduzir prompts, subagentes, regras e arquivos de instruções dos kits Claude e Copilot em Inglês.

### 2. Criação dos Boilerplates SDD
- [x] Criar `pt-br/sdd-boilerplate/sdd/` contendo a governança inicial limpa em Português.
- [x] Criar `en/sdd-boilerplate/sdd/` contendo a governança inicial limpa em Inglês.

### 3. Atualização dos Instaladores em `scripts/`
- [x] Atualizar scripts PowerShell e Bash para aceitarem o parâmetro opcional de idioma (`-Language` / `--language`, default `pt-br`).
- [x] Configurar resolução dinâmica de caminhos de origem com base no idioma.
- [x] Implementar a cópia condicional do boilerplate do SDD se a pasta `sdd/` estiver ausente no destino.
- [x] Adicionar suporte a prefixação de agentes (`-AgentPrefix` / `--agent-prefix`) em todos os kits baseados em especificação.

### 4. Criação dos Scripts de Sincronização Reversa (Sync-Back)
- [x] Criar `scripts/sync-back-template.ps1` (PowerShell).
- [x] Criar `scripts/sync-back-template.sh` (Bash).
- [x] Implementar mapeamento inteligente de templates e higienização automática de prefixos de agentes locais no retorno ao workspace.

---

## Validação Realizada
Validação executada com sucesso pelo Executor em cenários de teste locais (Windows e Bash), testando a cópia dos boilerplates, tradução e rebatismo das chaves e o fluxo de sincronização reversa de volta para a raiz do workspace.

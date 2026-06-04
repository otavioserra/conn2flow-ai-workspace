# Validation Checklist

Este documento concentra os checklists de aceitação e os registros de testes empíricos de validação para cada lote funcional.

---

## BATCH-001: Reorganização Bilingue & Instaladores

### 1. Checklist de Aceite Técnico
- [x] Estrutura física contendo as pastas `/en` e `/pt-br` na raiz criadas.
- [x] Templates movidos de `templates/` para `pt-br/templates/`.
- [x] Templates traduzidos gerados em `en/templates/`.
- [x] Boilerplate SDD limpo em Português criado em `pt-br/sdd-boilerplate/sdd/`.
- [x] Boilerplate SDD limpo em Inglês criado em `en/sdd-boilerplate/sdd/`.
- [x] Scripts instaladores (`.ps1` e `.sh` em `scripts/`) atualizados com:
  - Parâmetro de linguagem (`-Language` / `--language`).
  - Resolução dinâmica de caminhos de origem (`pt-br` ou `en`).
  - Cópia do boilerplate se a pasta `sdd/` estiver ausente no destino.
  - Suporte a prefixo de agente (`-AgentPrefix` / `--agent-prefix`) em todos os kits spec-driven.
- [x] Utilitários de sincronização reversa (`sync-back-template.ps1` / `.sh`) criados.

---

### 2. Logs de Testes de Validação
*(Preenchido pelo Executor IA após a realização dos testes)*

#### Teste 1: Instalação Padrão (Sem argumentos opcionais)
*   **Comando Executado**: `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath "temp/test-pt"`
*   **Resultado Esperado**: Criação de `CLAUDE.md`, `.claude/` e cópia do boilerplate `sdd/` em português.
*   **Evidência**: Execução concluída com instalação de `CLAUDE.md`, `.claude/` e dos 11 arquivos do boilerplate em `temp/test-pt-claude/sdd/`, incluindo `README.md`, `SPEC.md`, `process/`, `human-requests/`, `implementation/`, `validation/` e `decisions/`.

#### Teste 2: Instalação em Inglês com Prefixo de Agente
*   **Comando Executado**: `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath "temp/test-en" -Language "en" -AgentPrefix "demo"`
*   **Resultado Esperado**: Criação de `CLAUDE.md`, `.claude/` com agentes renomeados para `demo-sdd-coordinator.md`, etc., referências atualizadas nos arquivos textuais, e boilerplate `sdd/` em inglês.
*   **Evidência**: Execução concluída com criação de `temp/test-en-claude/CLAUDE.md` em inglês, `temp/test-en-claude/.claude/agents/demo-sdd-coordinator.md`, `demo-sdd-implementer.md`, `demo-sdd-reviewer.md` e boilerplate `sdd/` em inglês.

#### Teste 3: Instalação Copilot SDD em Inglês com Prefixo de Agente
*   **Comando Executado**: `scripts/install-spec-driven-copilot-kit.ps1 -TargetRepoPath "temp/test-en-copilot" -Language "en" -AgentPrefix "demo"`
*   **Resultado Esperado**: Criação de `.github/` em inglês, agentes `demo-sdd-*`, prompts ligados aos agentes finais e cópia de `sdd/scripts/hooks/`.
*   **Evidência**: Execução concluída com instalação de `.github/copilot-instructions.md`, `.github/agents/demo-sdd-*.agent.md`, prompts ligados a `demo-sdd-coordinator` e `demo-sdd-reviewer`, além de `sdd/scripts/hooks/sdd-session-start.ps1` e `.sh`.

#### Teste 4: Instalação Claude Privado em Inglês com Prefixo
*   **Comando Executado**: `scripts/install-private-project-claude-kit.ps1 -TargetRepoPath "temp/test-en-private-claude" -Language "en" -AgentPrefix "demo"`
*   **Resultado Esperado**: Criação de `CLAUDE.md`, `.claude/`, `docs/` em inglês, agentes `demo-*` e boilerplate `sdd/` em inglês.
*   **Evidência**: Execução concluída com `temp/test-en-private-claude/.claude/agents/demo-coordinator.md`, `demo-implementer.md`, `demo-reviewer.md`, docs operacionais em inglês e `sdd/` inicial copiado.

#### Teste 5: Instalação Copilot Privado em Inglês com Prefixo
*   **Comando Executado**: `scripts/install-private-project-copilot-kit.ps1 -TargetRepoPath "temp/test-en-private-copilot" -Language "en" -AgentPrefix "demo"`
*   **Resultado Esperado**: Criação de `.github/`, `docs/`, `scripts/hooks/` em inglês, agentes `demo-*` e boilerplate `sdd/` em inglês.
*   **Evidência**: Execução concluída com `.github/agents/demo-*.agent.md`, prompts privados, docs em inglês, `scripts/hooks/private-project-session-start.ps1` e `.sh`, além do boilerplate `sdd/`.

#### Teste 6: Sintaxe dos Scripts Bash
*   **Comando Executado**: `bash -n scripts/install-spec-driven-claude-kit.sh`, `bash -n scripts/install-spec-driven-copilot-kit.sh`, `bash -n scripts/install-private-project-claude-kit.sh`, `bash -n scripts/install-private-project-copilot-kit.sh`, `bash -n scripts/sync-back-template.sh`
*   **Resultado Esperado**: Nenhum erro de sintaxe.
*   **Evidência**: Todos os comandos retornaram sem saida e sem erro.

#### Teste 7: Sync-Back com Normalizacao de Prefixo
*   **Comandos Executados**:
  - `scripts/sync-back-template.ps1 -TargetRepoPath "temp/test-en-copilot" -Language "en"`
  - `scripts/sync-back-template.ps1 -TargetRepoPath "temp/test-en-private-claude" -Language "en"`
  - `bash scripts/sync-back-template.sh temp/test-en-claude --language en`
  - `bash scripts/sync-back-template.sh temp/test-en-private-copilot --language en`
*   **Resultado Esperado**: Detecao automatica do kit correto, inferencia do prefixo `demo`, sincronizacao dos arquivos de IA de volta para `en/templates/...` e reescrita dos nomes de agentes para o padrao generico do template.
*   **Evidência**: As quatro execucoes registraram `Detected kit: ...` e `Detected agent prefix: demo`, sincronizaram arquivos de agentes prefixados para destinos genericos como `sdd-coordinator.agent.md` e `private-project-coordinator.md`, e a busca por `demo-sdd-`, `demo-coordinator`, `demo-implementer` e `demo-reviewer` em `en/templates/**` retornou zero ocorrencias.

#### Teste 8: Fechamento da Reorganizacao Fisica
*   **Comando Executado**: remocao da pasta legada `templates/` apos migracao e validacao dos instaladores.
*   **Resultado Esperado**: Workspace passando a depender apenas de `pt-br/templates/` e `en/templates/`.
*   **Evidência**: Os instaladores e o sync-back operam exclusivamente sobre `../<language>/templates/<kit>`, e a pasta legada da raiz foi removida ao final do batch.

---

## BATCH-002: Memórias de Engenharia & Migrador de Legado nos Instaladores

### 1. Checklist de Aceite Técnico
- [ ] Criação do template `MEMORIA-ENGENHARIA-CHEFIA.md` sob `pt-br/sdd-boilerplate/sdd/` contendo diretrizes do Engenheiro Chefe Humano.
- [ ] Criação do template `MEMORIA-ENGENHARIA-EXECUCAO.md` sob `pt-br/sdd-boilerplate/sdd/` contendo o diário de bordo do executor IA.
- [ ] Criação do template `ENGINEERING-MEMORY-CHIEF.md` sob `en/sdd-boilerplate/sdd/`.
- [ ] Criação do template `ENGINEERING-MEMORY-EXECUTION.md` sob `en/sdd-boilerplate/sdd/`.
- [ ] Atualização de arquivos de regras/instruções nos kits (`CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md`, `.github/instructions/sdd.instructions.md`) em `pt-br` e `en` para incluir a regra de leitura obrigatória das memórias e de escrita compulsória na memória de execução pelo executor IA.
- [ ] Atualização dos scripts instaladores (`install-spec-driven-*.ps1` e `install-spec-driven-*.sh` em `scripts/`) para:
  - Detecção automática de estrutura de governança SDD legada (`project/<frente>/`).
  - Movimentação/migração física da pasta legada para `sdd/` na raiz do destino.
  - Limpeza e remoção do diretório `project/` caso este fique vazio após a movimentação.
  - Substituição textual automatizada nos arquivos de configuração do destino, trocando referências de `project/<frente>/` ou similar por `sdd/`.
  - Cópia dos arquivos de memória correspondentes ao idioma sem sobrescrever caso já existam no destino.

### 2. Logs de Testes de Validação
*(Preenchido pelo Executor IA após a realização dos testes)*

---

## BATCH-003: Migração Histórica e Saneamento de Legado no Conn2flow-site

### 1. Checklist de Aceite Técnico
- [ ] Execução do script instalador do Copilot Kit com sucesso no destino `conn2flow-site`.
- [ ] Criação dos diretórios modulares sob `conn2flow-site/sdd/` para `host-manager`, `arquivos` e `multiusuarios`.
- [ ] Migração física e cisão dos 17 arquivos legados de `project/host-manager/` para `/sdd/human-requests/host-manager/` e `/sdd/implementation/host-manager/` como concluídos.
- [ ] Migração física e cisão dos 2 arquivos de `project/arquivos/` para `/sdd/human-requests/arquivos/` e `/sdd/implementation/arquivos/` como concluídos.
- [ ] Migração física e cisão dos 4 arquivos de `project/multiusuarios/` para `/sdd/human-requests/multiusuarios/` e `/sdd/implementation/multiusuarios/` como concluídos.
- [ ] Consolidação do arquivo `sdd/host-manager.specs.md` com a especificação consolidada e atualizada.
- [ ] Movimentação dos arquivos do PayPal da pasta legada para `ai-workspace/pt-br/docs/`.
- [ ] Movimentação do arquivo de diário de agente para `ai-workspace/pt-br/agents-history/`.
- [ ] Remoção da pasta obsoleta `project/presentation/`.
- [ ] Remoção completa da pasta `project/` após a limpeza de todas as frentes de trabalho.

### 2. Logs de Testes de Validação
*(Preenchido pelo Executor IA após a realização dos testes)*



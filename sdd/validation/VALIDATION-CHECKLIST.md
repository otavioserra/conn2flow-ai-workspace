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
*   **Resultado Esperado**: Detecao automatica do kit correto, inferencia do prefixo `demo`, sincronizacao dos arquivos de IA de volta para `en/templates/**` e reescrita dos nomes de agentes para o padrao generico do template.
*   **Evidência**: As quatro execucoes registraram `Detected kit: ...` e `Detected agent prefix: demo`, sincronizaram arquivos de agentes prefixados para destinos genericos como `sdd-coordinator.agent.md` e `private-project-coordinator.md`, e a busca por `demo-sdd-`, `demo-coordinator`, `demo-implementer` e `demo-reviewer` em `en/templates/**` retornou zero ocorrencias.

#### Teste 8: Fechamento da Reorganizacao Fisica
*   **Comando Executado**: remocao da pasta legada `templates/` apos migracao e validacao dos instaladores.
*   **Resultado Esperado**: Workspace passando a depender apenas de `pt-br/templates/` e `en/templates/`.
*   **Evidência**: Os instaladores e o sync-back operam exclusivamente sobre `../<language>/templates/<kit>`, e a pasta legada da raiz foi removida ao final do batch.

---

## BATCH-002: Otimização de Contexto e Governança de Arquivamento

### 1. Checklist de Aceite Técnico
- [x] `archive/README.md` criado em `pt-br/sdd-boilerplate/sdd/decisions/`, `human-requests/`, `implementation/` e `validation/`.
- [x] `archive/README.md` criado em `en/sdd-boilerplate/sdd/decisions/`, `human-requests/`, `implementation/` e `validation/`.
- [x] `archive/README.md` criado no SDD local em `sdd/decisions/`, `sdd/human-requests/`, `sdd/implementation/` e `sdd/validation/`.
- [x] Regras de limite de 10 itens e arquivamento adicionadas aos templates Claude SDD em PT-BR e EN.
- [x] Regras de limite de 10 itens e arquivamento adicionadas aos templates Copilot SDD em PT-BR e EN.
- [x] `sdd/implementation/BATCH-INDEX.md` renumerado para sequência pública `BATCH-000` a `BATCH-005`, com este lote como `BATCH-002`.

### 2. Logs de Testes de Validação

#### Teste 1: Estrutura de archive nos boilerplates e SDD local
*   **Comando Executado**: `Get-ChildItem -Recurse -Filter README.md | Where-Object { $_.FullName -match '\\archive\\README.md$' }`
*   **Resultado Esperado**: 12 arquivos `archive/README.md` cobrindo boilerplate PT-BR, boilerplate EN e SDD local.
*   **Evidência**: Validação local confirmou 12 ocorrências esperadas.

#### Teste 2: Regras de otimização nos templates
*   **Comando Executado**: `rg -n "Otimização de Contexto|Context Optimization|10 itens|10 current" pt-br/templates en/templates`
*   **Resultado Esperado**: Seções de arquivamento presentes nos 8 arquivos de instruções SDD Claude/Copilot.
*   **Evidência**: Validação local confirmou as seções nos 8 arquivos-alvo.

#### Teste 3: Sequência pública de batches
*   **Comando Executado**: leitura de `sdd/implementation/BATCH-INDEX.md` e `sdd/implementation/batch-002-context-optimization.md`.
*   **Resultado Esperado**: Índice público sequencial com `BATCH-002` em `in-progress` para este lote e CI renumerado para `BATCH-005`.
*   **Evidência**: Índice atualizado com sequência `BATCH-000`, `BATCH-001`, `BATCH-002`, `BATCH-003`, `BATCH-004`, `BATCH-005`.

---

## BATCH-003: Otimização de Contexto nos Projetos Alvo

### 1. Checklist de Aceite Técnico
- [x] Scripts Claude SDD (`.ps1` e `.sh`) atualizados para criar `archive/README.md` em SDD preexistente.
- [x] Scripts Copilot SDD (`.ps1` e `.sh`) atualizados para criar `archive/README.md` em SDD preexistente.
- [x] Conn2Flow Core atualizado via Claude Kit com `-Force` e `-Language pt-br`.
- [x] Conn2Flow Nexus atualizado via Claude Kit com `-Force` e `-Language pt-br`.
- [x] Lumix atualizado via Claude Kit com `-Force` e `-Language pt-br`.
- [x] Conn2Flow Site atualizado via Copilot Kit com `-Force` e `-Language pt-br`.
- [x] Os quatro projetos possuem `archive/README.md` em `decisions/`, `human-requests/`, `implementation/` e `validation/`.
- [x] Arquivos de regras dos quatro projetos incluem a política de otimização de contexto.

### 2. Logs de Testes de Validação

#### Teste 1: Rollout com instaladores atualizados
*   **Comandos Executados**:
    - `install-spec-driven-claude-kit.ps1 -TargetRepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow" -Force -Language pt-br`
    - `install-spec-driven-claude-kit.ps1 -TargetRepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-nexus" -Force -Language pt-br`
    - `install-spec-driven-claude-kit.ps1 -TargetRepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\lumix" -Force -Language pt-br`
    - `install-spec-driven-copilot-kit.ps1 -TargetRepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site" -Force -Language pt-br`
*   **Resultado Esperado**: Atualização dos arquivos de regras e criação dos archives faltantes nos quatro projetos.
*   **Evidência**: Os quatro comandos concluíram com sucesso e registraram instalação dos quatro `archive/README.md` por projeto.

#### Teste 2: Estrutura de archive nos projetos alvo
*   **Comando Executado**: verificação PowerShell de `sdd/decisions/archive/README.md`, `sdd/human-requests/archive/README.md`, `sdd/implementation/archive/README.md` e `sdd/validation/archive/README.md` em Core, Nexus, Lumix e Site.
*   **Resultado Esperado**: 16 caminhos existentes.
*   **Evidência**: Validação retornou `True` para os 16 caminhos esperados.

#### Teste 3: Regras de otimização nos projetos alvo
*   **Comando Executado**: busca PowerShell por `Otimização de Contexto` / `10 itens` nos arquivos de regras dos quatro projetos.
*   **Resultado Esperado**: Política encontrada em `CLAUDE.md` e `.claude/rules/sdd.md` nos projetos Claude; e em `.github/copilot-instructions.md` e `.github/instructions/sdd.instructions.md` no projeto Copilot.
*   **Evidência**: Validação retornou `HasContextPolicy = True` para os 8 arquivos verificados.

#### Teste 4: Sintaxe dos scripts Bash alterados
*   **Comando Executado**: `C:\Program Files\Git\bin\bash.exe -n` nos scripts `install-spec-driven-claude-kit.sh` e `install-spec-driven-copilot-kit.sh`.
*   **Resultado Esperado**: Nenhum erro de sintaxe.
*   **Evidência**: Ambos os comandos retornaram sem saída e com exit code 0.

---

## BATCH-004: Integração e Protocolo MCP para Agentes Locais

*(Em breve)*

---

## BATCH-005: Validador de Governança SDD (GitHub Actions CI/CD)

*(Em breve)*

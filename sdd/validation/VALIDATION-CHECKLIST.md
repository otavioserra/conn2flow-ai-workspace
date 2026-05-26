# Validation Checklist

Este documento concentra os checklists de aceitação e os registros de testes empíricos de validação para cada lote funcional.

---

## BATCH-001: Reorganização Bilingue & Instaladores

### 1. Checklist de Aceite Técnico
- [ ] Estrutura física contendo as pastas `/en` e `/pt-br` na raiz criadas.
- [ ] Templates movidos de `templates/` para `pt-br/templates/`.
- [ ] Templates traduzidos gerados em `en/templates/`.
- [ ] Boilerplate SDD limpo em Português criado em `pt-br/sdd-boilerplate/sdd/`.
- [ ] Boilerplate SDD limpo em Inglês criado em `en/sdd-boilerplate/sdd/`.
- [ ] Scripts instaladores (`.ps1` e `.sh` em `scripts/`) atualizados com:
  - Parâmetro de linguagem (`-Language` / `--language`).
  - Resolução dinâmica de caminhos de origem (`pt-br` ou `en`).
  - Cópia do boilerplate se a pasta `sdd/` estiver ausente no destino.
  - Suporte a prefixo de agente (`-AgentPrefix` / `--agent-prefix`) em todos os kits spec-driven.
- [ ] Utilitários de sincronização reversa (`sync-back-template.ps1` / `.sh`) criados.

---

### 2. Logs de Testes de Validação
*(Preenchido pelo Executor IA após a realização dos testes)*

#### Teste 1: Instalação Padrão (Sem argumentos opcionais)
*   **Comando Executado**: `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath "temp/test-pt"`
*   **Resultado Esperado**: Criação de `CLAUDE.md`, `.claude/` e cópia do boilerplate `sdd/` em português.
*   **Evidência**: *(Colar logs do terminal e árvore de arquivos)*

#### Teste 2: Instalação em Inglês com Prefixo de Agente
*   **Comando Executado**: `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath "temp/test-en" -Language "en" -AgentPrefix "demo"`
*   **Resultado Esperado**: Criação de `CLAUDE.md`, `.claude/` com agentes renomeados para `demo-sdd-coordinator.md`, etc., referências atualizadas nos arquivos textuais, e boilerplate `sdd/` em inglês.
*   **Evidência**: *(Colar logs do terminal)*

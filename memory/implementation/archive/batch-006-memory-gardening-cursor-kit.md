# BATCH-006 — Memory Gardening e Cursor Kit

## Escopo do Lote

Implementar a governança de poda e destilação de memórias, criar o kit SDD bilíngue para Cursor e aplicar ambos em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

## Checklist de Implementação

### 1. Governança e skills

- [x] Criar as diretrizes normativas de Memory Gardening.
- [x] Disponibilizar `sdd-memory-gardening` nos templates PT-BR e EN.
- [x] Destilar as cinco skills Core Conn2Flow.
- [x] Criar as skills específicas de Lumix, Transforma MP e Conn2Flow Site.
- [x] Disponibilizar as skills dos projetos em `.claude/skills/` e `.cursor/skills/`.

### 2. Cursor Kit

- [x] Criar templates PT-BR e EN com `.cursorrules`, `.cursor/rules/sdd.mdc` e skill de gardening.
- [x] Criar instaladores PowerShell e Bash com idioma, force, prefixo e preservação de arquivos.
- [x] Garantir criação do boilerplate quando ausente e injeção não destrutiva de `archive/` em SDD existente.
- [x] Atualizar README em inglês e português.

### 3. Rollout e poda

- [x] Instalar o Cursor Kit em `conn2flow`.
- [x] Instalar o Cursor Kit em `lumix`.
- [x] Instalar o Cursor Kit em `transformamp`.
- [x] Instalar o Cursor Kit em `conn2flow-site`.
- [x] Podar as quatro memórias de execução para menos de 10 KB, preservando 3 a 5 tarefas recentes.

### 4. Validação

- [x] Validar sintaxe dos dois instaladores.
- [x] Validar instalação PT-BR e EN em diretórios temporários.
- [x] Validar preservação sem `Force` e sobrescrita com `Force`.
- [x] Validar frontmatter e descoberta física de regras/skills.
- [x] Registrar tamanhos finais e evidências em `sdd/validation/VALIDATION-CHECKLIST.md`.

## Resultado

Lote concluído em 2026-07-30. Os quatro projetos receberam regras/skills do Cursor, e as memórias ficaram entre 2,3 KB e 4,5 KB, com no máximo 50 linhas.

# BATCH-007 — Backlog de Ideias, Intake Gate e Gemini Kit

## Escopo do lote

Criar a incubadora oficial `sdd/backlog/`, impedir que executores implementem ideias sem promoção humana, completar o kit Gemini bilíngue e aplicar a governança em `conn2flow`, `lumix`, `transformamp` e `conn2flow-site`.

## Checklist de implementação

### 1. Backlog e Intake Gate

- [x] Criar `README.md`, `BACKLOG-INDEX.md` e `archive/README.md` nos boilerplates PT-BR e EN.
- [x] Documentar tipos `Feature`, `Epic`, `Spike` e `Architecture`.
- [x] Documentar estados `ICEBOX`, `IN-DISCUSSION` e `READY`.
- [x] Exigir promoção humana para `sdd/human-requests/`, atualização de `CURRENT.md` e associação a batch.
- [x] Adicionar a proibição de implementação direta aos arquivos principais de Claude, Copilot, Cursor e Gemini em ambos os idiomas.

### 2. Instaladores e Gemini Kit

- [x] Atualizar instaladores Claude, Copilot e Cursor em PowerShell/Bash para provisionar backlog ausente sem sobrescrever arquivos existentes.
- [x] Criar o Gemini Kit PT-BR/EN com `GEMINI.md`, `.gemini/settings.json`, `.gemini/styleguide.md`, `.geminiignore` e `.aiexclude`.
- [x] Criar instaladores Gemini em PowerShell/Bash com target, `Force`, prefixo e idioma.
- [x] Atualizar README em inglês e português com o fluxo do backlog e a configuração oficial do Gemini CLI.

### 3. Rollout

- [x] Aplicar o Gemini Kit e o backlog em `conn2flow`.
- [x] Aplicar o Gemini Kit e o backlog em `lumix`.
- [x] Aplicar o Gemini Kit e o backlog em `transformamp`.
- [x] Aplicar o Gemini Kit e o backlog em `conn2flow-site`.
- [x] Preservar SDD, memórias e customizações preexistentes.

### 4. Validação

- [x] Validar sintaxe dos quatro instaladores PowerShell e quatro Bash.
- [x] Validar JSON dos templates e rollouts Gemini.
- [x] Testar funcionalmente os quatro instaladores PowerShell contra SDD preexistente com sentinel.
- [x] Validar os 14 arquivos de instruções protegidos pelo Intake Gate.
- [x] Validar presença e identidade do rollout nos quatro repositórios.
- [x] Executar `git diff --check` e `git diff --cached --check` nos cinco repositórios.

## Resultado

Lote concluído em 2026-07-30. O backlog passou a ser uma área formal de ideação não executável; a promoção humana tornou-se o gate obrigatório; e os quatro projetos receberam o Gemini Kit e a estrutura de backlog sem sobrescrita do SDD existente.

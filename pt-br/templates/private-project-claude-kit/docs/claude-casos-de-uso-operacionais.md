# Casos de uso operacionais no Claude Code

## Mapa mental rápido

- `CLAUDE.md`: regras sempre ativas.
- `.claude/rules/`: regras por path.
- `/skills`: entradas reutilizáveis de workflow.
- `.claude/agents/`: subagentes especializados.
- `.claude/settings.json`: permissões, linguagem e hooks pequenos.
- `/hooks`: automação determinística quando precisar reforçar um ponto do fluxo.

## Quando usar cada peça

### Nova demanda em projeto privado

Use `/private-project-kickoff`.

### Retomada depois de pausa ou mudança manual

Use `/continue-private-work` e diga explicitamente o que mudou.

### Review antes de fechar a tarefa

Use `/review-private-work`.

### Regras que devem valer em toda sessão

Coloque em `CLAUDE.md`.

### Regras que só importam em certos arquivos

Coloque em `.claude/rules/` com `paths`.

### Runbooks recorrentes

Coloque em `.claude/skills/`.

### Delegação focada

Use subagentes em `.claude/agents/`.

### Automação pequena e determinística

Use hooks em `.claude/settings.json`.
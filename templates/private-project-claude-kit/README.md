# Private Project Claude Kit

Este kit é um ponto de partida para projetos privados baseados em Conn2Flow usando Claude Code.

## O que entra no kit

- `CLAUDE.md`: regras sempre ativas do repositório privado.
- `.claude/settings.json`: configuração compartilhada do Claude Code no projeto.
- `.claude/rules/*.md`: regras path-specific para PHP do gestor e SDD local em `project/`.
- `.claude/skills/*/SKILL.md`: slash commands e runbooks on-demand.
- `.claude/agents/*.md`: subagentes leves para coordenação, implementação e review.
- `docs/*.md`: documentação operacional para uso humano do workflow.

## Estrutura do workflow

- `CLAUDE.md` substitui o papel de instruções sempre ativas.
- `.claude/rules/` substitui regras path-specific.
- `.claude/skills/` substitui prompts reutilizáveis e runbooks sob demanda.
- `.claude/agents/` substitui agents leves de coordenação, implementação e review.
- `.claude/settings.json` centraliza linguagem, permissões e hooks pequenos.

## Instalação

1. A partir da raiz de `conn2flow-ai-workspace`, rode `scripts/install-private-project-claude-kit.ps1 -TargetRepoPath <repo>` no Windows ou `scripts/install-private-project-claude-kit.sh <repo>` em Bash.
2. Se preferir manualmente, copie `CLAUDE.md`, `.claude/` e `docs/` para a raiz do repositório alvo.
3. Abra o Claude Code no VS Code e valide o carregamento com `/memory`, `/skills`, `/agents`, `/hooks` e `/status`.

## Opção de prefixo para agents

Se quiser subagentes com nome do projeto, use o instalador com prefixo opcional.

- PowerShell: `scripts/install-private-project-claude-kit.ps1 -TargetRepoPath <repo> -AgentPrefix transformamp`
- Bash: `scripts/install-private-project-claude-kit.sh <repo> --agent-prefix transformamp`

Isso renomeia automaticamente os subagentes `private-project-*` para `<prefix>-*` sem alterar os nomes dos skills.
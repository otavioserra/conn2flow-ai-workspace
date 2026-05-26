# Spec-Driven Project Claude Kit

Este kit é um ponto de partida para repositórios que usam SDD com `sdd/` como fonte normativa e querem operar isso no Claude Code.

## O que entra no kit

- `CLAUDE.md`: regras sempre ativas do fluxo SDD.
- `.claude/settings.json`: configuração compartilhada do Claude Code.
- `.claude/rules/sdd.md`: regra path-specific para artefatos em `sdd/`.
- `.claude/skills/*/SKILL.md`: slash commands e runbooks reutilizáveis do SDD.
- `.claude/agents/*.md`: subagentes leves para coordenação, implementação e review.

## Instalação

1. A partir da raiz de `conn2flow-ai-workspace`, rode `scripts/install-spec-driven-claude-kit.ps1 -TargetRepoPath <repo>` no Windows ou `scripts/install-spec-driven-claude-kit.sh <repo>` em Bash.
2. Se preferir manualmente, copie `CLAUDE.md` e `.claude/` para a raiz do repositório alvo.
3. O instalador cria `sdd/human-requests/README.md` se essa pasta ainda não existir.
4. Valide o carregamento no Claude Code com `/memory`, `/skills`, `/agents`, `/hooks` e `/status`.
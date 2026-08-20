# Private Project Copilot Kit

Este kit é um ponto de partida para projetos privados baseados em Conn2Flow.

## O que entra no kit

- `.github/copilot-instructions.md`: regras sempre ativas para o repositório privado.
- `.github/instructions/php-gestor.instructions.md`: convenções específicas para arquivos PHP do gestor.
- `.github/instructions/project-sdd.instructions.md`: regras para frentes locais que já usam SDD dentro de `project/`.
- `.github/agents/*.agent.md`: agentes leves para coordenação, implementação e review.
- `.github/prompts/*.prompt.md`: entradas rápidas para kickoff e retomada.
- `.github/skills/*/SKILL.md`: runbooks reutilizáveis para decisão de escopo, integração de módulo do gestor, validação local e SDD local.
- `docs/*.md`: documentação operacional para o fluxo humano com o agente.

## Documentação adicional recomendada

- `docs/workflow-completo.md`: fluxo principal de kickoff, retomada e review.
- `docs/copilot-casos-de-uso-operacionais.md`: mapa de quando usar prompt, agent, skill, hook, handoff e subagente.
- `docs/gestor-modulos-integracao-pratica.md`: guia para evitar módulo do gestor estruturalmente incompleto.

## Skills adicionais do kit

- `gestor-module-integration`: protege módulos do gestor contra bootstrap, JSON, dispatch ou AJAX incompletos.
- `project-sdd-context`: ajuda a operar batches, reviews e validation em frentes locais dentro de `project/`.

## Fluxo recomendado

1. Instale este kit com `scripts/install-private-project-copilot-kit.ps1 -TargetRepoPath <repo>` ou `scripts/install-private-project-copilot-kit.sh <repo>` a partir da raiz de `conn2flow-ai-workspace`.
2. Se preferir manualmente, copie `.github`, `docs` e `scripts/hooks` para a raiz do repositório privado.
3. Ajuste nomes, paths e exemplos para o projeto real.
4. Valide carregamento no Chat Diagnostics.
5. Comece novas demandas com `/private-project-kickoff`, retome com `/continue-private-work` e revise com `/review-private-work`.

## Opção de prefixo para agents

Se quiser agents com nome do projeto, use o instalador com prefixo opcional.

- PowerShell: `scripts/install-private-project-copilot-kit.ps1 -TargetRepoPath <repo> -AgentPrefix transformamp`
- Bash: `scripts/install-private-project-copilot-kit.sh <repo> --agent-prefix transformamp`

Isso renomeia automaticamente os agents e atualiza as referências internas de `private-project-*` para `<prefix>-*`.
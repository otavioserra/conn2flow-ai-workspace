# Hooks e skills no Claude Code

## Quando usar skills

Use skills para workflows ou runbooks que você quer acionar por slash command ou deixar disponíveis para o Claude carregar automaticamente.

Exemplos deste kit:

- `/private-project-kickoff`
- `/continue-private-work`
- `/review-private-work`
- `private-project-context`
- `project-sdd-context`

## Quando usar subagentes

Use subagentes para delegação curta e focada dentro da mesma tarefa, como coordenação, implementação ou review em contexto separado.

## Quando usar hooks

Use hooks para automações pequenas e determinísticas, não para substituir raciocínio.

Boa função para hook:

- relembrar contexto depois de `/compact`
- bloquear edições em arquivos sensíveis
- rodar formatador ou validador depois de certas ferramentas

Má função para hook:

- decidir arquitetura
- investigar negócio
- substituir `CLAUDE.md`, rules, skills ou subagentes
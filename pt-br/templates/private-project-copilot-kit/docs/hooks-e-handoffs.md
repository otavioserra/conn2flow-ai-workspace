# Hooks e handoffs

## Quando usar handoffs

Use handoffs quando você quer uma transição guiada entre etapas com aprovação humana entre elas.

Exemplos:

- coordenação -> implementação
- implementação -> review
- review -> correções finais

## Quando usar subagentes

Use subagentes para delegação curta e focada dentro da mesma tarefa, como:

- pesquisar documentação externa recente
- revisar riscos de regressão
- levantar arquivos prováveis antes da implementação

## Quando usar hooks

Use hooks para automações determinísticas e pequenas, não para raciocínio complexo.

Boas ideias de hook:

- avisar sobre arquivos sensíveis antes de editar
- lembrar de validar quando certos paths forem tocados
- sugerir um prompt de continuidade ao final de uma tarefa longa

Evite usar hook para:

- decidir arquitetura
- fazer pesquisa ampla
- substituir prompts, skills ou agentes

## Regra prática

Prompts iniciam fluxos, skills carregam runbooks, agentes moldam o comportamento e handoffs costuram as etapas. Hooks devem ficar como guardrails pequenos e previsíveis.

## Hook do kit

O arquivo `.github/hooks/private-project-session-start.json` injeta um lembrete curto no início da sessão. Os scripts correspondentes ficam em `scripts/hooks/` para que o kit possa ser instalado por cópia ou por script sem depender de paths externos.
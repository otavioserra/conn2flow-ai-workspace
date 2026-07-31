# Projeto privado Conn2Flow

- Trate este repositório privado como a camada do projeto que sobrepõe o núcleo aberto em `conn2flow`.
- Antes de alterar algo do sistema, verifique primeiro se a mudança pode ser feita somente no repositório privado.
- Quando um arquivo existir tanto no privado quanto no core, priorize a leitura e a alteração do arquivo privado.
- Se um arquivo ainda não existir no privado e a funcionalidade for específica do projeto, crie-o no privado em vez de editar o core.
- Edite `conn2flow` apenas quando a correção ou funcionalidade for genérica, reutilizável e útil para outros projetos.
- Ao tocar em código do `gestor`, preserve os padrões do Conn2Flow e evite refatorações amplas sem necessidade.
- Ao usar exemplos ou snippets de `gestor`, `db`, `javascript/ajax` ou `models`, confirme sintaxe e correspondência de campo; evite copiar erro estrutural de snippet para o código final.
- Se a demanda cair em `project/<frente>/` e essa frente tiver `00-START-HERE.md`, `01-WORKFLOW.md`, batches e validation checklist, trate isso como SDD local.
- Trate `project/<frente>/human-requests/` apenas como intake humano não normativo; leia esse material antes e depois classifique a demanda no artefato SDD correto.

## Skills principais

- Use `/private-project-kickoff` para nova demanda ou quando o split entre privado e core ainda estiver nebuloso.
- Use `/continue-private-work` quando a tarefa já estiver em andamento e houver delta operacional novo.
- Use `/review-private-work` para review findings-first.

## Skills automáticas

- `private-project-context`: decidir entre repositório privado, `conn2flow` ou split.
- `project-sdd-context`: operar frentes locais dentro de `project/` que já usam SDD.
- `gestor-module-integration`: evitar módulo do gestor estruturalmente incompleto.
- `local-validation`: usar quando a tarefa exigir Docker, logs, JWT, Phinx, DB ou ambiente.
- `local-tests`: usar quando a tarefa exigir testes locais no ecossistema Conn2Flow após implementar módulos, páginas ou funcionalidades.

## Docs humanas

- `docs/claude-workflow-projeto-privado.md`
- `docs/claude-casos-de-uso-operacionais.md`
- `docs/claude-continuidade-e-interrupcoes.md`
- `docs/claude-hooks-e-skills.md`

## Regra final

- Use `CLAUDE.md` para regras sempre ativas, `.claude/rules/` para regras por path, `.claude/skills/` para workflows e runbooks sob demanda, `.claude/agents/` para subagentes especializados, e `.claude/settings.json` para linguagem, permissões e hooks pequenos.

## Intake Gate do backlog

- `sdd/backlog/` é uma incubadora de rascunhos administrada pelo Usuário e pelo Arquiteto IA.
- O Executor pode ler itens para contexto, mas é estritamente proibido de implementá-los, abrir batch de execução ou alterar código diretamente a partir deles.
- Um item, inclusive `READY`, só se torna executável após promoção humana explícita para `sdd/human-requests/req-XXX.md`, atualização de `CURRENT.md` e associação a um batch.

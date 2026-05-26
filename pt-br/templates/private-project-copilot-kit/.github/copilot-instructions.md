# Instruções principais do projeto privado

- Trate o repositório privado como a camada do projeto que sobrepõe o núcleo aberto em `conn2flow`.
- Antes de alterar algo do sistema, verifique primeiro se a mudança pode ser feita somente no repositório privado.
- Quando um arquivo existir tanto no projeto privado quanto no núcleo, priorize a leitura e a alteração do arquivo privado.
- Se um arquivo ainda não existir no privado e a funcionalidade for específica do projeto, crie o arquivo no repositório privado em vez de editar o núcleo.
- Edite `conn2flow` apenas quando a correção ou funcionalidade for genérica, reutilizável e útil para todos os projetos.
- Ao tocar em código do `gestor`, preserve os padrões já existentes do Conn2Flow e evite refatorações amplas sem necessidade.
- Para criação ou refactor estrutural de módulo do gestor, carregue a skill [gestor-module-integration](./skills/gestor-module-integration/SKILL.md).
- Ao usar exemplos ou snippets de `gestor`, `db`, `javascript/ajax` ou `models`, confirme sintaxe e correspondência de campo; evite copiar erros de snippet para o código final.
- Para tarefas multi-etapa, prefira coordenar o trabalho com agentes especializados, prompts e skills, em vez de concentrar tudo em um único prompt longo.
- Quando a demanda cair em `project/<frente>/` e a frente já tiver `00-START-HERE.md`, `01-WORKFLOW.md`, batches e validation checklist, trate isso como SDD local daquele escopo e use a skill [project-sdd-context](./skills/project-sdd-context/SKILL.md).
- Quando existir `project/<frente>/human-requests/`, trate essa pasta apenas como intake humano não normativo. Se a demanda vier como arquivo Markdown ou como a própria pasta, leia esse material primeiro e depois classifique a demanda no artefato SDD correto.
- Para tarefas de ambiente, validação local, Docker, token JWT, Phinx e logs, carregue a skill [local-validation](./skills/local-validation/SKILL.md).
- Para decidir corretamente entre o repositório privado e `conn2flow`, use a skill [private-project-context](./skills/private-project-context/SKILL.md).
- Consulte também [workflow-completo.md](../docs/workflow-completo.md), [copilot-casos-de-uso-operacionais.md](../docs/copilot-casos-de-uso-operacionais.md), [continuidade-e-interrupcoes.md](../docs/continuidade-e-interrupcoes.md) e [gestor-modulos-integracao-pratica.md](../docs/gestor-modulos-integracao-pratica.md).
- O hook [private-project-session-start.json](./hooks/private-project-session-start.json) injeta um lembrete curto de escopo no início da sessão; mantenha esse hook pequeno e audível.
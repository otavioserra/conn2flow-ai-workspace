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

## Intake Gate do backlog

- `sdd/backlog/` é uma incubadora de leitura exclusiva do Usuário e do Arquiteto IA.
- O Executor pode consultar itens, mas não pode implementá-los, abrir batch executável ou alterar código diretamente a partir deles.
- Mesmo `READY`, o item exige promoção humana para `sdd/human-requests/`, atualização de `CURRENT.md` e batch associado.


## 📋 Protocolo de Transparência & Checklist Vivo (Live Todo List)

- Ao iniciar qualquer requisição ou lote, renderize imediatamente a lista completa de tarefas (`Todo List`) com caixas de seleção `[ ]`.
- A cada término de etapa/comando relevante, atualize e re-exiba a lista marcando `[x]` nas etapas concluídas e destacando a etapa atual (`⏳ [EM ANDAMENTO]`).
- Nunca execute sequências longas de comandos sem atualizar o status visual para o usuário.

## 🛡️ Espectro de 3 Níveis de Autonomia de IA

1. **Nível 1: SUPERVISIONADO (Padrão Mandatório / Human-in-the-Loop)**:
   - O agente implementa código e executa testes, mas **NÃO realiza commit, push ou deploy automático**.
   - O desenvolvedor revisa e aprova as mudanças no chat/IDE antes da consolidação.

2. **Nível 2: AUTÔNOMO MONITORADO (Live Autopilot / Glass-Box no Chat)**:
   - Ativado quando a requisição contiver `modo: autonomo_monitorado` ou o usuário autorizar expressamente o acompanhamento contínuo na tela.
   - O agente executa a esteira completa com **Live Todo List (`[ ]` ➔ `[x]`) visível e atualizado em tempo real**:
     * Criação de branch/worktree isolada (`feat/req-XXX`).
     * Codificação e compilação de recursos (`c2f resources:sync`).
     * Execução de testes automatizados (`c2f db:test`).
     * **DEPLOY EXCLUSIVAMENTE EM AMBIENTE DE TESTE LOCAL** (`c2f manager:update-all` ou Docker local).
     * ⛔ **REGRA INVIOLÁVEL DE SEGURANÇA: NUNCA REALIZAR DEPLOY AUTOMÁTICO EM AMBIENTE DE PRODUÇÃO OU SERVIDORES REMOTOS.**
     * Commit semântico e push na branch de trabalho.
     * Relatório final com logs de execução e evidências de validação.

3. **Nível 3: AUTÔNOMO HEADLESS (Background Silencioso / Black-Box)**:
   - Ativado quando a requisição contiver `modo: autonomo_headless`.
   - O agente executa toda a esteira em segundo plano isolado via MCP Hub / Git Worktrees, emitindo notificação e relatório consolidado apenas ao término.


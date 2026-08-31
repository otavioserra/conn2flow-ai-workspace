# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-041 — Correção de Workflow Run no Watch e Limpeza de Rascunho](implementation/batch-041.md)
>
> **Lote atual:** [BATCH-042 — Propagação Global da Governança Multi-Repositório](implementation/batch-042.md), em andamento.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-041:** seleção temporal de workflow run e limpeza garantida de rascunho de release implementadas com 47 testes e VSIX instalado.
- **2026-08-31 — REQ-040 / BATCH-042:** formalizada requisição para propagar a regra inviolável de identificação mandatória de repositório e caminho absoluto para o Core (`conn2flow`), skill `sdd-workflow` (com `c2f ai:sync`) e boilerplates de novos projetos.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- A REQ-040 está `APPROVED` e o BATCH-042 está `READY_FOR_EXECUTION` em modo supervisionado.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Pendência imediata

- Agente Executor assumir a tarefa via `sdd/handoffs/CURRENT-HANDOFF.md`, renderizar a Live Todo List e realizar a implementação do BATCH-042.




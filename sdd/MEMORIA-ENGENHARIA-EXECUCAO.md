# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-042 — Propagação Global da Governança Multi-Repositório](implementation/batch-042.md)
>
> **Lote atual:** [BATCH-043 — Teste de Integração End-to-End da Tríade via MCP Hub](implementation/batch-043.md), em andamento.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-042:** propagada a regra inviolável de identificação mandatória de repositório e caminho absoluto para o Core (`conn2flow`), skill `sdd-workflow` (com `c2f ai:sync` para todas as 36 skills) e boilerplates de novos projetos. Homologado com 47/47 testes.
- **2026-08-31 — REQ-041 / BATCH-043:** formalizada requisição para teste fim-a-fim da Tríade de Agentes conectada via MCP Hub (`dispatch_task` ➔ implementação do probe ➔ `report_completion` ➔ auditoria independente).

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- A REQ-041 está `APPROVED` e o BATCH-043 está `READY_FOR_EXECUTION` em modo supervisionado.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Pendência imediata

- Macro-Arquiteto despachar tarefa via MCP Hub (`dispatch_task`) e fornecer os Starter Prompts para acionamento do Executor e Revisor.






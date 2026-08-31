# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-039 — Estabilização de Preview MPE, Release em 2 Fases e Docs Bilíngues Pré-Release](implementation/batch-039.md)
>
> **Lote atual:** [BATCH-040 — Reatividade de Versão nos Rascunhos e Eliminação de Clique Mudo](implementation/batch-040.md), em andamento.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-039:** implementado lifecycle único de preview Markdown sem encadeamento de abas e separação em duas fases de release com 38 testes.
- **2026-08-31 — REQ-038 / BATCH-040:** formalizada requisição para implementar reatividade completa de campos dependentes (tag message, commit message, release notes) ao alterar o incremento de versão no formulário de preparação e eliminar o clique mudo no item "Executar Release" na árvore do VS Code (comando sempre registrado com feedback explicativo de bloqueio).

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- A REQ-038 está `APPROVED` e o BATCH-040 está `READY_FOR_EXECUTION` em modo supervisionado.
- Os itens de execução de release na árvore devem sempre responder ao clique do usuário com comando associado, exibindo diagnóstico caso o gate esteja bloqueado.

## Pendência imediata

- Agente Executor assumir a tarefa via `sdd/handoffs/CURRENT-HANDOFF.md`, renderizar a Live Todo List e realizar a implementação do BATCH-040.


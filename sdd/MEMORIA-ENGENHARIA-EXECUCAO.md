# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-038 — Reestruturação segura, multilanguage, backlog e releases](implementation/batch-038.md)
>
> **Lote atual:** [BATCH-039 — Estabilização de Preview MPE, Release em 2 Fases e Docs Bilíngues Pré-Release](implementation/batch-039.md), em andamento.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-29 — BATCH-038:** entrega do BATCH-038 consolidada com 31 testes e VSIX atualizado.
- **2026-08-31 — REQ-037 / BATCH-039:** formalizada requisição para reconciliar regressão acidental em `extension.ts`, eliminar encadeamento de abas `.md` no preview, implementar Release em duas fases (preparação x execução) e sincronização documental obrigatória (`README.md`, `README-PT-BR.md`, `CHANGELOG.md`, `.github/workflows/`) pré-release. Handoff emitido para o Agente Executor.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- A REQ-037 está `APPROVED` e o BATCH-039 está `READY_FOR_EXECUTION` em modo supervisionado.
- Releases inteligentes dividem-se em Fase 1 (Preparação / Diagnóstico & Rascunho) e Fase 2 (Execução travada contra working tree suja e docs desatualizados).
- A sincronização documental bilíngue é pré-requisito mandatório antes do disparo de releases.

## Pendência imediata

- Agente Executor assumir a tarefa via `sdd/handoffs/CURRENT-HANDOFF.md`, renderizar a Live Todo List e realizar a implementação do BATCH-039.


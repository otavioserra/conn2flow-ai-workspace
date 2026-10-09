# CR-001 — Correlação dos Recibos MCP com a Tarefa

## Estado

- **Status:** `APPROVED_FOR_IMPLEMENTATION`
- **Origem:** findings F1–F3 de `sdd/validation/review-043.md`
- **Autorização humana:** comando `continue` em 2026-08-31
- **Handoff normativo:** `sdd/handoffs/CURRENT-HANDOFF.md`
- **Requisição / lote:** REQ-041 / BATCH-043

## Problema comprovado

O contrato de `report_completion` não identifica estruturalmente a tarefa nem o papel emissor,
permite que o recibo de um papel substitua o de outro e não transiciona a tarefa para estado terminal.
O probe também não valida o recibo final.

## Mudança aprovada

1. Acrescentar `task_id`, `req_id` e `role` opcionais a `ReportCompletionArgs`.
2. Persistir os três campos no `CompletionReceipt`.
3. Com `role`, gravar `completions/<batch_id>-<role>-receipt.json` e manter o recibo canônico
   `completions/<batch_id>-receipt.json` sincronizado.
4. Com identidade de tarefa, validar `tasks/<req_id>.json` e transicionar seu status para
   `completed` ou `failed`, registrando `completedAt`.
5. Expandir o probe para validar recibo, correlação e estado terminal.

## Validação obrigatória

- build TypeScript do MCP Hub;
- ciclo real `dispatch_task → report_completion` via stdio;
- probe focado e `npm test` completo da extensão;
- nova auditoria independente do Revisor Técnico.

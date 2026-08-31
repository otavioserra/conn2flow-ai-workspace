# Relatório de Revisão Técnica — BATCH-043 / REQ-041

* **Data**: 2026-08-31
* **Auditor**: Revisor Técnico / Auditor de QA (`c2f_reviewer`)
* **Requisição**: [req-041.md](../human-requests/req-041.md)
* **Registro de Lote**: [batch-043.md](../implementation/batch-043.md)
* **Checklist de Validação**: [VALIDATION-CHECKLIST.md](VALIDATION-CHECKLIST.md#batch-043-teste-de-integracao-end-to-end-da-triade-via-mcp-hub)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Parecer**: **REPROVADO COM RESSALVAS (`CHANGES_REQUIRED`)**

---

## 1. Findings críticos / bloqueantes

### F1 — O recibo não possui vínculo estruturado com a tarefa e pode ser sobrescrito

`report_completion` recebe apenas `batch_id`, `status`, `logs` e `summary`. O recibo não contém
`taskId`, `reqId`, `executionToken` nem a identidade/fase do agente emissor. Além disso, a gravação
usa sempre `completions/<batch_id>-receipt.json`, sobrescrevendo o recibo anterior do mesmo batch.

Consequências observáveis:

1. Não é possível provar por campos estruturados que o recibo pertence ao despacho atual.
2. Uma repetição de `report_completion` altera retroativamente a evidência do lote.
3. A emissão do recibo de homologação pelo Revisor, exigida pela REQ-041, substituiria o recibo do
   Executor em vez de preservar as duas etapas independentes da tríade.
4. Durante esta auditoria, o recibo mudou de `rec_1788199538559` para
   `rec_1788200250647`; os artefatos SDD foram corrigidos concorrentemente depois, mas o evento
   demonstra que a evidência não é imutável.

### F2 — O probe passa sem validar o recibo de conclusão

`vscode-extension/test/mcpTriadProbe.test.cjs` verifica que `completions/` é um diretório gravável,
mas não abre `completions/BATCH-043-receipt.json` nem valida `batchId`, `status`, timestamp ou vínculo
com `tasks/REQ-041.json`. O teste continuaria verde se o recibo estivesse ausente, com status
`failed` ou pertencesse a outro despacho. Assim, o teste automatizado não falsifica uma quebra no
trecho `report_completion` do ciclo E2E que dá nome ao lote.

### F3 — A tarefa permanece `dispatched` após o recibo `success`

`TaskRecord` declara os estados `running`, `completed` e `failed`, porém `report_completion` não lê
nem atualiza a tarefa correspondente. O estado observado ao final é tarefa `dispatched` e recibo
`success`, sem transição canônica que permita à fila distinguir trabalho pendente de concluído.

---

## 2. Findings menores / débito técnico

### F4 — Correlação mantida apenas em texto livre

O recibo atual menciona `task-1788199585576-df7a0` dentro de `logs`, o que permite inspeção humana,
mas não valida integridade, não é consumível com segurança por clientes e não substitui um campo
estruturado no contrato MCP.

---

## 3. Evidências independentes executadas pelo Revisor

| Verificação | Resultado |
|---|---|
| `node --test test/mcpTriadProbe.test.cjs` em `vscode-extension/` | **PASS — 1/1** |
| `npm test` em `vscode-extension/` | **PASS — TypeScript + 48/48, 0 falhas** |
| Handshake JSON-RPC/stdio e `tools/list` no `conn2flow-hub` | **PASS — 3 tools expostas** |
| `c2f_run_command(ai:sync --verbose)` via MCP | **PASS — exitCode 0; 36/36 nos 5 kits do Core** |
| Conferência de `tasks/REQ-041.json` | **PASS parcial — tarefa existe, mas segue `dispatched`** |
| Conferência de `completions/BATCH-043-receipt.json` | **PASS parcial — `success`, sem vínculo estruturado** |

CSRF, SQL, variáveis de interface, version bump e CSS/Tailwind são **não aplicáveis** ao slice, que
altera apenas teste Node, artefatos MCP de fila/recibo e documentação SDD.

---

## 4. Correções requeridas antes de novo review

1. Definir vínculo estruturado entre despacho e conclusão, preservando ao menos `taskId` e `reqId`
   no recibo e validando-os contra a tarefa despachada.
2. Impedir que recibos de Executor e Revisor se sobrescrevam; registrar fase/ator ou usar recibos
   distintos e imutáveis por tarefa/emissão.
3. Atualizar a tarefa para `completed`/`failed` no fechamento, ou documentar e testar outra
   transição canônica que retire a tarefa da condição pendente.
4. Fazer o probe abrir o recibo real e validar status, identidade do batch/tarefa e ordem temporal.
5. Reexecutar o probe, `npm test` e o ciclo MCP completo; então solicitar nova auditoria.

---

## 5. Parecer de homologação

Os comandos e a suíte de regressão passam, mas o objetivo central de rastreabilidade E2E ainda não
está tecnicamente demonstrado. O BATCH-043 permanece em `ready-for-review` e não deve seguir para
homologação executiva até a correção dos findings F1–F3.

**Status da Revisão**: `CHANGES_REQUIRED`

---
id: "BATCH-089"
title: "Fase 0 do ARCH-018: quatro melhorias operacionais, saneamento SDD→MDD e MDD como evolução do SDD"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-087"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Quinze skills PT-BR/EN revisadas na matriz, jargão SDD reduzido de 43 para 7 linhas e MDD explicitado como evolução do SDD."
summary_medium: "Categoria B, somente matriz, sem deploy, stage ou commit.\nAuditoria PASS com zero divergências e zero drift; pytest 119/119."
---

# BATCH-089 — Fase 0 do ARCH-018

[REQ-087](../human-requests/req-087.md) · [ARCH-018](../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada

## Live Todo List

- [x] Ler CURRENT, REQ-087, REP-008 e BATCH-088.
- [x] `c2f-hooks-system`: broadcast `plataforma_gateways` e redação vigente da REQ-077 (PT-BR/EN).
- [x] `c2f-payment-gateways`: roteiro de webhook assinado do Mercado Pago, conferido no Core em modo somente leitura (PT-BR/EN).
- [x] `c2f-architect-master` e `STARTER-PROMPTS.md`: proibição de `--skip-css` com `project:deploy` e alinhamento da REQ-077.
- [x] `c2f-shell-and-windows-traps`: `index.lock` no OneDrive após deploy e `git ls-files --eol` na restauração por blob (PT-BR/EN).
- [x] `c2f-multilingual-skills-governance`: exit code 1 da auditoria global após escrita seletiva (PT-BR/EN).
- [x] Saneamento SDD→MDD nas 13 skills e em `memory/process/`.
- [x] MDD como evolução do SDD em `00-baseline-architecture.md`, `02-policy.md` e nos boilerplates MDD PT-BR/EN.
- [x] Sync da matriz, 15 hashes EN, auditoria PASS e pytest 119/119.
- [x] Lote, FEAT-017, checklist e índices.

## Alterações

### Melhorias operacionais

| Skill / arquivo | Mudança | Autoridade do código |
| --- | --- | --- |
| `c2f-hooks-system` | Nova seção 7 sobre o broadcast `plataforma_gateways`. Guarda inicial por gateway, nada de `echo`/`header`/`exit`/`die` para evento alheio e `processed => true` só quando o módulo tratou o evento. A linha REQ-077 agora traz a redação vigente de `project:update-all <id>`. | Core `gestor/controladores/plataforma-gateways/plataforma-gateways.php`: `plataforma_gateways_carregar_hook` (`hooks.plataforma_gateways`, função `<modulo>_plataforma_gateways`), `plataforma_gateways_disparar_hook` (broadcast com `break` em `processed`) e `plataforma_gateways_stripe_confirmar_recebimento` (`503`/`401`). Presentes em `origin/main`. |
| `c2f-payment-gateways` | Nova seção 5.4: rota, cabeçalhos `x-signature`/`x-request-id`, manifest `id:…;request-id:…;ts:…;`, HMAC com `webhook_secret` sem expor segredos, exemplo `curl` com ID de sandbox e tabela de retornos 200/401/400/503. | Core `gestor/bibliotecas/mercadopago.php` (`mercadopago_validar_webhook`, `mercadopago_webhook_data_id`), `gestor/bibliotecas/pagamentos-gateways.php` (`pagamentos_gateway_validar_e_normalizar_webhook`, `pagamentos_gateways_mercadopago_resolver_webhook`) e `plataforma_gateways_webhook_universal`. **Só existem na branch `feat/req-305-mercadopago-orders-api`** (publicada em `origin`, fora da `main`). A skill registra a data da conferência e pede nova conferência após a integração. |
| `c2f-architect-master` | Regra explícita na caixa copiável: nunca associar `--skip-css` a `project:deploy`. | Wrapper `ProjectDeployCommand.php`, conforme a nota REQ-077 da skill do executor. |
| `memory/process/STARTER-PROMPTS.md` | Nota REQ-077 alinhada e proibição de `--skip-css` com `project:deploy`. | — |
| `c2f-shell-and-windows-traps` | Armadilha 21, passo 5: `git diff` do deploy deixa `index.lock` órfão no OneDrive. Seção 20: `git ls-files --eol` e `git show HEAD:<caminho>` na restauração por blob. | REP-008 |
| `c2f-multilingual-skills-governance` | O exit code 1 da auditoria global pode vir depois da escrita seletiva. O escopo é validado no JSON do `--report`. | REP-008 |

### Saneamento SDD → MDD

Contagem de linhas com `sdd` (sem diferenciar maiúsculas), via `grep -ci`:

| Conjunto | Antes | Depois | Remanescentes legítimos |
| --- | --- | --- | --- |
| PT-BR `.gemini/skills/` | 43 linhas em 13 skills | 7 linhas em 4 skills | `c2f-architect-master` (fallback legado e comando `ai:archive-sdd`, 4), `c2f-executor-agent` (fallback legado, 1), `c2f-mdd-indexing-and-handoffs` (fallback legado, 1), `mdd-workflow` (comando `ai:archive-sdd`, 1) |
| EN, kit Gemini (referência dos 7 kits EN) | 43 linhas em 14 skills | 8 linhas em 5 skills | As mesmas 7, mais `mdd-memory-gardening` (comando `ai:archive-sdd`) |

- Os caminhos substituídos foram conferidos no disco. O Core e o Site não têm mais `sdd/`. `BATCH-227.md` está em `conn2flow/memory/implementation/archive/`, e `req219-controles-e2e.cjs` e `PENDENCIAS-HUMANAS.md` estão em `conn2flow-site/memory/`.
- `ai:archive-sdd` foi preservado como nome real do comando. Em `origin/main` do Core, `AiArchiveSddCommand.php` opera em `memory/`, recorre a `sdd/` como fallback e tem o alias `ai:archive-memory`. A skill do arquiteto passou a dizer isso.
- `memory/process/MEMORY-GARDENING-GUIDELINES.md` teve a única referência ativa trocada ("artefato SDD" → "artefato MDD").
- A tradução EN do executor corrigiu "projects legacy SDDs" para "legacy SDD projects".

### MDD como evolução do SDD

Bloco `[!IMPORTANT]` com o texto da REQ-087 em `memory/00-baseline-architecture.md`, `memory/02-policy.md` e `templates/{pt-br,en}/mdd-boilerplate/memory/{00-baseline-architecture,02-policy}.md`. Os boilerplates SDD legados ficaram intactos. As versões em `02-policy` também dizem que `sdd/` serve só como fallback legado.

## Validação (Categoria B — sem deploy)

| Verificação | Resultado |
| --- | --- |
| Edição | 15 fontes PT-BR. EN revisado no kit Gemini e replicado às 6 cópias EN restantes por script, com a condição de que cada destino fosse idêntico ao blob `HEAD` da referência. Foram 84 gravações, num total de 99 cópias EN. Os finais de linha (CRLF/LF) de cada arquivo foram preservados. |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | `DRIFT_WARNING` transitório para as 15 skills, 19 alvos, 159 gravações e 0 divergências. |
| `--update-translation-hash <skill> en --translator mdd-agent` | 15 entradas em [translated.json](../../scripts/skills/translated.json), todas `PASS`, com data 2026-11-24. |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | **PASS** em 19 alvos, com 542 cópias iguais, 312 traduções, 0 divergências e 0 drift. [JSON](../../completions/skills-audit.json). |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | **119 passed em 97,06 s**, executado depois dos hashes. |
| Core | Somente leitura. Nenhum arquivo do Core ou dos satélites foi alterado. |

## Pendências para o Arquiteto

- **Regra dos 10 ativos**: `memory/implementation/` passa a ter 11 lotes com este. `mdd compact` (sem `--apply`) já apontava `req-075.md` para arquivar e `VALIDATION-CHECKLIST.md` para poda (27 KB / 311 linhas). Não movi nem podei nada porque a REQ-087 não autoriza e a DEC-136 manda preservar. Candidatos homologados mais antigos: BATCH-084 e REQ-075.
- **Webhook Mercado Pago**: reconferir a seção 5.4 de `c2f-payment-gateways` quando a REQ-305 do Core for integrada à `main`.
- **Fora do escopo, registrado**: `memory/implementation/BATCH-INDEX.md` ainda rotula o link de arquivo como `sdd/implementation/archive/`. `mdd-memory-gardening` (PT, linha 33) e `mdd-workflow` (linha 171) ainda tratam o arquivador como se não aceitasse `memory/`, o que o CLI atual já desmente. Proposta: corrigir na Fase 3 do ARCH-018, com a modernização de `ai:archive-sdd`.

## FEAT-017 e entrega

Relatório: [REP-009](../reports/REP-009-batch089-phase0-skills-and-sdd-cleanup.md). [Checklist](../validation/VALIDATION-CHECKLIST.md) e índices atualizados. A memória de execução está saudável (10.329 bytes / 57 linhas) e não foi alterada. A matriz está em `ready-for-review`, sem stage, commit ou push. `FEAT-015` segue não rastreado e fora do stage.

## Handoff supervisionado

```text
Arquiteto Master, revise a REQ-087 / BATCH-089 no conn2flow-ai-workspace.
Raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
Topologia dupla | Autonomia supervisionado | Categoria B | Estado ready-for-review (sem stage/commit/push).
15 skills PT-BR/EN, SDD nas skills 43→7 linhas, MDD como evolução do SDD em 00/02 e boilerplates MDD.
Auditoria PASS (0 divergências, 0 drift) e pytest 119/119.
Evidências: memory/implementation/batch-089.md, memory/reports/REP-009-batch089-phase0-skills-and-sdd-cleanup.md,
memory/validation/VALIDATION-CHECKLIST.md e completions/skills-audit.json.
Decidir o arquivamento da Regra dos 10 e encaminhar a homologação humana antes do commit seletivo.
```

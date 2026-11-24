---
id: "REP-009"
title: "Dificuldades e aprendizados do BATCH-089 para o AI Workspace"
status: "REVIEWED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-087"
batch: "BATCH-089"
summary_short: "Registra a conferência do webhook Mercado Pago fora da main, o saneamento SDD e a pressão da Regra dos 10."
summary_medium: "Fase 0 do ARCH-018 validada só na matriz.\nO relatório aponta a fonte do Core ainda em branch, as referências restantes ao arquivador e os limites de retenção."
---

# REP-009 — Dificuldades e aprendizados do BATCH-089

1. **Contexto da rodada.** REQ-087 / BATCH-089, Fase 0 do ARCH-018, no `conn2flow-ai-workspace`. Categoria B, topologia dupla, autonomia supervisionada, somente matriz. Foram revisadas 15 skills em PT-BR/EN, as referências SDD foram saneadas e o MDD foi explicitado como evolução do SDD. [Lote](../../implementation/archive/batch-089.md).

2. **Dificuldades e atritos.**
   - O código do webhook Mercado Pago exigido pela REQ-087 (`mercadopago.php`, `pagamentos-gateways.php`, `plataforma_gateways_webhook_universal`) só existe na branch `feat/req-305-mercadopago-orders-api` do Core. Lendo apenas a árvore de trabalho, a skill pareceria refletir a `main`. A diferença só apareceu com `git show origin/main:<caminho>`.
   - A contagem inicial de skills deu 10 em vez de 13. O `grep` sensível a maiúsculas não pega `sdd` minúsculo em "sdd numerado" nem em "sdd, batch". Com `grep -ci`, a contagem fechou em 13 skills e 43 linhas.
   - `glob` com `*` no Bash e no Python ignora `.gemini`, `.claude` e outras pastas iniciadas por ponto. A primeira conferência de uniformidade dos kits EN retornou vazio até trocar para `find` e `Path.glob('*/.*/...')`, como já indica a skill de shell.
   - `memory/implementation/` passa para 11 lotes, e `mdd compact` já apontava `req-075.md` e a poda do `VALIDATION-CHECKLIST.md`. A REQ-087 não autoriza arquivamento.

3. **Lacunas nas skills.**
   - `c2f-payment-gateways` não pedia para registrar em qual ref do Core a autoridade do código foi conferida. Agora a seção 5.4 registra.
   - `mdd-memory-gardening` (PT, linha 33) e `mdd-workflow` (linha 171) ainda tratam o arquivador como incapaz de operar em `memory/`. `AiArchiveSddCommand.php` em `origin/main` já opera em `memory/`, recorre a `sdd/` e tem o alias `ai:archive-memory`.
   - `memory/implementation/BATCH-INDEX.md` ainda rotula o link de arquivo como `sdd/implementation/archive/`.
   - A tradução EN de `mdd-memory-gardening`, linha 56, tem conteúdo diferente da fonte PT. Menciona `ai:archive-sdd` e "satellites still use memory/", e a fonte não diz isso. O hash continua válido.

4. **Solução validada.**
   - O roteiro HMAC foi escrito a partir de `mercadopago_validar_webhook`. O manifest segue a mesma ordem, com a parte ausente omitida e o `data.id` alfanumérico em minúsculas. O segredo vem do gateway ativo, e a tabela de retornos foi tirada de `plataforma_gateways_webhook_universal` e `plataforma_gateways_stripe_confirmar_recebimento`. O broadcast `plataforma_gateways` foi conferido em `origin/main`.
   - A replicação EN usou script que só gravava quando o destino era idêntico ao blob `HEAD` da referência. Foram 84 gravações, sem divergência.
   - Validação: sync, depois 15 hashes, auditoria **PASS** (19 alvos, 0 divergências, 0 drift) e pytest **119/119**. [Auditoria](../../../completions/skills-audit.json).

5. **Sugestões de melhoria.**
   - Em `c2f-architect-master` e na `c2f-documentation-governance`, exigir que a autoridade do código registre a ref (`origin/main` ou branch) e mandar reconferir após o merge.
   - Na Fase 3 do ARCH-018, atualizar `mdd-memory-gardening`, `mdd-workflow` e `BATCH-INDEX.md` para o suporte atual do arquivador a `memory/` e alinhar a tradução EN de `mdd-memory-gardening`.
   - Em `c2f-shell-and-windows-traps`, acrescentar que buscas por jargão devem usar `grep -i`.
   - Antes de cada lote que cria registro, prever na requisição quem autoriza o arquivamento da Regra dos 10, para o executor não ficar entre o teto e a DEC-136.

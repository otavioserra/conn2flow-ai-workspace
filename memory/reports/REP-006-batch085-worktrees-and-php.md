---
id: "REP-006"
title: "Dificuldades e aprendizados do BATCH-085 para o AI Workspace"
status: "READY_FOR_ARCHITECT"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Registra bloqueios de remoto, staging de kits ignorados e hashes da variante do Core."
summary_medium: "Sete satélites publicados e duas ausências de origin confirmadas.\nA auditoria seletiva verificou 112 cópias e a paridade PHP."
---

# REP-006 — Dificuldades e aprendizados do BATCH-085

1. **Contexto da rodada.** REQ-083 / BATCH-085 em `conn2flow-ai-workspace`. Ajustes do REP-005, paridade PHP no Core e integração via worktree isolada em Categoria B.
2. **Dificuldades e atritos.** `git fetch origin` confirmou que `conn2flow-home` e `conn2flow-mkt` continuam sem esse remoto. Regras de ignore alcançam caminhos autorizados no kit Claude do Core e do Lumix, inclusive um caminho já tracked no Core. O primeiro staging normal desse caminho foi recusado pelo Git.
3. **Lacunas nas skills consultadas.** `c2f-executor-agent` e a governança da REQ-077 cobrem preservação e limpeza. A aplicação prática precisou distinguir a ausência de remoto de uma falha de push e conferir os caminhos ignorados individualmente. `c2f-multilingual-skills-governance` documenta o contrato de bytes exatos, que também depende do EOL do checkout. `c2f-mdd-indexing-and-handoffs` orientou a precedência e a ordenação da ambiguidade.
4. **Solução validada.** O inventário permitiu partir de `origin/main` nos sete casos elegíveis. Staging explícito nos casos ignorados e revisão do diff limitaram a propagação a 112 cópias, cinco delas reconhecidas como variantes do Core. A reaplicação escreveu zero arquivos. As sete publicações foram confirmadas e as worktrees removidas. O PHP passou os seis testes novos e resolveu o REP-004 no CLI real.
5. **Melhorias propostas.** Na governança de worktrees, registrar no inventário os casos sem remoto antes da criação e consultar `git check-ignore --no-index` para caminhos de skill explicitamente aprovados. Na governança multilíngue, registrar uma verificação dos hashes exatos contra o blob staged e o efeito de CRLF no reconhecimento em checkouts novos.

Evidências no [BATCH-085](../implementation/batch-085.md) e no [recibo de execução](../../completions/BATCH-085-executor-receipt.json).

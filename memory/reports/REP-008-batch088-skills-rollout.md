---
id: "REP-008"
title: "Dificuldades e aprendizados do BATCH-088 para o AI Workspace"
status: "REVIEWED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-086"
batch: "BATCH-088"
summary_short: "Registra auditoria seletiva, aliases legados, EOL e validação da publicação em worktrees."
summary_medium: "Sete satélites publicados e worktrees removidas.\nO relatório detalha os desvios operacionais e os controles que preservaram as árvores de trabalho."
---

# REP-008 — Dificuldades e aprendizados do BATCH-088

1. **Contexto da rodada.** REQ-086 / BATCH-088 no `conn2flow-ai-workspace`, Categoria B, topologia dupla e autonomia supervisionada. Sete skills revisadas em PT-BR/EN e onze propagadas nos satélites com `origin`. [Lote](../implementation/batch-088.md).
2. **Dificuldades e atritos.** O sincronizador retorna código 1 por divergências em qualquer skill auditada, inclusive quando a escrita seletiva terminou. Em dois satélites, a seleção de `mdd-memory-gardening` migrou o alias antigo automaticamente. A restauração inicial do alias no Windows produziu CRLF e o checkout isolado sinalizou a diferença contra o blob LF. No Core e no Lumix, o stage seletivo exigiu explicitar caminhos sob regras de ignore. O diff também acusou espaços no fim de 35 linhas em cada um desses dois repositórios, herdados do exemplo PHP canônico.
3. **Lacunas nas skills.** `c2f-multilingual-skills-governance` explica o alcance global da auditoria, mas deixa implícito que um `FAIL` global pode vir depois de a escrita seletiva terminar. `c2f-shell-and-windows-traps` orienta a conferência de EOL e locks. Faltava um exemplo de como conferir o estado restaurado pelo blob quando o checkout converte LF para CRLF. A seção REQ-077 do `AGENTS.md` da matriz ainda contém a formulação anterior do pipeline. O alinhamento deste lote cobre as duas skills especificadas.
4. **Solução validada.** O JSON foi filtrado para as onze skills e cada cópia foi comparada com a fonte. Os aliases legados dos dois satélites foram restaurados byte a byte a partir dos blobs originais e ficaram fora dos commits. No stage, o Git recebeu apenas os caminhos previamente conferidos. Os espaços dos exemplos PHP foram conferidos contra a fonte canônica. Cinco reconhecimentos via `mdd sync --customize` mantiveram o título do Core e seus hashes locais corresponderam aos blobs staged. A matriz passou em 19 alvos, com zero divergências, zero drift e 119 testes aprovados. As 308 cópias nos sete satélites tiveram conteúdo confirmado em `origin/main`. [Auditoria da matriz](../../completions/skills-audit.json).
5. **Sugestões de melhoria.** Documentar em `c2f-multilingual-skills-governance` o código de saída da auditoria global e o efeito das migrações automáticas em operações seletivas. Avaliar um modo de preservar aliases durante a escrita seletiva e atualizar a redação de REQ-077 em `AGENTS.md`. Em `c2f-shell-and-windows-traps`, acrescentar a verificação de EOL com `git ls-files --eol` e a comparação com o blob de referência na restauração de um caminho específico.

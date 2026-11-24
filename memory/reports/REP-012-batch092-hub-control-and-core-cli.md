---
id: "REP-012"
title: "Dificuldades e aprendizados do BATCH-092 para o AI Workspace"
status: "READY_FOR_ARCHITECT"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-090"
batch: "BATCH-092"
summary_short: "Aba MDD Hub na extensão, fila serial no hub, paridade MCP Python e ai:archive-memory no Core; o arquivador normalizava links alheios e ignorava destinos <...>."
summary_medium: "Fase 3 do ARCH-018 com publicação no Core via worktree isolada.\nRegistra o bug de reescrita de links do arquivador (causa do atrito do REP-011), a ordem de reports/ com prefixos mistos, a suíte do Core na worktree sem vendor/ e duas armadilhas de shell."
---

# REP-012 — Dificuldades e aprendizados do BATCH-092

1. **Contexto da rodada.** REQ-090 / BATCH-092, Fase 3 do ARCH-018. Matriz `conn2flow-ai-workspace` (extensão VS Code, `mcp-hub`, `mdd-client`, `docs/`, poda de memória) e Core `conn2flow` (`cli/src/`) via worktree isolada, publicada em `origin/main` `6e146f7aa8b6`. Categoria B, topologia dupla, autonomia supervisionada. [Lote](../implementation/archive/batch-092.md). Feedbacks emitidos: FB-001, FB-002, FB-003.

2. **Dificuldades e atritos.**
   - **O arquivador do Core reescrevia links alheios.** `rewriteTarget` recalculava o caminho relativo de qualquer link para arquivo existente, mesmo quando nem o documento nem o alvo tinham sido movidos (`./x.md`, `a/../b.md` e a caixa eram normalizados). Era a mesma classe de erro que o REP-011 relatou no script próprio. Também deixava quebrados os links de pasta (`../scripts/`) dentro dos documentos movidos, porque exigia `is_file`. Achado lendo o código antes de mudar e confirmado no teste `testOnlyLinksAffectedByTheMoveAreRewritten`.
   - **Destinos `<...>` ficavam de fora.** Os `index.md` gerados usam `[source](<req-083.md>)`; o padrão do comando rejeitava `<` e `>`, então nem reescrevia nem acusava no gate. Medido na matriz: meu verificador passou de 304 para 307 links quebrados depois do arquivamento, exatamente os 3 `index.md`. O `mdd index` os regenerou, e o comando foi corrigido antes do commit.
   - **`reports/` mistura prefixos.** `BL-028` e `REP-002` não se comparam pelo número; com ordem numérica, o `BL-028` (consumido) seria o "mais recente". Passei a ordenar `reports/` pela `date:` do frontmatter. O teste que escrevi primeiro falhou por isso.
   - **Suíte do Core na worktree.** Sem `vendor/` na worktree, 54 testes falham porque subprocessos fazem `require vendor/autoload.php`, e outros 29 por ambiente (OpenSSL, Dashboard). Para separar regressão de ambiente, rodei o mesmo filtro no `origin/main` intacto (stash só na worktree): as mesmas 29 falhas.
   - **Escapes em comandos aninhados.** Duas vezes um `node -e` dentro de Bash transformou `\r\n` em quebra de linha real e quebrou o script (regex sem `/` de fechamento). A regra da persona (script em arquivo, editado pela ferramenta) resolveu; as correções foram feitas com a ferramenta de edição.
   - **CRLF invisível.** `grep -c $'\r'` devolveu 0 para `Application.php`, que é CRLF; o patch com `\n` no padrão achou 0 ocorrências. `node` mostrou `\r\n`.
   - **Catálogo de skills desatualizado.** A REQ pedia trocar "45" por "48", mas os catálogos tinham 47 linhas e 4 links quebrados (`sdd-*` renomeadas para `mdd-*`). Trocar só o número deixaria o catálogo errado; corrigi as linhas e incluí a skill que faltava.
   - **Status divergente.** O CURRENT lista REQ-076/BATCH-078 como homologado, mas o `batch-078.md` diz `ready-for-human-review`. Mantive ativo (o mais conservador) e registrei para o Arquiteto.

3. **Lacunas nas skills.**
   - `mdd-memory-gardening` e `c2f-persona-architect` §5 ainda mandam usar `ai:archive-sdd` e não conhecem `reports/`, `--status` nem `--folders` (FB-001).
   - `c2f-shell-and-windows-traps` não diz como detectar CRLF de forma confiável no Git Bash da ferramenta (FB-002).
   - `c2f-persona-executor` não diz que há dois servidores MCP com as mesmas tools de feedback nem que mudança de contrato exige paridade nos dois (FB-003).
   - `c2f-persona-executor` (REQ-077) não diz como rodar o PHPUnit numa worktree sem `vendor/` nem que é preciso comparar com uma linha de base do `origin/main`. Usar o `vendor/bin/phpunit` da árvore principal com `-c phpunit.xml` da worktree funciona para testes em processo, mas não para os que abrem subprocesso.

4. **Solução validada / armadilhas medidas.**
   - Arquivador: só links afetados mudam (documento parado com link para arquivo parado → texto intacto); documento movido reancora tudo, pastas incluídas, preservando a barra final; destinos `<...>` reescritos e checados. PHPUnit 13/13. Na matriz: 3 arquivados, 18 links em 9 arquivos, hash dos demais `.md` de `memory/` idêntico.
   - `--status=HOMOLOGATED,REVIEWED`: pendentes ficam retidos e ocupam a janela; a matriz terminou com 10 ativos em cada raiz, sem mover nada pendente.
   - Hub: fila serial por `Promise` encadeada; o teste usa streams `PassThrough` e uma requisição lenta antes de uma rápida.
   - Aba da extensão: status só `RUNNING` com evidência (PID vivo + porta aberta; hub com resposta ao `initialize`). Smoke real: porta aberta em 777 ms; `taskkill /T /F` encerrou os 4 processos (o `mdd.exe` é um launcher que sobe Python), o que `process.kill(pid)` sozinho não faria.
   - Validação: extensão 154/154, hub 7/7, pytest 142/142, auditoria/governança/índice PASS, `docs:audit` do Core 0 erros.

5. **Sugestões de melhoria para o AI Workspace.**
   - Triar FB-001..003 (agora possível pela aba MDD Hub) e, se aceitos, atualizar `mdd-memory-gardening`, `c2f-persona-architect`, `c2f-shell-and-windows-traps` e `c2f-persona-executor`.
   - Na seção de worktrees da `c2f-persona-executor`: para testes PHP do Core numa worktree, usar o `phpunit` da árvore principal e comparar com o `origin/main` intacto antes de atribuir falhas ao lote.
   - Rodar o `mdd index` logo depois de qualquer arquivamento, mesmo com o comando corrigido, porque o resumo de cada `index.md` também cita o status.
   - Ao promover o novo Core aos satélites, trocar `ai:archive-sdd` por `ai:archive-memory` nas skills e roteiros (o alias continua funcionando).

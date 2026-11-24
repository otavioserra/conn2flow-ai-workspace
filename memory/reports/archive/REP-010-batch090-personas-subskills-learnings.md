---
id: "REP-010"
title: "Dificuldades e aprendizados do BATCH-090 para o AI Workspace"
status: "REVIEWED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-088"
batch: "BATCH-090"
summary_short: "Rename das personas com aliases, subskills no sync, índice de skills, memory/learnings/ e a tensão entre arquivamento byte a byte e reescrita de links."
summary_medium: "Fase 1 do ARCH-018 validada só na matriz.\nRegistra a ordem obrigatória registro→sync no rename, a escolha de proteção no arquivador e as lacunas de skills encontradas."
---

# REP-010 — Dificuldades e aprendizados do BATCH-090

1. **Contexto da rodada.** REQ-088 / BATCH-090, Fase 1 do ARCH-018, no `conn2flow-ai-workspace`. Categoria B, topologia dupla, autonomia supervisionada, somente matriz. Escopo: rename da tríade para `c2f-persona-*`, Curator e Optimizer, índice de skills, `subskills/`, `memory/learnings/` e Regra dos 10. [Lote](../../implementation/archive/batch-090.md).

2. **Dificuldades e atritos.**
   - **Ordem do rename.** O sync pula um template EN só se a skill estiver registrada em `translated.json` com o nome **novo**. Se o sync rodar antes de renomear as chaves, ele move a pasta EN pelo alias e grava o PT-BR por cima da tradução. O mesmo vale para persona nova: a entrada EN precisa existir antes do primeiro `--apply`. Resolvi registrando antes (hash provisório) e reconhecendo o hash depois da revisão.
   - **Arquivador escolhe por número, não por status.** Com `--keep=10`, o `ai:archive-sdd` pegaria `req-077`/`078` e `batch-078`, ainda pendentes de homologação. Foi preciso montar `--protect` à mão a partir do CURRENT, e só a segunda prévia mostrou que `batch-078.md` também precisava de proteção.
   - **"Byte a byte" vs. links.** A REQ pedia originais preservados byte a byte e links reescritos sem órfãos. O arquivador reescreve os links relativos dentro do próprio arquivo movido. Assim, 4 dos 6 arquivados mudaram em 2 a 4 linhas, só nos alvos de link. As duas exigências não cabem juntas no mesmo arquivo.
   - **Contagem de órfãos sem linha de base.** O comando relata 170 links quebrados, mas não diz quantos já existiam. Medi com um checker próprio contra uma extração do `HEAD` (`git archive`). O único acréscimo foram os `index.md` derivados, resolvidos pelo `mdd index`.
   - **`audit-mdd-governance.cjs` abortava com `ENOENT`** na primeira skill ausente de um satélite, em vez de listar o problema. Corrigido para `Missing copy`.
   - **Python no Windows**: `Path.write_text` grava CRLF. Todas as edições usaram bytes para preservar BOM e finais mistos (`c2f-persona-executor` e `-reviewer` têm CRLF e LF misturados).

3. **Lacunas nas skills.**
   - `c2f-multilingual-skills-governance` dizia "renomear exige migrar o nome nos kits e no registro", sem a ordem. A ordem é o que evita sobrescrever a tradução. A nova seção REQ-088 documenta o mapa de aliases, mas ainda não diz explicitamente "renomeie a chave **antes** do `--apply`".
   - `c2f-persona-architect` (§5) manda usar `ai:archive-sdd --keep=10`, mas não avisa que o comando ignora o status de homologação nem orienta o `--protect`.
   - O mesmo trecho não diz que os links dentro do arquivo movido também são reescritos. Isso colide com "preservar byte a byte" quando a requisição exige os dois.
   - O EN de `c2f-payment-gateways` tinha "5.2 Absolute Impotence" (idempotência). O hash de tradução não pega erro de tradução, só mudança da fonte.

4. **Solução validada.**
   - Rename pelo próprio sync: 46 pastas movidas pelo alias (12 nos kits da matriz, 34 nos templates), 0 legados. Teste parametrizado cobre os 3 aliases, a idempotência e a recusa de coexistência.
   - Hash de tradução estendido às subskills: mudar `subskills/*.md` gera `DRIFT_WARNING`. Testado com fixture isolada.
   - Validação: sync → 7 hashes → auditoria **PASS** (19 alvos, 0 divergências, 0 drift) → governança PASS → índice PASS → pytest **130/130**.

5. **Sugestões de melhoria para o AI Workspace.**
   - `c2f-multilingual-skills-governance`: acrescentar "renomeie a chave em `translated.json` e registre a tradução de skill nova **antes** do primeiro `--apply`".
   - `c2f-persona-architect` §5 e `mdd-memory-gardening`: orientar `--protect` com os registros não homologados do CURRENT e avisar que os arquivos movidos têm links reescritos. Ao exigir "byte a byte", a requisição deve aceitar a reescrita de links ou pedir o par dual `archive/original/` + `archive/compacted/`.
   - Core `ai:archive-sdd` (Fase 3 do ARCH-018): seleção por `status` do frontmatter (`HOMOLOGATED`) e relatório de órfãos **novos** contra a linha de base.
   - `audit-mdd-governance.cjs`: comparar após normalizar CRLF, como o `sync-skills.cjs`. Hoje, 495 "cópias diferentes" nos satélites misturam diferença real e diferença só de fim de linha.
   - Primeiro ciclo do `c2f-persona-optimizer`: as 4 skills `OVER` medidas no índice (`c2f-shell-and-windows-traps` 487, `c2f-module-crud-scaffolding` 437, `c2f-javascript-ajax` 333, `c2f-payment-gateways` 313).
   - Prever na próxima requisição a autorização da Regra dos 10 para `memory/reports/`, que chega a 11 com este relatório.

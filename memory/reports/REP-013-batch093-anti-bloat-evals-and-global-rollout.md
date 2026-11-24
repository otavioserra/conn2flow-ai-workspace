---
id: "REP-013"
title: "Dificuldades e aprendizados do BATCH-093 para o AI Workspace"
status: "READY_FOR_ARCHITECT"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-091"
batch: "BATCH-093"
summary_short: "Quarentena por recorrência, --budget-report, mdd eval e curadoria FB-001..003; no rollout, alias renomeado para pasta ignorada pelo .gitignore saía do repositório."
summary_medium: "Fase 4 do ARCH-018 e rollout em 7 satélites via worktree isolada.\nRegistra a perda silenciosa de skill rastreada em kits .claude com whitelist, a criação de kits por --all, o legado duplicado que bloqueia o sync e a auditoria de junctions falsa pelo Git Bash (FB-004..FB-007)."
---

# REP-013 — Dificuldades e aprendizados do BATCH-093

1. **Contexto da rodada.** REQ-091 / BATCH-093, Fase 4 (final) do ARCH-018. Matriz `conn2flow-ai-workspace` (`mdd-client`, `mcp-hub`, `scripts/skills/`, 4 skills PT-BR/EN, inbox) e rollout das 48 skills nos 7 satélites com `origin` via worktrees `_wt-req091-<repo>`, já removidas. Categoria B, topologia dupla, autonomia supervisionada. [Lote](../implementation/batch-093.md). Feedbacks emitidos: FB-004, FB-005, FB-006, FB-007.

2. **Dificuldades e atritos enfrentados.**
   - **Skill rastreada perdida no commit (causa verificada).** Em `conn2flow` e `lumix`, o `.gitignore` ignora `.claude/skills/*` com whitelist. `c2f-architect-master` e `c2f-executor-agent` estavam rastreados por `add -f` antigo. O sync os renomeou para `c2f-persona-*`, que caem no ignore: o commit registrou só a deleção. Um verificador (`ls-tree` de `origin/main` × `HEAD`, deleção → sucessor rastreado) pegou o caso antes do push; `git add -f` dos dois sucessores corrigiu.
   - **`--apply --all` cria kits.** Em modo `--repos`, `sync-skills.cjs` cria os kits ausentes (`apply && todas`). `conn2flow-app` (só `.claude`) e `conn2flow-nexus` (`.claude`/`.github`) ganhariam 3–4 kits novos. Usei `--apply` com os 48 nomes, que respeita os kits existentes.
   - **Legado duplicado bloqueia o sync.** O rollout do BATCH-088 criou `mdd-memory-gardening` ao lado de `sdd-memory-gardening` em app/nexus; o sync recusa ("antiga e nova coexistem"). O legado era idêntico, com EOL normalizado, à matriz `78c9327`. A remoção (3 cópias) exigiu confirmação humana pela DEC-136.
   - **Customização do Core desfeita pelo sync.** A semente de `c2f-multilingual-skills-governance` mudou (`6bac…` → `1062…`), o reconhecimento deixou de valer e o sync gravou a semente. A variante é uma linha (`# ⚡ Gatilho Obrigatório`); reapliquei-a nos 5 kits e reconheci com `mdd sync --customize` (`8a4e3242…`, igual ao blob commitado).
   - **Auditoria de junctions falsa.** `cmd //c "dir /AL /S /B \"…\""` pelo Git Bash devolveu erro de sintaxe, e contar linhas dava "0 links". No PowerShell, `cmd /c` respondeu "Arquivo não encontrado" e `Get-ChildItem -Attributes ReparsePoint` deu 0.
   - **Core sem `ai:archive-memory` na árvore principal.** A árvore está em `feat/req-305-…`, sem `6e146f7`. Exportei `cli/` de `origin/main` com `git archive` para o scratchpad (CLI com autoloader próprio, sem `vendor/`) e rodei o comando oficial, sem worktree nem toque no Core.
   - **Duas falhas minhas de shell**: `cat > arquivo;` sem stdin e `python - a b -c` (ordem de argumentos) ficaram presos até o timeout. Ambos já estão na Armadilha 20; segui a regra e passei a escrever scripts em arquivo.

3. **Lacunas ou defasagens nas skills.**
   - `c2f-multilingual-skills-governance`: não avisa que o destino de um rename pode estar ignorado, não diz que `--all` cria kits e não orienta o caso de legado + canônico coexistentes (FB-004, FB-005, FB-006).
   - `c2f-shell-and-windows-traps` (Armadilha 18): manda auditar junctions com `dir /AL`, mas não diz para rodar no PowerShell nem como ler "Arquivo não encontrado" (FB-007).
   - `mdd-workflow` §171 ainda diz "Não execute ai:archive-sdd sobre memory/ sem suporte explícito no CLI". Ficou fora do escopo do FB-001; vale alinhar ao `ai:archive-memory` numa próxima curadoria.
   - ARCH-018 §4 fala em recorrência "em lotes distintos"; a REQ-091 falava em "2ª ocorrência distinta". Implementei a leitura da arquitetura: origem = `(repo, batch)`.

4. **Solução validada / armadilhas medidas.**
   - Gate 4A: auditoria PASS (0 divergências, 0 drift, 0 legados, 0 divergência de cópias EN), índice PASS, pytest **153/153**, `mdd eval` **EVAL-PASS 13/13**, `mcp-hub` 7/7.
   - FB-002 reproduzido: `grep -c $'\r'` = 0 e o one-liner `node` = 2 no mesmo arquivo CRLF.
   - Rollout: 7/7 publicados por fast-forward (base conferida antes do push e SHA confirmado após novo fetch); verificador com 0 perdas e 0 legados; worktrees, branches e metadados removidos; árvores principais com branch e contagem de `status` idênticas às do início.
   - Quarentena ao vivo: FB-004 (high) nasceu `READY`; FB-005/006 (medium, 1ª ocorrência) em `QUARANTINE`; FB-007 `READY` com recorrência 2 (FB-002 de outro lote).

5. **Sugestões de melhoria para o AI Workspace.**
   - `sync-skills.cjs`: depois de cada rename, rodar `git check-ignore` no destino e avisar (FB-004). No relatório, marcar legado coexistente idêntico a blob histórico como "removível com confirmação" (FB-006).
   - `c2f-multilingual-skills-governance`: incluir o verificador de deleção → sucessor como passo obrigatório antes do push de rollout (o script desta rodada cabe em `scripts/skills/`).
   - `c2f-shell-and-windows-traps` Armadilha 18: auditoria de junctions só no PowerShell (FB-007).
   - `mdd eval`: cada FB aceito ganha um cenário `EVAL-NNN` no mesmo lote (feito para FB-001..003: EVAL-009, 010, 012, 013), para que a curadoria não regrida.

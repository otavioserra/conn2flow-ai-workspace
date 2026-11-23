# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-084.md](req-084.md) (`REQ-084`)
* **Status**: `READY_FOR_EXECUTION` — aguardando início pelo Executor Tático
* **Lote Relacionado**: `BATCH-086` ([batch-086.md](../implementation/batch-086.md), a criar/preencher pelo Executor)
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-23
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-083.md](req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-084 / BATCH-086

1. **Melhorias em 3 Skills Canônicas (Somente Matriz `conn2flow-ai-workspace`)**:
   - `c2f-shell-and-windows-traps`: adicionar seção executável **"Remover worktree com junctions"** (CMD único, comandos proibidos, conferência pós-remoção) e ajustar cabeçalho de contagem obsoleta.
   - `c2f-json-resources-sync`: adicionar regra **"Commit seletivo de partes de `*Data.json`"** (inspeção por entrada/ID, seleção cirúrgica preservando `\/`/UTF-8/EOL, sem checksum manual, validação JSON + `git diff --cached`, parar e perguntar em ambiguidade).
   - `c2f-executor-agent`: adicionar regra **"Avanço concorrente da `main` após fast-forward aprovado"** (se a `main` andou, fazer merge só quando a versão da `main` contiver tudo; senão, parar, preservar e perguntar).
2. **Governança Multilíngue & Validação Local (Categoria B)**: Atualizar traduções EN, rodar sync restrito à matriz (`--repos conn2flow-ai-workspace`), atualizar hashes das 3 skills (`--update-translation-hash`), validar auditoria (`PASS`, `0` divergências, `0` drift) e `pytest -q tools/mdd-client/tests` (`100% PASS`).
3. **Faxina Determinística dos 10 Ativos**: Arquivar excedentes mais antigos de `memory/human-requests/` e `memory/implementation/` mantendo no máximo 10 ativos na raiz (preservando `req-084.md` e `batch-086.md`), reescrever links relativos sem órfãos, manter `04-memory-engineering-execution.md` sem poda, atualizar índices MDD e entregar `ready-for-review` ao Arquiteto Master (sem propagar aos satélites nesta REQ).

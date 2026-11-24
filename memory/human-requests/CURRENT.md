# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-087.md](req-087.md) (`REQ-087`)
* **Status**: `READY_FOR_EXECUTION` — aguardando início pelo Executor Tático
* **Lote Relacionado**: `BATCH-089` ([batch-089.md](../implementation/batch-089.md), a criar/preencher pelo Executor)
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-11-24
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/archive/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-086.md](req-086.md) (`BATCH-088`, Melhorias em 7 skills canônicas na matriz + Propagação Global Isolada via Worktree das 11 skills do ciclo `REQ-084/085/086` em 7/9 satélites com limpeza total das worktrees + alinhamento `AGENTS.md`/`GEMINI.md`; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-085.md](req-085.md) (`BATCH-087`, Melhorias em 4 skills canônicas + 2 micro-ajustes do `REP-007` em PT-BR/EN somente na matriz, `HOMOLOGATED` em 2026-11-23)
  - [req-084.md](req-084.md) (`BATCH-086`, Melhorias em 3 skills canônicas PT-BR/EN na matriz + Faxina Determinística dos 10 Ativos com reescrita de links, `HOMOLOGATED` em 2026-11-23)
  - [req-083.md](req-083.md) (`BATCH-085`, Ajustes do `REP-005` + Paridade PHP de `memory:get/set` no Core + Integração Isolada via Worktree em 7/9 Satélites com Limpeza Total das Worktrees; `conn2flow-home` e `conn2flow-mkt` sem `origin` a cargo dos chefes locais, `HOMOLOGATED` em 2026-11-23)
  - [req-082.md](req-082.md) (`BATCH-084`, Propagação Global da `REQ-081` + Melhorias do `REP-004` [`FEAT-018` / `FEAT-019`] + Diretriz Git do Arquiteto Master + Segunda Propagação Global, `HOMOLOGATED` em 2026-11-23)
  - [req-081.md](req-081.md) (`BATCH-083`, Caixa Copiável Obrigatória no Arquiteto Master [`FEAT-016`] e Relatório Obrigatório de Dificuldades do Executor [`FEAT-017`], `HOMOLOGATED` em 2026-11-21)
  - [req-080.md](req-080.md) (`BATCH-082`, Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX, `HOMOLOGATED` em 2026-11-18)
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](archive/req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](archive/req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](archive/req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-087 / BATCH-089 (Fase 0 do ARCH-018)

1. **4 Melhorias Operacionais + Micro-ajustes `REP-008` (Somente Matriz, PT-BR + EN)**:
   - `c2f-hooks-system`: regra de broadcast de `plataforma_gateways` (nunca encerrar requisição quando o gateway não for do módulo) + alinhamento da nota `REQ-077`.
   - `c2f-payment-gateways`: roteiro de reenvio de webhook assinado (HMAC-SHA256) do Mercado Pago, conferido em modo somente leitura no código do Core.
   - `c2f-architect-master` e `memory/process/STARTER-PROMPTS.md`: proibir prescrever `--skip-css` com `project:deploy` (+ alinhamento `REQ-077` em `STARTER-PROMPTS.md`).
   - `c2f-shell-and-windows-traps`: complementar armadilha 21 (`git diff` do deploy deixando `index.lock` no OneDrive) + verificação `git ls-files --eol` na restauração por blob (`REP-008`).
   - `c2f-multilingual-skills-governance`: esclarecer exit code 1 da auditoria global após escrita seletiva (`REP-008`).
2. **Saneamento `SDD` → `MDD` nas 13 Skills Canônicas**: atualizar referências operacionais obsoletas a `SDD`/`sdd/` em PT-BR e EN (preservando contexto histórico, fallback legado e comandos CLI literais do Core).
3. **Explicitação "MDD como Evolução do SDD"**: registrar com clareza em `memory/00-baseline-architecture.md`, `memory/02-policy.md` e nos boilerplates MDD PT-BR/EN em `templates/`.
4. **Sync, Hashes & Validação Local (Categoria B)**: sincronizar 5 kits/templates na matriz (`--repos conn2flow-ai-workspace`), atualizar hashes EN das skills alteradas, validar auditoria (`PASS`, `0` divergências, `0` drift) e `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` (`100% PASS`), entregando `batch-089.md` + `FEAT-017` + `VALIDATION-CHECKLIST.md` + `mdd index` em `ready-for-review` (sem commit/push e sem propagar aos satélites).

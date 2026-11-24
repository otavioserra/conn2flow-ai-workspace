---
id: "ARCH-018"
title: "Motor de Retroalimentação e Auto-Evolução de Skills, Personas Canônicas, Subskills e Memória de Aprendizados (MDD)"
status: "COMPLETED"
date: "2026-11-24"
author: "architect"
target_repo: "conn2flow-ai-workspace"
related:
  - "ARCH-011"
  - "ARCH-016"
  - "ARCH-017"
  - "FEAT-017"
summary_short: "Arquitetura IDE-agnóstica de retroalimentação contínua de skills (global e local de projeto), 5 personas c2f-persona-*, subskills, memory/learnings/, painel VS Code e skill evals."
summary_medium: "Substitui o repasse manual de relatórios FEAT-017 por um barramento federado (mdd-client + MCP + GitHub Issues) com curadoria em 4 filtros, otimização de longo prazo e skill evals.\nDefine 5 personas padronizadas, diferenciação entre aprendizado/skills locais de projeto e skills globais da matriz, índice de skills com subskills, e explicitação de MDD como evolução do SDD."
---

# ARCH-018 — Motor de Retroalimentação e Auto-Evolução de Skills, Personas Canônicas, Subskills e Memória de Aprendizados

* **Status**: `PROMOTED` — Fases 0–3 homologadas; Fase 4 entregue em `REQ-091` / `BATCH-093` (`ready-for-review`). A marcação final `COMPLETED` fica para a homologação do Macro-Arquiteto (ver §7).
* **Origem**: Sessão arquitetural com o Engenheiro Chefe Humano em 2026-11-24
* **Relacionados**: [ARCH-011](ARCH-011-mdd-hub-and-documentation-watcher.md), [ARCH-016](ARCH-016-mcp-hub-dual-dispatch-channels-headless.md), [ARCH-017](ARCH-017-mdd-database-engine-sqlite-fts5-and-sql-driver.md), [FEAT-017](FEAT-017-executor-ai-workspace-friction-report.md)

---

## 1. Problema e Objetivo

A adoção do relatório obrigatório de dificuldades (`FEAT-017`) gerou um fluxo rico de melhorias reais vindas de múltiplos repositórios, porém o repasse manual entre chats gera fadiga operacional. O objetivo desta arquitetura é criar um **sistema contínuo, auditável e IDE-agnóstico** que:

1. **Coleta automaticamente** aprendizados e sugestões de todas as personas em qualquer repositório (via CLI `mdd-client`, MCP `conn2flow-hub` e GitHub Issues).
2. **Separa o que é conhecimento local do projeto** (regras de negócio e skills próprias do cliente/satélite) do que é **conhecimento universal da matriz `conn2flow-ai-workspace`**.
3. **Impede alucinação, duplicação e inchaço (*skill bloat*)** através de um Tribunal de 4 Filtros, organização em `skills/index.md` + `subskills/`, e validação empírica por testes unitários de skills (`mdd eval`).
4. **Mantém o controle humano leve na entrada** (extensão VS Code como primeiro painel visual de controle do `mdd-client`, `conn2flow-hub` e fila de curadoria), evoluindo gradualmente para auto-curadoria supervisionada por métricas.
5. **Consolida a terminologia MDD** em todo o ecossistema, deixando explícito em `00-baseline-architecture.md` e `02-policy.md` que **MDD (Memory Driven Development) é a evolução direta do SDD (Spec-Driven Development)**.

---

## 2. Catálogo de 5 Personas Canônicas (`c2f-persona-*`)

Padroniza as skills de papel com prefixo explícito `c2f-persona-*` (separando claramente **quem age** das skills técnicas de domínio `c2f-*`):

| Persona | Substitui | Escopo de Presença | Responsabilidade |
| :--- | :--- | :--- | :--- |
| **`c2f-persona-architect`** | `c2f-architect-master` | Matriz + Satélites | Macro-Arquiteto / Engenheiro Chefe. Planeja, especifica, homologa e envia feedbacks de governança/prompts. |
| **`c2f-persona-executor`** | `c2f-executor-agent` | Matriz + Satélites | Micro-Executor Tático. Implementa lotes, registra aprendizados e envia feedbacks técnicos. |
| **`c2f-persona-reviewer`** | `c2f-reviewer-agent` | Matriz + Satélites | Revisor Técnico / Auditor Independente. Audita diffs/contratos e envia feedbacks de qualidade/segurança. |
| **`c2f-persona-curator`** | *(nova)* | **Matriz (escopo global) + Projetos/Satélites (escopo local)** | **Na Matriz**: processa inbox local + GitHub Issues (`skill-feedback`), aplica o Tribunal de 4 Filtros, verifica código real e monta lotes de evolução das skills `c2f-*`. **Nos Projetos/Satélites**: destila `memory/raw/` em `memory/learnings/`, cria/mantém **skills locais do projeto** (sem colidir com `c2f-*`) e encaminha à matriz apenas o que for universal. |
| **`c2f-persona-optimizer`** | *(nova)* | **Matriz** *(+ auditoria local opcional)* | Otimizador de longo prazo (ciclo mensal/bimestral): revisa todo o catálogo de skills, corta redundâncias, aplica *Skill Budget*, move receitas raras para `subskills/` e valida ganho de eficiência com `mdd eval`. |

> **Regra de migração**: a renomeação das 3 personas originais exige mapa de aliases em `scripts/skills/sync-skills.cjs` para substituição limpa nos 5 kits e templates PT-BR/EN sem duplicação nos satélites.

---

## 3. Arquitetura de Conhecimento em 2 Escopos (Projeto Local vs. Matriz Global)

### 3.1 Memória Evolutiva de Aprendizados (`memory/learnings/`)
Cada repositório MDD passa a contar com uma pasta dedicada de aprendizados destilados da IA (`memory/learnings/LRN-XXX-<slug>.md`, com `index.md`, YAML frontmatter e compactação dual `archive/compacted|original`), fechando o ciclo:

1. **`memory/raw/active/`**: observações brutas geradas durante o lote.
2. **`memory/learnings/`**: aprendizados verificados e estruturados do próprio repositório (causa raiz + evidência + anti-padrão), consultados antes de novas tarefas para reduzir *AI slop*.
3. **Skills Locais do Projeto** (curadas localmente por `c2f-persona-curator` em modo local): regras específicas do domínio do cliente, preservadas pelo `sync-skills.cjs`.
4. **Feedback Federado → Matriz** (`mdd feedback submit` / MCP / GitHub Issue `skill-feedback`): apenas achados universais do framework sobem para a matriz `conn2flow-ai-workspace`.

### 3.2 Índice de Skills (`skills/index.md`) e `subskills/`
* **`skills/index.md`** (gerado automaticamente, análogo ao `memory/index.md`): cataloga personas, skills raiz, subskills, contagem de linhas/*budget* e última revisão.
* **`<skill>/subskills/*.md`**: receitas extensas ou específicas de um provedor/caso (ex.: `c2f-payment-gateways/subskills/mercadopago-webhook-hmac.md`) vivem sob a skill-mãe e **não inflam o system prompt inicial** das IDEs, sendo carregadas sob demanda (progressive disclosure).

---

## 4. Tribunal Anti-Bloat (4 Filtros) e Skill Evals (`mdd eval`)

Toda proposta de alteração em skill passa por 4 filtros antes de ser apresentada ao humano (ou promovida):

1. **Prova de Evidência & Autoridade do Código**: feedback sem arquivo/linha, erro medido ou teste é rejeitado (`NEEDS_EVIDENCE`); o Curador valida contra o código real antes de redigir.
2. **Quarentena por Recorrência vs. Severidade**: falhas críticas (HTTP 500, perda de dados, segurança, locks) entram na 1ª ocorrência; dicas/micro-atritos ficam em `QUARANTINE` até 2+ ocorrências em lotes distintos.
3. **Orçamento de Tamanho (*Skill Budget*)**: teto de linhas/tokens por skill; perto do teto, proibido apenas apendar no rodapé — obrigatório condensar, refatorar ou mover detalhes para `subskills/`.
4. **Revisão Cética ("Advogado do Diabo")**: segunda verificação focada em vetar duplicação, contradição com `REQ-077`/`DEC-136`/`AGENTS.md`, ou vazamento de regra de projeto privado para a matriz.
5. **Skill Evals (`mdd eval`)**: banco de cenários sintéticos de regressão de skills rodados antes e depois da edição contra modelo rápido; só candidatos **`EVAL-PASS`** (maior ou igual precisão sem aumento injustificado de tokens) avançam.

---

## 5. Desacoplamento de IDE & Painel na Extensão VS Code

* **Cérebro 100% agnóstico de IDE**: reside no **`mdd-client` (Python + SQLite/FTS5)** e no **`conn2flow-hub` (MCP)**, com backend duplo de inbox (pasta `memory/inbox/feedback/` + GitHub Issues).
* **Primeiro Painel Visual (Extensão VS Code)**: nova aba **"MDD Hub & Skills Control"** consumindo o `mdd-client`/`conn2flow-hub`, exibindo:
  - Status em tempo real (`RUNNING`/`STOPPED`) e ações Start/Stop/Restart para **MDD Client** e **`conn2flow-hub`**.
  - Fila de feedbacks e curadoria (local + GitHub Issues) com triagem visual.
* **Evolução futura**: mesma camada visual portável para `mdd ui` (web local) ou app desktop sem duplicar lógica.

---

## 6. Roadmap de Execução em 5 Fases

| Fase | REQ Planejada | Escopo Principal |
| :--- | :--- | :--- |
| **Fase 0** | `REQ-087` | 4 melhorias operacionais atuais + notas `REP-008` + limpeza `SDD` → `MDD` nas 13 skills canônicas + explicitação de MDD como evolução do SDD em `00-baseline-architecture.md` e `02-policy.md` (+ templates MDD). |
| **Fase 1** | `REQ-088` | Rename para `c2f-persona-{architect,executor,reviewer}` com mapa de aliases no `sync-skills.cjs` + criação de `c2f-persona-curator` (escopo global + local) e `c2f-persona-optimizer` + `skills/index.md` + padrão `subskills/` + `memory/learnings/` nos boilerplates + rollout global consolidado. |
| **Fase 2** | `REQ-089` | Barramento `mdd feedback submit / list / triage` no `mdd-client` + tool MCP no `conn2flow-hub` + integração com GitHub Issues (`skill-feedback`) + conexão das 3 personas operacionais. |
| **Fase 3** | `REQ-090` | Nova aba na Extensão VS Code (controle de status/ativação de `mdd-client` e `conn2flow-hub` + painel de feedbacks/curadoria) + limpeza de rótulos `SDD` na extensão (mantendo fallback silencioso) + modernização `SDD` → `MDD` no Core CLI (`conn2flow/cli/src/`). |
| **Fase 4** | `REQ-091` | *Skill Budget* automático no auditor, quarentena por recorrência, Advogado do Diabo e runner `mdd eval` com cenários de regressão de skills. |

## 7. Situação das 5 fases (registro do Executor, 2026-11-24)

| Fase | Lote | Situação | Entrega verificada |
| --- | --- | --- | --- |
| 0 | [BATCH-089](../implementation/archive/batch-089.md) | `HOMOLOGATED` | 4 melhorias operacionais, saneamento SDD→MDD nas 13 skills, MDD como evolução do SDD |
| 1 | [BATCH-090](../implementation/archive/batch-090.md) | `HOMOLOGATED` | 5 personas `c2f-persona-*` com aliases, 48 skills, `index.md`, `subskills/`, `memory/learnings/` |
| 2 | [BATCH-091](../implementation/archive/batch-091.md) | `HOMOLOGATED` | `mdd feedback submit/list/triage`, inbox `FB-XXX`, GitHub Issues, tools MCP no `conn2flow-hub` |
| 3 | [BATCH-092](../implementation/archive/batch-092.md) | `HOMOLOGATED` | Aba MDD Hub & Skills Control, paridade MCP Python, `ai:archive-memory` no Core |
| 4 | [BATCH-093](../implementation/archive/batch-093.md) | `ready-for-review` | Filtro 2 (quarentena por recorrência por origem `(repo, batch)`), filtro 3 (`--budget-report`), aviso de divergência entre cópias EN, filtro 5 (`mdd eval` determinístico, 13 cenários, provider plugável), primeira curadoria real (FB-001..003 `ACCEPT`) e rollout das Fases 0–4 em 7 satélites |

- **Filtro 4 (Advogado do Diabo)**: segue como revisão cética da persona `c2f-persona-curator`, sem automação. A Fase 4 não o implementou em código.
- **Filtro 5**: o provider `deterministic` checa termos, regex e anti-padrões nas skills e nas cópias traduzidas. A comparação "antes e depois contra modelo rápido" aguarda um provider LLM registrado via `register_provider`.
- **Fora do rollout**: `conn2flow-home` e `conn2flow-mkt` (sem `origin`) ficam a cargo dos chefes locais.

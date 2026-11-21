---
id: "FEAT-016"
title: "Caixa de texto copiar-e-colar obrigatória no encerramento de requisições do Arquiteto Master"
status: "COMPLETED"
date: "2026-11-21"
author: "architect"
target_repo: "conn2flow-ai-workspace"
summary_short: "Instruir c2f-architect-master a sempre devolver um bloco copiável de acionamento ao criar requisições, mesmo em modos automáticos."
summary_medium: "Regra normativa na skill c2f-architect-master (e kits/traduções) para que toda criação de requisição termine com um bloco de texto copiável.\nA caixa orienta o próximo agente em alto nível e aponta para a especificação completa, permanecendo sempre visível como opção manual."
---

# FEAT-016 — Caixa de texto copiar-e-colar obrigatória no encerramento de requisições do Arquiteto Master

* **Status**: `PROMOTED` (`REQ-081` / `BATCH-083`)
* **Tipo**: Governança / Skills / DX
* **Autor**: Arquiteto Master (a pedido do Engenheiro Chefe Humano)
* **Data de Criação**: 2026-11-21
* **Repositórios Alvo**: `conn2flow-ai-workspace` (skills canônicas, traduções e kits) e propagação posterior para satélites / Core

---

## 🎯 Contexto e Motivação

Atualmente, quando o Engenheiro Chefe Humano solicita ao Arquiteto Master a criação de uma nova requisição (`req-XXX.md`), o agente cria corretamente os documentos normativos e atualiza o ponteiro em `memory/human-requests/CURRENT.md`, mas frequentemente **não devolve ao final da resposta uma caixa de texto pronta para clicar e copiar** contendo a instrução de acionamento do agente executor/revisor.

Como consequência, o operador humano precisa enviar repetidamente um pedido extra ao Arquiteto Master para gerar esse bloco de texto copiável.

### Princípio Esperado
- **A requisição (`req-XXX.md`)** é a **especificação completa** (normativa e detalhada).
- **A caixa de texto copiar-e-colar** é o **gatilho operacional conciso** que o humano copia e envia ao agente (ex.: orientando em alto nível o objetivo, a skill, o repositório e mandando iniciar lendo o arquivo da requisição).
- **Sempre visível, mesmo em modos automáticos**: Mesmo quando o ambiente estiver operando com infraestrutura de despacho automático (`autonomo_monitorado`, `autonomo_headless`, MCP Hub), o Arquiteto Master deve **sempre incluir a caixa de texto copiável** na resposta final. Assim, o operador sabe exatamente qual é a instrução de acionamento e mantém a opção de copiar e colar manualmente quando desejar.

---

## 📋 Escopo Proposto

1. **Atualização da skill canônica `c2f-architect-master`**:
   - Reforçar e expandir a seção **6. Handoffs de Prompts com Identificação de Repositório** (ou adicionar regra mandatória específica de encerramento de requisição) estabelecendo:
     - **Obrigatoriedade**: Toda vez que o Arquiteto Master criar ou atualizar uma requisição pronta para execução/revisão, **DEVE** incluir ao final da resposta um bloco de código copiável (` ```text ... ``` `) pronto para o humano copiar e enviar ao agente alvo.
     - **Papel do bloco**: Não repetir a especificação inteira; servir como instrução direta e clara de disparo ("começa aí" + contexto essencial) apontando para `memory/human-requests/CURRENT.md` e `req-XXX.md`.
     - **Campos mínimos obrigatórios na caixa**:
       * Skill do papel alvo (`c2f-executor-agent` ou `c2f-reviewer-agent`).
       * Identificador do repositório alvo e caminho absoluto da raiz do workspace.
       * Ponteiro para `memory/human-requests/CURRENT.md`, ID da requisição (`REQ-XXX`) e lote (`BATCH-YYY`).
       * Resumo curto (1–3 linhas) do objetivo geral da rodada para orientar o agente antes de abrir o arquivo.
       * Comando explícito de início (ex.: renderizar Live Todo List e iniciar conforme os critérios de aceite da requisição).
     - **Independência de modo de automação**: Deixar explícito que a caixa deve ser emitida **em qualquer modo de autonomia** (`supervisionado`, `autonomo_monitorado` ou `autonomo_headless`), servindo como referência transparente e opção manual de cópia.
2. **Governança Multilíngue (`c2f-multilingual-skills-governance`)**:
   - Atualizar a versão correspondente em inglês (`en`) da skill `c2f-architect-master` e atualizar o hash pairing SHA-256 sem drift.
3. **Propagação para os Kits Oficiais**:
   - Propagar via `scripts/skills/sync-skills.cjs` para todos os 5 kits (`.gemini/skills/`, `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`, `.github/skills/`) mantendo paridade total.
4. **Coerência Documental**:
   - Verificar se `memory/process/STARTER-PROMPTS.md` precisa de nota complementar alinhada à regra de caixa copiável obrigatória.

---

## ✅ Critérios de Aceite

1. A skill `c2f-architect-master` possui regra explícita e inequívoca exigindo a entrega de uma caixa de texto copiável (` ```text `) ao final de toda criação de requisição, com template claro de campos mínimos.
2. A regra deixa explícito que a caixa deve ser exibida inclusive quando houver infraestrutura de disparo automático (como opção manual e visibilidade da instrução).
3. As traduções (`pt-br` / `en`) e os 5 kits de agentes estão 100% sincronizados e aprovados na auditoria de hashes (Categoria B — apenas checks locais, sem deploy no Lab).

---

## 🔗 Referências

- Skill alvo: `.gemini/skills/c2f-architect-master/SKILL.md` (e fonte canônica de skills do workspace).
- Contratos de handoff: `.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md`.
- Templates de abertura: `memory/process/STARTER-PROMPTS.md`.

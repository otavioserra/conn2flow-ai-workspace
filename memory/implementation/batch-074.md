---
id: BATCH-074
title: Implementação da Trava Tripla MDD, Auto-Cura de Índices, Handoffs Adaptáveis e Pasta Canônica memory/human-reviews/
status: ready-for-intake
date: 2026-10-09
author: architect
target_repo: conn2flow-ai-workspace
summary_short: Live Todo List para implementação das 3 travas de governança do ARCH-015 / REQ-072
summary_medium: Rastreamento detalhado das etapas de scaffold de human-reviews/, skill c2f-mdd-indexing-and-handoffs, parsers de auto-cura de índices e políticas.
---

# BATCH-074 — Implementação da Trava Tripla MDD: Metadata Header com Auto-Cura de Índices, Handoffs Adaptáveis e Pasta Canônica `memory/human-reviews/`

- **Projeto**: `conn2flow-ai-workspace` (Matriz Central)
- **Raiz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-072](../human-requests/req-072.md)
- **Épico**: [ARCH-015](../backlog/ARCH-015-headless-triad-mechanics-and-human-reviews.md)
- **Status**: `ready-for-intake`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [ ] **1. Scaffolding da Pasta Canônica `memory/human-reviews/`**:
  - [x] 1.1 Provisionar diretório base `memory/human-reviews/` com `README.md` e `index.md`
  - [x] 1.2 Provisionar estrutura de arquivamento hierárquico `archive/`, `archive/compacted/` e `archive/original/`
  - [ ] 1.3 Criar template de exemplo de ficha de homologação (`templates/rev-example.template.md`)
- [ ] **2. Criação da 45ª Skill Canônica (`c2f-mdd-indexing-and-handoffs`)**:
  - [ ] 2.1 Criar `.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md` com padrão de frontmatter, regras de indexação e handoffs
  - [ ] 2.2 Espelhar a skill canônica em `.claude/skills/`, `.cursor/skills/`, `.codex/skills/` e `.github/skills/`
  - [ ] 2.3 Atualizar a contagem oficial de skills no ecossistema (de 44 para **45 skills**)
- [ ] **3. Ferramentas de Auto-Cura e Mutação via CLI (`c2f memory:index`, `c2f memory:set`, `mdd meta`)**:
  - [ ] 3.1 Especificar e prototipar parser com extração YAML e fallback gracioso para arquivos antigos sem cabeçalho
  - [ ] 3.2 Implementar comando de auto-cura `memory:index` no CLI Core (`conn2flow/cli`)
  - [ ] 3.3 Implementar comandos de mutação atômica `memory:set` e `memory:get` no CLI Core com re-sincronização instantânea do `index.md`
  - [ ] 3.4 Integrar rotinas de indexação e mutação de metadados (`mdd index` e `mdd meta set/get`) no Python MDD Client (`tools/mdd-client`)
- [ ] **4. Governança, Políticas e Boilerplates**:
  - [ ] 4.1 Atualizar `memory/01-general-memory.md` com a inclusão de `human-reviews/` e a Trava Tripla
  - [ ] 4.2 Atualizar `memory/02-policy.md` com os protocolos formais de handoff (topologias `solo`, `dupla`, `triade` e autonomias)
  - [ ] 4.3 Atualizar manuais de abertura rápida (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `memory/process/STARTER-PROMPTS.md`)
  - [ ] 4.4 Atualizar boilerplates e skeletons em `templates/` (en e pt-br)
- [ ] **5. Auditoria, Validação e Recibo**:
  - [ ] 5.1 Testar execução do comando de auto-cura gerando índices de teste e conferir integridade de links
  - [ ] 5.2 Conferir suíte de testes da extensão VS Code (124/124 testes)
  - [ ] 5.3 Gerar recibo de conclusão e fechar lote

---

## 🛡️ Regras Invioláveis de Execução

1. **Fallback Gracioso Mandatório**: Nenhuma alteração pode quebrar ou descartar arquivos legados sem frontmatter. O parser deve extrair título e resumo inicial de forma tolerante.
2. **Proibição de `git add .` e `-A`**: Commits devem listar exclusivamente os arquivos modificados.
3. **Respeito aos Processos Concorrentes**: Não modificar a árvore `tools/` de forma que cause conflitos com a implementação de Python em andamento na branch `feat/req-069`.

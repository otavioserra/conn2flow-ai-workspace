---
id: "ARCH-019"
title: "MDD Agnóstico de Framework & Instalador Universal de Projetos (CLI + Extensão + App Visual)"
status: "PROMOTED"
date: "2026-11-24"
author: "architect"
target_repo: "conn2flow-ai-workspace"
related:
  - "ARCH-018"
  - "ARCH-011"
  - "ARCH-014"
summary_short: "Desacopla a camada MDD do Conn2Flow para que qualquer projeto possa selecionar sua pasta, instalar memória/personas/curadoria local automaticamente e operar sem depender de IDE específica."
summary_medium: "Evolui a infraestrutura validada no ARCH-018 para um motor agnóstico de stack.\nUm instalador universal (primeiro na extensão DevTools e depois em UI web/desktop) inspeciona o projeto alvo, instala a estrutura memory/ + personas + curador local, gera skills iniciais do projeto e conecta o ciclo de aprendizado contínuo."
---

# ARCH-019 — MDD Agnóstico de Framework & Instalador Universal de Projetos

* **Status**: `ICEBOX` (registrado após conclusão e validação prática do [ARCH-018](ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) em 2026-11-24)
* **Visão do Engenheiro Chefe**: Separar formalmente o **núcleo universal MDD** (memória em 4 camadas, `memory/learnings/`, 5 personas, `skills/index.md`, `subskills/`, `mdd feedback`, `mdd eval`) dos pacotes específicos do Conn2Flow PHP, permitindo que qualquer desenvolvedor selecione a pasta de qualquer projeto (Node, Python, PHP, Go, Rust, etc.) e tenha o MDD instalado, adaptado e pronto para uso automaticamente.

## Pilares Planejados

1. **Catálogo Plugável de Domínios (`domains/<id>/domain.json`)**:
   - **Core MDD Universal (`domains/generic/domain.json`)**: `memory/`, 5 personas (`c2f-persona-*`), governança MDD, `mdd-client`, `mdd feedback`, `mdd eval` e geração de skill local do projeto.
   - **Domínios de Stack / Framework (`domains/<id>/domain.json`)**: `domains/conn2flow/` entregue de fábrica; novos domínios (ex.: `laravel`, `nextjs`, `python-fastapi`, `content-ops`) entram via **Pull Request** apenas adicionando sua pasta em `domains/<id>/` com manifesto declarativo (`id`, `name`, `detectors`, `skills`, `subskills`, `templates`), descobertos dinamicamente pelo `mdd bootstrap` e pela extensão VS Code sem alterar código.
2. **Bootstrap Inteligente por Pasta**:
   - Usuário aponta a pasta do projeto (via extensão VS Code ou futuro app web/desktop `mdd ui`).
   - O instalador detecta stack, linguagem, gerenciador de pacotes, testes e estrutura Git; gera `memory/`, configura kits de IA selecionados e cria um esqueleto de skills locais do projeto.
3. **Operação Multi-Cliente**:
   - Toda a lógica permanece no `mdd-client` / MCP, permitindo alternar livremente entre VS Code, Antigravity, Claude Code, Codex, Cursor ou interface web/desktop standalone.

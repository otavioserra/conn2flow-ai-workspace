# 🏛️ Arquitetura de Agente Duplo (Double Agent SDD Framework)

A engenharia de software com Inteligência Artificial em bases corporativas falha quando um único modelo tenta atuar simultaneamente como planejador estratégico e executor de código. 

O **Modelo de Agente Duplo com Desenvolvimento Guiado por Especificações (SDD)** resolve esse problema dividindo a inteligência em dois papéis complementares sobre uma fonte única de verdade no Git (`sdd/`).

---

## 👥 1. Os Dois Papéis Fundamentais

```mermaid
flowchart TD
    Human["👨‍💻 Engenheiro Chefe Humano"] -->|Ideias & Decisões| Architect["🏛️ Macro-Arquiteto (Antigravity / Gemini 3.7 Flash)"]
    Architect -->|Especificações & Requisições (sdd/)| SingleTruth[("📁 Repositório Local (Git / SDD)")]
    SingleTruth -->|Consumo de Tarefas Atômicas| Executor["⚡ Micro-Executores (Claude Code / Cursor / Copilot)"]
    Executor -->|Código Limpo, Testes & Logs| Codebase[("💻 Código-Fonte & Testes")]
    Codebase -->|Evidências & Validação| Human
```

### 🧠 A. O Macro-Arquiteto (Antigravity / Gemini 3.7 Flash)
* **Escopo**: Alto nível de abstração, planejamento de negócio, design de sistema e governança de dados.
* **Entradas**: Áudios, anotações soltas, ideias de novas funcionalidades e regras de negócio do usuário.
* **Saídas**: Artefatos formais no SDD:
  - `sdd/SPEC.md`: Especificação técnica viva do projeto.
  - `sdd/decisions/DECISION-LOG.md`: Registro de decisões arquiteturais.
  - `sdd/human-requests/req-XXX.md`: Requisições atômicas e prontas para execução.
* **Regra de Ouro**: O Arquiteto **nunca edita arquivos de código-fonte diretamente**. Ele preserva o contexto mental limpo para tomada de decisão estratégica.

### ⚡ B. Os Micro-Executores (Claude Code / Cursor / Copilot)
* **Escopo**: Baixo nível de abstração, implementação tática, edição de arquivos, execução de comandos e testes unitários.
* **Entradas**: Requisições atômicas (`req-XXX.md`), skills de governança (`c2f-*`) e memórias de execução.
* **Saídas**: Modificações de código, compilação de dados de recursos (`*Data.json`), migrações Phinx e relatórios de encerramento de lote (`sdd/implementation/batch-YYY.md`).
* **Regra de Ouro**: O Executor **nunca altera as especificações ou decisões arquiteturais**. Qualquer divergência encontrada deve gerar uma Solicitação de Mudança (`CR-XXX.md`).

---

## 🛡️ 2. Pilares de Sustentação da Metodologia

1. **Fronteira de Escrita (Ping-Pong Boundary)**: O Arquiteto e o Executor possuem permissões rígidas sobre quais pastas do repositório podem modificar.
2. **Colheita de Habilidades (Skill Harvesting)**: Quando um executor comete um erro ou descobre uma convenção de framework, a regra é extraída e transformada em uma Skill atômica sob demanda (`.claude/skills/`, etc.), em vez de inflar os prompts de sistema.
3. **Poda de Memória (Memory Gardening)**: Memórias operacionais são mantidas abaixo de 10 KB, podando o histórico para ~5 KB e arquivando logs antigos em subpastas `/archive/`.
4. **Intake Gate no Backlog (`sdd/backlog/`)**: Ideias em incubação (`ICEBOX` e `IN-DISCUSSION`) são blindadas contra leitura precipitada de agentes executores até promoção humana explícita.

# ARCH-009: Transição Arquitetural SDD ➔ MDD (Memory Driven Development) e Nomenclatura Global em Inglês

- **Tipo**: Arquitetura / Metodologia
- **Status**: `PROMOTED` (promovido para `REQ-067` / `BATCH-069` em 2026-10-09)
- **Origem**: Humano-no-Loop (Engenheiro Chefe)
- **Lote Relacionado**: `BATCH-069`
- **Data de Criação**: 2026-10-09

---

## 🎯 Contexto & Motivação

O framework Conn2Flow nasceu alicerçado no paradigma **SDD (Spec-Driven Development)**, no qual uma especificação normativa estática (`SPEC.md`) regia o desenvolvimento subsequente. 

Com a evolução prática do trabalho multi-agente autônomo (Antigravity, Gemini, Claude Code, Cursor, Codex) em múltiplos repositórios (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`), o sistema transcendeu o conceito de "especificação". Na realidade, o coração da governança transformou-se em um subsistema cognitivo completo de **Memória**:
- Memória episódica (histórico de requisições, sessões, batches e entregas);
- Memória semântica e normativa (políticas, contratos, decisões arquiteturais);
- Memória procedural (44 skills canônicas, runbooks, hooks operacionais);
- Memória sináptica e latente (scratchpads de inferência de LLMs).

Assim, o framework evolui oficialmente para **MDD — Memory Driven Development**.

---

## 📋 Escopo da Mudança

1. **Renomeação Canônica da Raiz de Governança**:
   - A pasta `sdd/` é renomeada para `memory/` em todos os projetos do ecossistema.
2. **Nomenclatura Estrutural em Inglês**:
   - Pastas e nomes de arquivos canônicos passam a ser estritamente em inglês (`00-baseline-architecture.md`, `01-general-memory.md`, `02-policy.md`, `human-requests/`, `implementation/`, `reports/`, `raw/`, etc.). O conteúdo interno pode ser em qualquer idioma (português, inglês, etc.), mas a semântica dos arquivos e pastas segue o padrão internacional para maximizar a acurácia dos modelos de IA.
3. **Tríade de Fundação em `memory/`**:
   - `00-baseline-architecture.md`: mapa mestre conciso da arquitetura e da codebase.
   - `01-general-memory.md`: guia operacional sobre como a memória é consumida, atualizada e podada.
   - `02-policy.md`: política de governança de cada pasta, papéis (Arquiteto, Executor, Revisor), SLAs e limites.
4. **Novas Pastas Canônicas**:
   - `memory/reports/`: relatórios executivos de alto nível de agentes (auditorias, pós-frentes, desfechos de spikes).
   - `memory/raw/`: memória de trabalho nativa para modelos de linguagem.

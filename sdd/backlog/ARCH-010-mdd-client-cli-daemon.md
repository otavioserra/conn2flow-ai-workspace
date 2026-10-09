# ARCH-010: MDD Client CLI & Daemon (Python) — Gerenciamento Local de Memória, Injeção em Projetos e Telemetria

- **Tipo**: Ferramenta / CLI / Daemon
- **Status**: `ICEBOX` (aguardando conclusão da base física da REQ-067)
- **Origem**: Humano-no-Loop (Engenheiro Chefe)
- **Data de Criação**: 2026-10-09

---

## 🎯 Contexto & Motivação

Atualmente, a gestão de pastas de memória e sincronização de skills é parcialmente manual ou dispersa em scripts avulsos. A extensão do VS Code foi uma primeira interface, mas o ecossistema precisa de uma ferramenta CLI universal, independente de IDE e executável em qualquer ambiente (terminal, container, CI/CD, nuvem).

---

## 📋 Escopo da Ferramenta

1. **Linguagem & Stack**:
   - Desenvolvida em **Python** (com CLI moderna via `typer` / `rich` e daemon assíncrono).
2. **Injeção Universal de Memória (`mdd init`)**:
   - Capacidade de injetar a pasta `memory/` em **qualquer codebase ou projeto** (software web, backend, mobile, projetos de engenharia civil, produções artísticas/musicais, etc.).
3. **Auto-Atualização Periódica da Infraestrutura (`mdd sync`)**:
   - Sincronizar periodicamente as skills dos agentes locais (`.gemini/`, `.claude/`, `.cursor/`, `.codex/`) a partir da matriz canônica.
   - Atualizar templates e boilerplates.
4. **Coleta de Telemetria e Geração de Reports (`mdd report`)**:
   - Monitorar logs de build, atritos e erros dos agentes locais.
   - Gerar relatórios estruturados em `memory/reports/` e despachá-los para o MDD Hub.
5. **Automação de Arquivamento e Compactação Dual (`mdd compact`)**:
   - Automatizar a poda de arquivos que atingem o teto de 50 KB / 10 itens ativos, gerando resumos em `archive/compacted/` e preservando originais em `archive/original/`.

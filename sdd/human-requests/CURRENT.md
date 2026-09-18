# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-056.md](req-056.md)
* **Status**: `APPROVED`
* **Lote Relacionado**: `BATCH-058`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-18
* **Lote Anterior Concluído**: [req-055.md](req-055.md) (`BATCH-057`)

## 🎯 Objetivo Operacional do Lote BATCH-058

Incorporação canônica das 3 novas armadilhas de shell/Windows e sincronização integral nos 5 repositórios:
1. **Consolidação na Matriz Central (`conn2flow-ai-workspace`)**: Atualizar `c2f-shell-and-windows-traps/SKILL.md` com as Armadilhas 7 (`rsync: dup() in/out/err failed` e pareamento cwRsync/SSH), 8 (sequências ANSI no Tailwind CLI) e 9 (`cd` antes de `sudo -u` no HestiaCP).
2. **Propagação Global**: Espelhar as 39 skills oficiais em todas as pastas de kit (`.claude/skills/`, `.gemini/skills/`, `.codex/skills/`, `.cursor/skills/` e `.github/skills/`) nos 5 repositórios (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`).
3. **Auditoria MD5 & Preservação**: Verificar paridade com zero divergências nas 39 skills canônicas e preservar skills privadas/locais de satélites.

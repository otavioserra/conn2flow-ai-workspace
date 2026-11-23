---
id: "FEAT-018"
title: "Sync restrito à matriz e estabilidade de hashes SHA-256 de skills frente a finais de linha (CRLF/LF)"
status: "COMPLETED"
date: "2026-11-21"
author: "architect"
target_repo: "conn2flow-ai-workspace"
summary_short: "Documentar sync restrito à matriz (--repos) e estabilizar hashes SHA-256 de traduções contra divergências de CRLF/LF."
summary_medium: "Origem: REP-004 (BATCH-083). Adiciona exemplos de sync/auditoria restritos à matriz na skill c2f-multilingual-skills-governance.\nPropõe normalização determinística de finais de linha (LF) e/ou .gitattributes para evitar falso drift de SHA-256 entre checkouts."
---

# FEAT-018 — Sync restrito à matriz e estabilidade de hashes SHA-256 de skills frente a finais de linha (CRLF/LF)

* **Status**: `ICEBOX` (aguardando promoção formal para `memory/human-requests/`)
* **Tipo**: Governança / Skills / Ferramental (`sync-skills.cjs`)
* **Origem**: [REP-004 — Dificuldades e Aprendizados do BATCH-083](../reports/REP-004-batch083-skills-learnings.md)
* **Autor**: Arquiteto Master
* **Data de Criação**: 2026-11-21
* **Repositórios Alvo**: `conn2flow-ai-workspace` (e paridade de auditoria no `mdd-client`)

---

## 🎯 Contexto e Problema (evidenciado em REP-004)

Durante a execução do `REQ-081` / `BATCH-083` (Categoria B, escopo restrito à matriz `conn2flow-ai-workspace`), o Executor enfrentou dois atritos diretos na governança multilíngue de skills:

1. **Risco de propagação acidental para satélites**: A skill `c2f-multilingual-skills-governance` documenta apenas `node scripts/skills/sync-skills.cjs --apply --all`, que por padrão inclui repositórios satélites. O agente precisou inspecionar o código-fonte do sincronizador para descobrir a flag `--repos conn2flow-ai-workspace` e evitar gravações fora do escopo autorizado.
2. **Fragilidade do hash SHA-256 a finais de linha (`CRLF` vs `LF`)**: O cálculo de `source_sha256` em `scripts/skills/translated.json` lê os bytes crus do arquivo na cópia de trabalho. No `BATCH-083`, `c2f-architect-master` usava `CRLF` e `c2f-executor-agent` tinha finais mistos; converter para `LF` alterava os hashes e produzia falsos alertas de drift, além de blobs Git anteriores já divergirem do registro.

---

## 📋 Escopo Proposto

1. **Documentação na skill `c2f-multilingual-skills-governance` (PT-BR + EN + 5 kits)**:
   - Adicionar exemplos explícitos de sincronização e auditoria restritos à matriz:
     ```sh
     node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace
     node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json
     ```
   - Orientar quando usar sync restrito à matriz (lotes Categoria B locais) vs. propagação global aos satélites.
   - Documentar a conferência do efeito de finais de linha (`CRLF`/`LF`) sobre os hashes até que a normalização seja concluída.
2. **Estabilidade determinística de finais de linha e hashes (Análise + Implementação)**:
   - Avaliar e decidir entre:
     - **(A — Recomendada)** Normalizar finais de linha (`\r\n` ➔ `\n`) em memória antes de calcular o `source_sha256` em `scripts/skills/sync-skills.cjs` e no auditor `mdd sync --audit` do `mdd-client`, eliminando dependência do `core.autocrlf` do checkout Windows/Linux; e/ou
     - **(B)** Definir regra versionada em `.gitattributes` para `.gemini/skills/**/*.md` e `templates/**/skills/**/*.md` (`text eol=lf`).
   - Validar com testes automatizados (fixtures com `CRLF`, `LF` e finais mistos) que o hash permanece idêntico em qualquer sistema operacional antes de migrar os hashes em `scripts/skills/translated.json`.

---

## ✅ Critérios de Aceite

1. A skill `c2f-multilingual-skills-governance` (PT-BR, EN e todos os 5 kits) documenta claramente o uso de `--repos conn2flow-ai-workspace` para sync e auditoria locais.
2. Testes automatizados comprovam que a detecção de drift SHA-256 é estável e livre de falsos positivos entre checkouts `CRLF` (Windows) e `LF` (Linux/CI), mantendo a detecção real de alterações de conteúdo.
3. Auditoria local `sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` passa com zero divergências e zero alertas de drift.

---

## 🔗 Referências

- Relatório de origem: [REP-004](../reports/REP-004-batch083-skills-learnings.md)
- Lote de origem: [BATCH-083](../implementation/archive/compacted/batch-083-95aade2d8707.md)
- Skill alvo: `.gemini/skills/c2f-multilingual-skills-governance/SKILL.md`
- Script sincronizador: `scripts/skills/sync-skills.cjs` e `scripts/skills/translated.json`

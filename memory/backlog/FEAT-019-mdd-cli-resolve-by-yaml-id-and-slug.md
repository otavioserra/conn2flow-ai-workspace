---
id: "FEAT-019"
title: "Resolução por ID do frontmatter YAML e prefixo com slug no mdd meta get/set e alinhamento da skill de indexação"
status: "PROMOTED"
date: "2026-11-21"
author: "architect"
target_repo: "conn2flow-ai-workspace"
summary_short: "Permitir que mdd meta get/set resolva artefatos por ID YAML (ex: REP-004) mesmo quando o arquivo possui slug no nome."
summary_medium: "Origem: REP-004 (BATCH-083). Hoje mdd meta get REP-004 falha porque o arquivo inclui slug no nome (REP-004-batch083-skills-learnings.md).\nEstender o resolvedor do mdd-client (e conferir paridade no Core CLI PHP) para buscar pelo campo id do YAML/prefixo e documentar o comportamento na skill."
---

# FEAT-019 — Resolução por ID do frontmatter YAML e prefixo com slug no `mdd meta get/set` e alinhamento da skill de indexação

* **Status**: `ICEBOX` (aguardando promoção formal para `memory/human-requests/`)
* **Tipo**: Ferramental / CLI (`mdd-client` & Core CLI) / Skills
* **Origem**: [REP-004 — Dificuldades e Aprendizados do BATCH-083](../reports/REP-004-batch083-skills-learnings.md)
* **Autor**: Arquiteto Master
* **Data de Criação**: 2026-11-21
* **Repositórios Alvo**: `conn2flow-ai-workspace` (`mdd-client` + skill `c2f-mdd-indexing-and-handoffs`) e paridade no `conn2flow` (`cli/` PHP)

---

## 🎯 Contexto e Problema (evidenciado em REP-004)

A skill `c2f-mdd-indexing-and-handoffs` afirma que os alvos de `mdd meta get/set` (e `php cli/c2f.php memory:get/set`) *"aceitam caminho em `memory/` ou nome/ID de arquivo único"*.

Porém, durante o `BATCH-083`, a consulta:
```sh
mdd meta get REP-004 status --json
```
retornou zero resultados porque o resolvedor atual do `mdd-client` compara apenas o nome ou *stem* exato do arquivo, enquanto artefatos como relatórios (`REP-004-batch083-skills-learnings.md`), itens de backlog (`FEAT-018-...md`, `ARCH-016-...md`) e outros documentos trazem o **ID canônico no frontmatter YAML (`id: "REP-004"`)** e um **slug no nome do arquivo**.

O agente só conseguiu consultar o metadado passando o caminho completo relativo (`memory/reports/REP-004-batch083-skills-learnings.md`).

---

## 📋 Escopo Proposto

1. **Melhoria no resolvedor de alvos do `mdd-client` (Python)**:
   - Em `mdd_client.core.indexer` (usado por `mdd meta get` e `mdd meta set`), ampliar a resolução de `target` com ordem determinística de precedência:
     1. Caminho explícito sob `memory/` (ex: `memory/reports/REP-004-batch083-skills-learnings.md`).
     2. Nome ou *stem* exato do arquivo (case-insensitive), preservando compatibilidade com `req-081`, `batch-083`.
     3. Correspondência exata pelo campo `id` do frontmatter YAML (case-insensitive, ex: `REP-004`, `FEAT-018`, `ARCH-016`) ou prefixo de ID seguido de `-` no *stem* (ex: `REP-004-*`).
   - Manter a trava de segurança contra ambiguidade: se mais de um arquivo casar com o mesmo ID, falhar com mensagem clara listando os caminhos candidatos e exigindo caminho explícito.
2. **Verificação de paridade no Core CLI (`php cli/c2f.php memory:get` / `memory:set`)**:
   - Confirmar se o resolvedor PHP apresenta a mesma limitação e, se sim, aplicar a mesma regra de resolução por `id:` YAML / prefixo com slug para manter paridade PHP/Python da Trava Tripla (`REQ-072`).
3. **Atualização da skill `c2f-mdd-indexing-and-handoffs` (PT-BR + EN + 5 kits)**:
   - Documentar explicitamente a regra de resolução por ID YAML, *stem* ou caminho relativo sob `memory/` (incluindo o exemplo de consulta por caminho para relatórios/backlogs com slug em caso de ambiguidade ou versões legadas do CLI).
4. **Cobertura de testes**:
   - Adicionar casos em `test_indexer.py` cobrindo resolução por ID YAML em arquivos com slug (`REP-004`, `FEAT-018`), fallback por caminho completo e erro determinístico em caso de ambiguidade.

---

## ✅ Critérios de Aceite

1. `mdd meta get REP-004 status --json` resolve corretamente `memory/reports/REP-004-batch083-skills-learnings.md` e retorna o valor esperado.
2. Casos ambíguos continuam falhando de forma determinística e informativa, sem mutação silenciosa.
3. Testes unitários do `mdd-client` (e do Core CLI, se aplicável) passam integralmente.
4. A skill `c2f-mdd-indexing-and-handoffs` (PT-BR, EN e 5 kits) reflete o comportamento real da ferramenta sem drift de tradução.

---

## 🔗 Referências

- Relatório de origem: [REP-004](../reports/REP-004-batch083-skills-learnings.md)
- Lote de origem: [BATCH-083](../implementation/batch-083.md)
- Skill alvo: `.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md`
- Contrato original: `REQ-072` / `ARCH-015` (Trava Tripla MDD)

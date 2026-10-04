# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-065.md](req-065.md)
* **Status**: `APPROVED` (aprovada pelo Humano para implementação imediata)
* **Lote Relacionado**: `BATCH-067`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-04
* **Lotes Anteriores / Em Espera**:
  - [req-064.md](req-064.md) (`BATCH-066`, lições de pipeline e traps nas skills, `ready-for-review`)
  - [req-062.md](req-062.md) (`BATCH-064`, release v1.1.2 da extensão VS Code, `ready-for-intake` / standby aguardando publicação humana)
  - [req-063.md](req-063.md) (`BATCH-065`, Chrome DevTools MCP, `HOMOLOGATED`)

---

## 🎯 Objetivo Operacional do Lote Ativo (BATCH-067)

Canonização de duas novas skills oficiais (`c2f-module-visual-assets` para Design System V3.0 de capas 3D e `c2f-tailwind-module-migration` para migração gradual de módulos Fomantic ➔ Tailwind), totalizando **43 skills canônicas**. Limpeza e atualização de `c2f-module-crud-scaffolding` (vinculação obrigatória de capas no manifesto), enriquecimento de `c2f-widget-development` (contrato de grid modular e `ajaxOpcao: 'widget-render'`), inclusão da **Armadilha 17** em `c2f-shell-and-windows-traps` (cache volátil do NPM e uso obrigatório de binários locais em `node_modules/.bin/`), atualização do catálogo em `AGENTS.md`/`GEMINI.md`, propagação com paridade MD5 de 100% para os 25 kits dos 5 repositórios e 14 templates, preservando as skills locais de satélites e validando `npm test` da extensão.

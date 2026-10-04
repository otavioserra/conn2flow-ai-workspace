# BATCH-067 — Canonização de Novas Skills, Contrato Modular de Widgets, Armadilha 17 e Propagação Global (43 Skills)

- Projeto: `conn2flow-ai-workspace`
- Caminho Raiz: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- Requisição: [REQ-065](../human-requests/req-065.md)
- Status: `ready-for-review`
- Executor: Antigravity (`c2f-executor-agent`)
- Data: 2026-10-04
- Autonomia: `autonomo_monitorado`

---

## 📋 Live Todo List

- [x] Incorporar `c2f-module-visual-assets` na matriz canônica (`.gemini/skills/` e kits `.claude`, `.cursor`, `.codex`, `.github`).
- [x] Importar `c2f-tailwind-module-migration` de `conn2flow/.gemini/skills/` para a matriz canônica (`.gemini/skills/` e kits).
- [x] Higienizar `c2f-module-crud-scaffolding` (remover frontmatter duplicado/BOM, corrigir mojibake UTF-8 e adicionar obrigatoriedade de capa via `c2f-module-visual-assets` com registro no `manifest.json`).
- [x] Atualizar `c2f-widget-development` com o contrato modular de grid (dimensões `width`/`height` dinâmicas, limites de redimensionamento e endpoint AJAX `ajaxOpcao: 'widget-render'`).
- [x] Adicionar a Armadilha 17 em `c2f-shell-and-windows-traps` e alinhar `c2f-tailwind-css-architecture` (proibição de `npx` e uso estrito de binários locais em `node_modules/.bin/`).
- [x] Atualizar `AGENTS.md` e `GEMINI.md` registrando o catálogo oficial de 43 skills canônicas.
- [x] Propagar globalmente via `node scripts/skills/sync-skills.cjs --apply --all`.
- [x] Auditar determinismo: `node scripts/skills/sync-skills.cjs --report completions/BATCH-067-skills-audit.json` (PASS, 0 divergências, 60 skills locais preservadas).
- [x] Executar suíte de testes da extensão do VS Code: `npm test` em `vscode-extension/` (124/124 testes verdes).
- [x] Gerar `sdd/implementation/batch-067.md`, atualizar `sdd/validation/VALIDATION-CHECKLIST.md#batch-067` e emitir recibo `completions/BATCH-067-executor-receipt.json`.

---

## 📊 Entregas e Modificações

### 1. Expansão Canônica para 43 Skills Oficiais

O ecossistema oficial de IA expande formalmente de 41 para **43 skills canônicas**:
1. **`c2f-module-visual-assets`**: Define o Design System V3.0 para geração e governança de capas 3D conceituais de módulos, especificações de arquivo WebP (1024×1024 px, 1:1, <120KB) e manifesto central.
2. **`c2f-tailwind-module-migration`**: Importada do Core (`conn2flow`), estabelece o protocolo passo a passo de migração gradual de módulos administrativos do Fomantic-UI para o Tailwind CSS v4 (`layout-administrativo-tailwind`, bundles de tela, controles `c2fc-*` e pontes de JS).

### 2. Higienização e Enriquecimento de `c2f-module-crud-scaffolding`

- **Remoção de Frontmatter Duplicado**: Eliminado o bloco residual com BOM (`\ufeff---`) e cabeçalho YAML legado.
- **Correção Integral de Mojibake**: Normalizados todos os caracteres acentuados corrompidos (`á`, `ã`, `ç`, `é`, `ê`, `í`, `ó`, `ô`, `õ`, `├──`, `└──`).
- **Obrigatoriedade de Capas**: Inserida a seção `1.1 Identidade Visual e Capa Obrigatória`, exigindo que todo módulo novo nasça com capa 3D padronizada (`gestor/assets/modulos/covers/<modulo-id>.webp` e `modulos/<modulo-id>/cover.webp`) e devidamente registrada em `gestor/assets/modulos/covers/manifest.json`.

### 3. Contrato Modular de Grid em `c2f-widget-development`

- **Dimensões Dinâmicas**: Especificadas propriedades de grid `width` (`grid_w`), `height` (`grid_h`) e limites operacionais (`min_w`, `max_w`, `min_h`, `max_h`) para suporte a redimensionamento e drag-and-drop sem quebra de layout.
- **Ciclo de Vida AJAX**: Padronizado o endpoint `ajaxOpcao: 'widget-render'`, definindo o payload de entrada (dimensões + parâmetros da instância) e retorno JSON (`{ status: 'Ok', data: { html, css } }`).

### 4. Armadilha 17 e Resolução de Binários em `node_modules/.bin/`

- **Armadilha 17 (`c2f-shell-and-windows-traps`)**: Documentado o risco de sumiço do executável `npx` e corrupção de cache volátil do NPM no Windows (`%LOCALAPPDATA%\npm-cache`), com proibição estrita de `npx` em pipelines e scripts automatizados.
- **Alinhamento em `c2f-tailwind-css-architecture`**: Regra 1 reformulada e seção `⚙️ Resolução de Binários Locais e Migração Modular` adicionada, impondo o uso direto de `node_modules/.bin/tailwindcss.cmd` e `node_modules/.bin/terser.cmd` (Windows) ou executáveis equivalentes no Linux/macOS.

### 5. Governança do Catálogo (`AGENTS.md` e `GEMINI.md`)

- `AGENTS.md` e `GEMINI.md` atualizados para declarar o catálogo oficial de **43 skills oficiais**:
  - **3 Skills** da Tríade SDD (`c2f-architect-master`, `c2f-executor-agent`, `c2f-reviewer-agent`).
  - **33 Skills** de Core, Módulos, Infra e Arquitetura.
  - **7 Skills** de Governança e Workflow SDD.

---

## 🔒 Auditoria Determinística e Propagação Global

Executado o script canônico `node scripts/skills/sync-skills.cjs`:
- **Modo Apply**: `node scripts/skills/sync-skills.cjs --apply --all` propagou 171 arquivos para os kits da matriz e satélites.
- **Modo Auditoria com Relatório**: `node scripts/skills/sync-skills.cjs --report completions/BATCH-067-skills-audit.json`:
  - **Status**: `PASS`
  - **Alvos Auditados**: 39 diretórios de kits (matriz, satélites e templates)
  - **Cópias Idênticas (MD5 correspondente)**: 1.628
  - **Traduções Preservadas nos Templates EN**: 21
  - **Divergências Encontradas**: 0
  - **Skills Locais dos Satélites Preservadas**: 60 (zero alteradas)

---

## 🧪 Suíte de Testes da Extensão VS Code

Execução de `npm test` em `vscode-extension/`:
```
# tests 124
# suites 0
# pass 124
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 200.0454
```
Exit code: **0** (100% verde).

---

## 📦 Recibo e Encerramento

Recibo operacional emitido em `completions/BATCH-067-executor-receipt.json`. Lote pronto para revisão técnica independente (`c2f-reviewer-agent`) e homologação executiva do Macro-Arquiteto.

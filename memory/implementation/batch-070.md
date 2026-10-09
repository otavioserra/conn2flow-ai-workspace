# BATCH-070 — Propagação da Transição Estrutural MDD nos 7 Repositórios Satélites do Ecossistema Conn2Flow

- **Projeto**: Multi-Repositório (`conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-068](../human-requests/req-068.md)
- **Status**: `ready-for-review`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [x] **1. conn2flow (Core Framework)**:
  - [x] 1.1 `git mv sdd memory`
  - [x] 1.2 Injetar Tríade Fundamental adaptada (`00-baseline-architecture.md`, `01-general-memory.md`, `02-policy.md`)
  - [x] 1.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 1.4 Atualizar referências em `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.codex/`
  - [x] 1.5 `php cli/c2f.php ai:sync` executado: 44 skills por kit, 37/37 obrigatórias; exit 1 porque 3 skills canônicas (c2f-ai-features, c2f-modelo-templates, c2f-module-visual-assets) não têm o bloco legado "Gatilho Obrigatório" que o validador do core exige (ver relatório)
  - [x] 1.6 Commit atômico com arquivos explícitos (sem `git add .`) e push
- [x] **2. conn2flow-site (Site Oficial)**:
  - [x] 2.1 `git mv sdd memory`
  - [x] 2.2 Injetar Tríade Fundamental adaptada
  - [x] 2.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 2.4 Atualizar referências de governança
  - [x] 2.5 Preservar as 9 skills locais e sincronizar as 44 canônicas
  - [x] 2.6 Commit atômico com arquivos explícitos e push
- [x] **3. conn2flow-nexus (Nexus Hub)**:
  - [x] 3.1 `git mv sdd memory`
  - [x] 3.2 Injetar Tríade Fundamental adaptada
  - [x] 3.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 3.4 Atualizar referências de governança e sincronizar skills
  - [x] 3.5 Commit atômico com arquivos explícitos e push
- [x] **4. conn2flow-app (App / API)**:
  - [x] 4.1 `git mv sdd memory`
  - [x] 4.2 Injetar Tríade Fundamental adaptada
  - [x] 4.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 4.4 Atualizar referências de governança e sincronizar skills
  - [x] 4.5 Commit atômico com arquivos explícitos e push
- [x] **5. lumix**:
  - [x] 5.1 `git mv sdd memory`
  - [x] 5.2 Injetar Tríade Fundamental adaptada
  - [x] 5.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 5.4 Preservar as 8 skills locais e sincronizar as 44 canônicas
  - [x] 5.5 Commit atômico com arquivos explícitos e push
- [x] **6. transformamp (Transform MP)**:
  - [x] 6.1 `git mv sdd memory`
  - [x] 6.2 Injetar Tríade Fundamental adaptada
  - [x] 6.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 6.4 Preservar as 19 skills locais e sincronizar as 44 canônicas
  - [x] 6.5 Commit atômico com arquivos explícitos e push
- [x] **7. conn2flow-mkt (Marketing)**:
  - [x] 7.1 `git mv sdd memory`
  - [x] 7.2 Injetar Tríade Fundamental adaptada
  - [x] 7.3 Provisionar `index.md` hierárquico, `memory/reports/` e `memory/raw/`
  - [x] 7.4 Atualizar referências de governança e sincronizar skills
  - [x] 7.5 Commit atômico com arquivos explícitos e push
- [x] **8. Auditoria Geral do Ecossistema**:
  - [x] 8.1 Verificar que nenhum repositório satélite mantém pastas `sdd/` órfãs
  - [x] 8.2 Suíte da extensão: 124/124 PASS; porém a descoberta multirepo ainda procura `sdd/` (src/repositoryLocator.ts:35, src/agentPromptPolicy.ts:33) e não enxerga `memory/` dos satélites migrados (ver relatório)
  - [x] 8.3 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **PROIBIDO `git add .` e `git add -A`**: Em todos os repositórios, liste estritamente os arquivos modificados.
2. **Preservação de Skills Locais**: As skills privadas (36 nos satélites) não podem ser removidas ou corrompidas.
3. **Preservação Histórica**: `git mv` garante que os logs e blame de Git sejam mantidos de ponta a ponta.

---

## Relatório de Execução (Executor, 2026-10-09)

Automação: `scripts/memory/batch-070-migrate.cjs <repo> "<papel>"` (git mv, tríade, índices, referências) + `scripts/skills/sync-skills.cjs --apply --all --repos ...`. Nenhum `git add .`/`-A`: sempre caminhos explícitos.

| Repositório | Branch | Commit | Push |
| --- | --- | --- | --- |
| conn2flow-nexus | main | 00a678a | ok |
| conn2flow-app | main | df07611 | ok |
| lumix | novo-chat-intelligence | 5e539a7 | ok |
| transformamp | main | 9def8a4 | ok |
| conn2flow-site | feat/req-122 | 895470df | ok |
| conn2flow | feat/req-265 | ea9911a2 | ok |
| conn2flow-mkt | main | 19cb99f | **não realizado: repositório sem remote `origin`** |

Auditoria: nenhum satélite mantém `sdd/`; tríade, `reports/` e `raw/active|archive` com `index.md` em todos; sync-skills `PASS` (0 divergentes, skills locais intactas); extensão 124/124.

### Pendências e achados (fora do escopo autorizado, não corrigidos)

1. **conn2flow-mkt sem remote**: commit local feito; falta `git remote add` + push (decisão humana). Edições em andamento de terceiros (`memory/MEMORIA-ENGENHARIA-CHEFIA.md`, `memory/PENDING-HUMAN-ACTIONS.md`, `req-003-...`) ficaram fora do commit e permanecem na árvore; `human-requests/index.md` já lista o req-003 ainda não versionado.
2. **Código do core ainda lê `sdd/`**: `cli/src/Support/Docs/SddSource.php:17`, `DocsBuilder.php` (prefixo `sdd/`), `AiArchiveSddCommand`, `AiPruneMemoriesCommand` e testes (`DocsSddReq184Test`, `DocsReq188Test` etc.). `docs:build` com `sdd.enabled` passa a emitir "sdd/: fonte não encontrada". O conn2flow-site publica páginas `docs-sdd-*` geradas dessa fonte.
3. **Extensão VS Code**: `repositoryLocator.ts` e `agentPromptPolicy.ts` ainda descobrem satélites por `sdd/`.
4. **Skills canônicas** ainda citam `sdd/` (e a skill local `nexus-validation`, preservada, também); `ai:sync` do core exige o bloco "Gatilho Obrigatório" ausente em 3 skills canônicas.
5. **Outras worktrees/branches** do conn2flow (conn2flow-req*) ainda têm `sdd/`; renames serão resolvidos no merge.
6. conn2flow-nexus e conn2flow-app só tinham kits `.claude`/`.github`; mkt só `.gemini`. Sincronizei apenas nos kits existentes.
7. Memória de execução (`MEMORIA-ENGENHARIA-EXECUCAO.md`) dos satélites não foi atualizada neste lote.

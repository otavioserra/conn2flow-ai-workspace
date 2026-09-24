# BATCH-049 — Modernização dos Tetos de Memory Gardening e Eliminação de Podas Prematuras

## Estado

- **Requisição:** REQ-047
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `dupla`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Task MCP:** `task-1788356876065-qv8vi`

## Live Todo List

- [x] Atualizar a politica de memoria nos masters, templates e boilerplates.
- [x] Atualizar a extensao e sua cobertura de classificacao de saude.
- [x] Propagar oficialmente os kits aos repositorios associados, sem commit, push ou deploy.
- [x] Validar a extensao, os contratos do Core e a paridade da skill entre os repositorios.
- [x] Registrar evidencias, atualizar handoff e emitir recibo do executor.

## Implementacao

- `sdd-memory-gardening` nao e mais acionada pelo encerramento de sessao ou batch e bloqueia explicitamente a poda abaixo de 50 KB / 200 linhas.
- A politica unificada usa alerta preventivo em 50 KB / 200 linhas, poda obrigatoria em 75 KB / 300 linhas e alvo aproximado de 25 KB, preservando 20 a 25 itens recentes.
- `c2f-executor-agent`, `sdd-workflow`, documentos SDD ativos e boilerplates foram alinhados aos novos limites.
- A extensao centraliza a classificacao em `gardeningPolicy.ts`; o provider gera requisicoes com os novos limites e os catalogos localizados descrevem o estado saudavel sem sugerir poda.
- A distribuicao oficial com `sync-all-repos.ps1 -Force -Language pt-br` atualizou os kits locais de `conn2flow`, `conn2flow-site`, `lumix` e `transformamp`, sem executar pipeline de projeto, banco ou deploy.

## Evidencias

1. `npm test` em `vscode-extension/`: compilacao TypeScript concluida e **84/84 testes aprovados**, com 0 falhas, 0 skips e 0 cancelamentos.
2. `php cli/c2f.php ai:sync` no Core: **36/36 skills** e blocos de contrato validados nos cinco kits ativos (`.claude`, `.cursor`, `.gemini`, `.github` e `.codex`).
3. A skill `.github/skills/sdd-memory-gardening/SKILL.md` tem o mesmo SHA-256 nos cinco repositorios: `95741e3599fd2b060937878aa570ac12a15ad4d5581f4070b97dead81487c4dc`.
4. Auditoria dos documentos de governanca ativos confirmou apenas os limites de 50 KB / 200 linhas, 75 KB / 300 linhas e ~25 KB; as copias PT-BR e ingles da skill contem suas redacoes equivalentes de bloqueio para memoria saudavel.
5. `git diff --check` no `conn2flow-ai-workspace` terminou sem erros de whitespace. Alteracoes concorrentes e fora do escopo nao foram revertidas.

## Pendencia para o Humano-no-Loop

- Revisar os diffs multirepositorio e decidir o aceite. Nenhum commit, push, deploy ou release foi executado neste modo supervisionado.
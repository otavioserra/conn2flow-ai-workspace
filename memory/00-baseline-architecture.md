# System Master Index — Conn2Flow AI Workspace

Projeto: conn2flow-ai-workspace. Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Fundação MDD aprovada pela REQ-067 / BATCH-069, 2026-10-09.

## Entrada econômica

1. Leia este router, [mecânica](01-general-memory.md) e [política](02-policy.md).
2. Leia [CURRENT](human-requests/CURRENT.md) e a requisição apontada; confirme aprovação, lote e autonomia.
3. Use o index.md da área antes de carregar documentos extensos. Consulte somente fontes necessárias ao slice.
4. Confira [SPEC](SPEC.md), [índice de lotes](implementation/index.md) e [validação](validation/index.md).

## Mapa do código e das fontes

| Área | Responsabilidade | Entrada |
| --- | --- | --- |
| memory/ | Governança persistente da matriz; contratos, episódios, relatórios e índices | [índice](index.md) |
| .gemini/skills/ | Fonte canônica de 44 skills procedurais | [Executor](../.gemini/skills/c2f-executor-agent/SKILL.md) |
| .claude/, .cursor/, .codex/, .github/ | Kits espelhados pelo sincronizador oficial | [sincronizador](../scripts/skills/sync-skills.cjs) |
| templates/pt-br/ e templates/en/ | Kits e boilerplates bilíngues para instalações; legado SDD preservado | [templates](../templates/README.md) |
| scripts/ | Instaladores, sync-back e propagação determinística de skills | [scripts](../scripts/) |
| vscode-extension/ | Extensão Conn2Flow Tools; fontes TypeScript e testes CJS | [package](../vscode-extension/package.json) |
| mcp-hub/ e cli/ | Integração e automação do workspace | [hub](../mcp-hub/) / [CLI](../cli/) |
| completions/ | Recibos e evidências verificáveis | [auditoria do lote](../completions/BATCH-069-skills-audit.json) |

## Limites entre repositórios

A matriz governa kits, memória e ferramentas. O core conn2flow contém gestor/, bibliotecas PHP, recursos e CLI do produto. conn2flow-site é o projeto do site; lumix e transformamp mantêm skills locais. A sincronização de skills alcança 25 kits e 14 templates (39 alvos), sem apagar skills exclusivas ou sobrescrever traduções declaradas.

A matriz e os sete satélites usam memory/ com os cinco documentos numerados 00–04. Boilerplates MDD usam memory/; os instaladores SDD permanecem compatíveis com sdd/ e os nomes numerados. ARCH-010 (Client CLI Daemon) e ARCH-011 (Hub/Watcher) são trabalho futuro, sem implementação neste lote.

## Autoridade e preservação

Código, schemas e configuração vigentes prevalecem sobre memórias históricas. SPEC e decisões aprovadas governam requisitos; intake não substitui contrato normativo. O Executor materializa a fundação explicitamente aprovada, registra evidências e entrega para revisão independente. A [baseline histórica](reports/archive/original/baseline-before-mdd.md) foi preservada integralmente.

---
id: "BATCH-101"
title: "Checklist inviolável de ativação de novos idiomas"
status: "HOMOLOGATED"
date: "2026-11-27"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-099"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Checklist de ativação de idiomas em três skills PT-BR e EN, EVAL-019, gates locais e rollout isolado."
summary_medium: "Documenta a ativação em LANGUAGES, resources.map.php e rótulos globais, a auditoria de listas fixas e o E2E do seletor do painel. Avalia as três skills em um cenário bilíngue e registra a propagação nos satélites."
---

# BATCH-101 — REQ-099

[Requisição](../human-requests/req-099.md) · [Checklist](../validation/VALIDATION-CHECKLIST.md#batch-101--req-099-2026-11-27)

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Topologia dupla, autonomia supervisionada, Categoria B.

## Live Todo List

- [x] Atualizar as três skills em PT-BR e EN.
- [x] Sincronizar os kits, reconhecer hashes SHA-256 e verificar o Skill Budget.
- [x] Validar o EVAL-019 e a suíte Python.
- [x] Aplicar a Regra dos 10 Ativos, verificar links e regenerar índices.
- [x] Simular e aplicar o rollout isolado aos satélites com `origin`.
- [x] Consolidar evidências, FEAT-017 e handoff.

## Evidências locais

| Verificação | Resultado |
| --- | --- |
| Código do Core | `gestor/config.php` 145–164 e 317–318 confirmam as cinco chaves e o sufixo de host do cookie. `gestor.php` 3171 e 3545–3557 e `admin-environment.php` 401–406 confirmam o filtro e a consulta de rótulos. |
| `sync-skills.cjs` e índice de skills | PASS em 19 alvos, zero divergência e zero drift após reconhecimento dos três hashes. Índice de 48 skills atualizado, `OVER: 0`. [Auditoria](../../completions/skills-audit.json) · [registro SHA-256](../../scripts/skills/translated.json). |
| `mdd eval --matrix .` | 19/19 EVAL-PASS. O EVAL-019 avaliou fontes PT-BR e 7 + 7 + 5 cópias EN sob um único veredito. Cada skill e cada cópia EN do `HEAD` anterior falharam no teste de regressão. |
| `pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95` | 223 PASS, cobertura 96,22%. Um aviso de depreciação Starlette/AnyIO. |
| `ai:archive-memory --dry-run` e `--repair-links` | Exit 0. Arquivou [REQ-092](../human-requests/archive/req-092.md) e [BATCH-096](archive/batch-096.md), ambos homologados, com 22 links reescritos e zero órfãos. A [validação do BATCH-096](../validation/archive/validation-096.md) saiu da janela ativa com seu registro histórico. |
| `mdd index` e `mdd status --json` | `healthy: true` e 10 requisições, 10 lotes e 10 relatórios ativos. `memory/04-memory-engineering-execution.md` permanece com 59 linhas e SHA-256 `88224eb16f731cdc21478a0c05ef38e104d3a828a38def7ea04ff1ca59c39886`. |

| Skill | Linhas PT-BR | Cópias EN verificadas |
| --- | ---: | ---: |
| `c2f-multilingual-system` | 47/300 | 7 |
| `c2f-environment-configuration` | 121/300 | 7 |
| `c2f-persona-executor` | 163/200 (meta deste lote ≤ 168) | 5 |

O lote de Categoria B documenta a validação E2E para futuras ativações. A regressão executada neste lote verifica o conteúdo das skills. Nenhum idioma foi ativado e nenhum deploy foi executado no Lab.

## Rollout nos satélites

A [simulação](../../completions/rollout-req099-dryrun.json) e a [aplicação](../../completions/rollout-req099.json) usaram as mesmas bases remotas e os mesmos caminhos aprovados. Cada worktree temporária partiu de `origin/main`, isolada das alterações e dos commits locais, inclusive nos checkouts do Core e do Lumix.

| Satélite | Estado | SHA confirmado em `origin/main` | Arquivos |
| --- | --- | --- | ---: |
| conn2flow | PUBLISHED | `fff97fbf4b1aa19ff76c298d812165ecbbd1093a` | 14 |
| conn2flow-site | PUBLISHED | `a92ca8e2611f61c31487320932923cd70c5de01b` | 15 |
| lumix | PUBLISHED | `770e892d0cdde134b47b9b154a1f05a997e51b4d` | 14 |
| transformamp | PUBLISHED | `585aea28e9e9311d38644cc9be979108eb9479c0` | 15 |
| conn2flow-home | SKIPPED_NO_ORIGIN | — | 0 |
| website-conn2flow | PUBLISHED | `22668e48dca9a87089d4da52cc1c8c01148448dc` | 15 |
| conn2flow-app | PUBLISHED | `8adacf6de443d604368854679a2ffca9db4e037f` | 3 |
| conn2flow-mkt | SKIPPED_NO_ORIGIN | — | 0 |
| conn2flow-nexus | PUBLISHED | `4316a6503641d32828e4f73507c90fc6747c38d4` | 6 |

Conferência posterior com `git ls-remote`, `git diff` e `git show` confirmou os sete SHAs, o pai de cada commit e o conteúdo dos 82 arquivos publicados. O rollout não precisou mesclar customizações reconhecidas das três skills. A cópia de `c2f-multilingual-system` em `.claude` é ignorada no Core e no Lumix e foi omitida. A skill foi publicada nos outros quatro kits desses dois satélites. `conn2flow-home` e `conn2flow-mkt` mantiveram os HEADs e as árvores limpas. Todas as worktrees temporárias foram removidas e cada repositório conserva apenas sua árvore principal.

## FEAT-017 — Dificuldades e aprendizados

- **Contexto** — Matriz `conn2flow-ai-workspace`, REQ-099 / BATCH-101, Categoria B. O incidente de origem foi uma tradução sincronizada no SQL que o seletor do painel não oferecia ao usuário.
- **Dificuldades** — O motor de avaliação aceitava uma skill por cenário. As traduções EN registradas também exigem edição em cada kit para evitar divergência entre cópias.
- **Lacunas** — Sistema multilíngue, configuração de ambiente e persona Executor deixavam de conectar os recursos traduzidos à ativação da instalação e à troca de idioma no fluxo real. A documentação de `mdd eval` descrevia somente cenários individuais.
- **Solução validada** — O campo opcional `related_skills` mantém o formato dos cenários existentes e agrega as verificações do EVAL-019 em um único veredito. As três fontes PT-BR e as 19 cópias EN do estado anterior foram rejeitadas pelas novas asserções. As versões atualizadas passaram no EVAL, na auditoria de hashes e na suíte Python. A edição do Executor canônico removeu o BOM UTF-8, com espelhos e hash sincronizados sobre os mesmos bytes normalizados.
- **Melhoria incorporada** — O README de avaliações agora descreve `related_skills` e o comportamento de `--skill`. Nas próximas regressões que cruzarem skills, o cenário pode validar cada fonte e tradução como parte de um aceite único.

## Handoff supervisionado

Projeto `conn2flow-ai-workspace`, raiz `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`, REQ-099 / BATCH-101, topologia dupla. O lote está em `ready-for-review` para o Macro-Arquiteto revisar o diff local e preparar a homologação humana. A matriz ficou sem commit e sem push. O backlog separado para o Arquiteto do Core `conn2flow`, em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow`, é a ativação e desativação visual de idiomas em `/admin-environment/` a partir dos mapas de recursos do Core e do projeto.

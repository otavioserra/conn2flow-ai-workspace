---
id: "BATCH-085"
title: "Ajustes do REP-005 e integração isolada das skills"
status: "HOMOLOGATED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Matriz e paridade PHP validadas; sete satélites publicados e dois sem origin; worktrees removidas."
summary_medium: "Skills PT-BR/EN e hashes atualizados. Core resolve IDs YAML e slugs.\nSete pushes confirmados e sete worktrees removidas; dois satélites aguardam remoto."
---

# BATCH-085 — Ajustes do REP-005 e integração isolada das skills

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. REQ-083 aprovada, Categoria B, topologia dupla, autonomia supervisionada. A concorrência nas árvores principais foi autorizada como motivo para o isolamento no [REQ-083](../human-requests/req-083.md).

## Live Todo List

- [x] Ler a requisição, ativar o Executor e auditar as nove árvores principais.
- [x] Atualizar ambas as skills nos kits PT-BR e EN, renovar os dois hashes e validar a matriz.
- [x] Implementar a paridade PHP na worktree do Core, validar com PHPUnit e atualizar os cinco reconhecimentos do manifesto.
- [x] Integrar as quatro skills nos sete satélites com `origin/main` e confirmar a publicação.
- [ ] Integrar `conn2flow-home` e `conn2flow-mkt` quando houver um `origin/main` confirmado.
- [x] Remover as sete worktrees e branches temporárias, podar registros e conferir as nove árvores principais.
- [x] Atualizar lote, checklist, índices e recibo para o Macro-Arquiteto.
- [ ] Homologação humana, commit seletivo e push da matriz pelo Arquiteto Master.

## Fase 1 — Matriz

- As skills `c2f-multilingual-skills-governance` e `c2f-mdd-indexing-and-handoffs` foram atualizadas nas fontes PT-BR, nos kits da matriz e nos templates PT-BR e EN. A primeira documenta escrita seletiva, auditoria global e o fluxo `mdd sync --customize`. A segunda documenta a ordem de resolução do Python e do Core PHP e o caminho explícito para ambiguidades e versões legadas.
- `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` atualizou 18 espelhos. Os hashes EN das duas fontes revisadas foram reconhecidos com `--update-translation-hash <skill> en --translator mdd-agent`.
- `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` retornou **PASS**, 19 alvos, 0 divergências e 0 drift. A auditoria registrou 542 cópias equivalentes, 312 traduções registradas e 24 skills locais preservadas. [Auditoria](../../completions/skills-audit.json).
- `.venv-mdd/Scripts/python.exe -m pytest -q tools/mdd-client/tests` passou **119/119** em 79,60 s.

## Fase 2 — Core

O resolvedor compartilhado de `memory:get/set` verifica caminho explícito sob `memory/`, nome ou stem exato e então ID YAML ou prefixo com slug. No mesmo nível de busca, múltiplos resultados geram erro com caminhos relativos ordenados. Os testes cobrem leitura por ID e slug, mutação por ambos os seletores, regeneração do índice local, precedência, ambiguidade e descarte de IDs duplicados, infraestrutura e UTF-8 inválido na descoberta por ID.

- `php -l` passou no resolvedor e no teste. PHPUnit 11.5.55 com PHP 8.5.8 passou **6 testes e 15 asserções** na regressão nova. O filtro de memória, incluindo `MemoryDualReq266Test`, passou **11 testes e 73 asserções** com quatro depreciações PHPUnit da suíte existente.
- `php cli/c2f.php memory:get REP-004 status --json --repo=C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace` retornou `"READY_FOR_ARCHITECT"`. A suíte PHP integral ficou fora da verificação.
- A variante com o título “⚡ Gatilho Obrigatório” foi preservada nos cinco kits. Cinco chamadas a `mdd sync --customize` atualizaram `memory/sync-customizations.json`. Os cinco SHA-256 locais foram conferidos contra os blobs staged. A auditoria no checkout de trabalho reconheceu os cinco pares; o contrato de bytes exatos requer os mesmos finais de linha usados no reconhecimento. Neste lote, ambos os lados do par foram reconhecidos com LF.
- Commits do Core: `d7fc2fe4c9f387f8ed4d28bef4530d912d3ce820` (skills e manifesto) e `4f2db9cebfc021a46b2bd4ff3c39ba6c55f71340` (PHP e teste).

## Integração e limpeza

Cada worktree elegível partiu do SHA atualizado de `origin/main` na branch `chore/sync-skills-req-083`. O sincronizador oficial operou com `--repos` apontando para as worktrees e `--apply` limitado a `c2f-architect-master`, `c2f-executor-agent`, `c2f-multilingual-skills-governance` e `c2f-mdd-indexing-and-handoffs`. O staging listou os caminhos exatos; algumas cópias Claude do Core e do Lumix exigiram `git add -f` específico devido ao `.gitignore` local.

Foram verificadas **112 cópias em 28 kits**, com **0 divergências nas quatro skills**. A auditoria global abrangeu 42 alvos e registrou **177 divergências fora do escopo**, 0 drift e 79 skills locais preservadas. Uma segunda aplicação escreveu **0 arquivos**. Os SHAs finais foram verificados por `git fetch origin` e `git ls-remote origin refs/heads/main`.

| Satélite | Raiz original | Worktree temporária | Branch e status inicial | Integração e SHA de `origin/main` | Limpeza | Impedimento |
| --- | --- | --- | --- | --- | --- | --- |
| `conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow` | `main` / 36 entradas | `4f2db9cebfc021a46b2bd4ff3c39ba6c55f71340` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |
| `conn2flow-site` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-site` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow-site` | `feat/req-292-docs-mdd` / 137 entradas | `a1f0932067870b2ddbe9e02da850cf395f00c613` · `main` local e remota | Removida; branch excluída; prune confirmado. | — |
| `lumix` | `C:/Users/otavi/OneDrive/Documentos/GIT/lumix` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-lumix` | `main` / 16 entradas | `d135be6d5d0aab4d33af7fa67ea2956e1e389b0c` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |
| `transformamp` | `C:/Users/otavi/OneDrive/Documentos/GIT/transformamp` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-transformamp` | `main` / 20 entradas | `3796882c5257a7ad55309e55089666cff5514712` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |
| `conn2flow-home` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-home` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow-home` | `infra/conn2flow-stack-req013` / 65 entradas | Pendente | Não criada; caminho ausente. | `origin` ausente; sem base `origin/main`. |
| `website-conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/website-conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-website-conn2flow` | `main` / 21 entradas | `15004bc5ff34e611fb37b32c394815ed0484852b` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |
| `conn2flow-app` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-app` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow-app` | `main` / 4 entradas | `adb211cd44fb057b1fc52c70431bf6c5c7b5d386` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |
| `conn2flow-mkt` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-mkt` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow-mkt` | `main` / 86 entradas | Pendente | Não criada; caminho ausente. | `origin` ausente; sem base `origin/main`. |
| `conn2flow-nexus` | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-nexus` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req083-conn2flow-nexus` | `main` / 8 entradas | `7abcfec7e036d71b887c42f96285a3593a121295` · fast-forward remoto | Removida; branch excluída; prune confirmado. | — |

A `main` local do Site, livre de checkout, avançou por fast-forward antes de `git push origin main`. Nos demais satélites elegíveis, o push fast-forward `HEAD:refs/heads/main` partiu da worktree e manteve a `main` local ocupada na posição original. Antes de remover cada worktree, a auditoria confirmou status limpo, ausência de commits exclusivos e ausência de junctions. As sete worktrees foram removidas sem força, seguidas de `git branch -d` e `git worktree prune`. As nove árvores originais mantiveram branch, HEAD, saída de `git status --short`, remotos e lista preexistente de worktrees. O recibo registra os remotos, os totais por código de status e a identidade da saída por SHA-256. [Recibo de execução](../../completions/BATCH-085-executor-receipt.json).

## Relatório de Dificuldades e Aprendizados para o AI Workspace

O inventário identificou dois satélites historicamente sem `origin`, e os kits Claude versionados do Core e do Lumix continham regras de ignore para alguns dos caminhos pedidos. Para o Core, o reconhecimento da variante usou os bytes exatos e exigiu a conferência dos blobs LF. O sincronizador preservou o restante do catálogo. O [REP-006](../reports/REP-006-batch085-worktrees-and-php.md) descreve os atritos, as skills consultadas, as evidências e as melhorias propostas.

## Handoff supervisionado

A matriz está em `ready-for-review`, com índice Git vazio e a FEAT-015 fora do stage. A execução permaneceu na Categoria B. O recibo foi gravado localmente porque o MCP Hub Conn2Flow não estava conectado. Aguarda encaminhamento humano ao Macro-Arquiteto.

```text
Ative c2f-architect-master em conn2flow-ai-workspace, raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Revise REQ-083 / BATCH-085, topologia dupla, autonomia supervisionado, Categoria B.
Leia memory/implementation/batch-085.md, memory/validation/VALIDATION-CHECKLIST.md e completions/BATCH-085-executor-receipt.json.
Confira a auditoria da matriz, pytest, PHP/PHPUnit e os sete pushes com worktrees removidas. Trate com o operador o origin/main de conn2flow-home e conn2flow-mkt.
Submeta o lote à homologação humana. Após autorização, faça o commit seletivo e o push da matriz, mantendo a FEAT-015 fora do stage.
```

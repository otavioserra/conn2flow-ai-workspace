---
id: "BATCH-088"
title: "Sete skills bilíngues na matriz e publicação isolada de onze skills"
status: "HOMOLOGATED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-086"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Sete skills bilíngues validadas na matriz e onze skills publicadas em sete satélites."
summary_medium: "Categoria B, matriz em revisão e sem stage.\nSete worktrees foram removidas e dois satélites sem origin aguardam os chefes locais."
---

# BATCH-088 — Sete skills bilíngues na matriz e publicação isolada de onze skills

[REQ-086](../human-requests/req-086.md) · Categoria B · Topologia dupla · Autonomia supervisionada

## Live Todo List

- [x] Atualizar as sete skills em PT-BR e EN, incluindo conferência do Core em modo de leitura.
- [x] Sincronizar kits e templates, atualizar sete hashes e aprovar auditoria e pytest.
- [x] Auditar nove satélites e publicar as onze skills nos sete com `origin`.
- [x] Preservar a variante do Core em cinco kits e registrar cinco pares de hashes com `mdd sync --customize`.
- [x] Confirmar publicação e remover worktrees e branches temporárias.
- [x] Registrar FEAT-017, checklist e índices.

## Fase 1 — Matriz

| Verificação | Resultado |
| --- | --- |
| Edição PT-BR/EN | Sete fontes PT-BR e 47 cópias EN atualizadas. A cópia local de `.cursor` passou na auditoria e está sob o ignore existente da matriz. |
| Sync oficial `--apply --all --repos conn2flow-ai-workspace` | 75 gravações em kits/templates. Os sete avisos transitórios de drift antecederam o reconhecimento dos hashes. |
| `--update-translation-hash <skill> en --translator mdd-agent` | Sete entradas atualizadas em [translated.json](../../scripts/skills/translated.json). |
| Auditoria da matriz | **PASS** em 19 alvos, com 542 cópias iguais, 312 traduções, zero divergências e zero drift. [JSON](../../completions/skills-audit.json). |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | **119/119 aprovados em 55,06 s**, após o registro dos sete hashes. |

- AJAX e CRUD documentam as quatro opções reservadas por `interface`. O exemplo usa `listar-itens`. Conferência no Core em `gestor/bibliotecas/interface.php`, no dispatcher `interface_ajax_finalizar`.
- Pipeline e executor usam `project:update-all <id>` para validar mudança do Core em Lab de projeto `local: true`, com `--skip-css` na Categoria A. A rotina só de projeto exige `project:deploy <id>`. A atualização isolada do sistema usa `manager:update-all` com `--skip-css` na Categoria A. O lote foi Categoria B, sem deploy no Lab.
- `gestor/config.php:301-307` normaliza `APP_ENV` e usa `production` por padrão, ou `development` quando `DEVELOPMENT_ENV` é verdadeiro. `gestor/bibliotecas/comunicacao-fila.php:58-85` confirma a ordem dos fallbacks. `gestor/bibliotecas/comunicacao.php:72-96` reconhece exatamente `production`, `prod` e `producao` como produção e bloqueia o redirecionamento válido salvo autorização explícita. O template `gestor/autenticacoes.exemplo/dominio/.env:133-139` registra a variável vazia e a exceção desativada por padrão.
- A skill de testes documenta o isolamento de `HookManager` e a restauração via Reflection, executor SQL e relógio injetáveis. O exemplo do Core está em `tests/Unit/PHP/ComunicacaoFilaReq304Test.php`. A skill de shell registra a busca em diretórios iniciados por ponto e o comando local de pytest.

## Fase 2 — Satélites

Conferi as onze skills de REQ-084/085/086 em 28 kits existentes, totalizando **308 cópias**. Cada worktree partiu de `origin/main`, com commit seletivo em `chore/sync-skills-req-086`. O fetch imediatamente anterior ao push confirmou a base em todos os casos. O push integrou os commits por fast-forward e um novo fetch confirmou o SHA e os blobs de todo o escopo. No Core e no Site, a ref local `main` estava livre e também avançou por fast-forward.

| Repositório | Raiz original | Worktree temporária | Commit e SHA publicado em `origin/main` | Limpeza |
| --- | --- | --- | --- | --- |
| conn2flow | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-conn2flow` | `bfb9164bdee3a492fefcdcdc9021823e1082ab34` | Removida, podada e ausente na listagem |
| conn2flow-site | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-site` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-conn2flow-site` | `7fa10208a82d0565eb593be4d999f3785209dc74` | Removida, podada e ausente na listagem |
| lumix | `C:/Users/otavi/OneDrive/Documentos/GIT/lumix` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-lumix` | `29d45932dcaf07ad26144f08f635758fc6d0ea48` | Removida, podada e ausente na listagem |
| transformamp | `C:/Users/otavi/OneDrive/Documentos/GIT/transformamp` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-transformamp` | `95a66e468b9e12e6ce4cfbf810db325c8e71a9e9` | Removida, podada e ausente na listagem |
| conn2flow-home | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-home` | — | Sem `origin`. A cargo do chefe local. | Nenhuma criada |
| website-conn2flow | `C:/Users/otavi/OneDrive/Documentos/GIT/website-conn2flow` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-website-conn2flow` | `7a17f6bb347555dd7989e5c423f432e7daa141a8` | Removida, podada e ausente na listagem |
| conn2flow-app | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-app` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-conn2flow-app` | `9f2e46155172dba8829ff7af05f8b6dd251312d4` | Removida, podada e ausente na listagem |
| conn2flow-mkt | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-mkt` | — | Sem `origin`. A cargo do chefe local. | Nenhuma criada |
| conn2flow-nexus | `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-nexus` | `C:/Users/otavi/OneDrive/Documentos/GIT/_wt-req086-conn2flow-nexus` | `32e75eefc7d1733d3538901070e71b7f4ee65bcb` | Removida, podada e ausente na listagem |

### Auditoria das árvores principais

As operações de escrita de arquivos, stage e commit ocorreram nas worktrees da requisição. O registro abaixo compara `git status --short --untracked-files=all` no início e no fim da execução isolada, com as contagens por código de status. Os remotos de fetch e push usavam a mesma URL em cada satélite com `origin`.

| Satélite | Branch inicial e final | Status inicial → final | URL de `origin` | Skills verificadas / arquivos no commit |
| --- | --- | --- | --- | --- |
| conn2flow | `feat/req-305-mercadopago-orders-api` | M 56, ?? 36 → M 56, ?? 38 | `git@github.com:otavioserra/conn2flow.git` | 55 / 56 |
| conn2flow-site | `lab/req-149-156` | M 2, ?? 2 → M 4, ?? 2 | `git@github.com:otavioserra/conn2flow-site.git` | 55 / 55 |
| lumix | `main` | M 16 → M 16 | `https://github.com/otavioserra/lumix.git` | 55 / 55 |
| transformamp | `main` | M 20 → M 20 | `git@github.com:otavioserra/transformamp.git` | 55 / 55 |
| conn2flow-home | `infra/conn2flow-stack-req013` | M 32, ?? 86 → M 32, ?? 86 | — | 0 / 0 |
| website-conn2flow | `main` | M 21 → M 21 | `git@github.com:otavioserra/website-conn2flow.git` | 55 / 55 |
| conn2flow-app | `main` | M 2, ?? 2 → M 2, ?? 2 | `git@github.com:otavioserra/conn2flow-app.git` | 11 / 11 |
| conn2flow-mkt | `main` | M 39, D 1, ?? 90 → M 39, D 1, ?? 90 | — | 0 / 0 |
| conn2flow-nexus | `main` | M 4, ?? 4 → M 4, ?? 4 | `https://github.com/otavioserra/conn2flow-nexus.git` | 22 / 22 |

No Core o inventário ganhou dois arquivos não rastreados durante a execução. No Site, a primeira auditoria já viu a branch `feat/req-156-seo-whatsapp-canonicals`, depois a execução isolada começou com `lab/req-149-156` e registrou dois arquivos modificados adicionais até o fim. Os HEADs das árvores principais do Core e do Site permaneceram iguais durante suas respectivas operações isoladas. Nos outros sete repositórios, branch, HEAD, status e remoto coincidiram antes e depois.

A variante do Core com o título **⚡ Gatilho Obrigatório** manteve seu conteúdo e incorporou a nota REP-007 que ordena sync, hashes, auditoria e pytest. O manifesto `memory/sync-customizations.json` foi atualizado por cinco chamadas a `mdd sync --customize`, com conferência dos hashes locais contra os blobs staged.

As auditorias globais exibiram divergências preexistentes fora da seleção no Core (28), Lumix (32), App (12) e Nexus (24). Cada uma das 308 cópias passou na conferência de conteúdo do escopo, sem drift. Os três aliases legados de `sdd-memory-gardening` do App e do Nexus ficaram preservados em seus blobs originais. Uma nova execução do sincronizador nesses kits detectará a coexistência dos nomes e exigirá resolver os aliases antes de escrever. Os commits do Core e do Lumix mantêm os espaços de fim de linha que já existiam no exemplo PHP da fonte canônica.

Antes da remoção, `cmd /c dir /AL /S` confirmou ausência de junctions nas sete worktrees. `git worktree remove`, `git branch -d`, `git worktree prune` e `git worktree list` confirmaram a limpeza dos caminhos da REQ-086. As worktrees anteriores foram mantidas.

## FEAT-017 e entrega

O [REP-008](../reports/REP-008-batch088-skills-rollout.md) registra a auditoria global em lotes seletivos, a restauração de aliases e a checagem de EOL. O [checklist](../validation/VALIDATION-CHECKLIST.md) e os índices foram atualizados. A pasta de implementação tinha onze lotes antes desta requisição. Para aplicar o limite de dez sem arquivar lotes em revisão, foram arquivados os dois encerrados mais antigos, [BATCH-082](archive/compacted/batch-082-4a26865308ed.md) e [BATCH-083](archive/compacted/batch-083-95aade2d8707.md). As sínteses contêm os links e hashes dos originais preservados byte a byte. Links históricos dentro dos snapshots continuam relativos à localização original.

A memória de execução ficou intacta. A matriz segue em `ready-for-review`, sem commit, push ou stage. `FEAT-015` permanece fora do stage.

## Handoff supervisionado

```text
Arquiteto Master, revise a REQ-086 / BATCH-088 no conn2flow-ai-workspace.
Raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
Topologia dupla, autonomia supervisionada, Categoria B. Estado ready-for-review.
Escopo de sete skills PT-BR/EN na matriz e onze skills publicadas em sete satélites.
Evidências em memory/implementation/batch-088.md, memory/reports/REP-008-batch088-skills-rollout.md,
memory/validation/VALIDATION-CHECKLIST.md e completions/skills-audit.json.
Auditoria PASS, zero divergências e zero drift na matriz. Pytest 119/119.
Sete pushes confirmados e worktrees removidas. Home e MKT seguem com os chefes locais.
Revisar as evidências e encaminhar a homologação humana antes de consolidar a matriz.
```

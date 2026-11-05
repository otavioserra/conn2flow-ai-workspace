---
id: "BATCH-079"
title: "Pipeline project:deploy, restrição de worktrees e lições REP-002"
status: "ready-for-review-with-preservation"
date: "2026-11-05"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Governança validada, duas worktrees integradas removidas e quinze preservadas por decisão humana."
summary_medium: "REQ-077 implementada e validada com 131 testes Python e 133 da extensão.\nHumano restringiu descarte aos alvos comprovadamente seguros; ignorados preservados e junctions desvinculadas sem afetar dependências."
---

# BATCH-079 — REQ-077

Projeto: conn2flow-ai-workspace. Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Topologia dupla; autonomia autonomo_monitorado. Trabalho na árvore existente, sem criar worktree. Fontes: CURRENT, REQ-077, REP-002 e DEC-136 do Core, além de ProjectDeployCommand.php e instalacao-manifesto.php. Alterações alheias iniciais em memória de execução, backlog e REP-003 preservadas.

## Rodada 1 — instruções e propagação

- [x] AGENTS/GEMINI/CLAUDE, 02-policy, regras, hooks existentes e prompt executor corrigidos.
- [x] Pipeline de projeto `./c2f project:deploy <id>`; sistema `manager:update-all`; `project:update-all` reservado a lote misto Core + projeto.
- [x] Worktrees somente com concorrência comprovada; em dúvida consultar humano; registrar origem/destino e expurgar ao fechar após auditoria.
- [x] DEC-136, diagnóstico HTTP, retirada física/utf8mb4, quatro armadilhas de shell, xhr.status e Rodada N documentados.
- [x] Precedência projeto > plugin > core e cinco tipos de choque registrados.
- [x] Correções também nas instruções raiz/regras/hooks encontrados nos cinco satélites; nenhuma cópia manual para ambientes de teste.
- [x] `node scripts/skills/sync-skills.cjs --apply --all`: 45 skills, 44 alvos, 1903 iguais, 21 traduções protegidas, zero divergências, 85 skills locais preservadas.
- [x] Python: `.venv-mdd/Scripts/python.exe -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests -q --junitxml=completions/BATCH-079-pytest.xml`: 131 passed, um aviso Starlette/AnyIO, 93,44 s.
- [x] Extensão: `node --test test/*.test.cjs`: 133 passed, zero failures/skips.
- [x] Revisão independente acionada conforme item 4.4 da requisição.
- [ ] Homologação humana.

Evidências: [skills](../../completions/BATCH-079-skills-audit.json), [Python JUnit](../../completions/BATCH-079-pytest.xml), [extensão](../../completions/BATCH-079-extension-tests.log).

## Rodada 2 — auditoria dos 17 resíduos

- [x] Caminhos absolutos validados contra a pasta GIT; inventário recursivo sem atravessar reparse points.
- [x] Registro Git, status, commits main..HEAD, diferenças para main, ignorados e junctions inventariados nos 17 alvos.
- [ ] Descarte seguro das 17 pastas: não executado enquanto houver trabalho único ou conteúdo ignorado não triado.
- [ ] `git worktree remove` e `prune` após decisão/triagem.

Nenhuma pasta foi apagada. Core req225 tem 11 commits fora da main; Site req225 tem dois. Treze árvores registradas têm entradas locais alteradas/não rastreadas. Core req277 e req284 estão limpas e seus HEADs são ancestrais da main, mas contêm arquivos ignorados (temp, configuração de ambiente e caches), além de junctions para dependências da árvore principal. Diferença entre HEAD antigo e main não foi confundida com commit único: ancestralidade foi confirmada separadamente nesses dois casos. Site req077 é órfã, com 11 arquivos e integração ainda não demonstrada. Os demais casos não são lixo comprovado.

Foi apresentada pergunta ao humano: preservar árvores com trabalho único e remover apenas seguras, ou arquivar integralmente o trabalho único antes de remover. Ausência de resposta não autoriza destruição. O aceite de espaço liberado permanece pendente. A continuidade independente da REQ-078 está expressamente autorizada pelo humano no chat, mesmo com esta pendência documentada.

Evidências: [inventário completo](../../completions/BATCH-079-worktree-audit.json), [resumo de limpeza](../../completions/BATCH-079-cleanup-summary.json).

## Rodada 3 — decisão humana e descarte seguro

O humano determinou: “Preservar as pastas com trabalho único e remover apenas as comprovadamente seguras.” A limpeza atende esse escopo ajustado; não se declara expurgo integral das 17.

- [x] Core req277 e req284: status limpo, HEAD ancestral de main e zero commits únicos revalidados imediatamente antes da remoção.
- [x] 1.237 e 3 arquivos físicos ignorados preservados respectivamente em ZIPs privados em `conn2flow/.git/batch079-preserved/`, com verificação individual SHA-256 e CRC. Arquivos de ambiente não foram expostos nem versionados.
- [x] Quatro junctions para vendor/node_modules desvinculadas pela API .NET sem recursão; nenhuma referência de entrada para as duas árvores encontrada nas worktrees Core/Site registradas.
- [x] `git worktree remove` sem força em ambos os alvos, seguido de `git worktree prune` no Core. Hashes de autoload.php e node_modules/.package-lock.json da árvore principal permanecem iguais.
- [x] Quinze pastas preservadas; nenhum trabalho único descartado. Código integrado permanece na main e branches não foram apagadas.
- [x] Revisão independente solicitada novamente para este delta.

Evidências: [preservação dos ignorados](../../completions/BATCH-079-preserved-ignored.json), [resultado da limpeza](../../completions/BATCH-079-cleanup-result.json). A política de execução do Windows exigiu iniciar a sessão PowerShell com ExecutionPolicy Bypass somente para esse processo; nenhuma configuração permanente alterada.

## Correções da revisão

Revisor identificou duas induções remanescentes no guia de migração Tailwind, ordem conflitante do diagnóstico HTTP, associação falsa de seis etapas ao deploy, atalho sync-core no prompt e rebuild obrigatório em todo deploy. Corrigidos antes da entrega; novas flags não foram inventadas. O wrapper de deploy repassa somente projeto e contents: `--skip-css` ficou restrito aos comandos que a implementam.

## Limites e continuidade

Sem deploy, Docker, consultas SQL, produção, commit, push ou assinatura humana. `mdd_client` não tem módulo __main__; a indexação usa o executável `.venv-mdd/Scripts/mdd.exe`. A auditoria de skills prova igualdade/proteção declarada, não atualidade semântica das traduções antigas (objeto da REQ-078). Revisão em [REV-079](../human-reviews/rev-079.md); homologação humana permanece aberta. Critério original de remover todas as 17 substituído pela orientação humana de preservar trabalho único. As seções Rodada 2 e seu inventário são fotografias anteriores à decisão, não o estado final.

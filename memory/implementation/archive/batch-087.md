---
id: "BATCH-087"
title: "Governança operacional de quatro skills e micro-ajustes do REP-007"
status: "HOMOLOGATED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-085"
topology: "dupla"
autonomy: "supervisionado"
summary_short: "Atualiza seis skills PT-BR/EN na matriz, com sync, hashes, auditoria PASS e pytest 119/119."
summary_medium: "Categoria B, somente matriz. Sem commit, push, deploy ou propagação aos satélites.\nRelatório de dificuldades FEAT-017 incluso."
---

# BATCH-087 — Governança operacional de quatro skills e micro-ajustes do REP-007

[REQ-085](../../human-requests/archive/req-085.md) · Categoria B · Topologia dupla · Autonomia supervisionada

## Live Todo List

- [x] `c2f-documentation`: build a partir de `git archive origin/main` (PT-BR/EN).
- [x] `c2f-json-resources-sync`: merge atômico, partes físicas e manifest do mesmo lado (PT-BR/EN).
- [x] `c2f-project-pipeline-and-tasks`: branch local de integração com conferência de hash (PT-BR/EN).
- [x] `c2f-shell-and-windows-traps`: armadilha 21, `index.lock` órfão no Windows (PT-BR/EN).
- [x] `c2f-multilingual-skills-governance` (hashes → `pytest`) e `mdd-memory-gardening` (órfãos preexistentes × novos) (PT-BR/EN).
- [x] Sync restrito à matriz, 6 hashes EN, auditoria e `pytest`.
- [x] Registrar evidências, FEAT-017 e handoff.

## Evidências técnicas

| Verificação | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | 64 arquivos gravados. Seis avisos de drift esperados até o reconhecimento dos hashes. |
| `--update-translation-hash <skill> en --translator mdd-agent` (6 skills) | 6 entradas atualizadas em `scripts/skills/translated.json`. |
| Auditoria da matriz | **PASS**, 19 alvos, 542 cópias iguais, 312 traduções, 0 divergências, 0 drift. [JSON](../../../completions/skills-audit.json). |
| `pytest -q tools/mdd-client/tests` (via `.venv-mdd`) | **119 aprovados em 54,73 s**, executado após os hashes. |
| Git | Nenhum commit, push nem stage. `FEAT-015` intacto e não rastreado. |

As seções EN foram inseridas nas cópias de todos os kits EN pertinentes (7 por skill, 5 para a governança multilíngue), preservando fim de linha.

## Relatório de dificuldades (FEAT-017)

1. `pytest` não está no PATH, e os Pythons 3.12/3.14 do sistema não têm as dependências do `mdd-client`. Solução: `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests`. Sugestão: registrar esse comando na skill de testes ou na REQ.
2. `glob(recursive=True)` ignora diretórios com ponto (`.claude`, `.gemini`), então a primeira passada não editou as cópias EN. Corrigido com `os.walk` e verificado pela lista de arquivos editados. Sugestão para `c2f-shell-and-windows-traps`.
3. Os `[DRIFT-WARNING]` do sync aparecem como erro no PowerShell (stderr), mas não bloqueiam. Foram resolvidos pelos hashes.

## Handoff supervisionado

```text
Arquiteto Master, revise REQ-085 / BATCH-087 no conn2flow-ai-workspace.
Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
Topologia dupla, autonomia supervisionada, Categoria B. Estado técnico: ready-for-review.
Escopo: seis skills PT-BR/EN na matriz, hashes e kits. Sem propagação aos satélites.
Evidências: memory/implementation/batch-087.md, memory/validation/VALIDATION-CHECKLIST.md e completions/skills-audit.json.
Auditoria PASS com zero divergências e drift. Pytest 119/119. Nada commitado nem em stage; FEAT-015 fora do stage.
```

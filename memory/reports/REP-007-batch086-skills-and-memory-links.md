---
id: "REP-007"
title: "Dificuldades e aprendizados do BATCH-086 para o AI Workspace"
status: "REVIEWED"
date: "2026-11-23"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Registra drift durante a atualização, a preservação de originais e a auditoria dos links arquivados."
summary_medium: "A suíte fica verde com o registro de traduções estabilizado.\nA faxina corrige os links afetados e preserva o conteúdo das fontes históricas protegidas."
---

# REP-007 — Dificuldades e aprendizados do BATCH-086

1. **Contexto da rodada.** REQ-084 / BATCH-086 no `conn2flow-ai-workspace`, Categoria B. Atualização de três skills em PT-BR/EN e retenção dos dez registros ativos por pasta. [Lote](../implementation/batch-086.md).
2. **Dificuldades e atritos.** O inventário real trouxe 14 requisições e 17 lotes antes do novo registro. A primeira rodada de pytest leu a matriz enquanto o registro EN estava em transição e obteve `DRIFT_WARNING` em `test_exact_customization_survives_sync_and_local_change_reopens`. O validador genérico do `skill-creator` recusou `user-invocable`, metadado já usado pelo repositório.
3. **Lacunas ou defasagens nas skills.** As três skills alteradas precisavam de instruções sobre junctions, seleção por ID dos JSON gerados e concorrência na `main`. `c2f-multilingual-skills-governance` documentava o drift transitório, mas deixava implícita a dependência dos testes que leem a matriz. `mdd-memory-gardening` e `c2f-mdd-indexing-and-handoffs` orientaram a retenção e a indexação. Faltava explicitar como registrar links antigos em originais protegidos na auditoria de arquivamento.
4. **Solução validada.** A execução após os três hashes estabilizados passou 119/119. A auditoria oficial ficou em PASS, com 0 divergências e 0 drift. A conferência com YAML verificou nomes e descrições preservando o metadado do kit, e comparou os blocos CMD em PT-BR/EN. A faxina moveu 12 documentos, reescreveu 65 links afetados e reparou 33 links antigos. Os 166 órfãos residuais já existiam, em 11 snapshots originais (164) e na memória de execução protegida (2). [Auditoria das skills](../../completions/skills-audit.json).
5. **Sugestões de melhoria.** Na `c2f-multilingual-skills-governance`, explicitar que a suíte que lê a matriz deve rodar após o reconhecimento dos hashes. Na `mdd-memory-gardening`, registrar separadamente os órfãos anteriores à operação que vivem em originais protegidos e os introduzidos por um movimento, com aprovação explícita para eventual reparo de originais.

## Links relativos preexistentes preservados

| Fonte protegida | Ocorrências |
| --- | ---: |
| `04-memory-engineering-execution.md` | 2 |
| `backlog/archive/original/ARCH-008-chrome-devtools-mcp-agent-runtime-inspection.md` | 1 |
| `backlog/archive/original/FEAT-014-programa-documentacao-core-e-site.md` | 1 |
| `human-requests/archive/original/req-066.md`, `req-067.md`, `req-068.md` e `req-070.md` | 4 |
| `implementation/archive/original/batch-066.md` e `batch-067.md` | 2 |
| `implementation/archive/original/BATCH-INDEX-fe51f34e6321.md` | 29 |
| `validation/archive/original/VALIDATION-CHECKLIST-5f08f316abcf.md` | 71 |
| `validation/archive/original/VALIDATION-CHECKLIST-c2ec2bf167a3.md` | 56 |
| **Total** | **166** |

Os dois destinos da memória de execução correspondem aos lotes [062](../implementation/archive/batch-062.md) e [063](../implementation/archive/batch-063.md), hoje no arquivo histórico. A decisão sobre os ponteiros antigos permanece no handoff.

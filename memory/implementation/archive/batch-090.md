---
id: "BATCH-090"
title: "Fase 1 do ARCH-018: 5 personas c2f-persona-*, índice de skills com subskills/ e memory/learnings/ (somente matriz)"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-088"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Tríade renomeada para c2f-persona-* com aliases no sync, Curator e Optimizer criados (48 skills), índice de skills, subskills/ com piloto Mercado Pago e memory/learnings/."
summary_medium: "Categoria B, somente matriz, sem deploy, stage ou commit.\nAuditoria PASS (19 alvos, 0 divergências, 0 drift, 0 legados); pytest 130/130; 6 registros arquivados pela Regra dos 10."
---

# BATCH-090 — Fase 1 do ARCH-018

[REQ-088](../../human-requests/archive/req-088.md) · [ARCH-018](../../backlog/ARCH-018-autonomous-skills-evolution-personas-and-learnings.md) · Categoria B · Topologia dupla · Autonomia supervisionada · [Relatório FEAT-017 (REP-010)](../../reports/archive/REP-010-batch090-personas-subskills-learnings.md)

## Live Todo List

- [x] Ler CURRENT, REQ-088, ARCH-018, BATCH-089, `sync-skills.cjs`, `translated.json` e os testes do `mdd-client`.
- [x] Renomear a tríade para `c2f-persona-{architect,executor,reviewer}` (PT-BR/EN, 5 kits, templates, `translated.json`, `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `STARTER-PROMPTS.md`, `docs/`) com mapa de aliases no `sync-skills.cjs`.
- [x] Seção de retroalimentação nas 3 personas operacionais (PT-BR/EN).
- [x] Criar `c2f-persona-curator` (escopo global + local) e `c2f-persona-optimizer` em PT-BR/EN; catálogo 46 → 48.
- [x] Gerador determinístico `scripts/skills/generate-skills-index.cjs` e `.gemini/skills/index.md`.
- [x] Suporte a `subskills/` no `sync-skills.cjs` e piloto `c2f-payment-gateways/subskills/mercadopago-webhook-hmac.md` (PT-BR/EN).
- [x] `memory/learnings/` na matriz e nos boilerplates MDD PT-BR/EN; área `learnings` no `mdd init`/`mdd index`.
- [x] Regra dos 10 Ativos: 6 registros arquivados com o `ai:archive-sdd` do Core.
- [x] Sync da matriz, 7 hashes EN, auditoria PASS, governança PASS, índice PASS e pytest 130/130.
- [x] Lote, REP-010, VALIDATION-CHECKLIST, BATCH-INDEX e índices MDD em `ready-for-review`.

## 1. Rename das personas e mapa de aliases

| Legado | Canônico |
| --- | --- |
| `c2f-architect-master` | `c2f-persona-architect` |
| `c2f-executor-agent` | `c2f-persona-executor` |
| `c2f-reviewer-agent` | `c2f-persona-reviewer` |

- **Fonte canônica**: `git mv` das três pastas em `.gemini/skills/`; `name:`, título e referências internas trocados por script que preserva BOM e finais de linha.
- **Aliases** (`scripts/skills/sync-skills.cjs`): os três pares entraram em `renamedSkills`, o mesmo mecanismo dos quatro aliases `sdd-*` → `mdd-*` da REQ-075. A pasta legada é movida inteira (sem cópia) só quando o nome novo é selecionado, e o sync recusa migrar se os dois nomes coexistem. No apply da matriz, o próprio sync moveu **46 pastas** (4 kits da matriz × 3 personas + 34 nos templates PT-BR/EN), com 0 legados restantes.
- **Registro de traduções**: chaves renomeadas em `translated.json` antes do sync. Sem isso, o sync trataria a persona EN como não traduzida e gravaria PT-BR por cima.
- **Retroalimentação**: as três personas operacionais ganharam a seção "Retroalimentação Contínua de Skills — ARCH-018": registram aprendizados (`raw/active/` → `learnings/` → `REP-XXX`) e encaminham sugestões ao Curador.
- **Referências atualizadas**: `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `memory/00-baseline-architecture.md`, `memory/process/STARTER-PROMPTS.md` (com prompts novos para Curador e Optimizer), `docs/{pt-br,en}` (catálogo e arquitetura do agente duplo) e `AGENTS.md`/`GEMINI.md` dos kits EN Codex/Gemini.
- **Preservado como histórico**: lotes, revisões, relatórios, recibos em `completions/` e backlog homologado mantêm os nomes antigos. São registros datados.

## 2. Novas personas

| Skill | Linhas | Conteúdo |
| --- | ---: | --- |
| `c2f-persona-curator` | 69 | Escopo global (inbox, `REP-XXX`, issues `skill-feedback`, Tribunal de 4 Filtros com vereditos `ACCEPT`/`NEEDS_EVIDENCE`/`QUARANTINE`/`REJECT`/`LOCAL_ONLY`) e escopo local (`LRN-XXX`, skills locais com prefixo do projeto, encaminhamento só do que é universal). |
| `c2f-persona-optimizer` | 52 | Roteiro de auditoria periódica a partir do índice: *Skill Budget*, redundância, contradição, candidatas a `subskills/` e paridade EN. Declara que `mdd eval` chega na Fase 4. |

Ambas são `user-invocable: true`, com tradução EN nos 5 kits `spec-driven` EN. Contagem: **48 skills** (5 personas + 34 core + 9 governança) em `sync-skills.cjs`, `audit-mdd-governance.cjs`, `mdd_client/sync.py`, `mcp_server.py`, testes, `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` e `00-baseline-architecture.md`.

## 3. Índice de skills e `subskills/`

- **Gerador**: `node scripts/skills/generate-skills-index.cjs` grava `.gemini/skills/index.md`; `--check` sai com 1 se o índice estiver desatualizado. Saída determinística (sem data, LF, ordenada, linhas contadas após normalizar CRLF). Lista personas, core e governança com linhas, bytes, *budget* sugerido (persona 200, core 300, governança 200), estado `OK`/`NEAR`/`OVER`, subskills e data da tradução.
- **Atenção de *budget*** medida no índice: `c2f-shell-and-windows-traps` 487/300, `c2f-module-crud-scaffolding` 437/300, `c2f-javascript-ajax` 333/300 e `c2f-payment-gateways` 313/300 (`OVER`); `c2f-project-pipeline-and-tasks` 254/300 e `mdd-workflow` 182/200 (`NEAR`). Insumo para o primeiro ciclo do Optimizer.
- **Sync**: `<skill>/subskills/**` é propagado só onde a skill-mãe existe e fora de traduções registradas. Cada arquivo é auditado (`subskill ausente` / `subskill diferente` = FAIL). Links simbólicos são recusados. O `source_sha256` da tradução passa a cobrir `SKILL.md` + subskills, então editar a subskill PT-BR reabre a revisão EN. Para skill sem subskill, o hash não muda.
- **Piloto**: o roteiro HMAC do Mercado Pago (§5.4) saiu de `c2f-payment-gateways/SKILL.md` para `subskills/mercadopago-webhook-hmac.md` (27 linhas), em PT-BR e nos 7 kits EN. A §5.4 mantém um ponteiro e as duas regras críticas: o Core já valida a assinatura e o segredo não é impresso. A skill-mãe caiu de 332 para 313 linhas.
- **Correção de passagem**: o EN de `c2f-payment-gateways` trazia o título "5.2 Absolute Impotence" (tradução errada de idempotência). Corrigido para "Absolute Idempotency" nos 7 kits EN.
- **Convenção documentada** em `c2f-multilingual-skills-governance` (nova seção "Subskills, índice e aliases — REQ-088") e em `c2f-persona-optimizer`.

## 4. `memory/learnings/`

- **Matriz**: `memory/learnings/` com `README.md` (fluxo `raw/active/` → `LRN-XXX` → skills locais / matriz e formato do registro), `index.md` e `archive/{compacted,original}/`. A tabela de camadas de `memory/01-general-memory.md` ganhou a linha "Aprendizados".
- **Boilerplates MDD PT-BR/EN**: mesma estrutura, linha no `memory/index.md` e parágrafo em `01-general-memory.md`. Boilerplates SDD intactos.
- **mdd-client**: `learnings` entrou em `AREAS` (`memory.py`). O `mdd init` cria a área com o arquivo dual, e o `mdd index` a indexa. Teste novo cobre a criação, a linha `LRN-001` no índice, o link no índice raiz e o `resolve("lrn-001")`.

## 5. Regra dos 10 Ativos

Comando do Core, somente leitura sobre o Core (`conn2flow` na branch `feat/req-305-mercadopago-orders-api`):

```sh
php cli/c2f.php ai:archive-sdd --repo=<matriz> --keep=10 \
  --protect=req-077.md,req-078.md,req-079.md,batch-077.md,batch-078.md,batch-079.md,batch-080.md,batch-081.md --dry-run
```

Protegi os registros que o CURRENT lista como aguardando homologação. Na primeira prévia, sem proteger `batch-078.md` (`ready-for-human-review`), o comando o escolhia no lugar do `batch-085.md` (HOMOLOGATED).

| Raiz | Antes | Arquivados | Ativos depois |
| --- | ---: | --- | --- |
| `human-requests/` | 14 | `req-075`, `req-076`, `req-080`, `req-081` | 10 (`req-077`–`079`, `req-082`–`088`) |
| `implementation/` | 12 (com este lote) | `batch-084`, `batch-085` | 10 (`batch-077`, `079`–`081`, `086`–`090`) |

- O comando reescreveu 33 links em 13 arquivos.
- **Bytes**: `req-075.md` e `req-076.md` continuam idênticos byte a byte (SHA-256 `281bcc43…` e `433cd68b…`). Em `req-080`, `req-081`, `batch-084` e `batch-085`, o comando mudou só o alvo de links relativos (+1 nível, 2 a 4 linhas por arquivo). O diff por palavra contra o `HEAD` deu 0 tokens alterados fora de links. Os originais seguem no `HEAD` do Git.
- **Órfãos**: comparei links relativos quebrados em `memory/` entre o `HEAD` e a árvore. O único acréscimo eram os `index.md` derivados, corrigidos pelo `mdd index`. As 170 ocorrências que o comando relata são preexistentes (snapshots `archive/original/` e 2 em `04-memory-engineering-execution.md`).
- `04-memory-engineering-execution.md` intacta: 10.329 bytes, SHA-256 `686e0495…` igual ao início.

## 6. Validação

| Verificação | Resultado |
| --- | --- |
| `node scripts/skills/sync-skills.cjs --apply --all --repos conn2flow-ai-workspace` | 78 gravações, 46 renomeações por alias, 0 divergências ([apply](../../../completions/BATCH-090-skills-apply.json)) |
| `--update-translation-hash <skill> en` | 7 skills: 5 personas, `c2f-multilingual-skills-governance`, `c2f-payment-gateways` |
| `node scripts/skills/sync-skills.cjs --repos conn2flow-ai-workspace --report completions/skills-audit.json` | **PASS**: 48 skills, 19 alvos, 562 iguais, 322 traduzidas, 0 divergências, 0 drift, 0 legados, 12 subskills iguais + 7 traduzidas, 24 skills locais preservadas ([auditoria](../../../completions/BATCH-090-skills-audit.json)) |
| `node scripts/skills/audit-mdd-governance.cjs --repos conn2flow-ai-workspace` | **PASS**: 48 canônicas, 240 cópias ([relatório](../../../completions/BATCH-090-governance-audit.json)) |
| `node scripts/skills/generate-skills-index.cjs --check` | **PASS** |
| `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests` | **130 passed** (119 anteriores + 11 novos em `test_personas_subskills_learnings.py`) |
| `mdd index --path .` | Índices regenerados; `learnings/` no índice raiz |

Testes novos: catálogo com 5 personas e sem nomes legados; migração de cada alias com pasta inteira preservada e idempotência; recusa de coexistência; propagação, auditoria e restauração de subskills; hash de tradução cobrindo a subskill; `--check` do índice e detecção de índice velho; área `learnings` no `init`/`index`; boilerplates com `learnings/`.

`audit-mdd-governance.cjs` ganhou `--repos` (padrão: todos os repositórios) e agora registra `Missing copy` em vez de abortar com `ENOENT`. Rodado em modo somente leitura sobre todos os satélites, ele dá FAIL, como esperado antes da propagação: 75 pastas legadas (15 por satélite), 125 cópias ausentes das personas e 495 cópias diferentes. Essa contagem compara bytes crus e inclui diferenças só de CRLF.

## 7. Fronteiras respeitadas

- Somente a matriz foi alterada. Nenhum satélite foi tocado. Notei que o Core já tinha 43 alterações locais de terceiros (mtime 2026-11-21, skills e `memory/`), que não são deste lote e ficaram intocadas.
- Categoria B: nenhum deploy. Sem `git add`, commit ou push. O `git mv` das 3 pastas canônicas deixou as renomeações no stage; tirei-as com `git restore --staged` e o índice Git ficou vazio. Ao commitar, inclua a remoção dos caminhos antigos e a adição dos novos. `memory/backlog/FEAT-015-…` intacto e fora do stage.
- `memory/03-memory-engineering-chief.md` e `04-memory-engineering-execution.md` sem alteração.

## 8. Pendências para o Arquiteto

- **Regra dos 10 em `memory/reports/`**: com o REP-010, a raiz passa a ter 11 relatórios (BL-028 + REP-001 a REP-010). A REQ-088 só autoriza `human-requests/` e `implementation/`, então não arquivei.
- **`VALIDATION-CHECKLIST.md`** está em 321 linhas / 28 KB (o `mdd compact` aponta poda). Não podei.
- **Contagens antigas em `README*.md` e `docs/`** (45 skills): fora do escopo; ficam para a governança de documentação viva.
- **Propagação aos satélites** (próxima fase): o mapa de aliases e a auditoria estão prontos. Em satélites com `memory/sync-customizations.json` apontando para nomes antigos, o `planRenames` existente migra as chaves.
- Homologação humana e commit/push seletivos na `main`.

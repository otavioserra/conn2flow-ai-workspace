# BATCH-073 — Padronização Canônica das Memórias de Engenharia em Inglês (03 e 04), Integração com `memory/raw/` e Atualização dos Boilerplates

- **Projeto**: Multi-Repositório (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `conn2flow-nexus`, `conn2flow-app`, `lumix`, `transformamp`, `conn2flow-mkt`)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-071](../human-requests/req-071.md)
- **Status**: `ready-for-review`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [x] **1. Matriz (`conn2flow-ai-workspace`)**:
  - [x] 1.1 Renomear `memory/MEMORIA-ENGENHARIA-CHEFIA.md` ➔ `memory/03-memory-engineering-chief.md` via `git mv`
  - [x] 1.2 Renomear `memory/MEMORIA-ENGENHARIA-EXECUCAO.md` ➔ `memory/04-memory-engineering-execution.md` via `git mv`
  - [x] 1.3 Atualizar `memory/01-general-memory.md` e `memory/02-policy.md` com os 5 arquivos de raiz e uso de `memory/raw/`
  - [x] 1.4 Atualizar referências em `AGENTS.md`, `GEMINI.md`, `CLAUDE.md` e skills de governança
  - [x] 1.5 Atualizar boilerplates e skeletons em `templates/` (en e pt-br)
- [x] **2. Propagação nos 7 Repositórios Satélites**:
  - [x] 2.1 `conn2flow`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.2 `conn2flow-site`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.3 `conn2flow-nexus`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.4 `conn2flow-app`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.5 `lumix`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.6 `transformamp`: `git mv` dos arquivos 03 e 04, atualizar referências, commit explícito e push
  - [x] 2.7 `conn2flow-mkt`: `git mv` da Chefia, criar execução 04 ausente no intake, atualizar referências e commit explícito local
- [x] **3. Auditoria & Validação**:
  - [x] 3.1 Verificar integridade de links e referências cruzadas
  - [x] 3.2 Rodar suíte da extensão VS Code para assegurar regressão zero (124/124 testes)
  - [x] 3.3 Emitir relatório de conclusão e recibo do lote

---

## 🛡️ Regras Invioláveis de Execução

1. **Preservação Integral de Conteúdo**: Nenhum registro histórico deve ser apagado no rename.
2. **Proibição de `git add .` e `-A`**: Em todos os repositórios, listar exclusivamente os arquivos modificados.
3. **Padrão Kebab-case em Inglês**: Nomes dos arquivos de raiz rigorosamente padronizados (`00` a `04`).


## Relatório consolidado do Executor — 2026-10-09

**Projeto:** conn2flow-ai-workspace. **Raiz matriz original:** C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
**Entrega isolada:** C:/Users/otavi/OneDrive/Documentos/GIT/req-071-worktrees/conn2flow-ai-workspace, branch `feat/req-071`.
**Estado:** ready-for-review; execução concluída, sem atribuir homologação do Arquiteto.

### Entrega e preservação

- Quinze memórias existentes dos oito repositórios e quatro memórias dos boilerplates foram renomeadas por `git mv`: 19 originais preservados, com mudanças limitadas ao cabeçalho e às referências de nomes. Nenhuma poda realizada.
- Exceção comprovada no intake: `conn2flow-mkt` não possuía memória de execução, nem em HEAD nem na árvore original. O arquivo `04-memory-engineering-execution.md` foi inicializado explicitamente sem inventar sessões históricas. A memória de Chefia com alterações locais continua integralmente na árvore original; essas alterações alheias não entraram no commit do lote.
- `01-general-memory.md` e `02-policy.md` consolidam 00–04, raw/active/, teto preventivo de 50 KiB, alerta crítico em 75 KiB e arquivo dual em raw/archive/. Manutenção autorizada preserva originais e sínteses antes de reduzir o ativo a cerca de 25 KiB com 20–25 registros recentes e pendências.
- Dois skeletons nativos `templates/{en,pt-br}/mdd-boilerplate/memory/` e dois boilerplates compatíveis `sdd-boilerplate/sdd/` contêm os cinco documentos e índices hierárquicos nas pastas canônicas. Instaladores SDD selecionam os novos nomes; a raiz sdd/ permanece compatível.
- `mdd init` cria 00–04 e CURRENT sem sobrescrever documentos existentes; status passa a exigir os cinco documentos. A extensão descobre memory/ nos satélites e projetos, prefere 04 e mantém fallback dos nomes legados.
- AGENTS/GEMINI/CLAUDE, regras e quatro skills correlatas atualizados. Skills distribuídas somente pelo `scripts/skills/sync-skills.cjs`; traduções declaradas atualizadas manualmente. Zero divergência nas quatro skills selecionadas e zero skills locais alteradas.
- Worktrees preservam as branches e alterações em andamento nas oito árvores originais. Não houve merge nas branches originais.

### Commits atômicos e remotes

| Repositório | Branch de entrega | Commit | Resultado |
| --- | --- | --- | --- |
| conn2flow | `feat/req-071` | `db5cc26577` | push confirmado por ls-remote |
| conn2flow-site | `feat/req-071-memory` | `dc14829b8b` | push confirmado por ls-remote |
| conn2flow-nexus | `feat/req-071-memory` | `2a28d927e0` | push confirmado por ls-remote |
| conn2flow-app | `feat/req-071-memory` | `ad0ee14a3b` | push confirmado por ls-remote |
| lumix | `feat/req-071-memory` | `2f87805dd4` | push confirmado por ls-remote |
| transformamp | `feat/req-071-memory` | `3ec608c11b` | push confirmado por ls-remote |
| conn2flow-mkt | `feat/req-071-memory` | `48f99e10b6` | commit local; sem remote |
| conn2flow-ai-workspace | `feat/req-071` | commit final deste relatório | push da branch de entrega; evidência consultável pela ref |

Cada staging listou caminhos de arquivos explicitamente; nenhuma operação `git add .`, `git add -A` ou commit de alterações alheias. `conn2flow-site` já tinha uma branch histórica `feat/req-071`; por isso os satélites seguintes usam `feat/req-071-memory`.

### Validação executada

1. Extensão: `npm.cmd run compile` PASS e suíte completa, **124/124**, zero falhas, skips ou cancelamentos. No Node 24.21.0, `npm test` falha no runner `node --test test/` antes de executar a suíte. Os mesmos arquivos foram executados com `node --test` e lista explícita de `test/*.test.cjs`; nenhum teste foi alterado para mascarar a falha do runner.
2. MDD Client: **32/32 pytest** PASS com PYTHONPATH apontando para a worktree; inclui os três tipos de projeto, estrutura completa, idempotência, preservação de documentos existentes e limites de diretório. Ruff check e formatação dos dois arquivos Python alterados PASS.
3. Verificação adicional reproduzível: `node scripts/tests/check-engineering-memory.cjs <raiz-da-matriz>` PASS para arquivo ausente, fallback legado, preferência pelo canônico, memória migrada, limiar crítico e escopo ausente.
4. Verificação de integridade: 19 corpos históricos equivalentes após normalização dos nomes e exclusão somente do cabeçalho alterado; oito repositórios com 00–04, quatro boilerplates completos, **zero links novos quebrados**. Links antigos que já não resolviam estão listados no JSON e não recebem PASS global.
5. Auditoria global de skills: FAIL com **84 divergências fora das quatro skills selecionadas**, todas comprovadas contra blobs Git anteriores. Zero divergência do escopo REQ-071. O diagnóstico global não foi ocultado nem corrigido com sobrescrita de trabalho de outros lotes.
6. Diferenças revisadas e `git diff --cached --check` executado antes dos commits.

### Evidências e limites

- [Preservação das memórias](../../completions/BATCH-073-memory-preservation.json)
- [Validação estrutural e links](../../completions/BATCH-073-validation.json)
- [Auditoria global de skills](../../completions/BATCH-073-skills-audit.json)
- [Prova das divergências anteriores](../../completions/BATCH-073-skills-baseline-proof.json)
- [Recibo do Executor](../../completions/BATCH-073-executor-receipt.json)

Mantidos sem revalidar: contratos e lições históricos dos documentos 03/04; seu conteúdo foi preservado, não reinterpretado como garantia técnica atual. Não foi exercitada a interface gráfica da extensão; compilação, suíte e descoberta da memória foram verificadas por execução local. A CLI de compactação não foi executada sobre históricos reais neste lote.

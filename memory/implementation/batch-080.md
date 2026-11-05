---
id: "BATCH-080"
title: "Traduções EN das skills e detecção de drift por SHA-256"
status: "ready-for-review"
date: "2026-11-05"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "46 skills com versões EN, registro SHA-256 e avisos não bloqueantes; Python 138 e extensão 133 PASS."
summary_medium: "42 skills restantes traduzidas, três traduções anteriores preservadas e a nova skill multilíngue publicada.\n312 arquivos EN protegidos em 44 alvos; testes de drift, reconhecimento e preservação executados sem deploy."
---

# BATCH-080 — REQ-078

Projeto: conn2flow-ai-workspace. Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Topologia dupla; autonomia autonomo_monitorado. Continuidade expressamente autorizada no chat após BATCH-079; CURRENT relido e atualizado. Nenhuma nova worktree criada. Homologação humana não atribuída.

## Live Todo — Rodada 1

- [x] Ler REQ-078 e CURRENT e aplicar skill-creator e contratos MDD.
- [x] Traduzir as 42 skills restantes e publicar a nova skill em inglês; preservar as três traduções anteriores.
- [x] Publicar 46 versões EN nos cinco kits completos; atualizar os arquivos existentes dos dois kits privados, totalizando 312 arquivos traduzidos.
- [x] `translated.json`: mapa idioma → skill → source_sha256, translated_at e translator, com 46 entradas EN.
- [x] Auditoria compara bytes atuais da matriz ao hash registrado; emite `[DRIFT-WARNING]` e status `DRIFT_WARNING`, com exit 0 quando não há erro real.
- [x] `--update-translation-hash <skill> <idioma> [--translator nome]`: reconhecimento explícito após revisão, gravação atômica apenas no registro, sem sync simultâneo.
- [x] Python `mdd sync --audit` devolve/mostra drift sem tratá-lo como falha. Divergências reais continuam FAIL/exit 1.
- [x] Nova skill `c2f-multilingual-skills-governance` criada e propagada aos cinco clientes e satélites existentes.
- [x] Travas do sincronizador, adaptador Python, testes, descrição MCP e auditor de contagem ajustadas para 46.
- [x] Descoberta de idiomas de templates pelo diretório; templates completos recebem novas skills, privados preservam seu catálogo parcial.
- [x] Testes: Python 138/138, extensão 133/133, sintaxe CJS e diff check PASS.
- [x] Auditoria de skills: PASS, 46 canônicas, 44 alvos, 1692 cópias iguais, 312 traduções protegidas, zero divergências, 85 skills locais preservadas.
- [ ] Homologação humana.

## Tradução e fidelidade

A redação inicial foi produzida localmente com Argos Translate 1.11.0 e modelo PT→EN, em ambiente Python 3.12 temporário separado. Nenhum conteúdo foi enviado a um serviço de tradução. Essa ferramenta não virou dependência do MDD Client, sincronizador ou instaladores. Fontes técnicas mantidas em PT-BR continuam canônicas.

Os scripts de autoria preservam blocos cercados, código inline, variáveis PHP, destinos de links e metadados de controle. A publicação valida todos os rascunhos antes de escrever: 43 traduções novas (42 pendentes + nova skill) com igualdade de blocos/código inline e sequência de variáveis PHP; name/user-invocable e gatilhos conferidos. As três traduções prévias foram preservadas e usadas em todos os kits. Seus exemplos preexistentes não foram retraduzidos para forçar igualdade byte a byte.

Revisão técnica incluiu terminologia, descrições YAML de todas as novas traduções, regras repetidas e amostras de procedimentos críticos. Corrigidos: metadado de nome alterado pelo tradutor em fonte com BOM, cabeçalhos descartados por emoji, termos técnicos inadequados, rótulos de gatilhos e duas linhas truncadas por símbolos. A validação recusou publicação quando o name divergiu; só publicou após reparo. Comandos e funções em código foram preservados, inclusive exemplos com comentários/literais PT-BR. Não se afirma revisão editorial humana integral das 46 skills; aprovação editorial/homologação continua humana. Algumas fontes canônicas têm exemplos históricos SDD e texto com mojibake, mantidos sem reescrever o contrato PT-BR.

## Testes e evidências

| Verificação | Resultado |
| --- | --- |
| pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests | 138 passed, um aviso de depreciação Starlette/AnyIO, 51,80 s |
| node --test test/*.test.cjs na extensão | 133 passed, zero falhas/skips |
| Sete novos testes de drift | CLI Python não bloqueante; auditoria somente leitura; tradução preservada no apply; ausência real FAIL; hash explícito; rejeição de três reconhecimentos inválidos; metadado inválido sem escrita |
| sync-skills --apply --all e auditoria sem apply | PASS; segunda auditoria com zero escritos |
| Sintaxe dos módulos CJS e git diff --check | PASS após remover whitespace de prosa sem alterar exemplos de código |

O `quick_validate.py` genérico do skill-creator foi executado e recusou o campo `user-invocable`, requerido pelo contrato deste ecossistema e pela REQ-078. O campo foi preservado. Validação de YAML, nome, campo de controle e gatilhos pelo publicador passou; não se registra PASS fictício no validador genérico.

Os sete casos novos somam 138 ao baseline de 131; a contagem não foi reduzida para manter um número histórico. Fixtures usam matrizes e clientes temporários, sem modificar fontes reais para fabricar drift. A revisão de criação da skill foi encaminhada ao passe independente previsto em skill-creator, com comportamento e limitações registrados na ficha de revisão.

Evidências: [auditoria global](../../completions/BATCH-080-skills-audit.json), [invariantes de tradução](../../completions/BATCH-080-translation-audit.json), [JUnit Python](../../completions/BATCH-080-pytest.xml), [log Python](../../completions/BATCH-080-python-tests.log), [extensão](../../completions/BATCH-080-extension-tests.log).

## Limites e handoff

Sem deploy, banco, Docker, publicação remota, commit ou push. Não houve alteração de SPEC nem simulação de assinatura humana. Hash pairing detecta mudança dos bytes da fonte desde a revisão registrada; não prova qualidade linguística nem detecta edição arbitrária da tradução. CRLF/LF diferentes alteram o hash por definição. Registro malformado falha antes de propagar; drift válido é apenas warning. O reconhecimento explícito exige tradução já cadastrada e fonte existente; novas traduções são cadastradas após revisão.

Arquivos de trabalho/cache da tradução são artefatos de autoria temporários, sem segredos. Não integrar caches/modelos/ambiente virtual. Alterações alheias iniciais em memória de execução, backlog e REP-003 permanecem preservadas. Manutenção global de memórias antigas e reconstrução de documentação pública não fazem parte deste lote.

Próximo papel: Macro-Arquiteto revisa o diff e as evidências de REQ-078/BATCH-080 e encaminha a homologação humana; apontar qualquer correção de tradução por skill/trecho. BATCH-079 permanece com RECOMMEND-APPROVAL e 2 remoções/15 preservações, conforme decisão humana.

Revisão independente concluída em [REV-080](../human-reviews/rev-080.md): RECOMMEND-APPROVAL, com amostragem explícita. [Forward-test](../../completions/BATCH-080-review-forward.json), [testes independentes](../../completions/BATCH-080-review-drift.xml) e [auditoria independente](../../completions/BATCH-080-review-skills-audit.json). Corrigidas também as ambiguidades apontadas sobre minificação, dado compilado, inferência de memória, ressalvas e shell.

Auditoria somente leitura de retenção registrada em `completions/BATCH-080-memory-audit.json`: existem 12 lotes ativos após as duas novas entregas. O compactador propôs um arquivamento e trim do checklist, sem ser aplicado; manutenção global/histórica foi preservada fora do escopo destas alterações de tradução. Não se declara o teto de dez corrigido. Modelos, ambiente virtual e caches/rascunhos foram mantidos em TEMP, fora do repositório.

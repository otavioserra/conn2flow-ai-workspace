---
id: "BATCH-076"
title: "Servidor MCP, interface MDD e migração do conn2flow-home"
status: "ready-for-human-review"
date: "2026-10-09"
author: "executor"
target_repo: "conn2flow-ai-workspace, conn2flow-home"
summary_short: "Execução da REQ-074: MCP nativo, extensão MDD e migração da governança local."
summary_medium: "Topologia triade e autonomia autonomo_monitorado. Revisão independente e homologação visual humana obrigatórias."
---

# BATCH-076 — REQ-074

## Escopo e Live Todo

- [x] 1.1 Dependência oficial MCP.
- [x] 1.2 Nove ferramentas canônicas no servidor Python.
- [x] 1.3 Subcomando mdd mcp, stdio e SSE.
- [x] 1.4 Daemon com --mcp.
- [x] 1.5 Testes MCP e cobertura Python >= 95%.
- [x] 2.1 Rótulos MDD na extensão.
- [x] 2.2 Descoberta prioritária de memory/ com fallback sdd/.
- [x] 2.3 Choques e customização intencional.
- [x] 2.4 Extensão com 124+ testes verdes.
- [x] 2.5 VSIX atualizado.
- [x] 3.1 Migração sdd/ para memory/ no conn2flow-home.
- [x] 3.2 Renomeação íntegra das memórias 03/04.
- [x] 3.3 Estrutura raw/ e human-reviews/.
- [x] 3.4 Referências atuais atualizadas.
- [x] 3.5 Índices gerados pelo mdd index.
- [x] 3.6 Commit com caminhos específicos.
- [x] 4.1 Suítes completas.
- [x] 4.2 Recibo e acionamento do Revisor Independente.
- [x] 4.3 Ficha rev-076.md emitida pelo Revisor.
- [ ] 4.4 Homologação visual por Otávio Serra (somente humano).

## Estado inicial

Matriz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace.
Infraestrutura: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-home.

Alterações anteriores preservadas: três skills em .gemini; package.json e package-lock.json da extensão; out/providers/gardeningManager.js e out/providers/sddScopeManager.js. Home iniciou com árvore limpa. CURRENT aponta REQ-074 aprovada; batch ainda não existia.

MCP Hub não está exposto nesta sessão; usar recibo em arquivo e Revisor Independente pela ferramenta de agentes, sem alegar despacho remoto.

## Evidências

Implementação técnica concluída em 2026-10-09.

- Python Client/Hub: 122 testes verdes; três integrações adicionais verdes (125 no total), sem falhas/skips. Cobertura consolidada em `completions/BATCH-076-python-coverage.json`; MCP 100%. JUnit principal e integração separados, logs persistidos.
- Extensão: TypeScript compilado e 131/131 testes verdes, sem skips; `completions/BATCH-076-extension.log`.
- MCP real: handshake, listagem das nove ferramentas e chamada de status por stdio (mdd mcp e daemon --mcp) e SSE loopback. Travessia de raiz rejeitada; parada/falha do monitor exercitadas.
- Sincronização: SHA-256 no propagador oficial; customização guarda hashes local/semente em `memory/sync-customizations.json`. Apply preserva o par reconhecido; alteração de qualquer hash reabre o choque. Confirmação da UI envia hashes esperados e recusa conflito alterado desde a auditoria.
- Extensão: MDD Explorer e catálogos EN/PT-BR; IDs de comandos antigos preservados. Descoberta memory/ tem precedência sobre todos os candidatos sdd/. Identidade do prompt deriva a raiz de memory/ corretamente.
- UI Bridge: Choques de Skills MDD chama mdd sync, apresenta motivo e hashes matriz/local e oferece Marcar como Customização Intencional. Resolvedor de entregas do produto permanece disponível; a nova ação é para skills canônicas e não transforma decisões de banco em exceções de skill.
- Executável: override opcional `conn2flow.mddExecutable`, descoberta dos ambientes .venv-mdd/.venv da matriz e fallback PATH. Workspace Trust exigido. Ambiente existente .venv-mdd atualizado com dependência MCP.
- Pacote: `vscode-extension/conn2flow-tools-1.1.3.vsix`, gerado com vsce 2.24.0 e recompilado após os ajustes finais; pacote não publicado ou instalado na janela humana.
- Home: commit `f5a7ea4`, árvore limpa. 67/70 arquivos originais da working tree idênticos byte a byte à fotografia anterior; somente README, AGENTS e CURRENT receberam atualizações autorizadas. Memórias MD/HTML renomeadas integralmente; 55 índices gerados. SPEC SHA-256 `7023F218A2E2EC656E9CE2908DD1597B9B62EB62597DA8A5185FF16113D46BB7` inalterado. Evidências `BATCH-076-home-before.json` e `BATCH-076-home-preservation.json`.
- Ruff e pip check PASS. git diff --check sem erros. SPEC, baseline, GPUs, Caddy, portas, rotas e documentos históricos preservados; apenas 01/02 ausentes foram inicializados de forma não destrutiva pelo CLI.

## Defeitos corrigidos, limites e itens não exercitados

Corrigidos durante a execução: saída MCP sem structuredContent (retorno agora tipado), prioridade de memory/ entre candidatos de projeto, identidade de raiz do prompt MDD, teste preso a versão antiga e comando npm test incompatível com Node 24, além da confirmação de hash contra alteração concorrente.

Avisos: depreciação Starlette/AnyIO nos testes e DEP0190 do vsce legado durante empacotamento. Python 3.14/Windows executado; ambiente canônico Python 3.12 instalado. Linux/CI remota não exercitados. Não houve execução de infraestrutura, produção, PyPI, Marketplace, push ou homologação simulada. Textos históricos preservados, não revalidados como descrição atual dos serviços; referências históricas sdd/ dentro de SPEC/memórias não foram reescritas para preservar seu conteúdo.

Revisão independente emitida em [rev-076.md](../human-reviews/rev-076.md), parecer RECOMMEND-APPROVAL, sem findings bloqueantes remanescentes. Homologação visual humana obrigatória permanece pendente. Conferir MDD Explorer, escopos memory/ e fallback legado, painel de choques e ação intencional no VSIX 1.1.3. A matriz permanece com diff local revisado, sem commit deste lote; home possui commit específico f5a7ea4.

## Correção na revisão independente

Finding P2: skill ausente sem path fazia o parser rejeitar a lista inteira de choques. O propagador agora informa path nas ausentes; teste do pipeline real com lista mista e testes do parser confirmam a correção. Três testes adicionais exercitam a ponte com dublês de VS Code/processo: hashes enviados, trust/cancelamento e conflito alterado. Suíte final após a correção: 125/125 Python, 97,01% global, 131/131 extensão. Evidências finais BATCH-076-final-pytest.xml e BATCH-076-final-coverage.json.

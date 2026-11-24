---
id: "BATCH-098"
title: "Sincronização remota de skills e VSIX 1.2.4"
status: "HOMOLOGATED"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-096"
topology: "dupla"
autonomy: "supervisionado"
category: "B"
summary_short: "Auto-Sync remoto com cache, verificação de conflitos e workflow opcional via bootstrap."
summary_medium: "Fase 2 do ARCH-019. CLI e extensão VS Code 1.2.4 consultam e aplicam atualizações do catálogo remoto."
---

# BATCH-098 — REQ-096

[Requisição](../human-requests/req-096.md) · [BATCH-097](batch-097.md) · [Checklist](../validation/VALIDATION-CHECKLIST.md#batch-098--req-096-2026-11-24) · [FEAT-017](../reports/REP-018-batch098-remote-skill-sync.md)

Matriz `conn2flow-ai-workspace` em `C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace`. Topologia dupla, autonomia supervisionada e Categoria B. Execução deste lote restrita à matriz e a fixtures temporárias.

## Live Todo List

- [x] Implementar `mdd sync --remote`, `mdd update`, cache raso e proteção das variantes locais.
- [x] Implementar Auto-Sync, botão e Paleta de Comandos no VS Code.
- [x] Documentar e testar o template de CI com `mdd bootstrap --with-ci-sync`.
- [x] Confirmar gates, empacotamento, janela ativa e handoff.

## Implementação e evidências

- O cache padrão usa `~/.mdd/cache/conn2flow-ai-workspace`. Origens HTTPS alternativas usam caches distintos por padrão. Fetch e reset ficam no checkout de cache, cuja origem, marcador de propriedade e caminho são checados. O fluxo remoto lê o catálogo e os domínios como dados.
- `--check-only` atualiza o cache e devolve `available`, `conflicts` e `customized` em JSON, com os arquivos do projeto preservados. `--apply` atualiza kits existentes e mantém `memory/skill-sync-state.json` com as sementes reconhecidas. Uma cópia divergente sem origem verificável entra em `conflicts`. A comparação é estável entre LF e CRLF, e cada gravação reapura os bytes locais após o planejamento.
- O Hub usa `notify` a cada 24 horas por padrão. Respeita Workspace Trust, domínio e intervalo por pasta. `off` suspende o trabalho em segundo plano, e `auto` aplica mudanças elegíveis e registra resultados e choques no canal Conn2Flow MDD Hub.
- O template semanal pode ser incluído pelo bootstrap, que preserva um workflow de mesmo nome. O template prepara o commit em branch própria, versiona apenas os resultados que passam pela política de ignore e abre PR para revisão.

| Verificação | Resultado |
| --- | --- |
| Gate Python exato do CI e Ruff | PASS. 222 testes, 96,21% de cobertura (gate de 95%). Ruff PASS. Um aviso de depreciação conhecido em Starlette/AnyIO. |
| Compile, testes e VSCE | 172/172 PASS, sem skips. VSIX 1.2.4 com 102 entradas e 253.233 bytes. SHA-256 `cf68c3b16adea21f16261bcab88233ca2b6a337e607c2324268a903c8452fd06`. |
| Cache com GitHub real em projeto descartável | Semente de `f93f39ecf528e94a152a6c742e93e8d5694eabcb`. 14 disponíveis no primeiro check, 14 aplicados, zero no segundo check. A primeira consulta manteve a pasta do projeto sem criação de memória. |
| Template opcional | PASS local em YAML, sintaxe Bash, bootstrap opt-in e staging seletivo em um Git descartável. A simulação preservou o ignore e registrou apenas arquivos destinados ao commit. |
| Auditoria, índice de skills e eval | Sync PASS em 19 alvos, zero divergências. Índice PASS com 48 skills, EVAL-PASS 16/16. |
| Regra dos 10 e integridade da matriz | healthy: true, 10 requisições, 10 lotes, 10 relatórios e 10 seções de validação. BATCH-093 e REP-005 arquivados com links reancorados. A seção homologada BATCH-094 foi para [o histórico](../validation/archive/validation-094.md), com original integral. MDD index regenerado. Memória 04 preservada, FEAT-015 fora do stage, matriz sem commit/push e zero deploys. |

O VSIX 1.2.4 complementa os artefatos 1.2.3 e 1.1.7 preservados na REQ-095. O template foi testado localmente. A primeira execução no GitHub dependerá da publicação do cliente com os novos comandos e da permissão de criação de PR no repositório que optar pelo workflow.

## Handoff supervisionado

> Macro-Arquiteto, revise REQ-095 / BATCH-097 e REQ-096 / BATCH-098 na matriz conn2flow-ai-workspace, raiz C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace. Topologia dupla, autonomia supervisionada, Categoria B. Confira os lotes, o checklist, os relatórios FEAT-017 e o VSIX 1.2.4 em workspace confiável. A homologação humana e a consolidação da matriz seguem para revisão.

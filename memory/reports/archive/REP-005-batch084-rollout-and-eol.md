---
id: "REP-005"
title: "Dificuldades e aprendizados do BATCH-084 para o AI Workspace"
status: "READY_FOR_ARCHITECT"
date: "2026-11-21"
author: "executor"
target_repo: "conn2flow-ai-workspace"
summary_short: "Escopo do sincronizador, migração de SHA-256 para LF e paridade do CLI no BATCH-084."
summary_medium: "Registra a propagação em nove satélites e a auditoria estável de finais de linha.\nO CLI PHP mantém o caminho explícito para artefatos com slug."
---

# REP-005 — Dificuldades e aprendizados do BATCH-084

1. **Contexto da rodada.** REQ-082 / BATCH-084 em `conn2flow-ai-workspace`. Propagação da REQ-081 em nove satélites e validação local de governança e metadados na matriz.
2. **Dificuldades e atritos enfrentados.** A auditoria seleciona um subconjunto para escrita e ainda inspeciona todo o catálogo dos destinos, por isso o status global pode falhar após aplicar as duas skills sem que elas apresentem divergências. Havia 33 hashes de origem dependentes de CRLF ou de finais mistos no checkout Windows. O CLI PHP ainda retorna zero candidatos para um ID com slug.
3. **Lacunas ou defasagens nas skills.** `c2f-multilingual-skills-governance` precisava dos comandos com `--repos` e da explicação do hash. `c2f-mdd-indexing-and-handoffs` descrevia resolução por ID sem distinguir o Python do PHP. `c2f-executor-agent` orienta o relatório e o Gate. O uso combinado com a skill de indexação definiu o recibo local quando o MCP Hub ficou indisponível.
4. **Solução validada e armadilhas medidas.** Foram conferidas 68 cópias da Fase 1 e 1.631 arquivos protegidos. A matriz passou em 19 alvos no checkout real e em duas simulações de EOL. `mdd meta get REP-004 status --json` retornou `READY_FOR_ARCHITECT`. A suíte do cliente passou com 119 testes e o PHP resolveu o mesmo relatório por caminho explícito.
5. **Sugestões de melhoria.** Registrar em `c2f-multilingual-skills-governance` que a seleção de skills restringe a escrita e que a auditoria ainda cobre o catálogo inteiro dos destinos. Abrir acompanhamento para paridade de ID e slug no resolvedor PHP.

Evidências no [BATCH-084](../../implementation/archive/batch-084.md) e na [auditoria local](../../../completions/skills-audit.json).

## Fase 3 — Segunda propagação

1. **Contexto da rodada.** Fase 3 da REQ-082 / BATCH-084 na matriz e nos nove satélites, com Gate aprovado em 2026-11-21.
2. **Dificuldade encontrada.** O Core já tinha o título “⚡ Gatilho Obrigatório” versionado nos cinco kits, sem manifesto para esse caminho. A auditoria global continuava agregando diferenças de outras skills.
3. **Lacuna nas skills consultadas.** A governança multilíngue descreve a preservação durante a sincronização. O procedimento para incorporar a atualização em uma cópia customizada e reconhecer o novo par de hashes ficou a cargo do comando MDD.
4. **Solução validada.** A atualização e o título local convivem nas cinco cópias do Core, reconhecidas no manifesto. A repetição do sync escreveu zero arquivos. Foram verificados 102 SKILL.md em 34 kits e 66 testes locais passaram.
5. **Sugestão de melhoria.** Documentar na governança multilíngue a revisão do diff de uma variante antes de atualizar seu reconhecimento com `mdd sync --customize`, bem como a diferença entre o escopo de escrita e a cobertura da auditoria.

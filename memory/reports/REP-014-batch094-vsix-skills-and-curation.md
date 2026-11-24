---
id: "REP-014"
title: "Dificuldades e aprendizados do BATCH-094"
status: "ready-for-review"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-092"
batch: "BATCH-094"
summary_short: "Registra os atritos de empacotamento VSIX, prova de origem das skills e validação da documentação pós-ARCH-018."
summary_medium: "BATCH-094 em Categoria B, topologia dupla e autonomia supervisionada.\nEvidência do tratamento de caminhos fora do escopo, npm no PowerShell, bump automático e controle de catálogo."
---

# REP-014 — Dificuldades e aprendizados (FEAT-017)

1. **Contexto da rodada.** REQ-092 / BATCH-094 na matriz `conn2flow-ai-workspace`, com VSIX v1.2.0, saneamento local de três satélites, auditoria somente leitura dos outros seis, documentação bilíngue e curadoria DEC-136. [Lote e evidências](../implementation/batch-094.md).
2. **Dificuldades e atritos.** A contagem inicial de Home misturava 20 alterações rastreadas da REQ-082 e cinco skills novas locais. O website ainda estava sujo por uma edição no metadado de schema. Quatro cópias no Core tinham o cabeçalho de gatilho idêntico ao próprio HEAD e o corpo antigo da REQ-082. No PowerShell, a política impediu o shim `npm.ps1`. O comando `npm run package` do repositório aplicaria outro bump. O validador dos guias ainda exigia 44 skills e ambos os READMEs tratavam o Client como futuro.
3. **Lacunas nas skills.** `c2f-persona-executor` cobre builds e evidências, mas deixa o empacotamento de uma versão já fixada para a documentação da extensão. `c2f-mdd-indexing-and-handoffs` define os comandos e o fluxo de entrega. O briefing reserva a nova ficha quando as janelas já estão cheias, e a retenção depende de autorização. A validação do catálogo precisava acompanhar o número publicado.
4. **Solução validada.** `npm.cmd` e VSCE direto geraram a v1.2.0 após 154/154 testes. O ZIP passou por CRC e conferência de metadados. Os diffs das skills foram comparados com os blobs históricos, com normalização CRLF/LF e conferência do cabeçalho do Core. A restauração de 57 caminhos preservou as demais entradas e os hashes locais. O validador alinhado verificou 284 links relativos e os 11 pares bilíngues.
5. **Melhorias propostas.** Incluir em `c2f-persona-executor` um link para o procedimento de empacotamento sem novo bump e para a verificação de CRC, manifesto e SHA-256. Em briefings de saneamento, registrar separadamente quantidade modificada e quantidade não rastreada e indicar a revisão histórica de referência. Na abertura de lotes que atingem a janela, registrar a decisão de retenção antes de mudar fichas históricas.

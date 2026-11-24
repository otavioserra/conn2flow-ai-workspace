---
id: "REP-011"
title: "Dificuldades e aprendizados do BATCH-091 para o AI Workspace"
status: "READY_FOR_ARCHITECT"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-089"
batch: "BATCH-091"
summary_short: "Barramento mdd feedback + tools MCP no hub TypeScript; cópias EN fora dos kits spec-driven, concorrência no stdio do hub e reescrita de links ao arquivar memory/reports/."
summary_medium: "Fase 2 do ARCH-018 validada só na matriz.\nRegistra onde as skills não orientaram (7 cópias EN, reports/ fora do ai:archive-sdd) e duas armadilhas medidas no hub MCP e no script de arquivamento."
---

# REP-011 — Dificuldades e aprendizados do BATCH-091

1. **Contexto da rodada.** REQ-089 / BATCH-091, Fase 2 do ARCH-018, no `conn2flow-ai-workspace`. Categoria B, topologia dupla, autonomia supervisionada, somente matriz. Escopo: `mdd feedback submit/list/triage`, tools MCP `submit_skill_feedback`/`list_skill_feedback`, 4 personas e notas do REP-010, READMEs e Regra dos 10. [Lote](../implementation/batch-091.md).

2. **Dificuldades e atritos.**
   - **Dois servidores MCP.** O `mdd-client` tem um MCP Python (`mdd mcp`), e o `conn2flow-hub` é o servidor TypeScript em `mcp-hub/`, conforme `.vscode/mcp.json`. A REQ nomeia o hub, então as tools foram para lá e delegam ao CLI Python. O MCP Python não ganhou as tools; o teste dele conta exatamente 9 tools.
   - **O hub responde às linhas em paralelo.** `startStdio` trata cada linha com `async` sem fila. Um `submit` seguido de `list` no mesmo stdin pode listar antes de gravar. O teste ponta a ponta abre um processo por requisição. Clientes MCP reais esperam a resposta, mas um script que despeja várias linhas não pode contar com a ordem.
   - **Sete cópias EN, não cinco.** O reviewer também existe nos kits `templates/en/templates/private-project-{claude,copilot}-kit`. O sync não grava cópia EN registrada em `translated.json` e a auditoria dá PASS com essas cópias velhas. Achei as duas por `find` depois da auditoria e alinhei os bytes (SHA-256 `9f2dc842…` nas 7).
   - **`memory/reports/` fica fora do `ai:archive-sdd`.** O comando do Core cobre só `human-requests/` e `implementation/`. Para `reports/`, escrevi um script de mover e reescrever links. A primeira versão normalizou links sem relação (`../scripts/` → `../scripts`, `(...)` → `(.)`) em 3 arquivos, entre eles `req-078`/`079`, pendentes de homologação. Restaurei os três a partir do Git, corrigi a barra no `BATCH-INDEX.md` e conferi por diff de palavras que só sobraram os alvos dos arquivos movidos.
   - **Heredoc com `\n`.** Um patch de teste via heredoc do Bash transformou `"\n"` em quebra de linha real e o arquivo deixou de compilar. A regra da `c2f-persona-executor` (script em arquivo, não heredoc) teria evitado.

3. **Lacunas nas skills.**
   - `c2f-multilingual-skills-governance` não lista onde ficam as cópias EN. Falta dizer que os kits `private-project-*` também carregam traduções e que a auditoria não compara conteúdo EN entre kits.
   - `c2f-persona-architect` §5 e `mdd-memory-gardening` mandam usar o `ai:archive-sdd`, mas não dizem que `memory/reports/` não é coberto nem como arquivar lá.
   - `c2f-persona-executor` não cita o MCP Python do `mdd-client` ao lado do `conn2flow-hub`; com dois servidores, o nome da tool não basta para saber onde mexer.

4. **Solução validada / armadilhas medidas.**
   - CLI: IDs sequenciais sob `memory/.mdd.lock`, contando também `archive/`. Índice gerado pelo renderer genérico, então o `mdd index` produz o mesmo arquivo (teste compara byte a byte). SQLite só quando `memory/.mdd.sqlite` existe. GitHub por runner injetável; falha do `gh` mantém o registro local e o CLI sai com 1.
   - Hub: argv explícito, sem shell (o teste passa `texto; rm -rf /` como resumo e confere que ele chega intacto). CLI resolvido por `MDD_CLI` → `.venv-mdd` → `PATH`.
   - `audit-mdd-governance.cjs`: CRLF normalizado com o mesmo helper do `sync-skills.cjs`. O teste cria uma matriz sintética com cópias CRLF (PASS, 240 cópias) e uma diferença real (FAIL apontando o arquivo).
   - Validação: sync aplicado (47 gravações) → 5 hashes EN → auditoria **PASS** (19 alvos, 0 divergências, 0 drift) → governança **PASS** (240 cópias) → índice **PASS** → pytest **141/141** → `npm test` do hub **5/5**.

5. **Sugestões de melhoria para o AI Workspace.**
   - `c2f-multilingual-skills-governance`: listar os 7 destinos EN (5 kits `spec-driven` + 2 `private-project`) e pedir conferência de SHA-256 entre eles depois de editar uma tradução. Melhor ainda: `sync-skills.cjs` avisar quando cópias EN registradas da mesma skill divergem entre si.
   - `mcp-hub/src/server.ts`: fila serial por conexão em `startStdio`, ou documentar que as requisições são concorrentes.
   - `ai:archive-sdd` (Fase 3 do ARCH-018): aceitar `memory/reports/` (ou `--folders`) e reescrever só os links que apontam para os arquivos movidos, sem normalizar o resto.
   - Primeiro uso real do barramento: este relatório pode ser reenviado como `FB-XXX` assim que a REQ for homologada. Não criei registros de exemplo na inbox da matriz para não deixar dado de teste versionado.

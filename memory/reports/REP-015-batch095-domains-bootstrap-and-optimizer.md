---
id: "REP-015"
title: "Dificuldades e aprendizados do BATCH-095"
status: "ready-for-review"
date: "2026-11-24"
author: "executor"
target_repo: "conn2flow-ai-workspace"
request: "REQ-093"
batch: "BATCH-095"
summary_short: "Atritos de EOL em edições por script, testes presos ao estado da matriz e regras da extensão descobertas só no teste; cita FB-008."
summary_medium: "BATCH-095 em Categoria B, topologia dupla e autonomia supervisionada.\nEvidências sobre sed -i e CRLF, heredoc com escapes, asserções de estado da matriz real e o bump automático do npm run package."
---

# REP-015 — Dificuldades e aprendizados (FEAT-017)

1. **Contexto da rodada.** REQ-093 / BATCH-095 na matriz `conn2flow-ai-workspace`: extensão v1.2.1, `domains/` + `mdd bootstrap` (ARCH-019 Fase 1), label do `--github`, FB-004/FB-007 e 1ª rodada do Optimizer (4 skills OVER → 0, 11 subskills PT-BR/EN). [Lote e evidências](../implementation/archive/batch-095.md).

2. **Dificuldades e atritos.**
   - **EOL em edições por script.** O `sed -i` do Git Bash (GNU sed 4.9) reescreveu arquivos CRLF inteiros em LF (`printf 'a\r\nb\r\nc\r\n'` + `sed -i '2s/b/B/'` → `od -c` mostra `a\n B\n c\n`). No sentido inverso, `Path.read_text`/`write_text` do Python 3.14 no Windows gravou CRLF em arquivos LF (`os.linesep`). Com `core.autocrlf` o diff do Git ficou limpo, mas os bytes da árvore mudaram. Corrigi com conversão explícita e passei a gravar bytes com o EOL detectado.
   - **Heredoc com `\\n` em Python.** Um teste gerado por heredoc virou string partida em duas linhas (`SyntaxError`). A Armadilha 13 já proíbe isso; o atrito foi meu, não da skill.
   - **Testes presos ao estado da matriz real.** `test_eval.py` exigia `c2f-shell-and-windows-traps` em `OVER` e `test_personas_subskills_learnings.py` exigia exatamente 1 subskill. O Optimizer, por definição, quebra essas asserções; atualizei-as para o novo estado (0 OVER, 11 subskills).
   - **Regra da extensão só visível no teste.** `batch054Ux.test.cjs` proíbe `showInformationMessage` em todo `src/`. O primeiro desenho do "Inicializar MDD" usava um botão "Abrir CURRENT.md" nesse diálogo; troquei por barra de status e abertura automática só quando a memória é nova.
   - **`npm run package` faz bump.** Empacotar a 1.2.1 por esse script geraria 1.2.2; usei o VSCE direto, como no BATCH-094.

3. **Lacunas nas skills.**
   - `c2f-shell-and-windows-traps` (Armadilha 20) manda usar "ferramenta de edição segura" em CRLF, mas não diz que o `sed -i` do Git Bash converte o arquivo inteiro, nem que o Python Windows em modo texto converte no sentido oposto.
   - `c2f-persona-optimizer` não avisa que extrair subskills quebra testes que fixam linhas, estado de budget ou contagem de subskills da matriz real.
   - As regras de UX da extensão (sem `showInformationMessage`, mensagens na barra de status) não estão numa skill; só nos testes e no histórico dos lotes 054.

4. **Solução validada.**
   - Bytes: scripts de divisão leem `read_bytes()`, normalizam em memória e gravam com o EOL original; `git diff --stat` ficou restrito às linhas alteradas.
   - Extração verbatim com asserção de cercas pareadas, `mdd eval` 15/15 (incluindo os cenários antigos que ancoram texto agora em subskill) e auditoria PASS com 0 `translation_copy_divergence` nas 7 cópias EN.
   - Extensão 166/166, pytest 162/162, VSIX 1.2.1 com `unzip -t` limpo.

5. **Melhorias propostas.**
   - **FB-008** (já no barramento, `READY`): acrescentar à Armadilha 20 que edição pontual em CRLF não usa `sed -i` do Git Bash, e que o script Python grava bytes ou usa `newline=''`, conferindo o EOL pelos bytes depois.
   - `c2f-persona-optimizer`: ao planejar uma extração, rodar `pytest` antes e listar as asserções que dependem do tamanho ou do budget da matriz real, atualizando-as no mesmo lote com justificativa.
   - Skill ou subskill da extensão VS Code (ex.: em `c2f-persona-executor` ou numa skill local da matriz) com as regras de UX já cobradas pelos testes: notificações rotineiras só na barra de status, progresso visível em ações demoradas, comandos com argv explícito e `buildMddEnv()` em toda chamada `mdd`.

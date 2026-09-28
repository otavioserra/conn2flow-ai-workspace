# Validation Checklist

Este documento concentra os checklists de aceitaÃ§Ã£o e os registros de testes empÃ­ricos de validaÃ§Ã£o para os lotes funcionais ativos.

## ValidaÃ§Ãµes Arquivadas

- [validation-001-003.md](archive/validation-001-003.md) (BATCH-001 a BATCH-003)
- [validation-006-007-014.md](archive/validation-006-007-014.md) (BATCH-006, BATCH-007 e BATCH-014)
- [validation-015.md](archive/validation-015.md) (BATCH-015)
- [validation-004-050.md](archive/validation-004-050.md) (BATCH-004 a BATCH-050)

---

## BATCH-051 — Persistência Externa em settings.json e Sincronização Dinâmica do Prompt (REQ-049, 2026-09-02)

### 1. Checklist de Aceite Técnico

- [x] Escopo SDD, projeto alvo, topologia e autonomia persistidos em configuração do VS Code (escopo `window`).
- [x] Preferências recarregadas na inicialização com precedência `settings.json` → `workspaceState` legado → inferência.
- [x] `conn2flow.sdd.copyPrompt` gera o prompt refletindo topologia e papéis ativos.
- [x] Metadado `Topologia de Agentes` sincronizado no `CURRENT.md`, preservando o vocabulário `dupla`.
- [x] Testes de unidade adicionados em `vscode-extension/test/`.

### 2. Evidências de Validação

1. `npm test` em `vscode-extension/`: compilação TypeScript limpa e **98/98 testes aprovados** (baseline 84/84), 0 falhas e 0 skips.
2. Novo `test/workspacePreferencesPolicy.test.cjs` (11 casos): paridade entre `PREFERENCE_KEYS` e o `contributes.configuration`; aliases de vocabulário; recusa de escopo/id inválidos; as três camadas de precedência; leitura do `CURRENT.md` **real** do repositório; atualização in-place sem mudar a contagem de linhas; inserção após `Status`; preservação de `dupla` na escrita.
3. `agentPromptPolicy.test.cjs` passou a exigir que o prompt de topologia dupla seja **diferente** do de tríade e contenha o texto de papéis correspondente, nos dois idiomas.

### 3. Defeito de causa-raiz corrigido

O `CURRENT.md` declara `` `dupla` `` e o `ModesManager` só aceitava `` `duplo` ``: **toda** leitura de
topologia caía no padrão `triade`. A seleção do painel era ignorada mesmo dentro da mesma sessão, não
apenas após o reload. Os normalizadores passaram a aceitar aliases e a escrita preserva o termo do documento.

### 4. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-051.md](review-051.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-052 — Suporte a ssh_public_path e Execução SSH Automática no Pipeline Multiprojeto (REQ-050, 2026-09-02)

### 1. Checklist de Aceite Técnico

- [x] Campo `ssh_public_path` (e demais chaves `ssh_*`) declarado no template do `environment.json` e exposto pelo `ProjectEnvironmentResolver`.
- [x] `assets:publish --project=ID` publica o `dist/` no docroot da VM via rsync/SSH.
- [x] `css:rebuild --project=ID` dispara dentro da VM quando `deploy_mode: "ssh"`.
- [x] Etapa 8/8 do `project:update-all` declara o projeto alvo.
- [x] Guardas de caminho remoto, citação e confirmação explícita cobertas por teste.

### 2. Evidências de Validação

1. Novo `tests/Unit/PHP/ProjectSshPublicPathReq050Test.php`: **17 casos, 47 asserções**, todos aprovados.
2. `vendor/bin/phpunit`: **1113/1113** aprovados, 7595 asserções, 4 skipped pré-existentes. `ProjectSshDeployReq034Test` (19 casos) segue verde — modo local sem regressão.
3. `npx vitest run`: **408/408**.
4. Simulação sem execução remota (`--simular-remoto`): `ssh -o BatchMode=yes -o ConnectTimeout=15 -p 22 "otavio@192.168.1.108" "cd '/home/snapphoton/web/snapphoton.local/conn2flow-gestor' && sudo -u 'snapphoton' './c2f' 'css:rebuild'"`.
5. Ausência de regressão medida: `assets:publish --project=transformamp-local --dry-run` e `assets:publish --dry-run` produzem saída idêntica à anterior.
6. Projeto SSH sem `ssh_public_path` reporta a ausência e sai com 0, em vez de publicar num docroot adivinhado.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-052.md](review-052.md) emitido com parecer **APPROVED** em 2026-09-02.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-053: Feedback Visual de Loading na Extensão, Resiliência VM, Poda de Checklists e Integração de Docs

### 1. Checklist de Aceite Técnico

- [x] Feedback visual de loading (`vscode.window.withProgress`) implementado em ações longas (release, updates e compilação).
- [x] Script de atualização via API (`update-system.sh`) com suporte a cURL `-k` / `--insecure` para `.local` e logging detalhado de erros HTTP.
- [x] Nós de diagnóstico do VS Code adaptados para o modo VM (ocultando Docker quando o projeto for VM).
- [x] Poda SDD de checklists históricos em `conn2flow`, `lumix` e `transformamp` (preservando até 25 itens ativos e arquivando o restante).
- [x] Atalhos de documentação ampla (`docs/`) adicionados na árvore Dev Tools.
- [x] `npm test` em 100% verde e `php cli/c2f.php ai:sync` com 36/36 skills nos 5 kits.

### 2. Evidências de Validação

1. `npm test` em `vscode-extension/`: **104/104 testes aprovados**, 0 falhas e 0 skips. Os novos
   testes cobrem progress notification até o fim da task, spinner/`aria-busy` no formulário,
   detecção de VM por `deploy_mode: "ssh"`, ocultação de Docker e rotas bilíngues de docs.
2. `tests/Unit/PHP/ProjectUpdateSystemVmReq051Test.php`: **5 testes, 21 asserções**; contrato de
   `.local`, opt-in `api.insecure_ssl`, preservação do erro cURL, corpo HTTP e repasse PHP validados.
3. `vendor/bin/phpunit`: **1121/1121 testes**, 7629 asserções, 4 skips e 2 depreciações
   preexistentes. `bash -n` e `php -l` também limpos.
4. `php cli/c2f.php ai:sync`: **36/36 skills** nos cinco toolkits do Core. Checagem somente-leitura
   confirmou as 36 skills obrigatórias e contratos em todos os cinco kits de `conn2flow-site`,
   `lumix` e `transformamp`.
5. Poda: Core **42 → 25** blocos ativos e 17 preservados em
   `sdd/validation/archive/validation-111-134.md`; `lumix=8` e `transformamp=11`, portanto já
   conformes e sem remoção indevida.
6. Os dois efeitos colaterais versionados da suíte completa (`schema-metadata.json` e
   `.tailwind-build-manifest.json`) foram restaurados. O `BATCH-165.md` concorrente foi preservado.
7. Nenhum update remoto, commit, push, deploy ou release foi executado. A validação ao vivo da VM
   fica para homologação humana porque o endpoint inicia uma sessão remota mesmo em dry-run.
8. Gate SDD final: `ai:archive-sdd --keep=10 --repair-links --dry-run` confirmou 10 requisições,
   10 batches e **zero links relativos órfãos** no `conn2flow-ai-workspace`.

Detalhamento operacional: [batch-053.md](../implementation/batch-053.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-053.md](review-053.md) emitido com parecer **APPROVED** em 2026-09-03.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-054: SSH no css:audit, Confirmação Remota em VM, Saneamento de Notificações, Status Bar VM e Busca de Docs

### 1. Checklist de Aceite Técnico

- [x] `c2f css:audit` com suporte a projetos VM (`deploy_mode: "ssh"`) delegando via SSH sem erro de `.env`.
- [x] Etapa 6/8 de `project:update-all` autorizada automaticamente em projetos VM locais (`--confirmar-remoto`).
- [x] Saneamento da barra de notificações do VS Code: fim dos toasts redundantes de sucesso (usar `setStatusBarMessage(..., 3000)`).
- [x] Version Bump automatizado da extensão VS Code (atualização para 1.1.0 e rotina de bump).
- [x] Barra de status do VS Code dinâmica (exibindo VM quando o projeto ativo for VM) com links para logs da VM (`php-error.log`, `nginx-error.log`).
- [x] Busca rápida e navegação de documentação técnica do sistema em `ai-workspace/pt-br/docs`.
- [x] Navegação contínua no preview Markdown preservando o modo de visualização.
- [x] `npm test` da extensão 100% verde e testes do Core aprovados.
- [x] Recibo emitido em `completions/BATCH-054-executor-receipt.json`.

### 2. Evidências de Validação

1. `npm test` na extensão: **111/111**; pacote `conn2flow-tools-1.1.0.vsix` gerado com 79 arquivos.
2. Core PHP: **1125/1125**, 7650 asserções, 4 skips; teste novo **2/2**, 12 asserções.
3. Core JavaScript: `npx vitest run` com **417/417** testes em 29 arquivos.
4. Execução SSH real do `css:audit` para `conn2flow-site-local`: código 0, relatório das quatro
   tabelas retornado pela VM e nenhuma tentativa de leitura do `.env` local.
5. Manifesto Tailwind confirmado com **237 recursos** e preservado como alteração preexistente.
6. Detalhamento operacional: [batch-054.md](../implementation/batch-054.md).
7. Gate SDD final: 10 requisições, 10 batches e zero links relativos órfãos; `batch-044.md`
   preservado em `implementation/archive/` pelo comando oficial.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-054.md](review-054.md) emitido com parecer **APPROVED** em 2026-09-03.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.

---

## BATCH-055: Resolução de Permissão de Logs VM e Execução SSH do css:rebuild sem Dependência de ./c2f

### 1. Checklist de Aceite Técnico

- [x] `vmDiagnosticsPolicy.ts` invoca `sudo tail -n 100` para leitura de logs remotos (`php-error.log` e `nginx-error.log`) eliminando `Permission denied`.
- [x] `sync-core-to-project.sh` sincroniza `c2f` e `cli/` para a instalação remota SSH.
- [x] `CssRebuildCommand::regenerarViaSsh()` implementa modo duplo (CLI primário e fallback via `php controladores/agents/arquitetura/css-regenerar.php`).
- [x] `tailwind-recursos.php` suporta fallback para o comando global `tailwindcss` quando não houver `node_modules` local.
- [x] `ProjectSshPublicPathReq050Test.php` compatível com o comportamento de `escapeshellarg` no Linux (Ubuntu runner do GitHub Actions).
- [x] Host SSH padronizado para `lab.conn2flow.local`.
- [x] `npm test` da extensão 100% verde.
- [x] Testes do Core CLI aprovados.
- [x] Recibo emitido em `completions/BATCH-055-executor-receipt.json`.

### 2. Evidências de Validação

1. Extensão VS Code: `npm test` compilou TypeScript e aprovou **114/114 testes**.
2. Core focado: **54/54 testes**, 171 asserções; `php -l` e `bash -n` sem erros.
3. Core completo: **1158/1158 testes**, 7730 asserções, 4 skips e 2 depreciações preexistentes.
4. Runner Linux local (`php:8.3-cli`): REQ-050 aprovou **17/17 testes e 51 asserções**, cobrindo a representação POSIX de `escapeshellarg()`.
5. A simulação do rebuild montou CLI local, CLI global e fallback PHP sobre `lab.conn2flow.local`, retornando código 0 sem executar SSH.
6. O Core foi integrado externamente no commit `13814708`; nenhuma operação remota mutante foi executada pelo Executor.
7. Gate SDD oficial arquivou `batch-045.md`; a verificação final confirmou a janela 10/10 e zero links relativos órfãos.



### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-055.md](review-055.md) emitido com parecer **APPROVED** em 2026-09-08.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-055-executor-receipt.json`.

---

## BATCH-056: Memory Gardening do Ecossistema SDD e Validação de Publicação de Release

### 1. Checklist de Aceite Técnico

- [x] Poda de `lumix/sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` reduzindo seu tamanho de 52.36 KB para a faixa de 20-30 KB (< 35 KB).
- [x] Confirmação de que nenhum arquivo `MEMORIA-*.md` do ecossistema ultrapassa o teto de 50 KB.
- [x] Empacotamento do VSIX oficial `conn2flow-tools-1.1.1.vsix` atualizado.
- [x] Workflows de release no GitHub Actions (`release-gestor.yml`) confirmados com status `success`.
- [x] Testes unitários da extensão (`npm test`, 114/114) e Core 100% verdes.
- [x] Gate SDD sem links órfãos e janela da regra dos 10 ativa.
- [x] Recibo emitido em `completions/BATCH-056-executor-receipt.json`.

### 2. Evidências de Validação

1. `lumix/sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` reduzido de 53.620 bytes para 15.028 bytes (-72%); original arquivado em `lumix/sdd/archive/MEMORIA-EXECUCAO-pre-batch-056.md`.
2. Auditoria ecossistema: 100% dos arquivos `MEMORIA-*.md` ativos abaixo de 50 KB.
3. Extensão VS Code: `npm test` aprovou 114/114 testes e gerou `conn2flow-tools-1.1.1.vsix` (79 arquivos, 186.54 KB).
4. GitHub Actions Core: run `gestor-v2.10.10` com status `success`.

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-056.md](review-056.md) emitido com parecer **APPROVED** em 2026-09-14.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-056-executor-receipt.json`.

---

## BATCH-057: Consolidação Canônica e Sincronização Global das 39 Skills nos 5 Repositórios

### 1. Checklist de Aceite Técnico

- [x] `c2f-shell-and-windows-traps/SKILL.md` atualizado na matriz com `MSYS_NO_PATHCONV=1` para `rsync`.
- [x] `c2f-javascript-ajax/SKILL.md` atualizado na matriz com cobertura CSRF para `XMLHttpRequest` cru.
- [x] Espelhamento completo das 39 skills em `.claude/skills/`, `.gemini/skills/` e `.codex/skills/` na matriz central.
- [x] Distribuição e sincronização das 39 skills para os 4 satélites (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`), incluindo as 3 skills da Tríade SDD.
- [x] Auditoria de integridade por hash criptográfico confirmando zero divergência em todo o ecossistema.
- [x] Gate SDD sem links órfãos e janela de 10 requisições/batches ativos respeitada.
- [x] Recibo emitido em `completions/BATCH-057-executor-receipt.json`.

### 2. Evidências de Validação

1. Auditoria MD5 recursiva: **15 kits**, **585 cópias oficiais**, `divergences=0`; todas as cópias
   contêm 39/39 skills e a Tríade SDD completa.
2. Validação estrutural: **39/39 skills** com `SKILL.md`, frontmatter, `name` coerente e
   `description`; zero erros.
3. Testes focados do Core: `npx vitest run tests/Unit/JS/global-csrf.test.js
   tests/Unit/JS/global-auth-redirect.test.js`, **20/20 aprovados**.
4. Gate SDD final: 10 requisições, 10 batches ativos e zero links relativos órfãos.
5. Detalhamento operacional: [batch-057.md](../implementation/batch-057.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-057.md](review-057.md) emitido com parecer **APPROVED** em 2026-09-17.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-057-executor-receipt.json`.





---

## BATCH-058: Incorporação Canônica das Armadilhas 7, 8 e 9 e Sincronização Global nos 5 Repositórios

### 1. Checklist de Aceite Técnico

- [x] `c2f-shell-and-windows-traps/SKILL.md` atualizado na matriz com as Armadilhas 7 (cwRsync/SSH dup failed), 8 (sequências ANSI no CLI) e 9 (cd antes de sudo no HestiaCP).
- [x] Espelhamento completo das 39 skills em `.claude/skills/`, `.gemini/skills/`, `.codex/skills/`, `.cursor/skills/` e `.github/skills/` na matriz central.
- [x] Distribuição e sincronização das 39 skills para os 4 satélites (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`).
- [x] Preservação integral de 35 skills locais/privadas nos satélites.
- [x] Auditoria de integridade por hash criptográfico confirmando zero divergência em 975 arquivos verificados.
- [x] Suíte de testes `npm test` aprovada com 114/114 testes verdes.
- [x] Gate SDD sem links órfãos e janela de 10 requisições/batches ativos respeitada (arquivado `batch-048.md`).
- [x] Recibo emitido em `completions/BATCH-058-executor-receipt.json`.

### 2. Evidências de Validação

1. Auditoria MD5 recursiva: **25 kits**, **975 cópias oficiais**, `divergences=0`; todas as cópias contêm 39/39 skills perfeitamente idênticas.
2. Testes unitários: `npm test` em `vscode-extension/`, **114/114 testes aprovados** (180ms).
3. Preservação: 35 skills privadas/locais intactas nos 4 satélites.
4. Gate SDD final: 10 requisições, 10 batches ativos e zero links relativos órfãos; `batch-048.md` arquivado.
5. Detalhamento operacional: [batch-058.md](../implementation/batch-058.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-058.md](review-058.md) emitido com parecer **APPROVED** em 2026-09-18.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-058-executor-receipt.json`.

---

## BATCH-059: Migração da Governança de Configurações para `.gemini/config.json` e Aderência ao Antigravity v2.16+

### 1. Checklist de Aceite Técnico

- [x] `.agents/mcp_config.json` migrado para `.gemini/mcp_config.json` e diretório `.agents/` removido.
- [x] Arquivo canônico `.gemini/config.json` criado e padronizado nos 5 repositórios (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`).
- [x] `GEMINI.md` e `AGENTS.md` atualizados incorporando a regra de `.gemini/config.json` e o slash command `/boost`.
- [x] Templates em `templates/` atualizados com `.gemini/config.json` e documentação atualizada.
- [x] Suíte de testes `npm test` aprovada com 114/114 testes verdes.
- [x] Gate SDD sem links órfãos e janela de 10 requisições/batches ativos respeitada (arquivado `batch-049.md`).
- [x] Recibo emitido em `completions/BATCH-059-executor-receipt.json`.

### 2. Evidências de Validação

1. Migração de arquivos: `.agents/mcp_config.json` → `.gemini/mcp_config.json` ativo; `.agents/` removido.
2. Configuração nos 5 repositórios: `.gemini/config.json` presente e válido em todos os 5 repositórios.
3. Testes unitários: `npm test` em `vscode-extension/`, **114/114 testes aprovados** (180ms).
4. Gate SDD final: 10 requisições, 10 batches ativos e zero links relativos órfãos; `batch-049.md` arquivado.
5. Detalhamento operacional: [batch-059.md](../implementation/batch-059.md).

### 3. Revisão Técnica

- [x] Auditoria do Revisor Técnico: [review-059.md](review-059.md) emitido com parecer **APPROVED** em 2026-09-24.
- [x] Homologação executiva concluída pelo Macro-Arquiteto.
- Recibo: `completions/BATCH-059-executor-receipt.json`.

---

## BATCH-061: Auditoria Ampla do Ecossistema SDD, Poda de Arquivos Gigantes e Cristalização dos Aprendizados em Skills

### 1. Checklist de Aceite Técnico

- [x] Poda e arquivamento de arquivos > 50 KB nos 5 repositórios do ecossistema:
  - `conn2flow-ai-workspace`: `VALIDATION-CHECKLIST.md` podado de 82.29 KB para 17.98 KB (arquivado `validation-004-050.md`).
  - `conn2flow`: `DECISION-LOG.md` podado de 113.71 KB para 47.71 KB; `BATCH-INDEX.md` podado de 102.01 KB para 6.11 KB; `VALIDATION-CHECKLIST.md` mantido em 11.17 KB; `CURRENT.md` podado de 44.10 KB para 4.95 KB.
  - `lumix`: `VALIDATION-CHECKLIST.md` podado de 128.65 KB para 9.39 KB; `BATCH-INDEX.md` podado de 83.59 KB para 6.66 KB.
  - `conn2flow-site`: `VALIDATION-CHECKLIST.md` podado de 71.34 KB para 19.70 KB; `MEMORIA-ENGENHARIA-EXECUCAO.md` podado de 30.04 KB para 13.86 KB.
  - `transformamp`: `DECISION-LOG.md` podado de 49.04 KB para 22.21 KB.
  - Meta atingida: 10/10 arquivos abaixo de 50 KB (9/10 abaixo de 25 KB).
- [x] Atualização de `c2f-database-operations/SKILL.md`: `JSON_MERGE_PATCH`, proteção RFC 7396 (`null`), validação com `JSON_VALID()` e prevenção de race conditions.
- [x] Atualização de `c2f-hooks-system/SKILL.md`: sincronização automática de deploy e comando dedicado `./c2f project:sync-hooks <projeto-id>`.
- [x] Atualização de `c2f-gestor-functions/SKILL.md`: `nome_especifico`, caminhos relativos em `gestor_redirecionar()` e `<modulo>.ajax.public.php`.
- [x] Atualização de `c2f-modelo-templates/SKILL.md`: mockups defensivos `<!-- widgets#SIG < -->` e `<template>`.
- [x] Atualização de `c2f-shell-and-windows-traps/SKILL.md`: Armadilha 10 (colapso de barra invertida em heredoc Git Bash) e Armadilha 11 (timeout de `grep -rn` no Windows).
- [x] Espelhamento nos 5 kits da matriz e nos templates bilíngues (pt-br/en).
- [x] Propagação para os 20 diretórios de kit dos 4 satélites (`conn2flow`, `lumix`, `conn2flow-site`, `transformamp`).
- [x] Auditoria criptográfica MD5: 1.000 arquivos verificados com zero divergências e preservação de skills locais.
- [x] Suíte de testes `npm test` da extensão: 114/114 testes aprovados (0 fail).
- [x] Relatório `sdd/implementation/batch-061.md` criado e recibo emitido.

### 2. Evidências de Validação

1. Auditoria de tamanhos: 10/10 arquivos abaixo de 50 KB confirmados via script de medição.
2. Auditoria MD5: 1.000/1.000 correspondências de hash canônico em todos os 25 kits dos 5 repositórios.
3. Testes da extensão: `npm test` em `vscode-extension/`, 114/114 testes aprovados (187ms).
4. Detalhamento operacional: [batch-061.md](../implementation/batch-061.md).

# BATCH-054 — SSH no css:audit, confirmação remota em VM e refinamentos da extensão

* **Requisição:** REQ-052
* **Status:** READY_FOR_REVIEW
* **Modo:** supervisionado
* **Repositórios:** `conn2flow` (Core CLI) e `conn2flow-ai-workspace` (extensão VS Code e SDD)

## Live Todo List

- [x] Ler `CURRENT.md`, `req-052.md`, governança SDD e estado inicial dos dois repositórios.
- [x] Auditar os contratos existentes de SSH, VM, notificações, status bar, documentação e preview Markdown.
- [x] Implementar `css:audit` remoto e autorização automática da etapa 6/8 para VM local no Core.
- [x] Implementar saneamento de notificações e confirmação remota nos comandos de projeto da extensão.
- [x] Implementar version bump 1.1.0, status bar VM e atalhos seguros para logs remotos.
- [x] Implementar busca do acervo técnico e navegação contínua no preview Markdown.
- [x] Adicionar testes de regressão do BATCH-054.
- [x] Executar `npm test` e testes do Core com resultado 100% verde.
- [x] Registrar evidências no checklist de validação e emitir o recibo do Executor.

## Implementação

- `CssAuditCommand` reconhece `deploy_mode: "ssh"`, monta a chamada com
  `SshRemoteTransport`, repassa `--limite`/`--json`, preserva JSON puro na execução real e oferece
  `--simular-remoto` para diagnóstico sem abrir sessão.
- `ProjectUpdateAllCommand` deriva a autorização declarativa apenas quando o projeto combina
  `deployMode=ssh` e `local=true`; produção continua exigindo a flag explícita. A autorização é
  repassada às etapas 6/8 e 8/8.
- A extensão eliminou `showInformationMessage` de sucessos rotineiros em favor de mensagens de
  status por 3 segundos; erros e alertas críticos continuam em pop-up.
- A versão passou a `1.1.0`; `npm run package` executa bump patch automático e a rotina oferece
  `npm run version:bump:dry-run`.
- A barra inferior alterna entre Docker e `$(vm) Conn2Flow VM`, reage à troca do projeto e abre um
  seletor para `logs/php-error.log` e `logs/nginx-error.log` via SSH seguro.
- `conn2flow.docs.search` pesquisa recursivamente `docs/` e
  `conn2flow/ai-workspace/pt-br/docs`; o destino abre no preview configurado.
- Links Markdown que o preview gerenciado encaminha a uma aba fonte são capturados e reabertos no
  preview, fechando somente a aba `.md` redundante.

## Evidências

1. `npm test` em `vscode-extension/`: **111/111 testes aprovados**, 0 falhas, 0 skips.
2. `vendor/bin/phpunit`: **1125/1125 testes aprovados**, 7650 asserções, 4 skips e 2 depreciações
   preexistentes.
3. `npx vitest run`: **417/417 testes aprovados** em 29 arquivos; mensagens `ECONNREFUSED` de
   recursos Happy DOM permaneceram em `stderr`, sem falhas da suíte.
4. `CssAuditSshReq052Test`: **2/2 testes**, 12 asserções; `php -l` limpo nos dois comandos Core.
5. `css:audit --project=conn2flow-site-local --limite=3` executado de fato via SSH na VM e validado
   sem erro de `.env`; a simulação com `--json` também montou o comando remoto e saiu com código 0.
6. VSIX gerado: `vscode-extension/conn2flow-tools-1.1.0.vsix`, **79 arquivos**, 186,54 KB.
7. `.tailwind-build-manifest.json` preservado com **237 recursos**; as alterações já presentes no
   início do lote em `schema-metadata.json` e no manifesto não foram incorporadas ao escopo.
8. `git diff --check` limpo nos dois repositórios. Nenhum commit, push, deploy ou operação remota
   mutante foi realizado; somente a auditoria SSH de leitura do critério de aceite foi executada.
9. Gate SDD oficial arquivou `batch-044.md` em `sdd/implementation/archive/`; o dry-run final
   confirmou 10 requisições, 10 batches e zero links relativos órfãos.

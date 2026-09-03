# BATCH-053 — Loading na Extensão, Resiliência VM, Poda de Checklists e Integração de Docs

## Estado

- **Requisição:** REQ-051
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia desta execução:** `tríade` (instrução humana mais recente; o intake permanece com o metadado histórico `dupla`)
- **Projeto principal:** `conn2flow-ai-workspace`
- **Raiz principal:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Core:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`

## Live Todo List

- [x] Implementar progresso nativo contínuo nos pipelines longos de Core, projetos e release.
- [x] Manter o formulário de release em estado ocupado durante “Salvar e Executar”.
- [x] Tornar o updater por API tolerante a certificados locais e verboso em falhas HTTP/transporte.
- [x] Ocultar controles e status de Docker quando o projeto ativo usar `deploy_mode: "ssh"`.
- [x] Integrar índice documental e roadmap bilíngues, preservando o guia de arquitetura existente.
- [x] Podar checklists que excedam 25 blocos ativos, preservando o histórico e links.
- [x] Validar extensão, Core, sintaxe, skills e integridade do diff.
- [x] Emitir recibo do Executor e preparar handoff para o Revisor separado.

## Implementação

### Feedback visual contínuo

`CommandRunner` agora mantém `vscode.window.withProgress` em `ProgressLocation.Notification` até o
encerramento efetivo da tarefa do VS Code. O opt-in foi ligado a `manager:update-all`,
`resources:sync`, `css:rebuild`, `project:update-all`, `project:deploy` e `project:sync-core`.
O fluxo de release usa títulos próprios também enquanto aguarda o workflow do GitHub Actions.

No formulário, “Salvar e Executar” desabilita os controles, marca `aria-busy`, mostra spinner e
mantém o painel vivo até o fluxo de execução terminar ou for bloqueado/cancelado. As notificações de
sucesso/erro continuam emitidas pelo `CommandRunner` e pelo fechamento de release.

### Resiliência VM

`update-system.sh` ativa `--insecure` automaticamente apenas para URLs HTTPS cujo hostname termina
em `.local`, ou mediante opt-in `devProjects.<id>.api.insecure_ssl: true` / argumento explícito
`--insecure`. O padrão do template permanece `false`. O cURL deixou de esconder `stderr` e de ser
abortado silenciosamente pelo `set -e`: cada falha agora relata exit code do cURL, status HTTP e
corpo da resposta (ou `<empty>`) em start, deploy, database e finalize. O comando PHP documenta e
repassa o opt-in.

Na extensão, a política pura `isVmProject()` reconhece `deploy_mode: "ssh"`. Nesse modo, os quatro
nós Docker deixam de compor Diagnóstico e o item Docker da barra de status é ocultado; ações de
skills e sincronização permanecem acessíveis.

### Documentação e poda

A árvore ganhou o índice bilíngue `docs/{pt-br,en}/README.md` e o roadmap bilíngue, além dos guias
já expostos (painel, CLI/MCP, orquestração, arquitetura de agentes e skills). Rótulos, tooltips e
comandos estão nos catálogos runtime e `package.nls*.json`.

O Core tinha 42 blocos de batch no checklist: os 17 primeiros da janela corrente foram arquivados
em `sdd/validation/archive/validation-111-134.md`, e o único link relativo interno foi reancorado.
O ativo ficou com 25 blocos. `lumix` tinha 8 e `transformamp` 11; ambos já estavam conformes e não
foram artificialmente podados. Alterações preexistentes de skills em `lumix` foram preservadas.

## Evidências

1. `npm test` em `vscode-extension/`: **104/104 testes**, 0 falhas, 0 skips.
2. Testes focados da extensão: **13/13**, cobrindo progresso, loading do formulário, VM/SSH,
   documentação, tooltips, hierarquia e cobertura de comandos.
3. `ProjectUpdateSystemVmReq051Test.php`: **5 testes, 21 asserções**.
4. `vendor/bin/phpunit`: **1121/1121 testes**, 7629 asserções, 4 skips e 2 depreciações
   preexistentes. Dois manifestos regenerados pela suíte foram restaurados conforme a política de
   isolamento; `BATCH-165.md`, criado por outra execução concorrente, foi preservado.
5. `bash -n ai-workspace/en/scripts/projects/update-system.sh` pelo Git for Windows: limpo.
6. `php -l cli/src/Commands/ProjectUpdateSystemCommand.php`: limpo; helps Bash e CLI exibem
   `--insecure` e sua restrição a desenvolvimento local.
7. `php cli/c2f.php ai:sync`: **36/36** skills verificadas nos cinco toolkits do Core. Auditoria
   somente-leitura confirmou o mesmo conjunto obrigatório 36/36 em todos os cinco kits de
   `conn2flow-site`, `lumix` e `transformamp`.
8. Poda medida: `conn2flow 42 → 25` + arquivo com 17 blocos; `lumix=8`, `transformamp=11`.
9. `ai:archive-sdd --keep=10 --repair-links` arquivou `req-041.md` e `batch-043.md` após a criação
   dos artefatos deste lote; dry-run final confirmou 10/10 em cada raiz e zero links órfãos.

## Limites e handoff

- Nenhuma sessão real de update foi iniciada contra a VM: mesmo com `--dry-run`, a API cria uma
  sessão remota. A execução foi deliberadamente omitida no modo supervisionado.
- Nenhum commit, push, deploy ou release foi executado.
- A auditoria findings-first pertence ao Revisor separado da tríade.

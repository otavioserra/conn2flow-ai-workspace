# BATCH-055 — Logs VM privilegiados e rebuild CSS remoto resiliente

## Identificação

- Requisição: `REQ-053`
- Repositório de governança/extensão: `conn2flow-ai-workspace`
- Repositório Core: `conn2flow`
- Autonomia: `supervisionado`
- Status: `ready-for-review`
- Data: 2026-09-03

## Live Todo List

- [x] Adicionar `sudo` ao `tail -n 100` remoto e cobrir PHP/Nginx em teste unitário.
- [x] Sincronizar o launcher `c2f` e o diretório `cli/` para destinos SSH e o projeto mestre `conn2flow-site`.
- [x] Implementar o modo duplo do rebuild SSH: CLI local/global e fallback PHP.
- [x] Resolver `tailwindcss` pelo PATH quando não houver binário local.
- [x] Propagar o `NODE_PATH` global para o rebuild em instalações sem `node_modules` local.
- [x] Tornar portáveis as quatro asserções de comandos SSH da suíte REQ-050.
- [x] Confirmar os hosts `lab.conn2flow.local` previstos no briefing.
- [x] Executar `npm test` na extensão e PHPUnit focado/completo no Core.
- [x] Registrar evidências no checklist e emitir `completions/BATCH-055-executor-receipt.json`.

## Implementação

- `buildVmLogCommand()` usa `sudo tail -n 100` e possui cobertura dedicada para os logs PHP e Nginx.
- O sync do Core publica `c2f` e `cli/` quando o transporte é SSH ou o alvo é o projeto mestre.
- O rebuild remoto detecta `./c2f`, depois `c2f` no PATH e recorre ao controlador PHP quando ambos faltam; as opções do comando são preservadas nos três ramos.
- `CssRebuildCommand` reconhece tanto o checkout do Core (`gestor/`) quanto uma instalação remota plana.
- O compilador procura `tailwindcss` com `which` depois dos candidatos locais, e o regenerador acrescenta o diretório global ao `NODE_PATH` sem apagar valores existentes.
- As comparações de comandos SSH normalizam apenas a camada externa de quoting; o caso hostil continua validando o argumento remoto completo com o `escapeshellarg()` nativo.

## Evidências

1. `npm test` em `vscode-extension/`: **114/114 testes aprovados**, sem falhas, skips ou cancelamentos.
2. PHPUnit focado: **54/54 testes**, 171 asserções; sintaxe PHP e Bash limpa.
3. PHPUnit completo no Core: **1158/1158 testes**, 7730 asserções, 4 skips e 2 depreciações preexistentes.
4. PHP 8.3/Linux em container: `ProjectSshPublicPathReq050Test.php` com **17/17 testes e 51 asserções**.
5. `css:rebuild --project=conn2flow-site-local --confirmar-remoto --simular-remoto --dry-run` exibiu os três ramos sobre `lab.conn2flow.local` e saiu com código 0, sem abrir sessão SSH.
6. Alterações do Core integradas externamente no commit `13814708`; o Executor não realizou commit, push, deploy ou mutação remota.
7. Efeito colateral de timestamp em `schema-metadata.json` restaurado após a suíte; alterações concorrentes de `admin-cron`/BATCH-167 foram preservadas fora do escopo.
8. Gate SDD oficial arquivou `batch-045.md`; o dry-run final confirmou 10 requisições, 10 batches e zero links relativos órfãos.

# BATCH-052 — Suporte a ssh_public_path e Execução SSH Automática no Pipeline Multiprojeto

## Estado

- **Requisição:** REQ-050
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Projeto:** `conn2flow` (Core / CLI) + `conn2flow-ai-workspace` (governança)
- **Raiz do código:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`

## Live Todo List

- [x] Declarar `ssh_public_path` (e as demais chaves `ssh_*`) no template do `environment.json`.
- [x] Criar o transporte SSH em PHP com as guardas da biblioteca bash existente.
- [x] Fazer `assets:publish` reconhecer `--project` e publicar no docroot da VM por rsync.
- [x] Fazer `css:rebuild` disparar dentro da VM em vez de apenas recusar.
- [x] Declarar o projeto na etapa 8/8 do `project:update-all`.
- [x] Cobrir com testes e validar sem regressão.

## Implementação

### Os dois defeitos, medidos

1. **Etapa 6/8 (`css:rebuild`)**: com `deploy_mode: "ssh"` o comando *recusava* a etapa, porque o
   `.env` e o MySQL estão na VM. O pipeline terminava sempre com aviso e o CSS derivado do projeto
   nunca era regenerado.
2. **Etapa 8/8 (`assets:publish`)**: o pipeline chamava `new Input(['--opcional'])` — **sem o id do
   projeto**. A publicação lia o `PUBLIC_PATH` do `.env` do **Core** e, quando ele existia,
   publicaria o `dist/` do projeto no DocumentRoot de outro site. Sem ele, apenas pulava a etapa.

### `cli/src/Support/SshRemoteTransport.php` (novo)

Contraparte PHP de `ai-workspace/en/scripts/lib/project-transport.sh`, com as mesmas guardas e pelas
mesmas razões:

- **Caminho remoto absoluto obrigatório.** Um valor relativo cairia no home da conta SSH e `/`
  alcançaria a raiz do convidado — com `--delete` no rsync isso apaga o sistema do outro lado.
- **Citação POSIX argumento a argumento**, independente do shell local que dispara o `ssh`. O `ssh`
  concatena os argumentos e o servidor os entrega ao shell: interpolar valor do `environment.json`
  na linha remota seria execução arbitrária.
- **`ssh_run_as` validado como nome de usuário simples** antes de virar `sudo -u`.
- **BatchMode + ConnectTimeout**: um pipeline que para num prompt de senha fica pendurado até o
  timeout do chamador sem dizer por quê.
- **`--rsync-path "sudo rsync"`** quando `ssh_sudo`: eleva só o processo remoto do rsync, não o
  pipeline inteiro.

### Chaves novas em `devProjects.<id>`

| Chave | Papel |
| --- | --- |
| `ssh_public_path` | DocumentRoot da VM; o `dist/` é publicado em `<ssh_public_path>/dist/` |
| `ssh_cli_entrypoint` | entrypoint do CLI remoto, padrão `./c2f` (aceita `php cli/c2f.php`) |
| `ssh_cli_path` | diretório de execução do CLI remoto, padrão `ssh_target_path` |

O template `dev-environment/templates/environment/environment.json` passou a documentar todas as
chaves `ssh_*`, com `deploy_mode: "local"` como padrão — projetos existentes não mudam de
comportamento.

### Comportamento novo

- `c2f assets:publish --project=ID`: monta o `dist/` numa área de staging local
  (`temp/assets-publish/<id>/`) e envia por `rsync` para `<ssh_public_path>/dist/` na VM. Mantém a
  etapa idempotente e verificável antes de tocar no servidor.
- `c2f css:rebuild --project=ID`: executa `cd <alvo> && ./c2f css:rebuild` dentro da VM, onde `.env`
  e MySQL existem nativamente, repassando `--tipo`, `--id`, `--limite`, `--todos` e `--dry-run`.
- `c2f project:update-all <id>`: a etapa 8/8 agora declara `--project=<id>`.

### Guardas de segurança

Alcançar outra máquina **nunca é implícito**, nem em projeto `local=true`: tanto o `css:rebuild`
remoto quanto o `assets:publish` remoto exigem `--confirmar-remoto`. `--simular-remoto` imprime a
linha de comando exata sem executá-la. Sem `ssh_public_path` declarado, a publicação é **ignorada com
aviso** em vez de cair num docroot adivinhado.

## Evidências

1. Novo `tests/Unit/PHP/ProjectSshPublicPathReq050Test.php`: **17 casos, 47 asserções**, todos
   aprovados. Cobre a normalização do `ssh_public_path`, a recusa de caminho relativo e de `/`, a
   recusa de porta fora de faixa, a recusa de `ssh_run_as` hostil, a citação de um valor com
   `'; rm -rf /; #` (o `&&` da linha continua sendo um só), a linha do rsync com e sem `--delete`, o
   `mkdir -p` remoto, o entrypoint composto e os contratos dos três comandos alterados.
2. `vendor/bin/phpunit`: **1113/1113** aprovados, 7595 asserções, 4 skipped pré-existentes.
   `ProjectSshDeployReq034Test` (19 casos) continua verde — o modo local não regrediu.
3. `npx vitest run`: **408/408**.
4. `php -l` limpo em todos os arquivos alterados.
5. Simulação real, sem executar nada remoto — `css:rebuild --project=snapphoton-local
   --confirmar-remoto --simular-remoto`:
   ```
   ssh -o BatchMode=yes -o ConnectTimeout=15 -p 22 "otavio@192.168.1.108" \
     "cd '/home/snapphoton/web/snapphoton.local/conn2flow-gestor' && sudo -u 'snapphoton' './c2f' 'css:rebuild'"
   ```
6. Ausência de regressão no caminho local, medida: `assets:publish --project=transformamp-local
   --dry-run` e `assets:publish --dry-run` (sem projeto) produzem saída **idêntica** à anterior.
7. `assets:publish --project=snapphoton-local --opcional` (projeto SSH sem `ssh_public_path`) reporta
   a ausência e sai com 0, em vez de publicar no lugar errado.

## Ressalvas de homologação

- **Nenhum comando remoto foi executado.** O modo é supervisionado e a regra de segurança do projeto
  proíbe deploy automático em servidor remoto. A construção da linha de comando está coberta por
  teste; a execução contra a VM depende de homologação do operador.
- **Os dois projetos com `deploy_mode: "ssh"` (`snapphoton-local`, `conn2flow-site-local`) ainda não
  declaram `ssh_public_path`** — é um caminho real de servidor e não deve ser adivinhado. Enquanto
  não for preenchido pelo operador, a etapa 8/8 apenas informa.
- **Projetos locais continuam usando o `PUBLIC_PATH` do Core** na etapa 8/8. Resolver o DocumentRoot
  a partir do `.env` do próprio projeto local está fora do escopo declarado da REQ-050 (que trata do
  caso `deploy_mode: "ssh"`) e fica registrado aqui como candidato a intake.

## Pendência para o Humano-no-Loop

- Preencher `ssh_public_path` nos projetos SSH e homologar um `project:update-all` com
  `--confirmar-remoto` contra a VM. Nenhum commit, push, deploy ou release foi executado.

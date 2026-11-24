---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../tools/mdd-client/src/mdd_client/cli.py
  - ../../scripts/skills/sync-skills.cjs
  - ../../scripts/install-spec-driven-codex-kit.ps1
  - ../../scripts/setup-mcp-connectors.ps1
  - ../../mcp-hub/src/server.ts
  - ../../mcp-hub/src/tools/dispatchTask.ts
  - ../../mcp-hub/src/tools/c2fCommand.ts
---


# Guia rápido: CLI Core, MDD e MCP

[English](../en/QUICKSTART-CLI-AND-MCP.md) · [Índice da documentação](README.md)

## Escolha o repositório e a ferramenta

| Ferramenta | Repositório | Finalidade | Disponibilidade |
| --- | --- | --- | --- |
| c2f | Core conn2flow | Recursos do produto, ambiente e pipelines de projeto | Implementado no repositório separado do Core |
| Sincronizador de skills | conn2flow-ai-workspace | Auditar/propagar skills canônicas | Implementado |
| MCP conn2flow-hub | conn2flow-ai-workspace/mcp-hub | Rodar comandos Core, enfileirar tarefas e registrar recibos | Implementado em TypeScript |
| MDD Client / MDD Hub Python | tools/mdd-client e tools/mdd-hub | Memória local, relatórios e monitoramento de documentação | Disponíveis a partir do código-fonte |

## CLI Core

Na raiz do Core, comece pela ajuda. Seus comandos não rodam pela pasta cli/ deste workspace.

```sh
./c2f help
./c2f resources:sync
./c2f manager:update-all
./c2f project:update-all <id>
```

No PowerShell, use `.\c2f.ps1 help`; diretamente em PHP, use `php cli/c2f.php help`. Os exemplos de pipeline exigem ambiente de teste configurado e as skills pertinentes do Core. Rode pipelines de recursos e atualização um por vez em foreground com logs visíveis; nunca os substitua por cópia de arquivos para espelhos de teste. Confirme o alvo antes de operar projetos.

## Skills canônicas e novos projetos

Na raiz da matriz, use:

```sh
node scripts/skills/sync-skills.cjs
node scripts/skills/sync-skills.cjs --apply c2f-ai-features
```

O padrão é auditoria sem escrita. Aplicar uma skill nomeada escreve nos kits configurados e preserva skills locais exclusivas e traduções declaradas. O instalador Codex existente aceita TargetRepoPath e Language:

```powershell
.\scripts\install-spec-driven-codex-kit.ps1 -TargetRepoPath "C:\projects\my-project" -Language pt-br
```

Esse instalador ainda provisiona sdd/ e preserva uma pasta SDD existente. Ele não implementa mdd init nem comprova que um satélite migrou.

## MDD Client

Na raiz do repositório, instale o Client em um ambiente virtual ativo com Python 3.11+.

```sh
python -m pip install -e tools/mdd-client
mdd init ./my-project --type software --kits
mdd status --path ./my-project
mdd feedback list --json
mdd eval
```

Consulte `mdd feedback submit --help` e `mdd feedback triage --help` para os argumentos obrigatórios. Rode os exemplos de feedback e eval na raiz da matriz. O [guia Python](GUIA-ECOSSISTEMA-PYTHON-MDD.md) descreve a sincronização, o roteamento do feedback, a quarentena e os cenários de regressão.

## Configuração do MCP Hub

O [servidor Hub](../../mcp-hub/src/server.ts) usa JSON-RPC por stdin/stdout. Instale/compile em mcp-hub/ com npm ci e npm run build, depois configure o cliente para iniciar Node com caminho absoluto para mcp-hub/dist/index.js. O repositório também fornece configuração Docker Compose; Docker é opcional para o conector Node local.

```json
{
  "mcpServers": {
    "conn2flow-hub": {
      "command": "node",
      "args": ["C:/projects/conn2flow-ai-workspace/mcp-hub/dist/index.js"]
    }
  }
}
```

Essa é a estrutura de conector usada pelo injector do repositório; confira o formato de configuração do cliente alvo antes de aplicar. O setup-mcp-connectors.ps1 atual também escreve uma entrada legada .agents/mcp_config.json. A matriz agora exige configuração em .gemini/; não trate a entrada legada como canônica. Esta alteração documental mantém o helper e registra a divergência.

O conector Python roda `mdd mcp` por stdio por padrão. Configure o caminho absoluto do executável no ambiente virtual se o cliente MCP não encontrar `mdd` no PATH. As tools `submit_skill_feedback` e `list_skill_feedback` também estão em `conn2flow-hub`. A triagem usa o CLI do Client.

## Ferramentas, modos e evidências

| Ferramenta | Entrada obrigatória | Resultado |
| --- | --- | --- |
| c2f_run_command | command; args e repoPath absoluto opcionais | exitCode, stdout, stderr, duração e success do CLI Core |
| dispatch_task | repo, req_id, prompt; mode opcional | Registro JSON de tarefa em tasks/ |
| report_completion | batch_id, status (success/failed), logs | Recibo de conclusão; task_id/req_id/role opcionais correlacionam o trabalho |
| log_session_event | batch_id, agent_id, role, summary | Evento de timeline de sessão compartilhada |

dispatch_task aceita **supervised**, **live_autonomous** e **headless_autonomous**; o padrão é supervised. Ele grava o registro da fila, sem iniciar daemon Python ou executar um lote autonomamente. O watcher VS Code observa alterações em tarefas e recibos. Inclua projeto alvo, raiz absoluta, requisição, lote, escopo e condições de parada nos prompts.

Os modos headless/monitored/reviewer de evolução do MDD Hub Python são outra interface. Um recibo de sucesso descreve verificações executadas; não substitui revisão independente nem homologação humana. Consulte o [playbook do workflow](PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md).

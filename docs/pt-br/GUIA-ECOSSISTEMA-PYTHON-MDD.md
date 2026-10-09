---
verified_at: d052f32
sources:
  - ../../tools/mdd-client/pyproject.toml
  - ../../tools/mdd-client/src/mdd_client/cli.py
  - ../../tools/mdd-client/src/mdd_client/memory.py
  - ../../tools/mdd-hub/src/mdd_hub/api.py
  - ../../tools/mdd-hub/src/mdd_hub/watcher.py
  - ../../tools/mdd-hub/src/mdd_hub/evolution.py
---

# Guia do ecossistema Python MDD

[English](../en/MDD-PYTHON-ECOSYSTEM-GUIDE.md) · [Índice](README.md)

## Disponibilidade e instalação

O MDD Client e o MDD Hub estão implementados em Python 3.11+, em dois pacotes independentes. O Client organiza a memória de projetos; o Hub recebe relatórios e acompanha documentação oficial de IA. A instalação é pelo código-fonte; não há publicação no PyPI.

Na raiz deste repositório, crie e ative um ambiente virtual e instale os pacotes:

```sh
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install -e "tools/mdd-client[test]" -e "tools/mdd-hub[test]"
mdd --help
mdd-hub --help
```

Node.js é necessário para sincronizar skills pelo propagador oficial. Git com identidade de commit é necessário para o modo headless. Consulte o [manual completo](../../tools/README.md) para opções, configuração e limitações.

## Como usar o Client

```sh
mdd init ./my-project --type software
mdd sync --path ./my-project --matrix /path/to/conn2flow-ai-workspace
mdd status --path ./my-project
mdd compact --path ./my-project
mdd compact --path ./my-project --apply
mdd report --path ./my-project --log build.log
mdd watch --path ./my-project --once
```

| Comando | Comportamento |
| --- | --- |
| `init` | Cria a tríade 00/01/02, todas as áreas de memória, índices e arquivos duais. Aceita software/mobile/general; `--kits` instala skills e regras nos cinco kits. Preserva documentos e configurações existentes. |
| `sync` | Sincroniza 44 skills e regras canônicas; preserva skills/regras exclusivas e configurações locais. Usa `--matrix`, `MDD_MATRIX` ou o checkout fonte. `--audit` verifica sem propagar. |
| `compact` | Audita por padrão; `--apply` aplica janela de dez, teto de 50 KiB e router de 30 KiB. Preserva bytes originais, produz extratos estruturais e partes completas, repara links e atualiza índices. Chefia e documentos selecionados por CURRENT ficam protegidos. |
| `status` | Mostra painel Rich ou `--json`; retorna código 1 para memória não conforme. |
| `report` | Exporta saúde e contadores de erros/avisos/timeouts para JSON; não inclui texto bruto dos logs. `--hub URL` envia o relatório salvo. |
| `daemon` / `watch` | Serviço assíncrono em foreground; emite JSON quando a saúde muda. Aceita `--interval` e `--once`; Ctrl+C encerra. Um gerenciador de serviços pode hospedá-lo em background. |

Documentos saudáveis permanecem intactos. Originais arquivados conservam os bytes e a base relativa registrada; sínteses são extratos de navegação, não resumos semânticos aprovados. Referências inline, definições Markdown e URIs de arquivo internas são reparadas. Sintaxe aninhada e anchors HTML personalizados exigem revisão. Locks exclusivos impedem mutações concorrentes; um lock abandonado exige inspeção antes de remoção explícita.

## Hub e API

```sh
mdd-hub serve --root ./hub-project --port 8765
mdd report --path ./my-project --hub http://127.0.0.1:8765
mdd-hub serve --root ./hub-project --watch-docs --mode reviewer
```

O servidor usa loopback por padrão. `MDD_HUB_TOKEN` habilita autenticação Bearer nos dois processos; bind externo exige token pela CLI. Para acesso remoto, configure HTTPS em um proxy. O [schema da API](../../tools/mdd-hub/src/mdd_hub/models.py) define versão 1, UUID, projeto, data com timezone, saúde, contadores não negativos e lições limitadas. `/docs` apresenta a referência interativa.

| Rota | Resultado |
| --- | --- |
| `POST /api/v1/reports` | 201 para ingestão nova, 200 para retry idêntico, 409 para reutilização conflitante de ID, 422 para schema inválido, 413 acima de 256 KiB e 401 sem credencial válida. |
| `GET /api/v1/status` | Contagens de relatórios/projetos, relatórios não conformes e estado/erros do watcher. |

Relatórios persistem em `memory/reports/clients/`; `consolidated.json` agrega atritos e recorrência de lições. A implantação usa um worker e armazenamento em arquivos com locks, sem banco distribuído. O MCP Hub TypeScript existente é outro serviço.

## Watcher e modos de evolução

```sh
mdd-hub watch --root ./hub-project --mode reviewer --once
mdd-hub watch --root ./hub-project --mode monitored --interval 3600
mdd-hub watch --root ./hub-project --mode headless --once
```

As [sete fontes configuráveis](../../tools/mdd-hub/src/mdd_hub/sources.py) cobrem Gemini, Antigravity, Claude Code, MCP SDK, Codex, Kimi e Cursor. `--sources arquivo.yaml` substitui a lista HTTPS. O primeiro ciclo cria baseline; ciclos seguintes extraem flags adicionadas/removidas, comandos, parâmetros e notas de shell. A extração é heurística e limitada, com indicador de truncamento. Snapshots normalizados ficam em `memory/raw/archive/watcher-state/`; falhas de coleta/evolução não avançam o checkpoint. Há três coletas simultâneas, timeout de 20 segundos e limite de 2 MiB por resposta.

| Modo e alias | Saída |
| --- | --- |
| `reviewer` / `supervisionado` | Observações enfileiradas em `memory/raw/inbox/` para revisão humana. |
| `monitored` / `autonomo_com_report` | Referências documentais em `memory/proxies/ai-updates/` e relatório executivo imediato. |
| `headless` / `totalmente_autonomo` | Branch dedicada, worktree isolada, commit com caminhos explícitos e manifesto de preparação de PR. `--publish` também envia a branch ao origin. |

O manifesto inclui branch, commit, título e corpo; não cria PR hospedada no GitHub. Nenhum modo executa instruções coletadas nem promove observações automaticamente para políticas/skills normativas. Falhas de commit conservam a worktree para recuperação; branches incompletas são rejeitadas em retries. A branch e o stage do usuário permanecem preservados.

## Validação e integração VS Code

```sh
python -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests --cov=mdd_client --cov=mdd_hub --cov-fail-under=95
python -m ruff check tools
python tools/verify_mdd.py --output temp/mdd-smoke.json --live-docs
```

Foram executados 61 testes com sucesso e 97,23% de cobertura em Windows/Python 3.12.4: inicialização, retenção, preservação local, API, envio HTTP real, parsing, retries e três modos de evolução com Git real. Os 11 checks de CLI e a coleta real das sete fontes passaram. Consulte [evidências](../../completions/BATCH-071-smoke.json) e [lote](../../memory/implementation/batch-071.md). Há um aviso de depreciação Starlette/AnyIO, sem falhas. A CI está configurada para Windows/Linux e Python 3.11/3.12; a execução remota não integra esta evidência local.

A integração dual da extensão [ARCH-014](../../memory/backlog/ARCH-014-vscode-extension-mdd-client-hub-integration.md) permanece futura. Não houve alteração ou publicação da extensão, merge, deploy ou publicação PyPI.

# REGISTRO DE IMPLEMENTAÇÃO BATCH-038 / REQ-036

* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-08-29
* **Executor**: OpenAI Codex
* **Revisor**: Humano-no-Loop / Arquiteto
* **Repositórios Alvo**: `conn2flow-ai-workspace` + `conn2flow`
* **Autonomia**: `supervisionado`

---

## Objetivo operacional

Reestruturar a extensão Conn2Flow Dev Tools com segurança operacional, contexto SDD correto, interface bilíngue, navegador de backlog e releases guiados do Gestor e do Gestor Instalador.

## Defeito prioritário incorporado

Ao selecionar o escopo `ai-workspace`, os navegadores de requisições, implementações, decisões e handoffs continuam resolvendo o SDD do Core. Projetos satélites funcionam corretamente.

Hipótese inicial confirmada: `findRepoSdd(repoName)` aceita `<workspace-atual>/sdd` antes de confirmar que o workspace atual corresponde a `repoName`; por isso a busca de `conn2flow-ai-workspace` retorna indevidamente `conn2flow/sdd` quando o Core está aberto.

## Live Todo List

- [x] Ler REQ-036, governança, SPEC, memória, índices e checklist.
- [x] Confirmar a causa do escopo incorreto do AI Workspace.
- [x] Corrigir resolução, persistência e testes do escopo SDD.
- [x] Neutralizar commit/push automático nas pontes de agentes.
- [x] Proteger ações customizadas por Workspace Trust.
- [x] Criar executor seguro de comandos com alvo, confirmação e resultado real.
- [x] Persistir preferências e remover alvos implícitos perigosos.
- [x] Reorganizar a árvore e corrigir portabilidade/documentação.
- [x] Implementar navegador e filtros de backlog.
- [x] Implementar localização `pt-BR`/`en` e seletor de idioma.
- [x] Criar formulário Webview reutilizável e política `auto|quick|form` para ações multiparâmetro.
- [x] Implementar preflight e assistentes de release do Gestor e Instalador.
- [x] Remover staging amplo dos scripts canônicos de release.
- [x] Criar e executar testes automatizados.
- [x] Compilar e empacotar o VSIX.
- [x] Atualizar a instalação local com destino e hashes validados.
- [x] Realizar review findings-first e atualizar evidências SDD.
- [x] Entregar o diff ao humano sem commit/push/deploy/release.
- [x] Reabrir o lote após o feedback de que `Colapsar todas` não funciona visualmente.
- [x] Invalidar de forma controlada o estado visual memorizado pelo VS Code.
- [x] Adicionar regressão automatizada para a geração dos IDs das seções.
- [x] Recompilar, empacotar e atualizar a instalação local.
- [ ] Submeter a correção ao novo teste visual humano.

## Resultado implementado

- Resolução do SDD por repositório corrigida; o AI Workspace não recai mais no Core.
- Árvore reduzida a seis seções progressivas, com estado persistido e alvo explícito.
- Executor único por tarefas dedicadas, Workspace Trust, impacto, confirmação e código de saída real.
- Formulário Webview com CSP/nonce, validação host-side e regra `auto|quick|form`.
- Catálogos runtime e NLS completos em `pt-BR`/`en`.
- Backlog com índice, filtro, alerta de drift e promoção somente como preparação governada.
- Releases separados para Gestor/Instalador, com permissão GitHub, preflight, formulário único e acompanhamento do workflow.
- Scripts de release com árvore limpa, `--dry-run`, tag antecipada e staging explícito.
- Controles `Expandir todas` e `Colapsar todas` agora avançam uma geração persistida dos IDs das seções, impedindo que o VS Code restaure o estado visual anterior; os IDs permanecem estáveis durante a navegação manual.

## Review findings-first

O feedback visual revelou uma regressão: atualizar `TreeItemCollapsibleState` mantendo IDs estáveis permitia ao VS Code restaurar a expansão anterior. O finding foi corrigido com IDs versionados somente nas ações globais e quatro testes dedicados. Nenhum finding crítico ou alto permaneceu; aguarda novo aceite visual humano após Reload Window.

## Autorização de consolidação

Após receber o diff revisável, o Humano-no-Loop autorizou explicitamente commit e push para preservar a árvore. Em 2026-08-29, autorizou novamente a consolidação da correção de expansão/colapso. As autorizações não incluem deploy ou release. O commit anterior do Core conteve somente os quatro arquivos canônicos de release; alterações alheias do Gestor permaneceram fora dele.

## Limites de segurança

- Nenhum release ou deploy real será executado neste lote; commit e push dependem de autorização humana explícita, recebida para esta consolidação.
- A validação de release deve usar testes unitários, mocks e preflights somente leitura.
- Scripts de release podem ser alterados, mas não acionados.
- Nenhuma alteração em `sdd/SPEC.md` faz parte deste lote.

## Arquivos esperados

- `vscode-extension/src/extension.ts`
- `vscode-extension/src/providers/*.ts`
- novos módulos de localização, contexto, backlog, execução e release
- formulário Webview seguro e reutilizável para parâmetros compostos
- `vscode-extension/package.json`, catálogos NLS e testes
- `conn2flow/ai-workspace/en/scripts/releases/release.sh`
- `conn2flow/ai-workspace/en/scripts/releases/release-installer.sh`
- artefatos operacionais SDD da REQ-036 / BATCH-038

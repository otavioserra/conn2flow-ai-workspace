# REP-002: Relatório para o AI Workspace — o que as skills e o ambiente devem aprender com a REQ-285 (atualizador, choques e Lab)

- **Tipo**: Relatório de aprendizado (insumo para requisição de melhoria de skills)
- **Status**: READY
- **Criado em**: 2026-10-20
- **Origem**: Engenheiro Chefe, no chat da REQ-285 ("deixa um relatório bem completo para o agente do workspace criar uma requisição de melhoria das skills… o que faltou, onde você se perdeu, o que poderia ficar melhor")
- **Para quem**: o agente que mantém as skills canônicas (`.claude/skills/`, kits versionados) e os documentos de processo. Não pede código de produto; o que é código virou a REQ-286 do core.
- **De onde vem**: REQ-285 / BATCH-294 do core (`conn2flow`), branches `feat/req-285` (`507db028`) e `feat/req-285-r2` (`ffb12f42`); releases 3.0.10 e 3.0.11; Lab `conn2flow.local` (core + conn2flow-site). Lições brutas em `conn2flow/memory/04-memory-engineering-execution.md` (seção REQ-285). DEC-136 no `DECISION-LOG.md` do core. REQ-286 do core.

---

## 1. O que aconteceu, em uma página

1. **3.0.8 → 3.0.9 pelo painel**: "Falha finalize". A requisição do Arquiteto supunha timeout, memória ou sessão. A causa real era **HTTP 404**: a página do próprio `admin-atualizacoes` tinha sido desativada segundos antes, na etapa de banco.
2. **Por quê**: o projeto instalado reivindica `db/data/*Data.json` com os mesmos nomes do core. O core preservou os do projeto (certo), mas a etapa de banco **leu os do projeto como se fossem do core**. A retirada automática (REQ-199) viu as chaves do core "saírem" e desativou 1.069 registros e **apagou 3.568 linhas** (3.524 `variaveis`). O painel caiu no meio da própria atualização.
3. **Regra violada**: o Engenheiro Chefe sempre exigiu "manter por padrão; remover só com confirmação do operador". A retirada automática da REQ-199 desviou dessa regra e nenhuma skill a registrava. Restaurada como **DEC-136**.
4. **3.0.10**: etapa de banco lê só o que o core entregou; retirada vira choque `retirado`; Lab reparado pelo dump do snapshot.
5. **Deploy do projeto**: HTTP 500. Fatal de memória ao registrar 298 choques com diff (a etapa de arquivos da API rodava com 128 MB), **depois** de o manifesto já estar gravado. Os arquivos ficariam velhos em silêncio. A API ainda entregava o próprio zip enviado como `project.zip`.
6. **3.0.11**: choques gravados em fluxo e antes do manifesto; 1 GB na etapa de arquivos.
7. **Pós-3.0.11**: selo "Gestor v3.0.8" no dashboard. O `config.php` do Lab estava preservado como "editado" desde 19/10 (sync de teste com CRLF), e por isso faltava também o registro da biblioteca `api-crud`. Os 1.423 choques eram falsos positivos de sincronizações de teste. A regra da req-199 escondia 316 arquivos do projeto divergentes.

---

## 2. Onde eu me perdi (e o que teria evitado)

| Onde | O que aconteceu | O que teria evitado |
| --- | --- | --- |
| Diagnóstico inicial | A requisição trazia hipóteses (timeout, memória, sessão). Quase segui por elas. O que resolveu foi o access log do nginx (404, 39 bytes) e notar que o log da sessão não tinha `WebFinalize: iniciando`. | Skill de diagnóstico do atualizador com a ordem: log da sessão → access log do nginx (código e bytes) → `php-error.log` no horário → banco. "Falha <etapa>" na tela = falha HTTP, e o código está no access log. |
| Acesso ao Lab | Perdi tempo com permissões: o gestor do `conn2flow.local` só abre com `sudo`; `mysql` e PDO como root funcionam por `unix_socket`. | Seção "Lab" numa skill (`local-validation` ou `c2f-docker-environment`): caminhos (`/home/admin/web/<dominio>/conn2flow-gestor`), logs (`/var/log/nginx/domains/<dominio>.log`), `sudo mariadb`, onde ficam snapshots, overrides, choques e manifestos. |
| Regra de manter | Implementei primeiro uma "trava contra retirada em massa". O Engenheiro Chefe corrigiu: a regra é nunca remover sem confirmação, e é antiga. | Regra inviolável escrita nas skills de atualização/deploy e no `02-policy.md`: **nada sai sem confirmação explícita do operador** (DEC-136). |
| Tabelas sem `status` | Só vi os `DELETE` (3.524 `variaveis`) depois de ler o log da retirada linha a linha. | Skill de reparo: sempre ler `RECURSOS_RETIRADA ... removidos=` antes de propor reativação; tabela sem `status` não se reativa, volta do dump. |
| Shell | Um `cat > arquivo;` sem heredoc ficou esperando stdin e travou o comando até o timeout. Rodei por engano um script de substituição contra o arquivo errado (não gravou porque abortou na primeira asserção). Substituição Python multi-linha falhou em arquivo CRLF (`api.php`). `grep -c $'\r'` deu 0 em arquivo com CRLF. | `c2f-shell-and-windows-traps`: nunca `cat >` sem heredoc; script de edição sempre com asserção de contagem antes de gravar; arquivo CRLF → usar a ferramenta Edit; conferir CRLF com `php -r` + `bin2hex`. |
| Árvore compartilhada | O `conn2flow-site` estava na `feat/req-143` com mudanças de outro agente. Não rodei deploy dali, mas só porque conferi. | Já existe a memória "pipeline em árvore compartilhada"; levar para a skill `c2f-project-pipeline-and-tasks` como checagem obrigatória antes de qualquer `project:deploy`. |
| Permissões | A ação final de saneamento no Lab foi negada pelo classificador do modo automático. | Prever na skill: operação em massa no Lab (resolver choques, regravar manifesto) pede aprovação explícita; preparar script com simulação e entregar o comando ao humano. |
| Minificado | O `.min.js` do módulo ficou desatualizado; 11 outros já estavam assim na `main`. | Skill de JS do painel: dizer que a release regenera (`assets:minify` no passo de pré-compilação) e que `--verificar` não deve falhar o lote. |

---

## 3. O que as skills devem passar a dizer

### 3.1 Skill nova sugerida: `c2f-updater-and-clashes` (atualizador, choques e manifesto por camada)

Hoje o conhecimento está espalhado em memórias e comentários de código. Conteúdo mínimo:

1. **Camadas e precedência**: `projeto` > `plugin:<id>` > `core`; manifestos em `installation/manifests/<camada>.json` e `recursos-<dono>.json`; o que é choque (`editado`, `sobreposto`, `retirado`, `retirado-editado`, `original-ausente`); onde fica a versão nova (`backups/overrides/<versão>/`).
2. **Regra inviolável (DEC-136)**: nada é removido (arquivo, `status='D'`, `DELETE`) sem confirmação explícita do operador. `--confirmar-retirada` é a única exceção, pedida pelo operador.
3. **`db/data/` tem dois donos com os mesmos nomes**: a etapa de banco do core lê o que o core entregou (`instalacao_core_dados_dir()`); a do projeto, os do projeto. Nunca misturar.
4. **Ordem que não pode inverter**: registrar choques → gravar manifesto. O manifesto diz "entregue"; gravado sem choques, esconde divergência.
5. **Snapshots** (`backups/atualizacoes/snapshots/exec-N` e `api-*`): o dump `banco.sql.gz` é anterior à etapa de banco; `manifests/` guarda os manifestos de antes. É o caminho de reparo.
6. **Reparo sem apagar nada**: carregar o dump num banco auxiliar, comparar por PK (status e linhas ausentes), simular, aplicar. Manifesto de recursos regravado com as chaves reais do dono.
7. **Diagnóstico** (ordem da seção 2).
8. **Lab poluído por sincronização de teste**: `sync-core`/`sync-files` gravam fora do manifesto, e cada arquivo vira "editado" nas entregas seguintes. Reconciliar resolvendo superados e aceitando a versão entregue, com autorização.

### 3.2 Ajustes em skills existentes

- **`c2f-executor-agent`**: incluir DEC-136 nas regras invioláveis; "Falha <etapa>" é HTTP (ver access log); antes de rodar deploy, conferir branch e `git status` do repositório do projeto.
- **`c2f-project-pipeline-and-tasks` / `c2f-projects-system`**: `project:sync-core` e `sync-files` no Lab **poluem os manifestos** e geram choques falsos nas atualizações seguintes. Depois de usar, reconciliar ou preferir `project:deploy`/release. Deploy pela API: a etapa de arquivos agora usa 1 GB; o zip não entra mais na entrega.
- **`c2f-database-operations`**: tabela sem coluna `status` não tem desativação lógica, então qualquer rotina de "retirada" ali é `DELETE`. `atualizacoes_choques.diff` precisa de `utf8mb4` (emoji derrubava o INSERT no MariaDB).
- **`c2f-shell-and-windows-traps`**: itens da tabela da seção 2 (heredoc/stdin, CRLF, asserção antes de gravar, `grep $'\r'`).
- **`local-validation`**: seção do Lab com caminhos, `sudo`, logs e banco.
- **`c2f-javascript-ajax`**: em `.fail()` de etapa, logar `xhr.status`; sem isso a tela só diz "Falha".

### 3.3 Processo MDD

- **Requisição do Arquiteto com diagnóstico preliminar**: bom como pista, mas a skill de início de lote deveria mandar confirmar com dado real antes de seguir (aqui as três hipóteses estavam erradas).
- **Rodadas no mesmo lote**: a REQ-285 teve três rodadas (finalize, deploy de projeto, falsos positivos) com uma release no meio de cada. Faltou um padrão para "rodada N" no relatório do lote e no checklist; usei seções "Rodada 2". Formalizar.
- **Teto de 10 itens em `human-requests/`**: o diretório do core está com 19; ninguém poda. Lembrar no fechamento de lote.

---

## 4. O que virou requisição de produto

- **REQ-286 (core)**: artefatos de sistema (`vendor/**`, `*.precompiled.css`, `*.min.js`, `db/data/**`, manifestos de assets e de migrações) sempre escritos pela camada dona e fora do choque; `config.php` do core tratado; regra da req-199 só pula com decisão registrada; decisão em lote na tela; `diff` em `utf8mb4`; comparação sem diferença de CRLF; saneamento de instalação.

## 5. Estado deixado no Lab (para quem continuar)

- Banco reparado (dump `exec-4`), manifesto de recursos do core regravado, trava liberada. Backups em `/root/req285-*` no `ssh lab`; banco auxiliar `req285_restore` ainda existe.
- Manifesto do projeto devolvido ao de antes do deploy que falhou.
- **Pendente de aprovação humana**: script `falsos285.php` (simulado; saída: 2 arquivos do core sobrescritos — `config.php` e `vendor/composer/installed.php` —, 1.367 choques superados, 24 "sobreposto" mantidos, 316 arquivos do projeto liberados para o próximo deploy). A aplicação foi negada pelo modo automático e ficou com o Engenheiro Chefe.

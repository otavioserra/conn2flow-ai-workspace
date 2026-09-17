# BATCH-047 — Correção de Preflight do Instalador e Governança de Sondas HTTP e Contratos CLI

## Estado

- **Requisição:** REQ-045
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `dupla`
- **Projeto:** `conn2flow-ai-workspace`
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Repositório secundário:** `conn2flow` (Core) — `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`
- **Task MCP:** `task-1788273387896-8q9pz`

## Live Todo List

- [x] Diagnosticar a causa raiz do preflight `gestor-instalador\index.php`.
- [x] Criar as fontes de versão ordenadas (`PRODUCT_VERSION_SOURCES`, `resolveProductVersion`, `productVersionCandidates`) no módulo puro `src/releasePolicy.ts`.
- [x] Trocar o par `versionFile`/`versionPattern` por `versionSources` em `ReleaseDefinition` e adequar `readVersion`, `diagnose` e a mensagem de preflight em `src/providers/releaseManager.ts`.
- [x] Reescrever `ai-workspace/en/scripts/releases/version-installer.php` para incrementar `const VERSION` em `InstallerGuard.php` e sincronizar o comentário do `index.php`.
- [x] Espelhar a reescrita em `ai-workspace/pt-br/scripts/releases/version-instalador.php`, incluindo o `--dry-run` que só existia no `en`.
- [x] Ajustar a guarda de caminhos alterados e o staging de `ai-workspace/en/scripts/releases/release-installer.sh` para aceitar `InstallerGuard.php` + `index.php`.
- [x] Substituir o `git add .` proibido de `ai-workspace/pt-br/scripts/releases/release-instalador.sh` por staging explícito.
- [x] Formalizar a Regra Anti-Deadlock de Sonda HTTP em `c2f-html-css-pages-and-components/SKILL.md` (seção 3) e `c2f-dev-scripts/SKILL.md` (seção 4).
- [x] Formalizar o contrato canônico `CommandInterface` / `BaseProcessCommand` em `c2f-dev-scripts/SKILL.md` (seção 3) e corrigir a alucinação "Symfony Console" em `cli/CLAUDE.md`.
- [x] Propagar as duas skills e o `cli/CLAUDE.md` para todos os kits do workspace, dos templates e do Core.
- [x] Validar `php cli/c2f.php ai:sync` no Core (36/36 skills em 5 kits).
- [x] Criar `vscode-extension/test/releaseVersionSource.test.cjs` (10 casos).
- [x] Rodar `npm test` com 100% verde (76/76).
- [x] Regerar o VSIX local para homologação visual do formulário pelo operador.

## Decisões técnicas do lote

1. **Fontes ordenadas em vez de arquivo único.** A REQ-045 ofereceu duas saídas (regex resiliente *ou* ler `InstallerGuard.php`). Implementar só o regex resolveria a versão mas deixaria `versionFile` apontando para um arquivo que não é mais a fonte da verdade — e `diagnose()` usa esse campo em `requiredFilesReady`. Foi adotada uma lista ordenada `ProductVersionSource[]`: `gestor-instalador/src/InstallerGuard.php` como fonte canônica e `gestor-instalador/index.php` como fallback retrocompatível para instaladores v1, onde a versão ainda era literal na atribuição. O par `versionFile`/`versionPattern` foi eliminado.

2. **`requiredFilesReady` passou a exigir *alguma* fonte, não uma específica.** Antes, `required` continha o `versionFile` fixo. Com duas fontes possíveis, o gate agora exige `workflow` + `c2f` + pelo menos uma fonte de versão presente (`versionSourcesReady`). Isso preserva o bloqueio `required-file-missing` sem quebrar árvores de instalador v1.

3. **Módulo puro para testabilidade.** `releaseManager.ts` importa `vscode` e não pode ser exigido (`require`) fora do host da extensão. Seguindo o padrão consolidado (`repositoryLocator.ts`, `agentPromptPolicy.ts`), a resolução de versão foi extraída para `src/releasePolicy.ts` e testada sobre `out/releasePolicy.js`; o provider é coberto por asserção de regex sobre o fonte `.ts`.

4. **O script de versão passou a tocar dois arquivos — e isso quebraria o release.** `release-installer.sh` comparava a saída inteira de `git status --porcelain` com uma única string (`CONFIG_FILE`). Com o bump escrevendo `InstallerGuard.php` **e** o comentário do `index.php`, essa guarda abortaria toda release do instalador. A comparação virou uma lista de permissão (`grep -vxF`) sobre os dois caminhos, com bloqueio explícito quando nada mudou.

5. **`git add .` removido do script pt-br.** `release-instalador.sh` fazia `git add .`, proibido pela governança de concorrência multi-agente (arrasta trabalho de outros agentes para o commit de release). Substituído por staging explícito dos dois caminhos. Ajuste adjacente ao escopo da REQ-045 §2, registrado aqui por transparência.

6. **`--dry-run` retroportado para o pt-br.** O `version-instalador.php` não tinha `--dry-run` nem validação de tipo de update, ao contrário do `en`. Como os gates de release pré-calculam a tag antes de mutar o disco, a ausência do flag deixava o script pt-br incapaz de sustentar o mesmo fluxo. Paridade restabelecida.

7. **`cli/CLAUDE.md` afirmava "baseado em Symfony Console".** Era a origem documental exata da alucinação que a REQ-045 §4 combate: o console `c2f` tem contratos próprios em `Conn2Flow\Cli\Contracts` e nenhuma dependência de Symfony Console. O documento foi corrigido em 4 cópias (Core, workspace e 2 kits de template) e a superfície completa da interface foi documentada.

## Arquivos alterados

### `conn2flow-ai-workspace`

| Arquivo | Natureza |
| --- | --- |
| `vscode-extension/src/releasePolicy.ts` | `ProductVersionSource`, `PRODUCT_VERSION_SOURCES`, `resolveProductVersion`, `productVersionCandidates` |
| `vscode-extension/src/providers/releaseManager.ts` | `versionSources`, `readSource`, `readVersion`, `versionSourcesReady`, preflight e `diagnose` |
| `vscode-extension/test/releaseVersionSource.test.cjs` | Novo — 10 casos |
| `vscode-extension/out/releasePolicy.js(.map)`, `out/providers/releaseManager.js(.map)` | Saída de compilação |
| `.claude/`, `.gemini/`, `.codex/`, `.github/skills/c2f-dev-scripts` e `c2f-html-css-pages-and-components` | Skills atualizadas |
| `templates/{en,pt-br}/templates/*-kit/**/skills/{c2f-dev-scripts,c2f-html-css-pages-and-components}/SKILL.md` | Propagação nos 14 kits |
| `cli/CLAUDE.md` + `templates/{en,pt-br}/templates/spec-driven-project-claude-kit/cli/CLAUDE.md` | Contrato CLI corrigido |
| `sdd/implementation/batch-047.md`, `BATCH-INDEX.md`, `sdd/validation/VALIDATION-CHECKLIST.md`, `sdd/human-requests/CURRENT.md`, `sdd/handoffs/CURRENT-HANDOFF.md`, `sdd/MEMORIA-ENGENHARIA-EXECUCAO.md` | Governança SDD |

### `conn2flow` (Core)

| Arquivo | Natureza |
| --- | --- |
| `ai-workspace/en/scripts/releases/version-installer.php` | Bump em `InstallerGuard.php` + sync do comentário |
| `ai-workspace/pt-br/scripts/releases/version-instalador.php` | Idem + `--dry-run` e validação de tipo |
| `ai-workspace/en/scripts/releases/release-installer.sh` | Guarda de caminhos e staging explícito |
| `ai-workspace/pt-br/scripts/releases/release-instalador.sh` | `git add .` → staging explícito |
| `cli/CLAUDE.md` | Contrato `CommandInterface` e remoção da menção a Symfony Console |
| `.cursor/`, `.gemini/`, `.github/`, `.codex/skills/{c2f-dev-scripts,c2f-html-css-pages-and-components}/SKILL.md` | Skills propagadas (`.claude/skills/*` é gitignored no Core) |

## Evidências

### Teste 1: Suíte automatizada da extensão

* **Comando**: `npm test` em `vscode-extension/` (compilação TypeScript + `node --test`)
* **Resultado**: **76/76 testes passando**, 0 falhas, compilação limpa (66 anteriores preservados + 10 novos).

### Teste 2: Novo arquivo `test/releaseVersionSource.test.cjs`

10/10 casos verdes:

1. lê a versão canônica em `InstallerGuard.php`;
2. **regressão da REQ-045**: `index.php` sozinho (referenciando `InstallerGuard::VERSION`) não resolve versão — e resolve assim que o guard está presente;
3. fallback retrocompatível para o literal v1 do `index.php`;
4. precedência do guard sobre um literal legado divergente;
5. degradação para a próxima fonte quando o guard existe sem `const VERSION`;
6. lista de candidatos para a mensagem de preflight quando nada resolve;
7. gestor continua lendo `gestor/config.php`;
8. resolução contra o `InstallerGuard.php` **real** do repositório Core;
9. `releaseManager.ts` consome as fontes ordenadas e não tem mais `versionFile`/`versionPattern`;
10. preflight e `diagnose` reportam candidatos e exigem `versionSourcesReady`.

### Teste 3: Preflight real contra o repositório Core

```text
produto      : installer
  candidatos : gestor-instalador/src/InstallerGuard.php | gestor-instalador/index.php
  fonte      : gestor-instalador/src/InstallerGuard.php
  versao     : 2.1.0
  preflight  : OK
  proximo    : 2.1.1 | tag: instalador-v2.1.1
produto      : manager
  candidatos : gestor/config.php
  fonte      : gestor/config.php
  versao     : 2.10.1
  preflight  : OK
  proximo    : 2.10.2 | tag: gestor-v2.10.2
```

### Teste 4: Scripts de versão do Core (sandbox isolado)

* `php -l` limpo nos dois scripts.
* `--dry-run`: `patch` → `2.1.1`, `minor` → `2.2.0`, `major` → `3.0.0` (nenhuma escrita em disco).
* Tipo inválido (`foo`) → mensagem de erro e `exit=1`.
* Escrita real em sandbox: `const VERSION = '2.1.0'` → `'2.1.1'` **e** comentário do `index.php` → `(2.1.1)`; segunda execução `minor` → `2.2.0` em ambos. `diff` integral confirma que **somente a versão** mudou no `InstallerGuard.php`.
* Fallback v1 (sem `InstallerGuard.php`): `'1.9.4'` → `'1.9.5'` no `index.php`.
* Sem nenhuma fonte: erro descritivo e `exit=1`.

### Teste 5: Guarda de caminhos do `release-installer.sh`

`bash -n` limpo nos dois scripts. Simulação da guarda:

| Caso | Caminhos alterados | Resultado |
| --- | --- | --- |
| 1 | `InstallerGuard.php` + `index.php` (v2) | LIBERA |
| 2 | apenas `index.php` (v1 legado) | LIBERA |
| 3 | apenas `InstallerGuard.php` | LIBERA |
| 4 | `InstallerGuard.php` + `gestor/config.php` | BLOQUEIA (`gestor/config.php`) |
| 5 | árvore limpa | BLOQUEIA (nada mudou) |

### Teste 6: Integridade das skills (`ai:sync` no Core)

```text
.claude/skills   36  36/36  36  ✔ Verified
.cursor/skills   36  36/36  36  ✔ Verified
.gemini/skills   36  36/36  36  ✔ Verified
.github/skills   36  36/36  36  ✔ Verified
.codex/skills    36  36/36  36  ✔ Verified
✔ SUCCESS  All 36 skills verified successfully across all active AI toolkits!  (exit 0)
```

### Teste 7: Paridade das cópias propagadas

* `c2f-dev-scripts/SKILL.md`: 21 cópias, **1 hash único**.
* `c2f-html-css-pages-and-components/SKILL.md`: 24 cópias, **1 hash único**.
* `cli/CLAUDE.md`: 4 cópias, **1 hash único**.
* `grep` por `Padrão Symfony Console` / ``estendem `Symfony`` em `CLAUDE.md` e `SKILL.md` dos dois repositórios: **nenhum resíduo**.

### Teste 8: Empacotamento da extensão

* `npx vsce package` → `conn2flow-tools-1.0.0.vsix` (67 arquivos, 159.96 KB), com `vscode:prepublish` compilando limpo.
* O arquivo é gitignored (`*.vsix`); serve apenas para a homologação visual local do operador.

### Teste 9: Harness headless do formulário (critério de aceite 2)

Um harness reproduziu o caminho de dados completo de `ReleaseManager.prepare('installer')` + `diagnose()`
sobre `out/releasePolicy.js` e o repositório Core real, imprimindo os valores que cada campo do formulário recebe:

```text
=== Formulario "Preparar Release" — produto: installer ===
  currentVersion  (readonly) : 2.1.0
  branch          (readonly) : main
  documentation   (readonly) : bloqueado: README:installer-version
  releaseType     (select)   : patch
  nextVersion     (readonly) : 2.1.1
  tag             (readonly) : instalador-v2.1.1
  tagMessage      (text)     : instalador-v2.1.1
  commitMessage   (textarea) : chore(release): publish installer 2.1.1
  command         (readonly) : ./c2f installer:release patch <tag-message> <commit-message> <mode>

=== semverPreview: reatividade ao trocar releaseType ===
  patch  -> nextVersion=2.1.1  tag=instalador-v2.1.1  command=./c2f installer:release patch ...
  minor  -> nextVersion=2.2.0  tag=instalador-v2.2.0  command=./c2f installer:release minor ...
  major  -> nextVersion=3.0.0  tag=instalador-v3.0.0  command=./c2f installer:release major ...

=== Diagnostico de gate ===
  fonte de versao resolvida : gestor-instalador/src/InstallerGuard.php
  requiredFilesReady        : true
  canPrepare                : true
```

**Versão atual, próximo incremento e tags calculadas conferem, e `canPrepare` é `true`** — ou seja, o preflight
não aborta mais e o formulário é montado. Os `blockers` restantes (`permission-unknown`, `dirty-tree`,
`draft-missing`) são estados de ambiente esperados: o harness não chama o `gh`, a árvore do Core tem as alterações
deste próprio lote e nenhum rascunho foi salvo ainda. Resta ao operador apenas a conferência visual da pintura do
painel no VS Code, que exige a janela da IDE e não pode ser exercitada headless.

## Achado fora do escopo: drift dos READMEs do Core

O gate documental acusou `README:installer-version`. **Isso não é regressão deste lote — é um drift pré-existente
que a correção desmascarou.** Enquanto `readVersion` devolvia `undefined` para o instalador,
`inspectReleaseDocumentContents()` recebia `installerVersion = undefined` e **pulava inteiramente** a checagem do
README. Com a versão resolvendo, a checagem passou a rodar e revelou que:

* a tag `instalador-v2.1.0` existe no repositório (release publicada);
* `README.md` (linhas 155/159/163) e `README-PT-BR.md` (linhas 160/164/168) ainda apontam os downloads para
  `instalador-v2.0.0`.

Consequência prática: o gate `documentation-outdated` continuará bloqueando a **execução** da release do instalador
até que os READMEs sejam sincronizados. Como a alteração muda URLs de download voltadas ao usuário final e a
manutenção de `README.md` / `README-PT-BR.md` é responsabilidade do Arquiteto (`MEMORIA-ENGENHARIA-CHEFIA.md` §1),
**nada foi alterado nesses arquivos**. Fica registrado para decisão do Humano-no-Loop.

## Ambiguidades e decisões discutíveis (para arbitragem do Arquiteto)

Registro honesto dos pontos em que o Executor teve de interpretar a REQ-045 ou escolher entre alternativas
defensáveis. Nenhum deles é bloqueante para a revisão, mas todos podem gerar mudança de rumo.

| # | Ponto | Interpretação adotada | Alternativa que o Arquiteto pode preferir |
| --- | --- | --- | --- |
| A1 | **A REQ §1 ofereceu duas saídas** (regex resiliente *ou* ler `InstallerGuard.php`). | Terceira via: lista ordenada `versionSources`, eliminando `versionFile`/`versionPattern`. | Manter `versionFile`/`versionPattern` e só trocar arquivo + regex, mudança mínima. |
| A2 | **Semântica de `requiredFilesReady` mudou.** Antes exigia um arquivo nomeado; agora exige *pelo menos uma* fonte de versão. | Aceita árvore v1 (só `index.php`) sem disparar `required-file-missing`. | Exigir estritamente `InstallerGuard.php`, tratando instalador v1 como não-releasável. |
| A3 | **Alteração dos `release-*.sh` não foi pedida na REQ §2.** | Alterados: a guarda `CHANGED_PATHS != CONFIG_FILE` abortaria **toda** release do instalador assim que o bump passasse a tocar dois arquivos. | Se o Arquiteto discordar, o bump teria de escrever só o `InstallerGuard.php` e deixar o comentário do `index.php` dessincronizado. |
| A4 | **`git add .` removido do `release-instalador.sh` (pt-br).** | Removido por violar a governança de concorrência multi-agente. | Reverter se houver razão histórica para o staging amplo nesse script. |
| A5 | **`--dry-run` e validação de tipo retroportados para o `version-instalador.php` (pt-br).** | Paridade funcional com o `en`, que os gates de release exigem. | Manter o pt-br como tradução congelada, sem evoluir capacidade. |
| A6 | **`cli/CLAUDE.md` afirmava "Symfony Console".** A REQ §4 diz "documentações de desenvolvimento", sem nomear arquivos. | Interpretado como incluindo `cli/CLAUDE.md` — era a origem documental literal da alucinação. | Restringir a REQ §4 apenas às skills, deixando `cli/CLAUDE.md` para outro lote. |
| A7 | **Divergência temporária nos repositórios satélites.** As skills foram propagadas apenas nos dois repositórios-alvo declarados (`conn2flow-ai-workspace` e `conn2flow`) e nos templates. | `conn2flow-site`, `lumix` e `transformamp` permanecem no hash antigo (`21cd8183…` vs. `dfa364a9…`) até rodarem o instalador de kit. | Propagar já nos satélites, ou emitir requisição própria para a sincronização global. |
| A8 | **Sentido canônico do fluxo de skills.** `sync-back-template` vai repo → template; `install-*-kit` vai template → repo. | Editado em `.claude/skills` do workspace e copiado para todos, inclusive templates (resultado idêntico, hash único). | Formalizar qual das duas pontas é a fonte da verdade, para evitar que dois agentes editem pontas opostas. |
| A9 | **BATCH-044/045/046 não escreveram no `VALIDATION-CHECKLIST.md`**, embora o `BATCH-INDEX.md` aponte para `VALIDATION-CHECKLIST.md#batch-0XX`. | Este lote escreveu a seção `BATCH-047`, honrando o ponteiro do índice. | Decidir se o checklist continua sendo o destino das evidências ou se os `batch-0XX.md` passam a ser a fonte única — hoje o índice mente. |
| A10 | **O critério de aceite fala em "abrir o formulário", não em "conseguir publicar a release".** | Considerado atendido: `canPrepare: true`, campos corretos. | Se a expectativa real era destravar a **publicação** do instalador, ela **não** está atendida: o gate `documentation-outdated` (READMEs em `instalador-v2.0.0`) mantém `canExecute: false`. Ver *Achado fora do escopo*. |
| A11 | **Recibo MCP emitido antes do polimento final.** O recibo `rec_1788275223806` cita 76/76 mas foi emitido antes do ajuste do `t.skip` e do registro do achado dos READMEs. | Os números seguem válidos (76/76 reconfirmados, 0 skipped). | Reemitir recibo se o Arquiteto exigir que ele reflita o achado dos READMEs. |

## Pendências para o Humano-no-Loop

1. **Conferência visual do painel (resíduo do critério de aceite 2)**: os valores do formulário já foram validados headless no Teste 9 (`2.1.0` → `2.1.1` → `instalador-v2.1.1`, `canPrepare: true`). Resta apenas instalar o VSIX regenerado e confirmar a pintura do painel no VS Code — única parte que exige a janela da IDE.
2. **Sincronizar os READMEs do Core com `instalador-v2.1.0`** (ver *Achado fora do escopo*). Sem isso o gate `documentation-outdated` seguirá bloqueando a execução da release do instalador. Não alterado por decisão de escopo.
3. **Nenhum commit, push, deploy ou release foi executado** (modo `supervisionado`).
4. **Observação de governança (fora do escopo da REQ-045)**: `sdd/validation/VALIDATION-CHECKLIST.md` está com ~62 KB e o `BATCH-INDEX.md` com 17 lotes ativos, acima do teto de 10 itens da `MEMORIA-ENGENHARIA-CHEFIA.md` §4. O arquivamento não foi solicitado nesta requisição e não foi executado por conta própria.

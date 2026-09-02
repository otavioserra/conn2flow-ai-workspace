# BATCH-050 — Regra dos 10 Ativos na Raiz SDD, Integridade de Links e Comando CLI ai:archive-sdd

## Estado

- **Requisição:** REQ-048
- **Status:** `ready-for-review`
- **Modo:** `supervisionado`
- **Topologia:** `dupla`
- **Projeto:** `conn2flow-ai-workspace` (governança) + `conn2flow` (Core CLI)
- **Raiz:** `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`

## Live Todo List

- [x] Criar `AiArchiveSddCommand.php` no Core e registrá-lo no `Application.php`.
- [x] Validar o comando em sandbox isolado antes de tocar em repositório real.
- [x] Executar a faxina nos 5 repositórios com reescrita de links.
- [x] Atualizar `c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` nos toolkits.
- [x] Validar `ai:sync` 36/36 e a integridade de links.
- [x] Registrar evidências, handoff e recibo do executor.

## Implementação

### Comando `c2f ai:archive-sdd`

`cli/src/Commands/AiArchiveSddCommand.php` (novo, registrado em `cli/src/Console/Application.php`).

```
c2f ai:archive-sdd [--repo=PATH] [--keep=10] [--protect=A,B] [--repair-links] [--dry-run] [--verbose]
```

Decisões que sustentam o comando:

1. **Recência por sequência numérica, não por mtime.** Os arquivos SDD nascem numerados (`req-048.md`,
   `BATCH-106-slug.md`, `local-batch-002-slug.md`) e essa numeração é monotônica no tempo. O `mtime`
   não é: uma edição de correção num lote antigo o promoveria à frente de lotes recentes. Arquivos
   sem número (`CURRENT.md`, `BATCH-INDEX.md`, `ITERATION-CONTEXT-v2.1.0.md`) são estruturais e
   nunca são movidos; subdiretórios (`host-manager/`, `3d-catalog/`) também ficam intactos.

2. **O ponteiro ativo é preservado, o backlog histórico não.** A proteção lê o `CURRENT.md`, mas
   apenas nas linhas de ponteiro (`Ponteiro Ativo`, `Lote Relacionado`, `Lote Anterior`). Uma
   primeira versão protegia *toda* referência do arquivo — e o `CURRENT.md` do Core lista 79 intakes,
   o que tornava a pasta inteira inarquivável. Os arquivos assim fixados **descontam do orçamento**
   `--keep`, para que a raiz nunca ultrapasse 10 sequenciados.

3. **Mover sem reescrever link é proibido por construção.** Depois de mover, o comando varre todo
   `.md` sob `sdd/` e retarget-a os links relativos e `file:///` que apontavam para o caminho antigo.
   O cálculo é feito a partir do diretório **de origem** de cada arquivo, então funciona também para
   os links *internos* de um arquivo que acabou de descer para `archive/`.

4. **Links dentro de code spans não são tocados.** `` `[file.md](archive/file.md)` `` num documento é
   exemplo de documentação, não navegação; reescrevê-lo corromperia o texto. O scanner consome
   blocos cercados e spans inline como alternativa do regex, antes de considerar um link.

5. **`--repair-links` conserta o dano de arquivamentos manuais anteriores.** Havia 218 links órfãos
   somados nos 5 repositórios, quase todos de arquivos movidos à mão no passado sem ajustar o
   caminho. O reparo tenta, em ordem determinística: irmão em `archive/`, reancoragem a partir de
   uma pasta ancestral (arquivo desceu de nível) e remoção de `../` sobrando (link subia demais).
   Sem candidato inequívoco, o link é deixado como está e **reportado** — nunca adivinhado.

6. **O comando falha (exit 1) enquanto restar link órfão.** O gate final é independente da
   movimentação: ele resolve todo link relativo de todo `.md` sob `sdd/` contra o disco.

### Skills de governança

`c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` passaram a declarar a Regra dos 10
Ativos na Raiz, a obrigação de manter os links e o comando a usar. Propagação por cópia de arquivo
(o `ai:sync` audita contratos, não copia):

| Skill | Cópias atualizadas | SHA-256 (md5 curto) |
| --- | --- | --- |
| `sdd-workflow` | 39 (5 repos × 5 kits + 14 templates) | `84a799ac…` |
| `sdd-memory-gardening` (PT-BR) | 32 | `20a7756e…` |
| `sdd-memory-gardening` (EN) | 7 templates | `18636b46…` |
| `c2f-architect-master` | 5 (só o AI Workspace declara a skill) | `ad4d9bb1…` |

## Evidências

### 1. Sandbox antes da execução real

Cópia isolada do `sdd/` em scratchpad: 88 arquivos arquivados, 3 links reescritos, gate limpo. O
`diff` do `BATCH-INDEX.md` do Core mostrou alteração **apenas** nos alvos dos links, dentro de linhas
de tabela com milhares de caracteres de texto preservados byte a byte.

### 2. Faxina nos 5 repositórios

| Repositório | Arquivados | Links reescritos | Links reparados | Órfãos antes → depois |
| --- | --- | --- | --- | --- |
| `conn2flow` | 88 | 146 | 107 | 113 → **6** |
| `conn2flow-ai-workspace` | 90 | 6 | 0 | 0 → **0** |
| `conn2flow-site` | 0 (já conforme) | 0 | 0 | 0 → **0** |
| `lumix` | 92 | 69 | 21 | 21 → **0** |
| `transformamp` | 25 | 100 | 30 | 43 → **1** |

### 3. Regra dos 10 atingida

Arquivos sequenciados soltos na raiz, após a faxina (estruturais como `CURRENT.md`, `README.md` e
`BATCH-INDEX.md` não contam):

| Repositório | `human-requests/` | `implementation/` |
| --- | --- | --- |
| `conn2flow` | 10 | 10 |
| `conn2flow-ai-workspace` | 10 | 10 |
| `conn2flow-site` | 5 | 4 |
| `lumix` | 10 | 10 |
| `transformamp` | 10 | 10 |

### 4. Contratos do Core

`php cli/c2f.php ai:sync`: **36/36 skills** e blocos de contrato verificados nos cinco kits
(`.claude`, `.cursor`, `.gemini`, `.github`, `.codex`). `php -l` limpo nos arquivos novos e alterados.

### 5. Suíte do Core

`vendor/bin/phpunit`: **1113/1113** aprovados (4 skipped pré-existentes). `npx vitest run`: **408/408**.

## Achados abertos (não causados por este lote)

Sete links continuam órfãos porque apontam para arquivos que **nunca existiram** em seus
repositórios — nenhuma ferramenta pode repará-los, e silenciá-los seria pior do que reportá-los:

| Repositório | Arquivo | Alvo inexistente |
| --- | --- | --- |
| `conn2flow` | `sdd/backlog/BACKLOG-INDEX.md` | `BL-011-poda-pipeline-sync-allowlist.md` |
| `conn2flow` | `sdd/backlog/BACKLOG-INDEX.md` | `BL-012-migracao-painel-tailwind-desacoplamento-fomantic.md` |
| `conn2flow` | `sdd/implementation/BATCH-INDEX.md` | `BATCH-116.md`, `BATCH-131.md`, `BATCH-135.md` |
| `conn2flow` | `sdd/validation/VALIDATION-CHECKLIST.md` | `../implementation/batch-047.md` |
| `transformamp` | `sdd/process/00-START-HERE.md` | `implementation/BATCH-007-publishers-e-instanciacao-de-paginas-dinamicas-manual-humano.md` |

Recomendação: virar intake do Arquiteto — criar os relatórios faltantes ou remover as referências.

## Pendência para o Humano-no-Loop

- Revisar os diffs multirepositório e decidir o aceite. Nenhum commit, push, deploy ou release foi
  executado neste modo supervisionado.

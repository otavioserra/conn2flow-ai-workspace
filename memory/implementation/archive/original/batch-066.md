# BATCH-066 — Lições de 2026-10-01 nas skills

- Projeto: `conn2flow-ai-workspace`
- Raiz: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- Requisição: [REQ-064](../human-requests/req-064.md)
- Status: `ready-for-review`
- Executor: Claude Code
- Data: 2026-10-01
- Autonomia: `autonomo_monitorado`

## Live Todo List

- [x] Levantar as situações do dia e o que cada skill deixava de dizer.
- [x] Acrescentar as lições a sete skills canônicas (`.gemini/skills`).
- [x] Criar o propagador genérico, com auditoria por MD5 e respeito às traduções.
- [x] Propagar para a matriz, os templates e os satélites.
- [x] Auditar e registrar.

## O que mudou nas skills

| Skill | Acréscimo |
| --- | --- |
| `c2f-project-pipeline-and-tasks` | Regra #8: o pipeline tem oito etapas (a skill dizia seis). Regra #9: saída 0 não prova que o conteúdo chegou, e onde conferir. Regra #10: um deploy por vez. Regra #11: regras de dados do sincronizador |
| `c2f-agent-visual-inspection` | Ciclo para ambiente de teste por SSH; lista do que toda validação de página confere; validar com o ambiente ocioso; guardar os scripts no repositório |
| `c2f-shell-and-windows-traps` | Armadilhas 13 a 16: heredoc com apóstrofo e barra invertida; argumento com `/` em `node` e `curl`; pasta sincronizada bloqueando arquivo; suíte PHP no Linux e CRLF |
| `sdd-workflow` | Conferir branch e stage antes de cada commit; commit por índice separado; comandos proibidos em árvore compartilhada; coordenação escrita na requisição do outro lote; prova de "pré-existente" |
| `c2f-database-operations` | Seção 5: o que a sincronização do deploy protege e o que apaga |
| `project-validation` | Validação que prova o que afirma |
| `c2f-executor-agent` | Texto para leitor de fora: páginas, novidades e README |

Tudo foi acrescentado ao fim de cada skill, com título próprio. Na skill de pipeline, os três pontos que diziam "6 etapas" passaram a apontar para a Regra #8.

## Propagador

`scripts/skills/sync-skills.cjs`:

- sem argumentos, audita todas as cópias contra `.gemini/skills` e não escreve;
- `--apply <skill ...>` ou `--apply --all` propaga;
- nunca apaga e nunca toca em skill que não existe na matriz;
- um template só recebe skill que ele já traz;
- `scripts/skills/translated.json` lista as skills traduzidas nos templates em inglês, que não são sobrescritas nem comparadas.

### Achado: três skills dos templates em inglês são traduções

`c2f-environment-configuration`, `project-validation` e `sdd-memory-gardening` têm texto em inglês nos sete kits de `templates/en`. O propagador do BATCH-065 só tratava as sete skills daquele lote, então isso não aparecia. A versão em inglês do bloco novo de `project-validation` foi acrescentada à mão nas sete cópias.

As outras 38 skills dos templates em inglês estão em português. Vale decidir se o template em inglês deve ser traduzido por inteiro.

## Validação

1. `node scripts/skills/sync-skills.cjs --apply <7 skills> --report completions/BATCH-066-skills-audit.json`: `PASS`, 245 arquivos escritos.
2. `node scripts/skills/sync-skills.cjs` (auditoria): `PASS`, 39 alvos, 1.550 cópias iguais, 21 traduções, 0 divergentes, 59 skills locais preservadas, 0 alteradas. Zero arquivos planejados: idempotente.
3. Rodar de novo o script das lições: nenhuma skill alterada.
4. `php cli/c2f.php ai:sync` no core: sem erro novo. O aviso de `c2f-modelo-templates` sem o bloco "Gatilho Obrigatório" já existia.
5. `node --check scripts/skills/sync-skills.cjs`: sem erros.

Antes da mudança, a auditoria do propagador novo dava as mesmas 21 traduções e nenhuma outra divergência.

## Repositórios satélites

| Repositório | Cópias gravadas | Commit |
| --- | --- | --- |
| `conn2flow-ai-workspace` | matriz e templates | neste lote |
| `conn2flow` | 5 kits | feito pelo executor |
| `conn2flow-site` | 5 kits | feito pelo executor, direto na `main`; a árvore estava na branch de outro agente |
| `lumix` | 5 kits | **não commitado**: o commit desse repositório é do operador |
| `transformamp` | 5 kits | **não commitado**: idem |

## Propostas que ficaram para depois

1. **Uma skill só para trabalho com vários agentes** (`c2f-multi-agent-shared-tree`). Hoje o assunto está repartido entre `sdd-workflow` e a de pipeline. Criar a 42ª exige atualizar o catálogo, os auditores (o do BATCH-065 confere "41") e o `ai:sync` do core.
2. **Reserva de número de requisição por comando** (`c2f sdd:reserve`), em vez de reler a pasta e commitar à mão: houve colisão de numeração no dia.
3. **Um arquivo de estado único** (`sdd/STATE.md`) gerado, com requisição ativa, lote, ambiente e últimos achados. A regra atual manda ler de oito a dez arquivos no início de cada sessão.
4. **Pipeline que recusa árvore suja de outro lote** e trava de deploy no caminho SSH: é mudança do core, registrada no backlog do `conn2flow-site` (BL-024, D1 e D2).
5. **Verificação de fumaça no fim do pipeline**: N páginas alteradas respondem 200 com o conteúdo novo (BL-024, D6).
6. **`c2f-modelo-templates` sem o bloco de gatilho**, apontado pelo `ai:sync`.
7. **Tradução completa dos templates em inglês**, ou a decisão de mantê-los em português.
8. **Skill do agente de segurança**, quando o BL-022 do `conn2flow-site` for promovido.
9. **Memória de execução do core acima do alerta** (256 linhas; poda obrigatória em 300).

## Limites

- As lições vêm de um dia de trabalho de um executor. São casos reais, não uma revisão sistemática das 41 skills.
- Nenhuma skill foi removida ou reescrita: só acréscimos.

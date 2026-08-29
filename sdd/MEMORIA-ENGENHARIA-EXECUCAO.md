# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-037 — Recuperação SDD e estabilização do preview MPE](implementation/batch-037.md)
>
> **Lote atual:** [BATCH-038 — Reestruturação segura, multilanguage, backlog e releases](implementation/batch-038.md), pronto para revisão humana.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-29 — Recuperação:** auditado o estado posterior ao BATCH-036; 14 commits e 44 arquivos de evolução da extensão não possuíam registro operacional correspondente.
- **2026-08-29 — BATCH-037:** removido o fechamento global de abas Markdown e introduzida política restrita ao fonte alvo e ao preview MPE gerenciado.
- **2026-08-29 — Validação:** `npm test` aprovou 5/5 testes; TypeScript compilou; VSIX foi empacotado; hashes da instalação local ficaram idênticos aos artefatos compilados.
- **2026-08-29 — Aceite humano:** após `Developer: Reload Window`, o preview encadeado passou a focar o documento correto sem acumular fontes Markdown.
- **2026-08-29 — REQ-036:** criada proposta de reorganização da interface, navegação de backlog, segurança operacional, interface `pt-BR`/`en` e releases separados do Gestor e do Gestor Instalador.
- **2026-08-29 — BATCH-038:** REQ-036 aprovada; diagnóstico confirmou que `findRepoSdd()` retornava o SDD do workspace atual sem verificar o repositório solicitado, afetando especificamente o escopo `ai-workspace`.
- **2026-08-29 — Entrega BATCH-038:** escopo corrigido; árvore progressiva, executor seguro, backlog, `pt-BR`/`en`, formulários compostos e releases Gestor/Instalador implementados; 27 testes e VSIX aprovados.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- A REQ-036 está `APPROVED` e o BATCH-038 está `READY_FOR_REVIEW` em modo supervisionado.
- Releases devem usar `c2f manager:release` e `c2f installer:release`, integrados respectivamente aos workflows `release-gestor.yml` e `release-instalador.yml`.
- Os scripts de release precisam remover `git add .` antes de serem expostos pela interface.
- Permissão de release deve ser comprovada; ausência ou indeterminação de permissão oferece somente diagnóstico seguro.
- Modo supervisionado: commit e push foram autorizados explicitamente ao final para preservar a árvore; deploy e release permanecem não autorizados.

## Pendência imediata

- Aguardar Reload Window e aceite visual humano do BATCH-038; nenhum release, deploy, commit ou push foi executado.

# FEAT-015 — Receita de dados de módulo por `sync_resources` nas skills de recursos e pipeline

* **Status**: `ICEBOX`
* **Tipo**: Conhecimento / Skills
* **Autor**: Executor (`website-conn2flow`, BATCH-003), a pedido do Engenheiro Humano
* **Data de Criação**: 2026-11-19
* **Repositórios Alvo**: `conn2flow-ai-workspace` (skills canônicas e kits) e `conn2flow` (cópia de skills do Core)

---

## 🎯 Contexto e Motivação

No BATCH-003 do `website-conn2flow` (REQ-003), o executor precisava colocar no banco do projeto os registros dos módulos `menus`, `publisher`, `publisher_pages`, `publisher_highlights` e `publisher_index`, além de publicações com `publisher_id`. Ele leu as seis skills obrigatórias e mesmo assim escreveu um seeder PHP próprio. O Engenheiro Humano apontou que o pipeline de recursos já faz isso por `sync_resources`, e o lote foi refeito no padrão nativo do `conn2flow-site`.

As skills do site estavam iguais às do `conn2flow-ai-workspace` (46/46 com o mesmo hash), então a causa não foi defasagem. A receita existe, mas está no lugar errado ou incompleta:

1. **`c2f-documentation` §5** é o único ponto que diz que um projeto popula `publisher`, `publisher_pages`, `publisher_index` e `menus` com `resources/project_tables_config.json` + `sync_resources`, e que publicações vão em `pages.json`. A skill só é acionada para trabalho de documentação, então não aparece quando o assunto é portal, menus ou publicador.
2. **`c2f-resources-system` §5** apresenta o mecanismo como "tabelas customizadas podem se tornar novos tipos de recursos" e cita só `tables_config.json` e `<modulo>.json`. Não menciona `project_tables_config.json`, não diz que vale para tabelas de módulos do Core preenchidas por um projeto e não aponta exemplo real.
3. **`c2f-project-pipeline-and-tasks`** cita `project_tables_config.json` só para a lista `deletar` (Regra #6). Já `DYNAMIC_SKIP_PROJETO_SEM_SEMENTE` (Regra #11) aparece como aviso, e não como "o projeto pode e deve semear essas tabelas".
4. **`c2f-widget-development`** e **`c2f-modelo-templates`** explicam a renderização dos widgets, mas não dizem de onde vêm, num projeto, os registros que eles leem.
5. **O pedido** (REQ-003, Frente 4) prescrevia "um script PHP idempotente (ex.: `gestor/db/seeds/...`)". Nem o Arquiteto nem o Executor tinham uma regra que barrasse isso.

## 📋 Escopo Proposto

1. **`c2f-resources-system` §5**: reescrever com dois casos.
   - Tabela nova declarada pelo Core ou por módulo (`tables_config.json` / `<modulo>.json`).
   - Dados de tabelas de módulo do Core em um projeto: `resources/project_tables_config.json`, `metadata_file` em `resources/<lang>/<arquivo>.json`, HTML em `resources/<lang>/<tabela>/<id>/<id>.html` e `field_types` (`json`, `file:html`). Incluir o bloco pronto das cinco tabelas e o exemplo de publicação em `pages.json` com `publisher_id`. Referência: `conn2flow-site/gestor/resources/`.
2. **Regra explícita**: "Para colocar registros no banco de um projeto, não escreva seeder, migration de dados nem SQL avulso; declare a tabela em `project_tables_config.json`." Repetir nas seções de proibição de `c2f-resources-system`, `c2f-project-pipeline-and-tasks` e `c2f-executor-agent`.
3. **`c2f-project-pipeline-and-tasks`**: ampliar a Regra #6 para o ciclo completo do `project_tables_config.json` (sincronizar, deletar, forçar atualização) e reescrever o `DYNAMIC_SKIP_PROJETO_SEM_SEMENTE` como indicação de semente ausente.
4. **Gatilhos de descrição**: incluir "menus", "publicador", "publisher", "destaques", "índice", "posts" e "dados iniciais" no TRIGGER de `c2f-resources-system`, para que a skill seja lida em pedidos de portal.
5. **`c2f-architect-master`**: requisição que precise de dados iniciais deve prescrever `sync_resources`, nunca seeder.
6. **Armadilhas medidas no BATCH-003**, a registrar nas skills pertinentes:
   - `publisher-highlights` só substitui `[[item#x]]` sem arrobas.
   - Publicações vindas de `pages.json` recebem a data do deploy; para manter a ordem editorial, use `rule: manual` + `selected_items`.
   - Template escolhido em runtime precisa entrar em `tailwind_dependencies` das páginas bundle e do layout.
   - Utilities responsivas que estruturam o layout (`hidden lg:flex`) podem ser invertidas por uma folha carregada depois; use CSS de autoria ou bundle.
7. Propagar para os cinco kits e para as cópias do Core e dos satélites (`sync-skills.cjs` / auditoria de hash).

## ✅ Critério de aceite

Num pedido como a REQ-003, um executor que leia apenas as skills obrigatórias de recursos e pipeline chega a `project_tables_config.json` + `sync_resources` sem precisar abrir `c2f-documentation` nem o código do compilador.

## 🔗 Referências

- `website-conn2flow`: `memory/implementation/batch-003.md`, commit `bc98bb7`.
- `conn2flow-site/gestor/resources/project_tables_config.json`.
- Core: `gestor/controladores/agents/arquitetura/atualizacao-dados-recursos.php` (`coletarConfigsTabelas`, `lerMetadadosDinamicos`, `processarRegistroDinamico`).

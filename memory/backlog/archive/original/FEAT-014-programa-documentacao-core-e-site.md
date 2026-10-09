# FEAT-014 — Programa de Documentação: Correção no Core + Documentação Online no Conn2Flow Site

* **Status**: `PROMOTED` — fase 1 entregue em 2026-09-25 (Core req-176/177/178 · BATCH-181/182/183; conn2flow-site REQ-057 · BATCH-050; Matriz REQ-058 · BATCH-060). Próximo: ondas de correção (§7, linha 5+).
* **Tipo**: Documentação / Infraestrutura de Publicação / Skill
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-25
* **Repositórios Alvo**: `conn2flow` (Core), `conn2flow-site`, `conn2flow-ai-workspace` (Matriz Central — skill e propagação)
* **Relacionados**: [FEAT-007](FEAT-007-integrate-core-ai-workspace-documentation.md) (curadoria anterior, escopo menor), [ARCH-007](ARCH-007-atualizacao-automatica-kits-ia-nas-instalacoes.md) (atualização automática dos kits — segundo momento)

---

## 1. Objetivo

1. **Corrigir e completar** a documentação física do Core (`conn2flow/ai-workspace/{pt-br,en}/docs/`), usando o código como autoridade, e criar a documentação que falta.
2. **Publicar** essa mesma documentação como site público no `conn2flow-site`, em HTML com Tailwind CSS, como **recursos do sistema** gerados por um parser de Markdown.
3. **Institucionalizar** o trabalho numa rotina incremental ("a cada passagem de agente, N documentos") e numa **skill** propagada a todos os repositórios.

---

## 2. Diagnóstico (levantado em 2026-09-25)

### 2.1 Acervo do Core
- `ai-workspace/` tem cerca de 490 arquivos. `docs/` soma cerca de 125 arquivos por idioma, com ~35 mil linhas.
- Quase tudo foi modificado pela última vez entre jan e mar/2026, antes de cerca de 180 batches.
- Defasagem medida grosseiramente (funções no código × funções citadas na doc):

| Biblioteca | Funções | Não documentadas | Citadas e inexistentes |
|---|---|---|---|
| `gestor.php` | 76 | 68 | 16 |
| `interface.php` | 58 | 57 | 25 |
| `plugins-installer.php` | 44 | 44 | 24 |
| `autenticacao.php` | 22 | 19 | 15 |

- **Bibliotecas sem doc:** `2fa`, `assets-externos`, `cron`, `editor-texto`, `hooks`, `html-editor`, `jwt`, `modulo-distribuido`, `oauth`, `oauth2`, `recursos`, `seguranca`, `sitemap`, `stripe`.
- **Módulos sem doc:** `admin-cron`, `forms-search`, `forms-submissions`, `galleries`, `interface`, `menus`, `pages-index`, `publisher-highlights`, `publisher-index`.
- **Conteúdo legado sem uso:** `agents-history/`, `prompts/`, `templates/` (fluxo anterior ao SDD). Também há changelogs disfarçados de doc (`*-v2.6.3.md`, `*-CONCLUIDO.md`).
- ⚠️ `ai-workspace/{en,pt-br}/scripts/` **está em uso** (83 referências a partir de `cli/`, `.vscode` e afins, incluindo `scripts/lib/project-transport.sh`) e **não entra na limpeza**.

### 2.2 Infraestrutura já existente no Core
- **`publisher`**: define o tipo de conteúdo (`fields_schema` + `template_id` + `path_prefix`).
  - Tipos de campo: `text`, `textarea`, `html`, `image`. Não existe tipo Markdown.
- **`publisher-pages`**: grava em `paginas` (com `publisher_id`, HTML já preenchido) e em `publisher_pages` (`fields_values`, `html_template`).
- **`publisher-index`** (widget): índice paginado com busca textual, ordenação (`date_desc|date_asc|title_asc|title_desc`), "carregar mais" e métricas.
  - Templates: `lista`, `lista-imagem`, `grid`, `grid-imagem`, `timeline`, `agenda`.
  - **Lacuna:** não filtra por valor de campo (por exemplo, `secao`).
- **`pages-index`** (widget): os mesmos 6 templates, mais uma página de busca geral.
- **`publisher-highlights`** (widget): `grid-cards`, `lista-simples`, `artigos-editorial`, `notas-mosaico`, `destaque-principal-carousel`, `lives-video-destaque`.
- **`menus`** (widget): árvore curada (`children`, `page_id`), com visibilidade por perfil.
  - Templates: `vertical-sidebar`, `breadcrumb`, `dropdown`, `horizontal-navbar`, `mobile-hamburguer`, `footer-colunas`.
- **API:** existe a rota `/_api/{modulo}/{acao}` (JWT, via `hooks.api` do módulo). **Nenhum** entre publisher, publisher-pages e menus a implementa hoje.
- **Pipeline de recursos:** existe a sincronização declarativa `sync_resources` (BATCH-056) via `resources/project_tables_config.json`.
  - **Já comprovada no Transforma MP** para `publisher`, `publisher_pages`, `publisher_index`, `publisher_highlights` e `menus`.
  - O recurso de página já aceita `publisher_id` (`atualizacao-dados-recursos.php`).
- **Markdown:** o Core não tem dependência de runtime em `composer.json` nem biblioteca de Markdown. O site usa Tailwind `^4.1.17`.

---

## 3. Decisões já tomadas pelo Humano (2026-09-25)

| # | Decisão |
|---|---|
| D1 | **Caminho C (híbrido).** O Markdown do Core é a **fonte única**. Um **parser** o converte em HTML/Tailwind como **recursos do sistema** no site, publicados pelo pipeline. A API entra de forma complementar. |
| D2 | **Público por padrão**, com opção de restringir. O mecanismo de restrição (frontmatter e/ou JSON do módulo, login e permissão de módulo) é definido depois, sem bloquear a fase 1. |
| D3 | **Bilíngue por documento.** Cada doc é corrigida em pt-br e imediatamente em en, no mesmo contexto. Nada de "tudo em pt-br primeiro". |
| D4 | **Limpeza do legado com preservação.** Antes, criar branch/tag de snapshot do Core atual. Depois remover `agents-history/`, `prompts/` e `templates/` da `main`. |
| D5 | **URL** `/docs/` (em inglês, sem problema). |
| D6 | **Revisão profunda.** Cada doc é refeita a partir da leitura do código (módulo, bibliotecas, JSON, recursos, migrations, hooks, API), não só do texto antigo. O que não tem doc é criado. |
| D7 | **Skill** criada e mantida na Matriz Central (`conn2flow-ai-workspace`) e propagada aos demais repositórios. |
| D8 | **Opção 3 (Guias × Referência) escolhida** (ver §6). As outras opções ficam só como referência histórica; o protótipo da req 3 implementa a Opção 3 direto. |
| D9 | O Arquiteto tem liberdade para propor recursos inspirados em outras documentações e módulos novos (ver §6.1). |

---

## 4. Arquitetura proposta

```
conn2flow/ai-workspace/{pt-br,en}/docs/**/*.md      ← FONTE ÚNICA (git, revisão por diff)
        │  frontmatter: slug, secao, ordem, visibilidade, fontes[], verificado_em
        ▼
c2f docs:build --project=conn2flow-site             ← PARSER (CLI do Core, reutilizável por qualquer projeto)
        │  Markdown → HTML com classes Tailwind (mapa de classes por elemento)
        │  gera: publisher_pages/*.html + publisher-pages.json, pages.json (publisher_id),
        │        menus.json (árvore da sidebar), publisher-index.json
        ▼
conn2flow-site/gestor/resources/{pt-br,en}/…        ← RECURSOS DO SISTEMA
        │  project_tables_config.json com sync_resources (modelo do Transforma MP)
        ▼
resources:sync → css:rebuild → deploy do projeto    ← PIPELINE EXISTENTE (checksum, UPSERT, idempotente)
        ▼
conn2flow.com/docs/…  (pt-br) · /en/docs/… (a confirmar no roteamento i18n do site)
```

### 4.1 Contrato de frontmatter (a normatizar na req do Core)

```yaml
---
titulo: "Biblioteca gestor.php"
slug: referencia/bibliotecas/gestor
secao: referencia            # guias | conceitos | referencia | novidades
subsecao: bibliotecas        # bibliotecas | modulos | hooks | api | cli | ...
ordem: 10
visibilidade: publico        # publico (padrão) | restrito  — D2
modulo: null                 # id do módulo documentado (base para a restrição futura)
fontes:                      # código que esta doc descreve; alimenta o docs:audit
  - gestor/bibliotecas/gestor.php
verificado_em: 5b4348ab      # commit do Core contra o qual a doc foi conferida
traducao: en/docs/referencia/bibliotecas/gestor.md
---
```

### 4.2 Parser (`c2f docs:build`)
- **Onde fica:** no CLI do Core (`cli/src/Commands/DocsBuildCommand.php`).
  - É reutilizável por qualquer projeto (lumix e transformamp poderão publicar docs próprias).
  - O **projeto** declara a configuração em `docs.config.json`: caminho da fonte, publishers, menus, layout e prefixo de URL.
- **Conversão:** o Core não tem dependência de runtime. Há duas opções, a decidir na req:
  - **(a)** Embutir **Parsedown** (arquivo único, MIT) e fazer pós-processamento de classes.
  - **(b)** Escrever um conversor próprio mínimo (títulos, parágrafos, listas, tabelas, código, citações e callouts `> [!NOTE]`).
  - Recomendação: **(a)**, com um mapa de classes Tailwind configurável e testado.
- **Tailwind:** o HTML sai com classes utilitárias explícitas.
  - Não depende de `@tailwindcss/typography`.
  - Garante que o `css:rebuild` compile tudo (ver skill `c2f-tailwind-css-architecture`).
- **Extras:**
  - Âncoras em títulos, gerando um sumário "nesta página".
  - Reescrita de links `.md` para URLs `/docs/...`.
  - Realce de código com classes estáticas.
  - Aviso de link quebrado como **erro de build**.
- **Idempotência:** o mesmo Markdown gera o mesmo recurso (checksum estável).
- **Proteção:** edição manual no painel é sobrescrita no próximo build. A doc se edita no Markdown, e isso deve ficar documentado na skill.

### 4.3 API (complementar — D1)
- **Fase posterior:** implementar `hooks.api` de **leitura** (`list`, `get`) em `publisher`, `publisher-pages` e `menus`, para o agente conferir o que está publicado numa instalação sem abrir o painel.
- `upsert` via API só se surgir necessidade real (por exemplo, instalações sem pipeline).

### 4.4 Rotina recorrente (`c2f docs:audit`)
- Gera um **ranking de defasagem** por doc:
  - funções no código ausentes na doc e o contrário;
  - caminhos citados que não existem;
  - módulos e bibliotecas sem doc;
  - `fontes[]` modificadas depois de `verificado_em`;
  - doc sem par de tradução;
  - frontmatter inválido.
- **Cada passagem de agente:**
  1. roda o `docs:audit`;
  2. pega os N itens do topo;
  3. para cada item, lê o código a fundo (D6), reescreve em pt-br e en (D3) e atualiza `verificado_em`;
  4. roda `docs:build` e publica no ambiente **local**.
- Pode virar `/loop` ou `/schedule` depois.

---

## 5. Taxonomia da documentação (reorganização do `ai-workspace/docs`)

```
docs/
├── guias/          # começar, instalar, criar módulo, criar plugin, deploy de projeto…
├── conceitos/      # arquitetura, recursos, projetos, multilíngue, hooks, widgets, variáveis…
├── referencia/
│   ├── bibliotecas/   # 1 doc por gestor/bibliotecas/*.php (44)
│   ├── modulos/       # 1 doc por gestor/modulos/* (35)
│   ├── api/           # rotas /_api, auth, módulos distribuídos
│   ├── cli/           # comandos c2f
│   └── hooks/
└── novidades/      # changelogs e "docs-versão" legados convertidos em notas de release
```

Os manuais de usuário (`docs/manual/modulos/`) viram a parte "como usar" de cada doc de módulo em `referencia/modulos/`, em vez de ficarem duplicados.

---

## 6. Variações visuais para escolha no site (D8)

As três opções serão **prototipadas localmente** com as mesmas docs do piloto. O Humano escolhe e as outras são descartadas antes de produção.

| | Opção 1 — Publicador por seção | Opção 2 — Publicador único filtrável | Opção 3 — Guias × Referência ⭐ |
|---|---|---|---|
| Publishers | `docs-guias`, `docs-conceitos`, `docs-bibliotecas`, `docs-modulos`, `docs-api` | `docs` (campo `secao`) | `docs-guias` (editorial), `docs-referencia` (técnico), `docs-novidades` (opcional) |
| Home `/docs/` | `highlights` `grid-cards`, um card por seção | `publisher-index` `grid` com filtros | `highlights` `artigos-editorial` (guias) + atalhos da referência |
| Índice | um `publisher-index` `lista` por seção | um índice com busca e filtro por seção | guias em `lista-imagem`; referência em `lista` compacta; novidades em `timeline` |
| Artigo | sidebar `vertical-sidebar` + `breadcrumb` | 3 colunas: sidebar, conteúdo, sumário | guias: leitura larga; referência: sidebar + sumário de funções |
| Busca global | `pages-index` (busca) | nativa do índice | `pages-index` (busca) |
| Mudança no Core | nenhuma | **filtro por campo** no `publisher-index` | nenhuma agora; o filtro por campo é evolução opcional |

### 6.1 Recursos extras propostos (D9)

Inspirados em Stripe Docs, Laravel Docs, Docusaurus, MDN e Tailwind Docs. Classificados por fase.

| # | Recurso | Inspiração | Como no Conn2Flow | Fase |
|---|---|---|---|---|
| X1 | **Referência gerada a partir do código** | PHPDoc, TypeDoc, Laravel API | `c2f docs:extract` lê as assinaturas e os docblocks das bibliotecas e gera o **esqueleto** da doc de referência (lista de funções, parâmetros, retorno, arquivo e linha). O agente escreve a explicação por cima. É o que mais ataca a defasagem na origem. | 1 |
| X2 | **Selo "Verificado contra o código"** | Stripe "last updated" | O rodapé do artigo mostra o commit e a data do `verificado_em`, com link para o arquivo-fonte no GitHub. Se o `docs:audit` marcar a doc como defasada, aparece um aviso visível. | 1 |
| X3 | **Docs para agentes de IA** | `llms.txt`, "Copy as Markdown" | O `docs:build` publica `/docs/llms.txt` (índice) e `/docs/llms-full.txt`, e cada página ganha o botão "copiar como Markdown". Um agente em outro IDE aprende o Conn2Flow lendo o site. **Diferencial forte para um framework guiado por IA.** | 1 |
| X4 | **Sumário "nesta página" + anterior/próximo** | Docusaurus | O parser gera as âncoras e o sumário. A navegação anterior/próximo sai da ordem do menu, sem módulo novo. | 1 |
| X5 | **Busca rápida `Ctrl+K`** | Algolia DocSearch | Um modal sobre a busca AJAX do `pages-index`/`publisher-index`, na forma de um **widget novo e pequeno `docs-search`** (ou template novo do `pages-index`). | 2 |
| X6 | **Blocos ricos** | MDN, Docusaurus | Callouts `> [!NOTE|TIP|WARNING]`, abas de código (PHP/JS/CLI), botão de copiar código e diagramas Mermaid renderizados no build. | 1–2 |
| X7 | **"Esta página ajudou?"** | Stripe, MDN | Usa o módulo `forms` existente (sim/não + comentário) e gera o relatório de páginas problemáticas, que também entra no ranking do `docs:audit`. | 2 |
| X8 | **Novidades por versão** | Laravel "Upgrade Guide" | O publisher `docs-novidades` em `timeline`, alimentado pelo `CHANGELOG.md` a cada release, com links para as docs afetadas. | 2 |
| X9 | **Docs versionadas por release** | Docusaurus versions | `/docs/v2.10/...` congelado a cada versão maior do gestor. Só quando houver usuários externos em versões antigas. | 3 |
| X10 | **Receitas executáveis** | Laravel Bootcamp | A trilha "Construa seu primeiro módulo" em `guias/`, com cada passo validado por um teste automatizado que roda os comandos do guia. Se o guia quebrar, o teste falha. | 3 |

**Módulos ou widgets novos sugeridos:**
- Somente o `docs-search` (X5).
- Todo o resto reaproveita `publisher`, `publisher-index`, `publisher-highlights`, `menus`, `pages-index` e `forms`, ou nasce no build (parser).

---

## 7. Fatiamento proposto (para promoção a `human-requests/`)

| Ordem | Repositório | Requisição (proposta) | Escopo | Paralelo com |
|---|---|---|---|---|
| 0 | `conn2flow` | Snapshot + limpeza | branch/tag `legacy/ai-workspace-pre-docs`; remoção de `agents-history/`, `prompts/`, `templates/` (**nunca** `scripts/`) | — |
| 1 | `conn2flow` | Contrato + `docs:audit` + `docs:extract` | frontmatter normativo, taxonomia §5, comandos `c2f docs:audit` e `docs:extract` (X1), piloto com 3 docs refeitas em pt-br e en | 2 |
| 2 | `conn2flow` | Parser `docs:build` | comando, mapa Tailwind, reescrita de links, sumário e anterior/próximo (X4), callouts e código (X6), `llms.txt` (X3), selo verificado (X2), testes PHPUnit | 1, 3 |
| 3 | `conn2flow-site` | Infraestrutura `/docs/` (Opção 3) | publishers `docs-guias`/`docs-referencia`/`docs-novidades`, `layout-docs`, menus, índices, home, `project_tables_config.json`, `docs.config.json`, publicação local do piloto | 2 |
| 4 | `conn2flow-ai-workspace` | Skill `c2f-documentation` | ver §8; propagação aos 5 repositórios e aos templates de kit | após 1–3 |
| 5+ | `conn2flow` + site | Ondas de correção (rotina) | onda 1 bibliotecas centrais; onda 2 módulos; onda 3 sistemas (recursos, projetos, hooks, API, CLI); onda 4 lacunas | contínuo |
| opc. | `conn2flow` | API de leitura | `hooks.api` `list`/`get` em publisher, publisher-pages e menus | — |
| opc. | `conn2flow` | Filtro por campo | `publisher-index`/`pages-index` filtrando por valor de campo (se Opção 2 ou evolução da 3) | — |
| opc. | `conn2flow` + site | Docs restritas (D2) | `visibilidade: restrito` + permissão de módulo + login | — |

---

## 8. Skill a criar (`c2f-documentation`, na Matriz Central)

**Conteúdo mínimo:**
- **Quando usar:** "faça a documentação de X", "corrija a doc de Y", "rode a rotina de docs".
- **Protocolo de revisão profunda (D6):** o inventário de fontes a ler para cada tipo de doc.
  - Biblioteca: o arquivo PHP e os chamadores.
  - Módulo: `.php`, `.json`, `.js`, `resources/`, `widget`, `hooks`, migrations, `ai_modes`.
- **Contrato de frontmatter e taxonomia.**
- **Bilinguismo por doc (D3):** a en nasce na mesma passagem da pt-br.
- **Fluxo:**
  1. `docs:audit`;
  2. escolher N itens;
  3. reescrever;
  4. atualizar `verificado_em`;
  5. `docs:build`;
  6. `resources:sync`;
  7. deploy **local**;
  8. conferência visual.
- **Proibições:**
  - editar a doc publicada pelo painel;
  - documentar a partir de memória ou do texto antigo sem abrir o código;
  - publicar informação sensível (hosts, IPs, credenciais, caminhos de VPS).
- **Relação com `c2f-documentation-governance`:** pode estendê-la ou substituí-la. A decisão fica na req 4.

---

## 9. Riscos e pontos a verificar no piloto

- Escala do `pages.json` e do `publisher-pages.json` com mais de 150 docs × 2 idiomas: tempo de `resources:sync` e tamanho do `*Data.json`.
- Roteamento de idioma do site para `/en/docs/` (confirmar com a skill `c2f-multilingual-system`).
- Vazamento de detalhe interno em docs públicas: fazer revisão de segurança antes do primeiro deploy de produção.
- `preserve_on_user_modified` não pode preservar campos de conteúdo das docs (o Markdown é autoridade).
- Deploy de produção continua **exclusivamente humano**.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/` do(s) repositório(s) alvo, atualização de `CURRENT.md` e associação a um batch.

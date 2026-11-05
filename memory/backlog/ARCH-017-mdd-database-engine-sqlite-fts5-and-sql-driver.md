---
id: "ARCH-017"
type: "backlog"
status: "PROMOTED"
title: "Motor de Banco de Dados Relacional e Full-Text Search (SQLite3 + FTS5 Local e Multi-Driver SQL) para o MDD"
updated: "2026-11-05"
promoted_to: "REQ-079"
---

# ARCH-017: Motor de Banco de Dados Relacional e Full-Text Search (SQLite3 + FTS5 Local e Multi-Driver SQL) para o MDD

## 1. Motivação e Diagnóstico
Atualmente o ecossistema **MDD (Memory Driven Development)** opera primariamente sobre arquivos Markdown (`.md`) com cabeçalhos YAML frontmatter e arquivos `index.md` gerados por scripts. Embora arquivos Markdown sejam ideais para leitura humana e versionamento Git, a evolução do MDD para:
1. **Agentes locais de alta velocidade (`tools/mdd-client/`)** que precisam consultar centenas de memórias, cruzar grafos de dependências (`REQ ↔ BATCH ↔ DEC ↔ TRAP`) e buscar conceitos sem varrer dezenas de arquivos em disco;
2. **Sistemas Multi-Tenant / SaaS (`conn2flow-site` e futuramente `conn2flow` Core)**, onde cada usuário e cada módulo (como a Fábrica de Vídeos `video-factory`, `ai-agents`, `ai-assistant`) possui seu próprio banco de memória MDD estruturado;

exige uma **camada de banco de dados relacional embutida e indexada**.

O banco de dados local ideal — nativo na biblioteca padrão do Python (`sqlite3`), zero-configuração, arquivo único e com motor de busca textual **BM25 (FTS5)** e índices **B-Tree / JSON1** — é o **SQLite3 (`memory/.mdd.sqlite`)**, desenhado com um **Storage Driver Abstrato** capaz de espelhar exatamente o mesmo schema nas tabelas relacionais `ai_memories` e `ai_memory_links` (MariaDB/MySQL e PostgreSQL) do Gestor Conn2Flow.

---

## 2. Arquitetura Proposta

### 2.1. Banco Local Embutido (`memory/.mdd.sqlite` via SQLite3 + FTS5 + WAL)
- Arquivo local em `memory/.mdd.sqlite` (ignorado no Git via `.gitignore`, pois é um índice determinístico reconstruível a partir dos `.md` versionados ou sincronizável via API).
- Configurado com `PRAGMA journal_mode=WAL;` e `PRAGMA synchronous=NORMAL;` para leitura concorrente ultrarrápida por múltiplos agentes em paralelo sem lock de escrita.
- **Tabelas Principais**:
  1. `mdd_memories`:
     - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
     - `workspace_slug` (TEXT NOT NULL DEFAULT 'default')
     - `target` (TEXT NOT NULL DEFAULT 'global') — ex.: `global`, `video-factory`, `ai-agents`, `core`
     - `layer` (TEXT NOT NULL) — as 4 camadas canônicas do MDD: `normative` (00-02, decisões), `procedural` (03-04, skills, prompts), `episodic` (requests, batches, reviews, backlog), `raw` (logs, transcrições)
     - `doc_id` (TEXT NOT NULL) — ex.: `DEC-136`, `REQ-079`, `BATCH-081`, `TRAP-019`
     - `slug` (TEXT NOT NULL)
     - `title` (TEXT NOT NULL)
     - `summary` (TEXT)
     - `content` (TEXT NOT NULL)
     - `frontmatter_json` (TEXT) — JSON serializado do cabeçalho YAML
     - `tags` (TEXT)
     - `source_path` (TEXT) — caminho relativo ao repositório (`memory/...`)
     - `checksum_sha256` (TEXT NOT NULL) — evita reindexação desnecessária quando o arquivo `.md` não mudou
     - `status` (TEXT DEFAULT 'A')
     - `updated_at` (TEXT)
  2. `mdd_memories_fts` (Virtual Table **FTS5**):
     - `CREATE VIRTUAL TABLE mdd_memories_fts USING fts5(doc_id, title, summary, content, tags, content='mdd_memories', content_rowid='id', tokenize='unicode61 remove_diacritics 2');`
     - Permite ranking por relevância **BM25 (`bm25(mdd_memories_fts)`)** em menos de 2 ms sem depender de GPU ou API externa.
  3. `mdd_memory_links` (Grafo de Rastreabilidade Relacional):
     - `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
     - `source_doc_id` (TEXT NOT NULL)
     - `target_doc_id` (TEXT NOT NULL)
     - `relation_type` (TEXT NOT NULL) — `implements`, `depends_on`, `supersedes`, `references`, `blocks`

### 2.2. Compatibilidade 1:1 com o Módulo Universal `ai-memory` (`conn2flow-site` / Core)
- O schema de `mdd_memories` e `mdd_memory_links` mapeia 1:1 para as tabelas Phinx `ai_memories` e `ai_memory_links` do módulo `ai-memory` no Gestor (`conn2flow-site`), permitindo exportação/importação direta em JSONL (`mdd db export` / `mdd db import`) entre qualquer workspace local e o banco de dados online de um usuário.

### 2.3. Comandos CLI no `mdd-client` (`tools/mdd-client/`)
- `mdd db sync [--workspace <path>]`: varre `memory/` (e `.gemini/skills/` se solicitado), compara `checksum_sha256` e sincroniza incrementalmente o `memory/.mdd.sqlite`.
- `mdd db query "<termo>" [--layer normative|procedural|episodic|raw] [--target <slug>] [--limit 10] [--json]`: executa busca híbrida (filtro relacional B-Tree + ranking BM25 via FTS5) e devolve os trechos relevantes prontos para injeção no contexto do agente.
- `mdd db graph <DOC_ID>`: consulta `mdd_memory_links` e exibe a árvore completa de relacionamentos de um artefato (ex.: `REQ-079 ➔ BATCH-081 ➔ ARCH-017`).
- `mdd db learn --layer <layer> --doc-id <id> --title "<título>" --summary "<resumo>" --content "<texto>" [--sync-md]`: grava uma nova memória diretamente no banco SQLite e, opcionalmente, materializa/atualiza o arquivo `.md` correspondente com frontmatter YAML.
- `mdd db export [--output memory-dump.jsonl]` & `mdd db import <file.jsonl>`: ponte de portabilidade com a tabela `ai_memories` do Gestor Web.

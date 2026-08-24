# 🧩 Catálogo de Skills — Conn2Flow AI Workspace

Este catálogo lista as **32 Skills** (25 Core Skills do Framework + 7 SDD Workflow Skills) padronizadas e sincronizadas universalmente entre **Claude Code (`.claude/skills/`)**, **Cursor IDE (`.cursor/skills/`)**, **GitHub Copilot (`.github/skills/`)** e **Gemini Antigravity (`.gemini/skills/`)**.

---

## 🛠️ 1. Core Framework Skills (`c2f-*`) — 25 Skills

| Skill | Gatilho & Propósito Principal |
| :--- | :--- |
| **`c2f-module-crud-scaffolding`** | **[NOVA]** Guia e scaffold canônico para criação de novos módulos CRUD baseado no padrão `modulos-grupos`. |
| **`c2f-variables-system`** | **[NOVA]** Governança de textos, mensagens de erro, alertas de warning e i18n via `variables.json`. Proíbe strings hardcoded. |
| **`c2f-environment-configuration`** | **[NOVA]** Gestão de credenciais sensíveis e templates `.env` via `config.php` e `$_CONFIG`. Proíbe credenciais soltas. |
| **`c2f-resources-system`** | Compilação declarativa de 11 tipos de recursos (`layouts`, `pages`, `components`, `templates`, etc.) e tabelas dinâmicas. |
| **`c2f-global-variables`** | Guia de superglobais `$_GESTOR` (runtime), `$_CONFIG` (sistema), `$_BANCO` (conexão) e `$_ENV` (infra). |
| **`c2f-database-operations`** | Operações seguras com a biblioteca de banco (`banco_select`, `banco_insert_name`, `banco_update`, `banco_escape_field`). |
| **`c2f-database-migrations`** | Criação e execução de migrações determinísticas com Phinx (`db/migrations/`). |
| **`c2f-database-schema`** | Metadados de schema e sincronização declarativa via `schema-metadata.json`. |
| **`c2f-module-structure`** | Anatomia e ciclo de vida de módulos no diretório `gestor/modulos/`. |
| **`c2f-module-configuration`** | Telas e tabelas de configuração interna de módulos. |
| **`c2f-html-css-pages-and-components`** | Padrões de renderização HTML/CSS, slots de layout e marcação de seções (`data-id`, `data-title`). |
| **`c2f-system-tasks`** | Execução de rotinas do sistema, scripts bash e automações de infraestrutura. |
| **`c2f-auth-system`** | Autenticação, 2FA, sessões seguras e tokens JWT. |
| **`c2f-access-control`** | Perfis de usuário, permissões modulares e controle de acesso hierárquico. |
| **`c2f-form-processing`** | Processamento de formulários, validação CSRF e sanitização de dados. |
| **`c2f-api-endpoints`** | Construção de endpoints REST, respostas JSON e contratos de API. |
| **`c2f-ajax-handling`** | Tratamento de requisições AJAX assíncronas no frontend e backend. |
| **`c2f-crawlers-and-bots`** | Detecção de robôs, scrapers e crawlers de redes sociais (OpenGraph). |
| **`c2f-cookie-management`** | Manipulação de cookies com hashing e conformidade com LGPD/GDPR. |
| **`c2f-tailwind-css-architecture`** | **[NOVA/ATUALIZADA]** Governança do Tailwind CSS v4, prevenção de conflitos de cascata, limpeza de `css_compiled` em banco, templates dinâmicos (`tailwind_dependencies`) e compilação via `c2f resources:sync`. |
| **`c2f-library-system`** | Inclusão dinâmica e versionamento de bibliotecas do gestor (`gestor_incluir_biblioteca`). |
| **`c2f-url-routing`** | Resolução de URLs canônicas, rotas dinâmicas e reescrita de caminhos. |
| **`c2f-i18n-translations`** | Tradução e internacionalização de interfaces e dicionários (`__t()`). |
| **`c2f-file-system-operations`** | Uploads seguros, manipulação de arquivos e caminhos absolutos do sistema. |
| **`c2f-log-system`** | Gravação de logs unificados em disco (`log_disco()`) e depuração. |

---

## 🚦 2. SDD Workflow Skills (`sdd-*`) — 7 Skills

| Skill | Propósito no Fluxo de Desenvolvimento | Marco de Ativação |
| :--- | :--- | :--- |
| **`start-sdd-slice`** / **`sdd-classify-intent`** | Classifica a intenção e inicializa o contexto operacional da fatia. | 🟢 **Início de Tarefa** |
| **`sdd-workflow`** | Guia passo a passo de desenvolvimento guiado por especificações. | 🟢 **Início de Tarefa** |
| **`sdd-update-spec`** | Atualiza a especificação viva (`sdd/SPEC.md`) com rastreabilidade. | ⚙️ **Durante a Edição** |
| **`sdd-record-decision`** | Registra decisões arquiteturais formais em `sdd/decisions/DECISION-LOG.md`. | ⚙️ **Durante a Edição** |
| **`sdd-plan-batch`** | Divide requisitos complexos em lotes atômicos e executáveis. | ⚙️ **Durante a Edição** |
| **`project-validation`** / **`sdd-validate-acceptance`** | Valida critérios de aceite, executa testes e audita requisitos. | 🏁 **Fechamento & Validação** |
| **`review-current-batch`** / **`sdd-log-implementation`** | Registra o diário de implementação e evidências em `batch-YYY.md`. | 🏁 **Fechamento & Validação** |
| **`sdd-memory-gardening`** | Poda e arquivamento idempotente de memórias de execução. | 🏁 **Fechamento & Validação** |
| **`raise-spec-change`** / **`sdd-process-change-request`** | Processa solicitações formais de mudança de escopo (`CR-XXX.md`). | ⚠️ **Mudança Normativa** |

---

## ⚡ 3. O Padrão de Contrato de Execução (`TRIGGER` & `SKIP`)

Todas as 32 skills implementam uma cláusula contratual no topo do arquivo para garantir ativação determinística pelos modelos de linguagem:

```markdown
# ⚡ Gatilho Obrigatório
- **TRIGGER**: Ação operacional exata que obriga a leitura prévia da skill.
- **SKIP APENAS SE**: Condição estrita de isenção de leitura (ex: investigação sem edição).
- **CONSEQUÊNCIA DE IGNORAR**: Risco técnico de falha silenciosa, regressão ou rejeição de commit.
```

### Frontmatter com Gatilho de Ação:
As descrições no cabeçalho YAML seguem o padrão operacional direto:
`"LEIA ANTES de [Ação Observável]. Se não ler: [Consequência invisível/Erro em produção]."`

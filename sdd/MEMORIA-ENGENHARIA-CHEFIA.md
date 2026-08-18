# Memória de Engenharia — Chefia

> **Propósito**: Este diário de bordo é reservado ao **Engenheiro Chefe Humano**. Registre aqui suas preferências de design, convenções de código, restrições técnicas e regras de negócio que devem ser respeitadas em todas as sessões de trabalho.
>
> **Permissão**: Somente leitura para agentes executores IA. Apenas o Engenheiro Chefe Humano pode criar, editar ou remover anotações neste arquivo.

---

## 🏛️ Diretrizes Fundamentais de Arquitetura e Governança

1. **O Arquiteto como Guardião da Documentação Viva (Mandatório)**:
   - O Arquiteto assume a responsabilidade de manter a documentação de alto nível (`README.md`, `README-PT-BR.md` e a pasta `docs/`) sempre atualizada ao encerrar cada lote de implementação.
   - **Inspeção de Diff em Alto Nível**: Ao auditar o trabalho do Executor, o Arquiteto realiza uma checagem em nível executivo (resumo de arquivos alterados, novos componentes, migrações e evidências de teste), sem se afogar em detalhes de linhas de código individuais, preservando seu foco estratégico e agilidade.

2. **Modelo de Agente Duplo (SDD)**:
   - **Arquiteto (Antigravity / Gemini 3.7 Flash)**: Focado no macro, especificações (`sdd/SPEC.md`), decisões (`DECISION-LOG.md`) e requisições atômicas (`req-XXX.md`). Nunca edita código diretamente.
   - **Executores (Claude Code / Cursor / Copilot)**: Motores táticos focados no micro, execução de código, testes e evidências.

3. **Padrão Canônico de Módulos CRUD**:
   - Todo novo módulo deve seguir a arquitetura viva e consolidada de `gestor/modulos/modulos-grupos/` (via skill `c2f-module-crud-scaffolding`), com separação clara entre controller (`.php`), schema (`.json`), frontend (`.js`) e recursos (`resources/<lang>/pages|variables/`).

4. **Monitoramento Proativo de SDD Archiving & Memory Gardening (Mandatório)**:
   - Ao formular ou revisar qualquer requisição (`req-XXX.md`), o Arquiteto DEVE auditar proativamente o tamanho dos arquivos em todas as subpastas do `sdd/` do repositório alvo.
   - **Teto Ativo de 10 Itens**: `DECISION-LOG.md`, `BATCH-INDEX.md` e `VALIDATION-CHECKLIST.md` mantêm apenas os **10 itens ativos mais recentes**. Itens antigos devem ser movidos para suas respectivas subpastas `/archive/` (ex: `sdd/decisions/archive/`, `sdd/validation/archive/`).
   - **Teto de Memória de Execução**: `MEMORIA-ENGENHARIA-EXECUCAO.md` com teto de 15 KB / 50 linhas deve ser podada para ~4 KB a 5 KB (mantendo apenas 3–5 tarefas recentes).
   - Se qualquer arquivo exceder os limites, o Arquiteto inclui automaticamente a tarefa de arquivamento/poda na requisição do executor.

5. **Proibição de Código Solto e Strings Hardcoded**:
   - **HTML/CSS/MD**: Obrigatório o uso do Sistema de Recursos (`resources/`) compilado em `*Data.json`. Proibido HTML solto em controllers.
   - **Textos, Alertas e Erros**: Obrigatório o uso do Sistema de Variáveis (`resources/<lang>/variables.json` ou `<modulo>.json`) e consumo via `gestor_variaveis()`.
   - **Credenciais e Ambiente**: Obrigatório o cadastro prévio em `gestor/autenticacoes.exemplo/dominio/.env`, mapeamento em `gestor/config.php` e consumo via `$_CONFIG`.

---

## 📋 Preferências de Design & Estilo

* Nomes de arquivos e pastas em minúsculo e kebab-case (`meu-modulo-exemplo`).
* Código limpo, modular e autossuficiente.
* Uso de chaves naturais (`strategy: "natural_key"`) para sincronização determinística de tabelas SQL.

---

## ⚙️ Convenções de Código

* PHP moderno (strict types, tratamento de exceções, escape de SQL com `banco_escape_field()`).
* Validação de formulários via `interface_validacao_campos_obrigatorios()`.
* Histórico de edições com `banco_select_campos_antes_iniciar()` e `interface_historico_incluir()`.

---

## 🔒 Restrições Técnicas

* Paridade estrita de 32 skills em todos os kits (`.claude/skills/`, `.cursor/skills/`, `.github/skills/`, `.gemini/skills/`).
* Não criar pastas soltas fora do padrão estabelecido.

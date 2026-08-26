# SPEC.md: Especificação Normativa dos Kits e Instaladores

Este documento reúne a especificação técnica e de arquitetura dos templates e scripts contidos no repositório `conn2flow-ai-workspace`. Ele serve como especificação normativa única e guia de design para os scripts instaladores e estrutura bilingue.

---

## 1. Organização Semântica dos Idiomas em `templates/` e `docs/`

O repositório adota a convenção de **Pastas Semânticas de Domínio** contendo as subpastas de idiomas (`pt-br/` e `en/`):

### A. Diretório `templates/` (Moldes de Kits e Boilerplates):
*   `templates/pt-br/`: Contém os moldes e boilerplates em Português do Brasil.
*   `templates/en/`: Contém os moldes e boilerplates em Inglês americano.

Cada pasta de idioma possui a seguinte subestrutura interna:
*   `templates/`:
    - `spec-driven-project-claude-kit`: Configurações de IA do Claude Code para projetos SDD.
    - `spec-driven-project-copilot-kit`: Configurações de IA do GitHub Copilot para projetos SDD.
    - `spec-driven-project-cursor-kit`: Regras de projeto e skills do Cursor IDE para projetos SDD.
    - `spec-driven-project-gemini-kit`: Contexto hierárquico e configurações do Gemini CLI/Code Assist para projetos SDD.
    - `spec-driven-project-codex-kit`: Instruções, agentes e 33 skills do OpenAI Codex / GPT para projetos SDD no VS Code.
    - `private-project-claude-kit`: Configurações de IA do Claude Code para repositórios privados sobrepostos a um core.
    - `private-project-copilot-kit`: Configurações de IA do GitHub Copilot para repositórios privados sobrepostos a um core.
*   `sdd-boilerplate/`:
    - `sdd/`: A estrutura de pastas e arquivos markdown inicial padrão do SDD para novos projetos, completamente traduzidos no respectivo idioma.

### B. Diretório `docs/` (Manuais Técnicos e Guias):
*   `docs/pt-br/`: Documentação técnica completa em Português.
*   `docs/en/`: Documentação técnica completa em Inglês.
*   `docs/README.md`: Router e índice central bilíngue.


---

## 2. Especificação Técnica dos Instaladores em `scripts/`
Os scripts instaladores devem ser disponibilizados em PowerShell (`.ps1`) para ambientes Windows e em Bash (`.sh`) para ambientes Unix/macOS.

### Parâmetros Obrigatórios e Opcionais:
1.  **Caminho Alvo (`-TargetRepoPath` / `$1`)** - *Mandatório*: O caminho absoluto ou relativo para a raiz do repositório onde o kit será injetado.
2.  **Forçar Sobrescrita (`-Force` / `--force`)** - *Opcional*: Se fornecido, deve forçar a cópia de arquivos mesmo que eles já existam no destino. Caso contrário, pula arquivos existentes para proteger customizações locais.
3.  **Prefixo do Agente (`-AgentPrefix` / `--agent-prefix`)** - *Opcional*: Se fornecido, deve renomear os arquivos dos agentes leves e atualizar recursivamente todas as referências nos prompts e configurações de `CLAUDE.md` ou `.github/` para usar o prefixo (ex: `meuprojeto-coordinator`).
4.  **Idioma (`-Language` / `--language`)** - *Opcional*: Permite definir a linguagem de origem dos templates. Os valores aceitos são `"en"` ou `"pt-br"`. O valor padrão, caso não seja especificado, é `"pt-br"`.

### Comportamento de Cópia da Pasta `sdd/`:
*   Se o diretório `sdd/` **não existir** no caminho alvo, o instalador deve copiar recursivamente todo o diretório `sdd/` contido em `..\<Language>\sdd-boilerplate\sdd` para o destino.
*   Se o diretório `sdd/` **já existir** no destino, o instalador **não deve** copiar o boilerplate. Ele deve apenas copiar os recursos de suporte operacional (ex: hooks de início de sessão em `sdd/scripts/hooks/`), preservando totalmente todas as especificações e históricos do SDD do usuário.
*   Em SDD preexistente, os instaladores Claude, Copilot, Cursor e Gemini devem criar de forma não destrutiva os arquivos ausentes de `sdd/backlog/`: `README.md`, `BACKLOG-INDEX.md` e `archive/README.md`.

---

## 3. Especificação do Utilitário de Sincronização Reversa (Sync-Back)
Criar utilitários na pasta `scripts/`:
- `sync-back-template.ps1`
- `sync-back-template.sh`

### Comportamento:
*   Aceita como parâmetro o caminho do repositório real do cliente.
*   Puxa modificações de prompts, agentes e skills testados de volta para o diretório de templates correspondente no workspace (em `pt-br/templates/` ou `en/templates/`), facilitando a manutenção e a melhoria contínua dos moldes.

---

## 4. Memórias de Engenharia (Chefia e Execução)
Para evitar perda de contexto e necessidade de repetições lógicas entre sessões, a governança SDD conta com dois diários de bordo opcionais:

### Estrutura de Arquivos nos Boilerplates:
*   **Em Português (`pt-br/sdd-boilerplate/sdd/`)**:
    - `MEMORIA-ENGENHARIA-CHEFIA.md`: Documenta orientações de estilo, convenções de código, restrições e notas de negócio ditadas pelo Engenheiro Chefe Humano. (Apenas leitura para os executores).
    - `MEMORIA-ENGENHARIA-EXECUCAO.md`: Documenta notas de dependências locais, aprendizados do compilador, hacks locais de banco de dados e bugs resolvidos. (Leitura e escrita para os executores).
*   **Em Inglês (`en/sdd-boilerplate/sdd/`)**:
    - `ENGINEERING-MEMORY-CHIEF.md`: Correspondente à memória de Chefia em Inglês.
    - `ENGINEERING-MEMORY-EXECUTION.md`: Correspondente à memória de Execução em Inglês.

### Integração nas Instruções do Agente:
As regras nos templates de kits de IA (`CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md` etc.) devem instruir explicitamente os agentes a:
1.  **Carregar Memórias**: Ler ambos os arquivos de memória no início de cada sessão para alinhar contexto.
2.  **Manter Memórias**: Exigir que o Executor IA atualize a memória de `Execução` correspondente ao término de cada tarefa, registrando bugs corrigidos, particularidades do ambiente local e lições de código aprendidas, garantindo a persistência do histórico.
3.  **Preservação**: Impedir que o Executor modifique a memória de `Chefia` sem instruções explícitas do usuário humano.

---

## 5. Otimização de Contexto e Governança de Arquivamento (SDD Archive)
Para evitar a degradação de atenção do agente devido à saturação do contexto de prompt (bloating) e para otimizar o uso de tokens, o framework adota um limite de itens nos arquivos de histórico ativos.

### Regra do Limite de 25 Itens:
*   Os arquivos principais de acompanhamento histórico e logs (`DECISION-LOG.md`, `BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md` e similares) devem manter no máximo **25 itens ativos/correntes**.
*   Itens antigos que excederem o limite de 25 registros devem ser movidos para subpastas `archive/` criadas dentro de seus respectivos diretórios:
    - `sdd/decisions/archive/`
    - `sdd/human-requests/archive/`
    - `sdd/implementation/archive/`
    - `sdd/validation/archive/`

### Estrutura de Arquivamento nos Boilerplates:
*   Cada subpasta `archive/` possui um arquivo explicativo `README.md` (no idioma correspondente) detalhando como os registros arquivados devem ser referenciados e nomeados.
*   Os arquivos de histórico ativo devem manter um link ou sumário resumido direcionando para os logs arquivados.

### Atualização via Instaladores:
*   Caso o instalador detecte que o diretório `sdd/` já existe no repositório de destino, ele deve forçar a criação das quatro subpastas `archive/` e injetar os respectivos `README.md` ausentes, garantindo que repositórios herdados recebam a governança de otimização de forma automática e não destrutiva.

---

## 6. Memory Gardening e Destilação em Skills

As memórias de execução são contexto operacional curto, não um arquivo histórico ilimitado.

### Limites e ciclo de poda

*   A memória de execução entra em atenção preventiva ao atingir **35 KB ou 100 linhas** e deve ser podada obrigatoriamente antes de exceder **50 KB ou 150 linhas**.
*   Após a poda, deve permanecer abaixo de 35 KB, mirando aproximadamente **15 KB** e preservando as **12 a 15 tarefas mais recentes** e pendências ainda ativas.
*   A memória de Chefia permanece somente leitura para executores e não pode ser podada sem instrução humana explícita.
*   O histórico removido continua recuperável pelo Git; não deve ser copiado para outro arquivo carregado automaticamente.

### Destilação e distribuição

*   Regras recorrentes, estáveis e acionáveis devem ser convertidas em skills com diretório em kebab-case e `SKILL.md` contendo `name` e `description`.
*   Contratos reutilizáveis do Conn2Flow pertencem à camada Core/Global do workspace; regras exclusivas de cliente pertencem ao repositório do projeto.
*   Projetos usados por Claude e Cursor devem disponibilizar a mesma skill em `.claude/skills/<nome>/SKILL.md` e `.cursor/skills/<nome>/SKILL.md`.
*   O procedimento completo é normatizado por `sdd/process/MEMORY-GARDENING-GUIDELINES.md` e pela skill `sdd-memory-gardening`.

---

## 7. Cursor Kit para Projetos SDD

Cada idioma deve fornecer `templates/spec-driven-project-cursor-kit/` com:

*   `.cursor/rules/sdd.mdc`: regra de projeto principal, com frontmatter MDC, `globs: ["sdd/**/*"]` e `alwaysApply: false`, anexada automaticamente ao contexto SDD.
*   `.cursor/skills/sdd-memory-gardening/SKILL.md`: procedimento carregado sob demanda.
*   `.cursorrules`: camada de compatibilidade para versões/ambientes legados do Cursor; a regra MDC é a fonte principal.

Os instaladores `install-spec-driven-cursor-kit.ps1` e `.sh` devem:

1. aceitar caminho alvo, `Force`, prefixo de agente e idioma `pt-br|en`;
2. preservar arquivos existentes quando `Force` não for informado;
3. resolver `{{AGENT_NAME}}` como `sdd-executor` ou `<prefixo>-sdd-executor` somente nos arquivos instalados;
4. criar o boilerplate SDD apenas quando `sdd/` estiver ausente;
5. preservar memórias existentes e criar os quatro diretórios `archive/`/README ausentes de forma não destrutiva.

---

## 8. Backlog de Ideias e Intake Gate

Cada boilerplate deve disponibilizar `sdd/backlog/` como incubadora de ideias do Arquiteto e do usuário humano, com:

*   `README.md`: categorias `Feature`, `Epic`, `Spike` e `Architecture`; estados `ICEBOX`, `IN-DISCUSSION` e `READY`; e regras de promoção.
*   `BACKLOG-INDEX.md`: índice ativo dos itens incubados.
*   `archive/README.md`: convenção de arquivamento dos itens removidos do índice ativo.

O backlog é deliberadamente não executável. O Executor IA é estritamente proibido de implementar diretamente um item de `sdd/backlog/`, inclusive quando seu estado for `READY`. A implementação só pode começar após promoção humana explícita para uma requisição em `sdd/human-requests/`, atualização de `CURRENT.md` e associação a um batch operacional.

Esta proteção deve constar em todos os arquivos de instruções principais dos kits Claude, Copilot, Cursor e Gemini, em PT-BR e EN.

---

## 9. Gemini Kit para Projetos SDD

Cada idioma deve fornecer `templates/spec-driven-project-gemini-kit/` com:

*   `GEMINI.md`: contexto hierárquico principal, identidade resolvida de `sdd-executor` e Intake Gate.
*   `.gemini/settings.json`: configuração de projeto do Gemini CLI, com `GEMINI.md` como arquivo de contexto e respeito a `.gitignore`/`.geminiignore`.
*   `.gemini/styleguide.md`: convenções operacionais complementares.
*   `.geminiignore`: exclusões de contexto do Gemini CLI.
*   `.aiexclude`: compatibilidade de exclusões com Gemini Code Assist.

Os instaladores `install-spec-driven-gemini-kit.ps1` e `.sh` devem aceitar target, `Force`, prefixo de agente e idioma `pt-br|en`, preservar arquivos existentes sem `Force`, resolver `{{AGENT_NAME}}`, criar o boilerplate somente quando `sdd/` estiver ausente e provisionar backlog/archives ausentes de forma não destrutiva.

---

## 10. Espectro de 3 Níveis de Autonomia de IA e Trava de Deploy

Para equilibrar controle, velocidade e segurança operacional, o framework formaliza três níveis operacionais de autonomia:

### Nível 1: SUPERVISIONADO (Padrão Mandatório / Human-in-the-Loop)
* O agente implementa alterações e roda testes sob supervisão direta no chat.
* O agente **não realiza commits automáticos nem deploys**. O desenvolvedor humano revisa os diffs no VS Code antes de consolidar.

### Nível 2: AUTÔNOMO MONITORADO (Live Autopilot / Glass-Box no Chat)
* Ativado sob solicitação explícita (`modo: autonomo_monitorado` ou equivalente).
* O agente executa a esteira completa com **Live Todo List (`[ ]` ➔ `[x]`) visível na tela em tempo real**:
  1. Criação de branch ou worktree isolada (`feat/req-XXX`).
  2. Implementação de arquivos e compilação de recursos (`c2f resources:sync`).
  3. Execução da suíte de testes unitários (`c2f db:test`).
  4. **DEPLOY EXCLUSIVAMENTE EM AMBIENTE DE TESTE LOCAL** (`c2f manager:update-all` ou Docker local).
  5. ⛔ **REGRA INVIOLÁVEL DE SEGURANÇA: NUNCA REALIZAR DEPLOY AUTOMÁTICO NO AMBIENTE DE PRODUÇÃO.**
  6. Commit semântico e push na branch da fatia.
  7. Apresentação do relatório executivo final na tela.

### Nível 3: AUTÔNOMO HEADLESS (Background Silencioso / Black-Box)
* Ativado sob solicitação explícita (`modo: autonomo_headless`).
* O agente executa toda a esteira em segundo plano isolado via MCP Hub / Git Worktree sem exibir janelas interativas, emitindo notificação de conclusão ao Arquiteto apenas ao finalizar com sucesso.

---

## 11. Codex Kit para Projetos SDD (OpenAI Codex / GPT no VS Code)

Cada idioma deve fornecer `templates/spec-driven-project-codex-kit/` com:

*   `CODEX.md`: Instruções de projeto principais com governança SDD, skills obrigatórias por marco de fluxo, Intake Gate e 3 níveis de autonomia.
*   `AGENTS.md`: Configuração multi-agente OpenAI com papéis de Arquiteto, Executor e Humano-no-Loop.
*   `.codex/settings.json`: Configuração de contexto do Codex apontando para `CODEX.md`, `AGENTS.md` e `.codex/skills/`.
*   `.codex/skills/`: Todas as 34 skills com blocos de contrato `# ⚡ Gatilho Obrigatório` / `# ⚡ Mandatory Trigger`.

Os instaladores `install-spec-driven-codex-kit.ps1` e `.sh` devem aceitar target, `Force`, prefixo de agente e idioma `pt-br|en`, preservar arquivos existentes sem `Force`, resolver `{{AGENT_NAME}}`, criar o boilerplate somente quando `sdd/` estiver ausente e provisionar backlog/archives ausentes de forma não destrutiva.

---

## 12. Skill de Inspeção Visual e Runtime Autônomo (`c2f-agent-visual-inspection`)

Para eliminar a necessidade de intervenção humana em validações visuais e de runtime:
* No ambiente local de desenvolvimento (`$_GESTOR['development-env'] === true`), a autenticação de sessão é viabilizada via `c2f auth:cookie` e relaxamento condicional da flag `Secure` de cookies.
* A inspeção headless via Chrome DevTools Protocol / Playwright é realizada via comando CLI `c2f page:inspect <url> --selector="..." --computed="..." --screenshot`, retornando status HTTP, erros de console, estilos computados e screenshots.
* As evidências de inspeção devem ser registradas diretamente em `sdd/validation/VALIDATION-CHECKLIST.md`.

---

## 13. Governança de Version Bump e Concorrência Multi-Agente

### A. Regra Mandatória de Version Bump (Cache-Busting):
* Ao alterar qualquer script JavaScript (`<id>.js`) ou CSS (`<id>.css`) no diretório `resources/`, o agente DEVE OBRIGATORIAMENTE incrementar a versão (`versao: "X.Y.Z"`) no arquivo `<id>.json` ou no manifest do módulo (`<modulo>.json`).
* Isso assegura a invalidação imediata de cache no navegador após `c2f resources:sync`.

### B. Regras Mandatórias de Concorrência Multi-Agente:
1. **Proibição Absoluta de `git add -A` e `git commit -a`**:
   - O agente deve executar `git add <caminho-1> <caminho-2>` listando estritamente os arquivos tocados no seu lote aprovado.
2. **Reserva e Releitura Atômica de `req-XXX.md`**:
   - O agente deve reler `sdd/human-requests/` imediatamente antes de criar arquivos para evitar colisão e sobrescrita de números de requisição.

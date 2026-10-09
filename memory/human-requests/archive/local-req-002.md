# REQ-002: Memórias de Engenharia e Migrador de Estruturas de Legado nos Instaladores

## 1. Problema
Os engenheiros chefes humanos frequentemente precisam repetir as mesmas preferências lógicas, convenções e restrições técnicas em novas sessões de IA. Da mesma forma, os engenheiros executores de IA perdem o contexto de hacks locais, depurações e lições aprendidas entre conversas. Precisamos de uma infraestrutura persistente e bilingue para estes diários de bordo (Memórias de Engenharia).

Além disso, existem repositórios legados (como o Lumix/Photon) que utilizam a pasta `project/<frente>/` para governar o SDD local em vez de `/sdd` na raiz. Precisamos que o instalador do kit seja capaz de detectar e migrar de forma automática estas estruturas legadas para o novo padrão.

---

## 2. Ajustes Requeridos

### A. Criação dos Templates de Memória nos Boilerplates
Criar arquivos base nos dois idiomas para separar as responsabilidades:

1.  **Em Português (`pt-br/sdd-boilerplate/sdd/`)**:
    *   [NEW] `MEMORIA-ENGENHARIA-CHEFIA.md`: Reservada ao Engenheiro Chefe Humano. Contém preferências de design, restrições e regras de negócio. (Apenas leitura para executores).
    *   [NEW] `MEMORIA-ENGENHARIA-EXECUCAO.md`: Reservada aos agentes de execução IA. Contém aprendizados do compilador, hacks locais e bugs resolvidos. (Escrita e leitura para executores).
2.  **Em Inglês (`en/sdd-boilerplate/sdd/`)**:
    *   [NEW] `ENGINEERING-MEMORY-CHIEF.md`
    *   [NEW] `ENGINEERING-MEMORY-EXECUTION.md`

*(Nota: Insira um pequeno texto de introdução/placeholders em cada um dos arquivos descrevendo o propósito de cada um, para guiar o usuário e as IAs).*

### B. Atualização de Regras e Instruções dos Agentes
Nos templates dos kits baseados em especificação (`spec-driven` Claude e Copilot, tanto em `pt-br/` quanto em `en/`), atualize as regras de sistema (como `CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md`, `.github/instructions/project-sdd.instructions.md`):

1.  **Regra de Leitura Mínima**: Adicionar a obrigatoriedade de ler **ambas** as memórias de engenharia (`Chefia` e `Execução` no idioma correspondente) no início de qualquer sessão de trabalho, antes de alterar specs ou código.
2.  **Regra de Manutenção do Diário (Escrita)**: Instruir as IAs executoras a atualizarem compulsoriamente a memória de `Execução` com novos aprendizados lógicos ou depurações que surgirem no decorrer de suas tarefas, mantendo o histórico cross-session ativo.

### C. Automatização do Migrador de Legado nos Instaladores
Atualizar os quatro scripts em `scripts/` (`install-spec-driven-*.ps1` e `install-spec-driven-*.sh`):

1.  **Detecção de Estrutura Legada**:
    - O script deve varrer o repositório alvo em busca de diretórios de governança antigos: ex. se existir uma pasta `project/` contendo uma subpasta (como `project/atlas-fotobiomodulacao/`) que possua o arquivo `00-START-HERE.md` ou `README.md` com marcações de especificação.
2.  **Migração Física Automática**:
    - Se a pasta legada for encontrada e a pasta `/sdd` na raiz estiver ausente:
      - O instalador deve **mover/renomear** fisicamente a pasta legada (ex: `project/atlas-fotobiomodulacao/`) para a raiz `/sdd/`.
      - Remover a pasta `project/` se ela ficar vazia após a movimentação.
3.  **Atualização de Referências Textuais (Refactoring de Configs)**:
    - Se a migração ocorrer, o script deve fazer uma busca e substituição textual em todos os arquivos de configuração sendo copiados ou já existentes em `.github/` e `.claude/` do destino, substituindo referências antigas (ex: `project/atlas-fotobiomodulacao/` ou `project/<frente>/`) para o novo caminho `/sdd/`.
4.  **Criação das Memórias**:
    - Se a pasta `/sdd` foi migrada ou criada do zero, certificar-se de copiar os arquivos de memórias de engenharia correspondentes ao idioma selecionado (`-Language` / `--language`), **sem nunca sobrescrever** arquivos de memória que o usuário porventura já tenha criado no local.

---

## 3. Arquivos Impactados
- Todos os instaladores de kits SDD em `scripts/`
- Arquivos de regras (`CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md` etc.) nos templates em `pt-br/` e `en/`
- Criação dos novos templates de memória em `pt-br/sdd-boilerplate/sdd/` e `en/sdd-boilerplate/sdd/`

---

## 4. Plano de Validação & Implantação
Após atualizar os templates e testar localmente em diretórios de simulação (`temp/`), o Executor IA deverá rodar o instalador atualizado em lote direcionando para cada um dos seguintes repositórios reais no computador do usuário para realizar o setup oficial:

1.  **Repositório Conn2Flow Core**:
    - **Caminho**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`
    - **Ação**: Rodar o instalador do kit SDD (copiando os templates de memória para a pasta `sdd/` existente).
2.  **Repositório Conn2Flow Nexus**:
    - **Caminho**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-nexus`
    - **Ação**: Rodar o instalador do kit SDD (copiando os templates de memória para a pasta `sdd/` existente).
3.  **Repositório Lumix (Photon)**:
    - **Caminho**: `C:\Users\otavi\OneDrive\Documentos\GIT\lumix`
    - **Ação**: Rodar o instalador do kit SDD. O script deve **detectar automaticamente** a pasta `project/atlas-fotobiomodulacao/`, movê-la para a raiz `sdd/`, apagar a pasta `project/` e atualizar as configurações em `.github/`.
4.  **Repositório do Workspace**:
    - **Caminho**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
    - **Ação**: Copiar manualmente os templates criados em `pt-br/sdd-boilerplate/sdd/` para a nossa pasta `sdd/` local (ou rodar o script nela).

*Nota: Garanta que todas as execuções preservem quaisquer anotações de memórias preexistentes e mantenham as árvores de trabalho limpas para revisão do usuário.*

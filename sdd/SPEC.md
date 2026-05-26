# SPEC.md: Especificação Normativa dos Kits e Instaladores

Este documento reúne a especificação técnica e de arquitetura dos templates e scripts contidos no repositório `conn2flow-ai-workspace`. Ele serve como especificação normativa única e guia de design para os scripts instaladores e estrutura bilingue.

---

## 1. Organização dos Idiomas na Raiz
A raiz do repositório deve conter duas pastas de idiomas independentes, contendo as versões localizadas dos arquivos de templates e boilerplates:
*   `pt-br/`: Contém os recursos em Português do Brasil.
*   `en/`: Contém os recursos em Inglês americano.

Cada pasta de idioma deve ter a seguinte subestrutura interna:
*   `templates/`:
    - `spec-driven-project-claude-kit`: Configurações de IA do Claude Code para projetos SDD.
    - `spec-driven-project-copilot-kit`: Configurações de IA do GitHub Copilot para projetos SDD.
    - `private-project-claude-kit`: Configurações de IA do Claude Code para repositórios privados sobrepostos a um core.
    - `private-project-copilot-kit`: Configurações de IA do GitHub Copilot para repositórios privados sobrepostos a um core.
*   `sdd-boilerplate/`:
    - `sdd/`: A estrutura de pasta e arquivos markdown inicial padrão do SDD para novos projetos, completamente traduzidos no respectivo idioma da pasta raiz.

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

---

## 3. Especificação do Utilitário de Sincronização Reversa (Sync-Back)
Criar utilitários na pasta `scripts/`:
- `sync-back-template.ps1`
- `sync-back-template.sh`

### Comportamento:
*   Aceita como parâmetro o caminho do repositório real do cliente.
*   Puxa modificações de prompts, agentes e skills testados de volta para o diretório de templates correspondente no workspace (em `pt-br/templates/` ou `en/templates/`), facilitando a manutenção e a melhoria contínua dos moldes.

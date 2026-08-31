# Handoff do Macro-Arquiteto — REQ-040 / BATCH-042

* **Status**: `READY_FOR_EXECUTION`
* **Emissor**: Macro-Arquiteto (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / VS Code Extension)
* **Data**: 2026-08-31
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) + `conn2flow` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`)
* **Requisição Ativa**: [req-040.md](../human-requests/req-040.md)
* **Topologia**: `triade` (Arquiteto ➔ Executor ➔ Revisor ➔ Humano)
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-040** foi aberta para propagar globalmente a regra inviolável de **Identificação Mandatória de Repositório e Caminho Absoluto nos Prompts de Handoffs de Agentes** em todo o ecossistema Conn2Flow:

### 1. No Repositório Core (`conn2flow` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`)
- Atualizar `conn2flow/AGENTS.md`:
  * Adicionar a Regra Inviolável 7:
    > `7. **Identificação de Repositório em Handoffs e Prompts**: Sempre explicitar o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: conn2flow em c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow) nas mensagens de acionamento para outros agentes.`
- Atualizar `conn2flow/GEMINI.md`:
  * Adicionar a Regra Inviolável 6:
    > `6. **Identificação de Repositório em Prompts para Agentes**: Sempre que o Macro-Arquiteto preparar mensagens para o usuário repassar a agentes executores ou revisores, DEVE incluir o identificador e o caminho absoluto da raiz do repositório alvo para evitar confusão de contexto em sessões com múltiplos repositórios abertos.`

### 2. Na Skill Canônica de Governança SDD (`sdd-workflow`)
- Atualizar o arquivo `SKILL.md` da skill `sdd-workflow` em ambos os repositórios (`conn2flow-ai-workspace/.gemini/skills/sdd-workflow/SKILL.md` e no Core):
  * Adicionar a seção normativa sobre identificação obrigatória de repositório nos handoffs.
- No repositório Core (`conn2flow`), rodar o script de sincronização oficial das 36 skills:
  ```bash
  php cli/c2f.php ai:sync
  ```
  Isso sincronizará a skill para todos os diretórios de agentes suportados (`.gemini/`, `.codex/`, `.claude/`, `.github/`, `.cursor/`).

### 3. Nos Boilerplates de Novos Projetos Satélites
- Verificar e atualizar os templates/boilerplates de `AGENTS.md` e `GEMINI.md` utilizados pelo comando `c2f project:scaffold` ou pela extensão do VS Code (`vscode-extension/src/providers/projectsManager.ts`), garantindo que qualquer novo projeto satélite já nasça com a regra incluída.

### 4. Validação
- Executar os testes em `vscode-extension/` (`npm test`) para garantir que nenhuma regressão foi introduzida.
- Verificar integridade dos arquivos e não usar `git add .` ou `git add -A`.

---

## 📝 Protocolo de Execução
1. Renderize a sua Live Todo List (`[ ]` ➔ `[x]`).
2. Implemente as sincronizações nos arquivos indicados.
3. Ao concluir, atualize `CURRENT-HANDOFF.md` e `CURRENT.md` para `READY_FOR_REVIEW` para que o Revisor Técnico faça a auditoria.

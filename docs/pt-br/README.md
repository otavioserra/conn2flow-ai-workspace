# 📚 Central de Documentação Técnica (Português) — Conn2Flow AI Workspace

Bem-vindo à documentação técnica em Português do Brasil da infraestrutura, governança e metodologia de agentes de Inteligência Artificial do Conn2Flow.

---

## 🧭 Índice de Manuais

1. **[Guia Rápido do Core CLI, MCP Hub & Worktrees](GUIA-RAPIDO-CLI-E-MCP.md)**:
   - Comandos multiplataforma do CLI `c2f` (Git Bash, PowerShell, CMD).
   - Como subir o Servidor MCP Hub no Docker com auto-start.
   - Como criar Git Worktrees para execução de múltiplos agentes concorrentes.

2. **[Playbook de Orquestração Multi-Agentes & Alternância entre IDEs](PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md)**:
   - Como despachar tarefas automaticamente via MCP Hub sem copiar e colar prompts.
   - Como alternar dinamicamente entre Claude Code, Cursor, Copilot e Antigravity sem perda de contexto.
   - Como executar diretamente com subagentes locais no Antigravity.
   - O espectro dos 3 níveis de autonomia na prática.

3. **[Arquitetura de Agente Duplo (Double Agent SDD)](ARQUITETURA-AGENTE-DUPLO.md)**:
   - Divisão de responsabilidades entre o Macro-Arquiteto (Antigravity/Gemini) e os Micro-Executores (Claude Code, Cursor, Copilot).
   - Regras de fronteira de escrita (Ping-Pong Boundary), memória de engenharia e ciclo de vida do SDD.

4. **[Catálogo Completo de Skills](CATALOGO-DE-SKILLS.md)**:
   - Detalhamento das 25 Core Skills do Framework (`c2f-*`) e das 7 SDD Workflow Skills.
   - Gatilhos de ativação, regras mandatórias e convenções de código.

5. **[Roteiro de Evolução Futura & Backlog Estratégico](ROTEIRO-EVOLUCAO-FUTURA.md)**:
   - Centralização de Skills via Servidor MCP (*Model Context Protocol*).
   - Esteira de CI/CD com loop de auto-cura (*Self-Healing Tests*).
   - Diretrizes para o Curso de IA (do Leigo ao Avançado).

---

🌐 *Looking for English documentation? Access the [English Documentation Hub](../en/README.md).*

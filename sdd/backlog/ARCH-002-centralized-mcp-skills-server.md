# ARCH-002: Centralização de Skills via Servidor MCP (Model Context Protocol)

*   **Status**: `ICEBOX`
*   **Tipo**: Arquitetura / Infraestrutura de IA
*   **Data de Registro**: 2026-08-18
*   **Solicitante**: Chief Architect / User
*   **Prioridade**: Média (Evolução de Escala)

---

## 🎯 Contexto e Justificativa

Atualmente, o ecossistema mantém 31 skills espelhadas fisicamente em 4 formatos (`.claude/skills/`, `.cursor/skills/`, `.github/skills/`, `.gemini/skills/`) nos idiomas `pt-br` e `en` espalhados por múltiplos repositórios.

Embora scripts de sincronização resolvam a paridade, criar um **Servidor MCP central do Conn2Flow** permitirá que agentes em qualquer IDE ou CLI conectem via protocolo padrão e consultem as skills, regras de arquitetura e documentação dinamicamente direto da fonte, eliminando a redundância de centenas de arquivos físicos.

---

## 📋 Escopo Futuro (Checklist de Implementação)

- [ ] Implementar um servidor MCP local leve em TypeScript/Node ou Python no workspace.
- [ ] Expor endpoints MCP: `resources/list`, `skills/get`, `docs/search`, `rules/validate`.
- [ ] Configurar conectores MCP no Claude Code (`claude mcp add`), Cursor IDE, e Gemini Antigravity.
- [ ] Manter fallback estático para ambientes CI/CD sem servidor MCP ativo.

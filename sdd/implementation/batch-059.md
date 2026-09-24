# BATCH-059 — Migração para `.gemini/config.json` e Aderência ao Antigravity v2.16+

* **Requisição**: [req-057.md](../human-requests/req-057.md)
* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-09-24
* **Data de Conclusão**: 2026-09-24
* **Executor**: Antigravity (c2f-executor-agent)

---

## 📋 Live Todo List

- [x] Ler `sdd/human-requests/CURRENT.md` e `sdd/human-requests/req-057.md`
- [x] Migrar `.agents/mcp_config.json` para `.gemini/mcp_config.json` e remover pasta `.agents/`
- [x] Criar `.gemini/config.json` no workspace central
- [x] Atualizar `GEMINI.md` e `AGENTS.md` com `.gemini/config.json` e `/boost`
- [x] Atualizar templates dos kits em `templates/` e propagar `.gemini/config.json` para os 4 satélites
- [x] Executar suíte de testes `npm test`: **114/114 passed** ✅
- [x] Criar `sdd/implementation/batch-059.md`, atualizar checklist e emitir recibo `BATCH-059-executor-receipt.json`

---

## 📊 Entregas

### 1. Migração do MCP e Eliminação de `.agents/`

| Ação | Resultado |
|---|---|
| `.agents/mcp_config.json` → `.gemini/mcp_config.json` | ✅ Migrado (formato simplificado, só `mcpServers`) |
| `conn2flow-ai-workspace/.agents/` removido | ✅ Removido |
| `conn2flow/.agents/` removido | ✅ Removido |
| Demais satélites (nunca tiveram `.agents/`) | ✅ Confirmado |

### 2. `.gemini/config.json` — Criado em 5 Repositórios

| Repositório | `config.json` | `mcp_config.json` |
|---|---|---|
| `conn2flow-ai-workspace` (Matriz) | ✅ | ✅ (MCP Hub) |
| `conn2flow` | ✅ | — |
| `conn2flow-site` | ✅ | — |
| `lumix` | ✅ | — |
| `transformamp` | ✅ | — |

### 3. Documentação de Governança Atualizada

| Arquivo | Alterações |
|---|---|
| `GEMINI.md` | Seção "Configuração por Projeto" adicionada; `/boost` em hooks; nota de descontinuação de `.agents/` |
| `AGENTS.md` | Regra 8 (`/boost`); Regra 9 (`.gemini/config.json` como canônico) |

Propagado para os 4 satélites e templates (gemini-kit PT-BR e EN + codex-kit PT-BR e EN).

### 4. Templates Atualizados

| Template | `config.json` | `GEMINI.md` | `AGENTS.md` |
|---|---|---|---|
| `pt-br/spec-driven-project-gemini-kit` | ✅ | ✅ | — |
| `en/spec-driven-project-gemini-kit` | ✅ | ✅ | — |
| `pt-br/spec-driven-project-codex-kit` | — | — | ✅ |
| `en/spec-driven-project-codex-kit` | — | — | ✅ |

---

## 🔬 Evidências de Validação

### npm test
```
# tests 114
# pass 114
# fail 0
# duration_ms 168.16
```

### Verificação de estado final
```
conn2flow-ai-workspace | .agents=False | config.json=True | mcp_config=True
conn2flow              | .agents=False | config.json=True | mcp_config=False
conn2flow-site         | .agents=False | config.json=True | mcp_config=False
lumix                  | .agents=False | config.json=True | mcp_config=False
transformamp           | .agents=False | config.json=True | mcp_config=False
```

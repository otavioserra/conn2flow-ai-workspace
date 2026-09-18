# BATCH-058 — Armadilhas 7/8/9 e Sincronização Global de Skills

* **Requisição**: [req-056.md](../human-requests/req-056.md)
* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-09-18
* **Data de Conclusão**: 2026-09-18
* **Executor**: Antigravity (c2f-executor-agent)

---

## 📋 Live Todo List

- [x] Ler `sdd/human-requests/CURRENT.md` e `sdd/human-requests/req-056.md`
- [x] Atualizar `c2f-shell-and-windows-traps/SKILL.md` na matriz central com as 9 armadilhas
- [x] Espelhar as 39 skills canônicas em `.claude/`, `.gemini/`, `.codex/`, `.cursor/` e `.github/` no workspace central (156 cópias)
- [x] Sincronizar as 39 skills canônicas em todos os diretórios de kit dos 4 satélites (`conn2flow`, `conn2flow-site`, `lumix`, `transformamp`) preservando 35 skills locais (780 cópias)
- [x] Executar varredura criptográfica MD5 comprovando **zero divergências** (975 arquivos verificados)
- [x] Executar suíte de testes `npm test`: **114/114 passed** (0 fail, 180ms)
- [x] Criar `sdd/implementation/batch-058.md`, atualizar checklist e emitir recibo `BATCH-058-executor-receipt.json`

---

## 📊 Entregas

### 1. Skill `c2f-shell-and-windows-traps/SKILL.md` — Expandida de 6 para 9 Armadilhas

| # | Armadilha | Status |
|---|---|---|
| 1 | Conversão Automática de Caminhos MSYS | ✅ Existente |
| 2 | `curl` com `<` em formulários | ✅ Existente |
| 3 | Python Heredocs e Sequências de Escape | ✅ Existente |
| 4 | Asserts com Falha Silenciosa | ✅ Existente |
| 5 | Formulários `multipart/form-data` com Gatilhos Ocultos | ✅ Existente |
| 6 | Paralelismo Concorrente em Compilação (Supressão de Warnings) | ✅ Existente |
| 7 | `rsync: dup() in/out/err failed` — Pareamento cwRsync/SSH | ✅ **NOVA** |
| 8 | Sequências ANSI em CLI (Cores Quebram Parsers) | ✅ **NOVA** |
| 9 | `cd` antes de `sudo -u` em Tenants SSH Restritos (HestiaCP) | ✅ **NOVA** |

### 2. Propagação Global — 39 Skills × 5 Kits × 5 Repositórios

| Repositório | Skills Canônicas | Skills Locais Preservadas |
|---|---|---|
| `conn2flow-ai-workspace` | 39 × 5 = 195 | — (é a matriz) |
| `conn2flow` | 39 × 5 = 195 | Core-specific skills |
| `conn2flow-site` | 39 × 5 = 195 | `conn2flow-site-social-publisher` etc. |
| `lumix` | 39 × 5 = 195 | `lumix-fastapi-backend`, `lumix-tailwind-v4` etc. |
| `transformamp` | 39 × 5 = 195 | `transformamp-*` etc. |

### 3. Auditoria Criptográfica MD5

```
Audit complete: 975 files checked, 0 divergences found.
```

---

## 🔬 Evidências de Validação

### npm test
```
# tests 114
# pass 114
# fail 0
# duration_ms 180.54
```

### Armadilha 7 — Exemplo de Diagnóstico
Commit de referência: `conn2flow` `78206416` (BATCH-168/175). Erro `dup() in/out/err failed` (exit 12) causado por mistura cwRsync (Cygwin) + Git Bash SSH (MSYS2). Resolvido com pareamento mandatório + `-T` + `/cygdrive/c/`.

### Armadilha 8 — Exemplo de Diagnóstico
Tailwind CLI v4.3.3 emitia `\x1b[34m` na saída capturada por `proc_open()`, quebrando `version_compare()`. Resolvido com `NO_COLOR=1` + regex de higienização.

### Armadilha 9 — Exemplo de Diagnóstico
Deploy SSH em HestiaCP falhava com `Permission denied` no `cd /home/tenant/...` antes de `sudo -u tenant`. Resolvido encapsulando em `sudo -u tenant sh -c 'cd ... && ...'`.

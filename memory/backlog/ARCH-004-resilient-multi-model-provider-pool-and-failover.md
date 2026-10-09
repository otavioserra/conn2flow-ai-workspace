# ARCH-004: Failover Multi-Modelo Resiliente e Pool de Provedores de IA

* **ID**: `ARCH-004`
* **Tipo**: Arquitetura & Orquestração Multi-Agente
* **Status**: `ICEBOX` (Aguardando planejamento / promoção humana)
* **Data de Criação**: 2026-08-31
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Contexto**: Orquestrador MCP Hub (`conn2flow-hub`) e Tríade de Agentes

---

## 🎯 Objetivo

Implementar mecanismo de **failover resiliente de provedores de IA e substituição a quente (hot-swapping)** na Tríade de Agentes do Conn2Flow. Se a cota de tokens, créditos ou rate-limit de um modelo (ex: OpenAI GPT-5 / Claude 3.7 / Gemini Pro) se esgotar durante a execução de uma tarefa, o orquestrador do MCP Hub direciona automaticamente a tarefa para o próximo provedor configurado no pool, retomando a execução exatamente do último checkpoint persistido em disco (`CURRENT.md`, `batch-YYY.md`, `[x]` na Live Todo List).

---

## 💡 Princípios de Design

1. **Estado Desacoplado do Provedor de IA**:
   - Todo o progresso do lote é persistido deterministamente em artefatos de controle Git e no MCP Hub (`tasks/`, `completions/`, `CURRENT.md`).
   - Nenhum estado crítico reside exclusivamente na memória volátil da sessão de chat da IA.
2. **Pool de Modelos com Prioridade e Fallback Automático**:
   - Configuração de lista encadeada de provedores (ex: `[ "openai/gpt-5", "anthropic/claude-3.7-sonnet", "google/gemini-2.5-pro" ]`).
   - Ao capturar erros `429 (Too Many Requests / Rate Limit)` ou `402 / Insufficient Quota`, o orquestrador tenta o próximo modelo disponível sem abortar o lote.
3. **Continuidade Zero-Friction para o Desenvolvedor**:
   - Se o desenvolvedor trocar manualmente de janela ou provedor no chat, o novo agente lê o lote ativo e a Todo List (`[ ]` vs `[x]`) e continua sem necessidade de reexplicar o contexto.

---

## 📋 Escopo Futuro (Quando Promovido a Requisição)

1. **MCP Hub Router (`mcp-hub/src/router.ts`)**:
   - Suporte a múltiplos backends LLM para tarefas headless.
   - Detecção automática de esgotamento de quota e chave de API com comutação de rota.
2. **Persistência Incremental de Checkpoints**:
   - Gravação de sub-recibos intermediários no MCP Hub (`tasks/<req-id>-checkpoint.json`) para fatias longas.
3. **Skills de Auto-Boot com Suporte a Failover**:
   - Diretrizes normativas nas personas (`c2f-executor-agent`, `c2f-reviewer-agent`) para detecção e continuidade imediata a partir de checkpoints parciais.

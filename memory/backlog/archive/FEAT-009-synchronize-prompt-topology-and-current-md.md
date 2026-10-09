# FEAT-009 — Sincronização Dinâmica de Topologia e Autonomia no Prompt do Executor e no CURRENT.md

* **Status**: `ICEBOX`
* **Tipo**: Interface / Governança de Agentes / DX
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Repositório Alvo**: `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Nos `🎛️ Controles Principais` do Dev Tools, o usuário pode alternar a topologia ativa (`dupla` vs `triade`) e o nível de autonomia (`supervisionado`, `autonomo_monitorado`, `autonomo_headless`).

Contudo, ao acionar o botão **`📋 Copiar Prompt do Executor`**, o gerador de prompts embute o conteúdo bruto do arquivo `sdd/human-requests/CURRENT.md` do repositório selecionado. Caso esse arquivo contenha um cabeçalho textual antigo (ex: `**Topologia:** Tríade Multi-Agente Concorrente`), o prompt gerado entra em conflito com o modo selecionado pelo operador na interface do VS Code.

---

## 📋 Escopo Proposto

1. **Injeção Dinâmica no Cabeçalho de Identificação**:
   - No `agentPromptPolicy.ts` e `AgentBridgeManager.ts`, adicionar os campos `{topology, autonomy}` selecionados ativamente no painel aos parâmetros de template do prompt.
   - O cabeçalho de identificação passa a declarar explicitamente:
     * `Topologia Selecionada: Agente Duplo (Arquiteto/Revisor + Executor)` ou `Tríade Multi-Agente`
     * `Nível de Autonomia: supervisionado`
2. **Sincronização Bidirecional no `CURRENT.md`**:
   - Ao trocar a topologia/autonomia na interface ou ao disparar/copiar o prompt, sincronizar automaticamente as linhas `* **Topologia de Agentes**: ...` e `* **Nível de Autonomia**: ...` no `CURRENT.md` do repositório ativo, eliminando discrepâncias documentais entre o arquivo em disco e a IDE.
3. **Testes Unitários**:
   - Criar casos de teste em `agentPromptPolicy.test.cjs` validando que a topologia configurada na extensão sobrepõe metadados divergentes e é refletida corretamente na saída do prompt copiado.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

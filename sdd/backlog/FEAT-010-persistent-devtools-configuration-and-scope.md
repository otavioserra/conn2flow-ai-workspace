# FEAT-010 — Persistência Externa de Configurações, Escopo e Topologia do Dev Tools

* **Status**: `ICEBOX`
* **Tipo**: Persistência / UX / Confiabilidade
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Repositório Alvo**: `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Atualmente, ao fechar o VS Code, trocar de workspace ou reiniciar a máquina, as opções selecionadas pelo operador nos Controles Principais (como a topologia de agentes `dupla`, o modo de autonomia `supervisionado` e o escopo do repositório/projeto alvo ativo) são reinicializadas para os valores padrão em memória (como `triade`).

Isso gera retrabalho constante e pode causar erros de despacho caso o operador execute uma ação sem notar que a topologia voltou para o padrão.

---

## 📋 Escopo Proposto

1. **Arquivo de Configuração Persistente Externa**:
   - Centralizar o estado em um arquivo JSON persistente no diretório de dados do usuário (ex: `~/.conn2flow/devtools-config.json` ou `.conn2flow/config.json` na raiz da workspace).
   - Armazenar o estado estruturado:
     ```json
     {
       "activeScope": "conn2flow-site",
       "agentTopology": "dupla",
       "autonomyMode": "supervisionado",
       "lastUpdated": "2026-09-01T14:47:00Z"
     }
     ```
2. **Ciclo de Vida Otimizado (Performance Zero-Overhead)**:
   - **No Boot (Startup)**: Leitura síncrona/inicial única no `activate()` da extensão para restaurar imediatamente o escopo, a topologia e a autonomia salvos.
   - **Na Alteração (Event-Driven Write)**: Gravação assíncrona disparada somente no evento de clique/seleção de um controle pelo usuário, eliminando polling e sem qualquer impacto em performance.
3. **Sincronização com `vscode.workspaceState` / `globalState`**:
   - Garantir coerência entre o storage do VS Code e o arquivo externo de configuração.
4. **Testes Unitários**:
   - Cobrir leitura, gravação e fallback seguro para padrões em caso de arquivo ausente ou corrompido.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

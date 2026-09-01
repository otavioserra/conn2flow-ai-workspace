# FEAT-008 — Feedback Visual Contínuo e Barra de Progresso em Ações de Longa Duração

* **Status**: `ICEBOX`
* **Tipo**: Usabilidade / UX / Feedback Visual
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Repositório Alvo**: `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Durante a execução de ações de longa duração na extensão (como "Salvar e Executar Release", disparo de scripts no terminal, acompanhamento do GitHub Actions via `gh run watch`, compilações ou migrações), o feedback na barra de status por vezes expira rapidamente ou a interface parece estática.

Isso cria a falsa impressão de travamento ou congelamento da tela ("freeze"), quando na verdade o processo em background ainda está em andamento.

---

## 📋 Escopo Proposto

1. **Item Persistente na Status Bar (`StatusBarItem`)**:
   - Manter um indicador animado contínuo com spinner `$(sync~spin)` enquanto a operação assíncrona estiver ativa.
   - Atualizar a mensagem dinamicamente em cada etapa:
     * `$(sync~spin) Conn2Flow: Preparando release...`
     * `$(sync~spin) Conn2Flow: Executando release no terminal...`
     * `$(sync~spin) Conn2Flow: Aguardando workflow do GitHub Actions...`
     * `$(check) Conn2Flow: Release concluído com sucesso!` (por 3s após conclusão).
2. **Integração com `vscode.window.withProgress`**:
   - Exibir notificação de progresso não-intrusiva com título e mensagem de cancelamento/status.
3. **Estado de Loading nos Botões do Webview**:
   - Desabilitar temporariamente o botão "Salvar e Executar Release" em `ActionFormPanel` após o clique, exibindo spinner inline para evitar múltiplos cliques acidentais.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

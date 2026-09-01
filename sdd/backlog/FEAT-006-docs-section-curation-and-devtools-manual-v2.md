# FEAT-006 — Curadoria da Seção de Documentação, Remoção de Duplicatas e Manual Dev Tools v2

* **Status**: `ICEBOX`
* **Tipo**: Documentação / Limpeza de UI / UX
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-01
* **Repositório Alvo**: `conn2flow-ai-workspace` (`vscode-extension` e docs)

---

## 🎯 Contexto e Motivação

1. **Manual do Painel Dev Tools Desatualizado**: O documento `docs.panel` (`conn2flow.docs.openDevToolsGuide`) foi escrito na primeira versão da extensão e não reflete as novas seções, o HubTaskWatcher, o novo fluxo de release em duas fases nem as ações de IA unificadas.
2. **Guia de Publicação no Marketplace Fora de Contexto**: O item `docs.marketplace` (`conn2flow.docs.openMarketplaceGuide`) é uma instrução de empacotamento interna de interesse apenas do mantenedor durante releases de tooling, poluindo a navegação diária dos desenvolvedores.
3. **Duplicata de Configuração**: O atalho de seleção de topologia/autonomia (`agents.selectMode`) já foi centralizado nos `🎛️ Controles Principais` e deve ser removido da seção de `📚 Documentações & Configurações`.

---

## 📋 Escopo Proposto

1. **Reescrita do Manual Dev Tools v2**:
   - Atualizar a documentação do Dev Tools refletindo a árvore ergonômica com emojis, Controles Principais, Watcher, bridge de agentes e release manager.
2. **Remoção de Itens da Árvore**:
   - Remover o comando `docs.marketplace` da visualização da árvore na extensão (mantendo o arquivo markdown no repositório para consulta técnica).
   - Remover a duplicata `agents.selectMode` de `Documentações & Configurações`.
3. **Revisão dos Guias**:
   - Validar a precisão técnica do Guia Rápido CLI MCP, Playbook de Orquestração SDD e Arquitetura de Agentes.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

---
id: ARCH-014
title: Integração da Extensão VS Code com MDD Client e MDD Hub — Suporte Dual a Modo Desenvolvedor e Modo Cliente
status: PROMOTED
date: 2026-10-09
author: architect
target_repo: conn2flow-ai-workspace
summary_short: Integração da extensão VS Code com CLI Python e Hub: botões 1-click para mdd index/meta e painel dual client/developer
summary_medium: Conecta a interface gráfica Conn2Flow Dev Tools aos comandos CLI do MDD Client e API do Hub, oferecendo modo público para clientes e modo avançado para desenvolvedores.
---

# ARCH-014: Integração da Extensão VS Code com MDD Client e MDD Hub — Suporte Dual a Modo Desenvolvedor e Modo Cliente

- **Tipo**: Interface / Extensão VS Code / Arquitetura
- **Status**: `PROMOTED` (promovido para planejamento da próxima requisição de implementação em 2026-10-09)
- **Origem**: Humano-no-Loop (Engenheiro Chefe)
- **Data de Criação**: 2026-10-09

---

## 🎯 Contexto & Motivação

Com o surgimento das duas aplicações em Python do ecossistema MDD:
1. **MDD Client CLI & Daemon** (`ARCH-010`): Ferramenta distribuída para qualquer usuário/projeto gerenciar a pasta `memory/`, sincronizar skills e automatizar podas.
2. **MDD Hub & Documentation Watcher** (`ARCH-011`): Servidor central de auto-evolução, ingestão de relatórios e scraping contínuo de novidades das IAs.

A extensão oficial **Conn2Flow Dev Tools** (`vscode-extension/`) deve evoluir para ser a interface visual nativa que conecta o desenvolvedor a ambas as camadas, operando em **dois modos distintos** com degradação graciosa de acesso.

---

## 📋 Escopo da Arquitetura

### 1. Dual-Mode na Extensão do VS Code

A extensão detectará o contexto do workspace e as credenciais do usuário para disponibilizar dois modos de operação na barra lateral e na Command Palette:

#### Modo A: Modo Cliente / Usuário Geral (`mdd.mode: "client"`)
* **Disponibilidade**: Aberto a qualquer usuário, em qualquer projeto (web, mobile, backend, etc.).
* **Funcionalidades**:
  - Injetar memória MDD no projeto ativo via botão na interface (`mdd init`).
  - Painel de status da pasta `memory/` (tamanho de arquivos, quantidade de itens ativos, conformidade com a Regra dos 10).
  - Execução visual de sincronização de skills locais (`mdd sync`).
  - Execução manual ou automática de compactação (`mdd compact`).
  - Botão de envio de feedback/telemetria para o Hub (`mdd report`).

#### Modo B: Modo Desenvolvedor / Core (`mdd.mode: "developer"`)
* **Disponibilidade**: Ativado quando o repositório aberto é o repositório core/matriz (`conn2flow-ai-workspace`) ou quando o usuário possui credenciais autenticadas do Hub.
* **Funcionalidades**:
  - Painel de controle do **MDD Hub**: status do Documentation Watcher, fila de scrapers de IA e logs de ingestão de relatórios externos.
  - Seleção do modo de autonomia de evolução (`headless`, `monitored`, `reviewer`).
  - Aprovação visual de propostas de novas skills, regras ou armadilhas geradas pelos scrapers.
  - Disparo de sincronização global canônica para os repositórios satélites.

### 2. Controle de Acesso e Degradação Graciosa
* Se o usuário não tiver permissão de escrita ou acesso ao repositório matriz privado, a interface oculta os controles de governança do Hub e exibe as funcionalidades públicas do Client.
* Suporte a desenvolvedores que clonam o repositório público: eles podem rodar o Hub localmente em seu próprio ambiente se desejarem.

### 3. Comunicação IPC / CLI
* A extensão interage com o `mdd` (CLI Python) e com o Hub via subprocessos rápidos ou sockets locais (API REST/FastAPI em `localhost`), com fallback para execução direta de comandos CLI formatados em JSON.

# 🚀 Conn2Flow Dev Tools — Extensão Oficial do VS Code

Painel visual e interativo integrado à barra lateral do VS Code para acelerar o desenvolvimento, monitoramento e governança do ecossistema **Conn2Flow**.

---

## 🌟 Recursos Principais

### 1. 🏛️ MDD & Planejamento
Acesso à memória MDD (`memory/`, com fallback para `sdd/` em projetos legados) do escopo realmente selecionado, com preferência persistida, preview MPE controlado, navegadores de requisições/lotes/decisões/handoffs e backlog filtrável com alerta de divergência.

### 2. 🐳 Docker & Logs em Tempo Real
Controle e depuração ágil dos containers de desenvolvimento local:
- **Status dos Containers**: Executa `docker ps` no terminal integrado.
- **Logs Apache (Follow)**: Acompanha a saída de requisições HTTP do container Apache ao vivo.
- **Logs PHP (Follow)**: Exibe em tempo real o log de erros e warnings (`/var/log/php_errors.log`).
- **Limpar Logs PHP**: Trunca o arquivo de log para facilitar novas sessões de depuração.

### 3. 🛠️ Core & Releases
Disparo dos pipelines e ferramentas de compilação do Core Framework:
- **Update All (Sistema)**: Dispara o pipeline canônico de 4 etapas (`c2f manager:update-all`) finalizando com `css:rebuild`.
- **Sincronizar Recursos**: Compila layouts, páginas e componentes com `c2f resources:sync`.
- **CSS Rebuild**: Reconstrói classes derivadas do Tailwind CSS v4 diretamente do HTML do banco.
- **CSS Audit**: Executa a auditoria de classes órfãs e procedência de CSS (`c2f css:audit`).
- **Releases guiados**: Gestor e Gestor Instalador possuem formulários independentes, permissão GitHub e preflight de árvore, branch, workflow e tag.

### 4. 🗃️ Projetos
Gerenciamento de projetos satélites locais e remotos:
- **Update All (Projeto)**: Executa o pipeline de 6 etapas para o projeto selecionado (`c2f project:update-all <id>`).
- **Deploy de Projeto**: Dispara o deploy seguro do projeto para seu ambiente configurado.
- **Alvo explícito**: nenhum projeto é escolhido por fallback; deploy remoto apresenta alvo e comando antes da confirmação.

### 5. 📚 AI Workspace Hub
Central de comando dos 5 kits de IA e governança de agentes:
- **Sincronizar Skills (1-Click)**: Propaga e alinha as 48 skills em todos os repositórios conectados.
- **Validar Skills (ai:sync)**: Audita rigorosamente os blocos de contrato nos 5 kits de IA.
- **Abrir Playbook Multi-Agentes**: Acesso imediato ao guia prático de alternância entre IDEs e ferramentas.
- **Abrir Catálogo de Skills**: Documentação completa das 48 skills canônicas (Core, MDD e personas).

### 6. 🛰️ MDD Hub & Skills Control (aba dedicada)
Aba própria no painel Conn2Flow, que atua só como cliente visual: as regras ficam no `mdd-client` e no `conn2flow-hub`.
- **Servidores**: status `RUNNING`/`STOPPED` com PID (e porta, no MDD Client) e ações Iniciar, Parar e Reiniciar para o **MDD Client** (`mdd daemon --mcp --transport sse`, porta `conn2flow.mddHub.port`, padrão 8765) e o **Conn2Flow MCP Hub** (`node mcp-hub/dist/index.js`, confirmado por handshake MCP `initialize`). Parada por PID; no Windows, `taskkill /T /F` encerra a árvore do processo.
- **Feedbacks & Curadoria**: lista `mdd feedback list --json` agrupada por veredito (PENDING primeiro, ordenado por severidade), com opção de incluir GitHub Issues; a triagem invoca `mdd feedback triage <id> --verdict ... --reason ...` e recarrega a árvore. O painel nunca edita os arquivos `FB-XXX`.
- Exige Workspace Trust para iniciar/parar servidores e triar.

### 7. 🌐 Interface e execução segura

- Idioma automático pelo VS Code ou sobrescrita `pt-BR`/`en`.
- Títulos da Paleta de Comandos localizados por `package.nls`.
- Tarefas dedicadas com diretório explícito e confirmação proporcional ao impacto.
- Formulário único para ações com vários parâmetros; ações remotas/destrutivas sempre usam revisão em formulário.
- Custom actions bloqueadas em workspace não confiável; pontes de agentes não executam commit/push.

---

## 📊 Itens da Barra de Status (Status Bar)

- **`$(server) Conn2Flow Docker`**: Indicador de prontidão do ambiente Docker local.
- **`$(git-commit) MDD: REQ-XXX`**: Exibe dinamicamente o número da requisição ativa em desenvolvimento. Clicar no item abre diretamente o arquivo correspondente.

---

## ⚙️ Instalação & Compilação

Para compilar a extensão localmente:

```bash
cd vscode-extension
npm install
npm run compile
```

Para gerar o pacote instalável `.vsix`:

```bash
npm run package
```

E instale diretamente no VS Code:
```bash
code --install-extension conn2flow-tools-1.0.0.vsix
```

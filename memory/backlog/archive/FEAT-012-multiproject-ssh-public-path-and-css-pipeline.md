# FEAT-012 — Suporte a public_path e Execução SSH Automática no Pipeline Multiprojeto

* **Status**: `ICEBOX`
* **Tipo**: CLI / Infraestrutura / VM / Pipeline Multiprojeto
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-02
* **Repositórios Alvo**: `conn2flow` (Core / CLI) e `conn2flow-ai-workspace` (`vscode-extension`)

---

## 🎯 Contexto e Motivação

Atualmente, ao executar a atualização completa de um projeto satélite (`c2f project:update-all <id>`), duas etapas geram warnings/erros quando o projeto opera em ambiente de VM via SSH (`deploy_mode: "ssh"`):

1. **Etapa 6/8 (`css:rebuild`)**: O comando tenta ler credenciais de banco e arquivos do Gestor localmente no Windows para compilar o Tailwind CSS derivado do HTML do banco. Como o site vive na VM (`deploy_mode: "ssh"`), ele aborta com o aviso de falta de `.env` local.
2. **Etapa 8/8 (`assets:publish`)**: O comando tenta publicar os assets estáticos minificados em `dist/` no diretório público do servidor web, mas não sabe onde fica a pasta `public_html` da VM por falta de declaração no `environment.json`.

Como o desenvolvedor gerencia **múltiplas instalações e projetos** no `dev-environment/data/environment.json`, a solução definitiva é enriquecer o contrato do `environment.json` e adaptar o CLI para consumir esses metadados de forma automatizada e transparente.

---

## 📋 Escopo Proposto

### 1. Enriquecimento do Esquema de `devProjects` em `environment.json`
- Adicionar os campos `public_path` e `ssh_public_path` nas configurações de cada projeto em `devProjects.<id>`:
  ```json
  "conn2flow-site-local": {
    "name": "Conn2Flow Site Project - Local",
    "deploy_mode": "ssh",
    "ssh_host": "192.168.1.108",
    "ssh_target_path": "/home/admin/web/conn2flow.local/conn2flow-gestor",
    "ssh_public_path": "/home/admin/web/conn2flow.local/public_html",
    "url": "https://conn2flow.local/"
  }
  ```

### 2. Automação do `assets:publish` para SSH / VM
- Atualizar `AssetsPublishCommand.php`:
  * Se o projeto possuir `ssh_public_path` (ou `public_path`) configurado em `environment.json`, publicar os assets estáticos diretamente nessa pasta (via rsync/SCP em modo SSH ou cópia local no filesystem).

### 3. Automação do `css:rebuild` via SSH
- Atualizar `CssRebuildCommand.php` e `ProjectUpdateAllCommand.php`:
  * Se o projeto ativo possuir `deploy_mode: "ssh"`, o pipeline dispara a regeneração do CSS derivado **diretamente na VM via SSH** (`ssh user@host "cd <target> && ./c2f css:rebuild"`), onde o `.env` e a conexão MySQL da VM estão nativamente disponíveis.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.

# 🛒 Guia Oficial de Publicação no Visual Studio Code Marketplace

Este guia detalha o passo a passo completo para publicar a extensão **Conn2Flow Dev Tools (`conn2flow-tools`)** na loja oficial da Microsoft (**Visual Studio Marketplace**) e os métodos alternativos de compartilhamento imediato.

---

## 📋 Metadados do Pacote

O pacote já está configurado e compilado na pasta [`vscode-extension/`](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/vscode-extension):

* **Nome do Pacote**: `conn2flow-tools`
* **Nome de Exibição**: `Conn2Flow Dev Tools`
* **Publisher ID**: `conn2flow`
* **Versão Atual**: `1.0.0`
* **Arquivo VSIX Gerado**: [`vscode-extension/conn2flow-tools-1.0.0.vsix`](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/vscode-extension/conn2flow-tools-1.0.0.vsix) (77.56 KB)
* **Licença**: MIT
* **URL Futura na Loja**: `https://marketplace.visualstudio.com/items?itemName=conn2flow.conn2flow-tools`

---

## 🚀 Método 1: Publicação pelo Portal Web da Microsoft (Mais Fácil / Sem Linha de Comando)

Este é o método mais rápido e intuitivo para quem está publicando pela primeira vez:

### Passo 1: Acessar o Portal de Gerenciamento
1. Acesse: **[https://marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)**
2. Faça login com a sua conta Microsoft (ou crie uma gratuitamente).

### Passo 2: Criar o Publicador (`conn2flow`)
1. Se for o primeiro acesso, clique em **`Create publisher`**.
2. Preencha os campos:
   * **Name (ID)**: `conn2flow` *(deve ser exatamente igual ao campo `"publisher": "conn2flow"` do `package.json`)*;
   * **Display name**: `Conn2Flow`;
   * **Description**: *Ecossistema de alta produtividade e engenharia orientada a especificações para PHP, Tailwind e IA*;
   * **Website**: `https://conn2flow.com`.
3. Clique em **Create**.

### Passo 3: Enviar o Arquivo `.vsix`
1. No painel do publicador `conn2flow`, clique no botão **`+ New extension`** ➔ **`Visual Studio Code`**.
2. Arraste e solte o arquivo:
   `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\vscode-extension\conn2flow-tools-1.0.0.vsix`
3. Clique em **Upload**.
4. O sistema da Microsoft fará uma verificação de segurança automatizada (leva cerca de 3 a 5 minutos).
5. Pronto! A extensão estará online e acessível publicamente para qualquer pessoa no mundo!

---

## ⚡ Método 2: Publicação Automatizada via Terminal (`vsce CLI`)

Ideal para atualizar novas versões diretamente pelo terminal:

### Passo 1: Criar um Token de Acesso (PAT) no Azure DevOps
1. Acesse: **[https://dev.azure.com](https://dev.azure.com)** e faça login com a mesma conta Microsoft do Marketplace;
2. No canto superior direito, clique no ícone de configurações de usuário (ao lado da foto) ➔ **Personal access tokens**;
3. Clique em **+ New Token**;
4. Configure:
   * **Name**: `VS Code Marketplace Token`;
   * **Organization**: Selecione **All accessible organizations**;
   * **Expiration**: Escolha a validade desejada (ex: 90 dias ou 1 ano);
   * **Scopes**: Clique em *Show all scopes*, role até **Marketplace** e marque **Manage**;
5. Clique em **Create** e **copie o token gerado** imediatamente.

### Passo 2: Fazer Login e Publicar via Terminal
No terminal do projeto (PowerShell):

```powershell
cd C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace\vscode-extension

# Fazer login no publicador conn2flow (cole o PAT quando solicitado)
npx @vscode/vsce login conn2flow

# Publicar na loja
npx @vscode/vsce publish
```

---

## 📦 Método 3: Compartilhamento Imediato Sem Esperar a Loja (Distribuição Direta)

Se você quiser passar a extensão para um amigo, cliente ou desenvolvedor **agora mesmo**, sem esperar aprovação de loja:

### Opção A: Enviar o Arquivo `.vsix`
1. Envie o arquivo `conn2flow-tools-1.0.0.vsix` para a pessoa (por e-mail, Slack, Discord, pendrive, etc.);
2. A pessoa abre o VS Code dela e instala de duas maneiras:
   * **Pelo Menu Visual**: Abre a aba de Extensões (`Ctrl+Shift+X`) ➔ clica nos três pontinhos (`...`) no canto superior direito da aba ➔ seleciona **"Instalar de VSIX..."** e escolhe o arquivo.
   * **Pelo Terminal**: Executa:
     ```bash
     code --install-extension conn2flow-tools-1.0.0.vsix
     ```

### Opção B: GitHub Releases (Link Direto de Download)
1. Vá na aba **Releases** do repositório no GitHub (`https://github.com/otavioserra/conn2flow-ai-workspace/releases`);
2. Crie a Release `v1.0.0`;
3. Anexe o arquivo `conn2flow-tools-1.0.0.vsix` nos anexos (Assets);
4. Passe o link direto para quem você quiser baixar!

---

## 🌐 Método 4: Publicar no Open VSX Registry (Para Cursor, VSCodium e Gitpod)

O Cursor e forks open-source do VS Code usam o registro aberto **Open VSX**:

1. Acesse: **[https://open-vsx.org](https://open-vsx.org)**;
2. Faça login com GitHub;
3. Crie o namespace `conn2flow`;
4. Crie um Access Token em *Settings* ➔ *Access Tokens*;
5. Publique via terminal com um comando simples:
   ```bash
   npx ovsx publish vscode-extension/conn2flow-tools-1.0.0.vsix -p <SEU_TOKEN_OPEN_VSX>
   ```
6. A partir daí, qualquer usuário do **Cursor IDE** poderá instalar a extensão procurando diretamente pelo nome!

---

## 🔄 Como Lançar Atualizações Futuras

Sempre que fizermos novas melhorias na extensão:
1. No arquivo `vscode-extension/package.json`, altere a versão (ex: de `"1.0.0"` para `"1.0.1"`);
2. Execute o comando:
   ```powershell
   cmd.exe /c npx --yes @vscode/vsce package
   ```
3. Se estiver usando o Portal Web: Arraste o novo `.vsix` para o portal;
4. Se estiver usando o CLI: Execute `npx @vscode/vsce publish`.
5. O VS Code de todos os usuários que tiverem a extensão instalada receberá a atualização automaticamente em segundo plano!

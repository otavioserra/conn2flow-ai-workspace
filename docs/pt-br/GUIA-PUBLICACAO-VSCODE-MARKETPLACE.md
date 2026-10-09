---
verified_at: 2afd000
sources:
  - ../../vscode-extension/package.json
  - ../../vscode-extension/package-lock.json
  - ../../vscode-extension/scripts/bump-version.cjs
---


# Guia de empacotamento e publicação da extensão VS Code

[English](../en/VSCODE-MARKETPLACE-PUBLISHING-GUIDE.md) · [Índice da documentação](README.md)

## Metadados do pacote

O [manifesto](../../vscode-extension/package.json) autoritativo identifica conn2flow-tools, publisher conn2flow e licença MIT. Ele declara atualmente 1.1.1; v1.1.2 é o alvo de release. Este guia não afirma tamanho de VSIX gerado, disponibilidade de pacote ou publicação no Marketplace.

## Prepare e verifique localmente

Em vscode-extension/, instale dependências fixadas e rode a suíte da extensão:

```sh
npm ci
npm test
npm run version:bump:dry-run
```

O dry run informa o próximo patch sem escrever. Leia o [script de bump](../../vscode-extension/scripts/bump-version.cjs) antes de empacotar. Mantenha package.json e package-lock.json alinhados, atualize o changelog para a versão real e inspecione o diff resultante.

## Empacotar altera a versão

```sh
npm run package
```

O script package executa version:bump antes de vsce package. Partindo de 1.1.1, o próximo patch é 1.1.2; repetir o comando incrementa novamente. Ele escreve manifesto e lockfile e aciona compilação por vscode:prepublish. Uma falha no empacotamento pode, portanto, deixar a versão alterada. Revise esse estado antes de repetir; não deduza sucesso do pacote pela mensagem de bump.

## Instale e publique o artefato revisado

Para uso local, instale o VSIX realmente gerado pela ação Instalar do VSIX do VS Code. Valide o painel conforme o [guia operacional](GUIA-PAINEL-DEV-TOOLS-VSCODE.md).

A publicação no Marketplace é uma ação separada de release autorizada, usando o publisher pretendido e o artefato revisado. Confira acesso atual ao publisher e metadados reais do pacote antes de publicar. Este lote apenas documenta o processo; não gera release, transmite credenciais ou publica extensão. Coloque em stage arquivos de release explicitamente nomeados, em vez do diretório inteiro.

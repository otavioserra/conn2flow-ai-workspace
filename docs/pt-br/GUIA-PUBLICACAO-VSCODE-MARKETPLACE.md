---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../vscode-extension/CHANGELOG.md
  - ../../vscode-extension/package.json
  - ../../vscode-extension/package-lock.json
  - ../../vscode-extension/scripts/bump-version.cjs
---


# Guia de empacotamento e publicação da extensão VS Code

[English](../en/VSCODE-MARKETPLACE-PUBLISHING-GUIDE.md) · [Índice da documentação](README.md)

## Metadados do pacote

O [manifesto](../../vscode-extension/package.json) declara a versão 1.2.0, o publisher `conn2flow` e a licença MIT.

## Prepare e verifique localmente

Em vscode-extension/, instale dependências fixadas e rode a suíte da extensão:

```sh
npm ci
npm test
npm run version:bump:dry-run
```

O dry run informa o próximo patch sem escrever. Leia o [script de bump](../../vscode-extension/scripts/bump-version.cjs) antes de empacotar. Mantenha package.json e package-lock.json alinhados, atualize o changelog para a versão real e inspecione o diff resultante.

## Empacote a versão selecionada

Com manifesto e lockfile na mesma versão, rode em `vscode-extension/`:

```sh
npx @vscode/vsce package --out conn2flow-tools-1.2.0.vsix
```

`vscode:prepublish` compila a extensão. `npm run package` incrementa o patch antes de empacotar, então use esse script quando quiser outro incremento de patch.

## Instale e publique o artefato revisado

Para uso local, instale o VSIX realmente gerado pela ação Instalar do VSIX do VS Code. Valide o painel conforme o [guia operacional](GUIA-PAINEL-DEV-TOOLS-VSCODE.md).

A publicação no Marketplace é uma ação separada de release autorizada, usando o publisher pretendido e o artefato revisado. Confira acesso atual ao publisher e metadados reais do pacote antes de publicar. Coloque em stage arquivos de release explicitamente nomeados, em vez do diretório inteiro.

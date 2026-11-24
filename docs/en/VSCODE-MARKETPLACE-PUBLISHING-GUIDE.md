---
verified_at: fb46fe7
verified_in: BATCH-094
sources:
  - ../../vscode-extension/CHANGELOG.md
  - ../../vscode-extension/package.json
  - ../../vscode-extension/package-lock.json
  - ../../vscode-extension/scripts/bump-version.cjs
---


# VS Code extension packaging and publishing guide

[Português](../pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md) · [Documentation index](README.md)

## Package metadata

The [manifest](../../vscode-extension/package.json) declares version 1.2.0, publisher `conn2flow` and the MIT license.

## Prepare and verify locally

From vscode-extension/, install the locked dependencies and run the extension suite:

```sh
npm ci
npm test
npm run version:bump:dry-run
```

The dry run reports the next patch without writing. Read the [bump script](../../vscode-extension/scripts/bump-version.cjs) before packaging. Keep package.json and package-lock.json aligned, update the changelog for the actual release, and inspect the resulting diff.

## Package the selected version

For a release whose manifest and lockfile already match, run from `vscode-extension/`:

```sh
npx @vscode/vsce package --out conn2flow-tools-1.2.0.vsix
```

`vscode:prepublish` compiles the extension. `npm run package` increments the patch before packaging, so use it only when you intend another patch bump.

## Install and publish the reviewed artifact

For local use, install the actual generated VSIX via VS Code's Install from VSIX action. Validate the panel against the [operational guide](VSCODE-DEV-TOOLS-PANEL-GUIDE.md).

Marketplace publication is a separate authorized release action using the intended publisher and reviewed artifact. Verify current publisher access and the actual package metadata before publication. Stage explicitly named release files rather than the entire directory.

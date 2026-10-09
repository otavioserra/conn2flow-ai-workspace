---
verified_at: 2afd000
sources:
  - ../../vscode-extension/package.json
  - ../../vscode-extension/package-lock.json
  - ../../vscode-extension/scripts/bump-version.cjs
---


# VS Code extension packaging and publishing guide

[Português](../pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md) · [Documentation index](README.md)

## Package metadata

The authoritative [manifest](../../vscode-extension/package.json) identifies conn2flow-tools, publisher conn2flow and MIT license. It currently declares 1.1.1; v1.1.2 is the release target. This guide does not assert a generated VSIX size, package availability or Marketplace publication.

## Prepare and verify locally

From vscode-extension/, install the locked dependencies and run the extension suite:

```sh
npm ci
npm test
npm run version:bump:dry-run
```

The dry run reports the next patch without writing. Read the [bump script](../../vscode-extension/scripts/bump-version.cjs) before packaging. Keep package.json and package-lock.json aligned, update the changelog for the actual release, and inspect the resulting diff.

## Packaging changes version

```sh
npm run package
```

The package script runs version:bump before vsce package. From 1.1.1, the next patch is 1.1.2; repeating the command increments again. It writes the manifest and lockfile and triggers compilation through vscode:prepublish. A failed packaging step may therefore leave a version change. Review that state before retrying; do not infer package success from the bump message.

## Install and publish the reviewed artifact

For local use, install the actual generated VSIX via VS Code's Install from VSIX action. Validate the panel against the [operational guide](VSCODE-DEV-TOOLS-PANEL-GUIDE.md).

Marketplace publication is a separate authorized release action using the intended publisher and reviewed artifact. Verify current publisher access and the actual package metadata before publication. This batch only documents the process; it does not generate a release, transmit credentials or publish an extension. Stage explicitly named release files rather than the entire directory.

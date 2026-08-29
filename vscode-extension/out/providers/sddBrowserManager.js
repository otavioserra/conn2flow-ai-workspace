"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SddBrowserManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class SddBrowserManager {
    static getSddFolders() {
        const folders = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return folders;
        for (const f of workspaceFolders) {
            // 1. No próprio workspace
            folders.push(path.join(f.uri.fsPath, 'sdd'));
            // 2. No repo irmão conn2flow
            folders.push(path.join(f.uri.fsPath, '..', 'conn2flow', 'sdd'));
            // 3. No ai-workspace
            folders.push(path.join(f.uri.fsPath, '..', 'conn2flow', 'ai-workspace', 'sdd'));
        }
        return folders;
    }
    static async browseDirectory(subDir, title, openFile) {
        const candidates = this.getSddFolders();
        const foundFiles = new Map(); // fileName -> relativePath
        for (const base of candidates) {
            const targetDir = path.join(base, subDir);
            if (fs.existsSync(targetDir)) {
                try {
                    const files = fs.readdirSync(targetDir);
                    for (const file of files) {
                        if (file.endsWith('.md') && !foundFiles.has(file)) {
                            foundFiles.set(file, path.join('sdd', subDir, file).replace(/\\/g, '/'));
                        }
                    }
                }
                catch {
                    // segue para o proximo
                }
            }
        }
        if (foundFiles.size === 0) {
            vscode.window.showInformationMessage(`Nenhum arquivo encontrado em sdd/${subDir}/.`);
            return;
        }
        // Ordena os arquivos em ordem decrescente (ex: req-145 antes de req-144)
        const sortedNames = Array.from(foundFiles.keys()).sort((a, b) => {
            // Tenta extrair numero se houver
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            if (numA !== numB) {
                return numB - numA;
            }
            return b.localeCompare(a);
        });
        const items = sortedNames.map(name => {
            const isCurrent = name.toLowerCase() === 'current.md';
            return {
                label: `${isCurrent ? '⭐ ' : '📄 '}${name}`,
                description: isCurrent ? '(Requisição Ativa no SDD)' : `sdd/${subDir}/${name}`,
                detail: foundFiles.get(name)
            };
        });
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Selecione um arquivo de ${title} para visualizar:`
        });
        if (selected && selected.detail) {
            await openFile(selected.detail);
        }
    }
}
exports.SddBrowserManager = SddBrowserManager;
//# sourceMappingURL=sddBrowserManager.js.map
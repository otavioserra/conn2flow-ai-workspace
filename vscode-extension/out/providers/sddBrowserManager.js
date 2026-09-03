"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SddBrowserManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const sddScopeManager_1 = require("./sddScopeManager");
const localizationManager_1 = require("./localizationManager");
class SddBrowserManager {
    static async browseDirectory(subDir, title, openFile) {
        const sddRoot = sddScopeManager_1.SddScopeManager.getActiveSddRoot();
        const scopeLabel = sddScopeManager_1.SddScopeManager.getScopeLabel();
        if (!sddRoot || !fs.existsSync(sddRoot)) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('sdd.folderMissing', { scope: scopeLabel }));
            return;
        }
        const targetDir = path.join(sddRoot, subDir);
        const foundFiles = new Map(); // fileName -> relativePath
        if (fs.existsSync(targetDir)) {
            try {
                const files = fs.readdirSync(targetDir);
                for (const file of files) {
                    if (file.endsWith('.md')) {
                        foundFiles.set(file, path.join('sdd', subDir, file).replace(/\\/g, '/'));
                    }
                }
            }
            catch {
                // silencioso
            }
        }
        if (foundFiles.size === 0) {
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('sdd.noFiles', { directory: subDir, scope: scopeLabel }), 3000);
            return;
        }
        // Ordena os arquivos em ordem decrescente (ex: req-145 antes de req-144)
        const sortedNames = Array.from(foundFiles.keys()).sort((a, b) => {
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
                description: isCurrent ? `(${localizationManager_1.LocalizationManager.t('sdd.currentFile')} - ${scopeLabel})` : `[${scopeLabel}] sdd/${subDir}/${name}`,
                detail: foundFiles.get(name)
            };
        });
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: localizationManager_1.LocalizationManager.t('sdd.selectFile', { scope: scopeLabel, title })
        });
        if (selected && selected.detail) {
            await openFile(selected.detail);
        }
    }
}
exports.SddBrowserManager = SddBrowserManager;
//# sourceMappingURL=sddBrowserManager.js.map
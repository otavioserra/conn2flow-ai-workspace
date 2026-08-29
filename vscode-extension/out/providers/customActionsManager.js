"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomActionsManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const localizationManager_1 = require("./localizationManager");
class CustomActionsManager {
    static watcher;
    static getManifestPath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }
        for (const folder of workspaceFolders) {
            const candidates = [
                path.join(folder.uri.fsPath, '.c2f', 'actions.json'),
                path.join(folder.uri.fsPath, '.conn2flow', 'actions.json'),
                path.join(folder.uri.fsPath, 'c2f.actions.json')
            ];
            for (const cand of candidates) {
                if (fs.existsSync(cand)) {
                    return cand;
                }
            }
        }
        return undefined;
    }
    static getActionsManifest() {
        const manifestPath = this.getManifestPath();
        if (!manifestPath || !fs.existsSync(manifestPath)) {
            return undefined;
        }
        try {
            const raw = fs.readFileSync(manifestPath, 'utf8');
            const data = JSON.parse(raw);
            if (data && Array.isArray(data.actions)) {
                return {
                    title: data.title || 'Ações do Projeto',
                    actions: data.actions
                };
            }
        }
        catch {
            // Ignora erro de sintaxe JSON temporário enquanto o usuário digita
        }
        return undefined;
    }
    static setupWatcher(onChanged) {
        if (this.watcher) {
            this.watcher.dispose();
        }
        const pattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders?.[0] || '', '{.c2f/actions.json,.conn2flow/actions.json,c2f.actions.json}');
        this.watcher = vscode.workspace.createFileSystemWatcher(pattern);
        this.watcher.onDidChange(() => onChanged());
        this.watcher.onDidCreate(() => onChanged());
        this.watcher.onDidDelete(() => onChanged());
        return {
            dispose: () => {
                if (this.watcher) {
                    this.watcher.dispose();
                }
            }
        };
    }
    static async initSampleManifest(onCreated) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.noWorkspace'));
            return;
        }
        const targetDir = path.join(workspaceFolders[0].uri.fsPath, '.c2f');
        const targetFile = path.join(targetDir, 'actions.json');
        if (fs.existsSync(targetFile)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(targetFile));
            await vscode.window.showTextDocument(doc);
            return;
        }
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const sample = {
            title: '⚡ Ações Locais do Projeto',
            actions: [
                {
                    label: '🌿 Sincronizar Todos os Worktrees',
                    icon: 'git-branch',
                    description: 'Atualiza o estado e variáveis de ambiente em múltiplos worktrees locais',
                    type: 'terminal',
                    command: 'powershell -NoProfile -Command "Write-Host \'Sincronizando worktrees locais...\' -ForegroundColor Cyan"'
                },
                {
                    label: '🧹 Limpeza de Cache & Temporários',
                    icon: 'trash',
                    description: 'Remove arquivos temporários e caches de build',
                    type: 'terminal',
                    command: 'powershell -NoProfile -Command "Write-Host \'Limpando caches temporários...\' -ForegroundColor Green"'
                },
                {
                    label: '📄 Abrir Guia Local do Projeto',
                    icon: 'file-text',
                    type: 'file',
                    path: 'README.md'
                }
            ]
        };
        fs.writeFileSync(targetFile, JSON.stringify(sample, null, 2), 'utf8');
        // Abre o arquivo para o usuário editar
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(targetFile));
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('custom.created'));
        if (onCreated) {
            onCreated();
        }
    }
}
exports.CustomActionsManager = CustomActionsManager;
//# sourceMappingURL=customActionsManager.js.map
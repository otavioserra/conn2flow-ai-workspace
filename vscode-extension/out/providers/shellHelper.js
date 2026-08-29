"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellHelper = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class ShellHelper {
    static getActiveShellType() {
        const active = vscode.window.activeTerminal;
        const name = (active?.name || '').toLowerCase();
        if (name.includes('bash') || name.includes('mingw') || name.includes('sh') || name.includes('git')) {
            return 'bash';
        }
        if (name.includes('pwsh') || name.includes('powershell')) {
            return 'powershell';
        }
        if (name.includes('cmd') || name.includes('prompt')) {
            return 'cmd';
        }
        const defaultProfile = vscode.workspace.getConfiguration('terminal.integrated.defaultProfile').get('windows', '').toLowerCase();
        if (defaultProfile.includes('bash') || defaultProfile.includes('git') || defaultProfile.includes('mingw')) {
            return 'bash';
        }
        if (defaultProfile.includes('pwsh') || defaultProfile.includes('powershell')) {
            return 'powershell';
        }
        return 'bash';
    }
    static formatC2fCommand(subCommand) {
        const shell = this.getActiveShellType();
        if (shell === 'bash') {
            return `./c2f ${subCommand}`;
        }
        else {
            return `php cli/c2f.php ${subCommand}`;
        }
    }
    static formatPowerShellScript(scriptRelativePath, args = '') {
        const shell = this.getActiveShellType();
        // Encontra o caminho absoluto do script no workspace ou ai-workspace
        let absolutePath = '';
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            for (const f of workspaceFolders) {
                const candidates = [
                    path.join(f.uri.fsPath, scriptRelativePath),
                    path.join(f.uri.fsPath, '..', 'conn2flow-ai-workspace', scriptRelativePath),
                    path.join(f.uri.fsPath, 'ai-workspace', scriptRelativePath)
                ];
                for (const c of candidates) {
                    if (fs.existsSync(c)) {
                        absolutePath = c;
                        break;
                    }
                }
                if (absolutePath)
                    break;
            }
        }
        if (!absolutePath) {
            absolutePath = scriptRelativePath;
        }
        if (shell === 'bash') {
            const normalized = absolutePath.replace(/\\/g, '/');
            return `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${normalized}" ${args}`.trim();
        }
        else {
            return `powershell -NoProfile -ExecutionPolicy Bypass -File "${absolutePath}" ${args}`.trim();
        }
    }
}
exports.ShellHelper = ShellHelper;
//# sourceMappingURL=shellHelper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModesManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class ModesManager {
    static getCurrentModes() {
        const defaultModes = {
            topology: 'triade',
            autonomy: 'supervisionado'
        };
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath)) {
            return defaultModes;
        }
        try {
            const content = fs.readFileSync(currentPath, 'utf8');
            const topMatch = content.match(/\*\*Topologia de Agentes\*\*:\s*`?([a-zA-Z_-]+)`?/i);
            if (topMatch && (topMatch[1].toLowerCase() === 'duplo' || topMatch[1].toLowerCase() === 'triade')) {
                defaultModes.topology = topMatch[1].toLowerCase();
            }
            const autoMatch = content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([a-zA-Z_-]+)`?/i);
            if (autoMatch) {
                const val = autoMatch[1].toLowerCase();
                if (val === 'supervisionado' || val === 'autonomo_monitorado' || val === 'autonomo_headless') {
                    defaultModes.autonomy = val;
                }
            }
        }
        catch {
            // Ignora erro de leitura silenciosamente
        }
        return defaultModes;
    }
    static async setTopology(mode, onUpdated) {
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath)) {
            vscode.window.showErrorMessage('CURRENT.md não encontrado no workspace.');
            return;
        }
        try {
            let content = fs.readFileSync(currentPath, 'utf8');
            if (content.match(/\*\*Topologia de Agentes\*\*:/i)) {
                content = content.replace(/\*\*Topologia de Agentes\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Topologia de Agentes**: \`${mode}\``);
            }
            else {
                content = content.replace(/(\*   \*\*Status\*\*:[^\n]*\n)/i, `$1*   **Topologia de Agentes**: \`${mode}\`\n`);
            }
            fs.writeFileSync(currentPath, content, 'utf8');
            const label = mode === 'triade' ? '🏛️ Tríade de Agentes (Arquiteto + Executor + Revisor)' : '👥 Duplo Agente (Arquiteto + Executor)';
            vscode.window.showInformationMessage(`Topologia SDD alterada para: ${label}`);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Falha ao atualizar topologia: ${err.message}`);
        }
    }
    static async setAutonomy(level, onUpdated) {
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath)) {
            vscode.window.showErrorMessage('CURRENT.md não encontrado no workspace.');
            return;
        }
        try {
            let content = fs.readFileSync(currentPath, 'utf8');
            if (content.match(/\*\*N[íi]vel de Autonomia\*\*:/i)) {
                content = content.replace(/\*\*N[íi]vel de Autonomia\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Nível de Autonomia**: \`${level}\``);
            }
            else {
                content = content.replace(/(\*   \*\*Topologia de Agentes\*\*:[^\n]*\n)/i, `$1*   **Nível de Autonomia**: \`${level}\`\n`);
            }
            fs.writeFileSync(currentPath, content, 'utf8');
            const labels = {
                supervisionado: '🛡️ Nível 1: Supervisionado (Apenas edição e testes; sem commit/deploy sem OK)',
                autonomo_monitorado: '👁️ Nível 2: Autônomo Monitorado (Live Todo List e deploy local de teste)',
                autonomo_headless: '🤖 Nível 3: Autônomo Headless (Background silencioso)'
            };
            vscode.window.showInformationMessage(`Autonomia SDD alterada para: ${labels[level]}`);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Falha ao atualizar autonomia: ${err.message}`);
        }
    }
    static getCurrentFilePath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }
        for (const folder of workspaceFolders) {
            const p = path.join(folder.uri.fsPath, 'sdd', 'human-requests', 'CURRENT.md');
            if (fs.existsSync(p)) {
                return p;
            }
        }
        return undefined;
    }
}
exports.ModesManager = ModesManager;
//# sourceMappingURL=modesManager.js.map
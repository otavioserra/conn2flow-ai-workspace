"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModesManager = void 0;
const vscode = require("vscode");
const fs = require("fs");
const sddScopeManager_1 = require("./sddScopeManager");
const localizationManager_1 = require("./localizationManager");
class ModesManager {
    static cachedModes = {
        topology: 'triade',
        autonomy: 'supervisionado'
    };
    static initialized = false;
    static getCurrentModes() {
        if (!this.initialized) {
            this.initFromDisk();
            this.initialized = true;
        }
        return this.cachedModes;
    }
    static async selectTopology(onUpdated) {
        const selected = await vscode.window.showQuickPick([
            { label: localizationManager_1.LocalizationManager.t('mode.triad'), value: 'triade' },
            { label: localizationManager_1.LocalizationManager.t('mode.dual'), value: 'duplo' }
        ], { placeHolder: localizationManager_1.LocalizationManager.t('modes.selectTopology') });
        if (selected)
            await this.setTopology(selected.value, onUpdated);
    }
    static async selectAutonomy(onUpdated) {
        const selected = await vscode.window.showQuickPick([
            { label: localizationManager_1.LocalizationManager.t('mode.supervised'), value: 'supervisionado' },
            { label: localizationManager_1.LocalizationManager.t('mode.monitored'), value: 'autonomo_monitorado' },
            { label: localizationManager_1.LocalizationManager.t('mode.headless'), value: 'autonomo_headless' }
        ], { placeHolder: localizationManager_1.LocalizationManager.t('modes.selectAutonomy') });
        if (selected)
            await this.setAutonomy(selected.value, onUpdated);
    }
    static initFromDisk() {
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath))
            return;
        try {
            const content = fs.readFileSync(currentPath, 'utf8');
            const topMatch = content.match(/\*\*Topologia de Agentes\*\*:\s*`?([a-zA-Z_-]+)`?/i);
            if (topMatch && (topMatch[1].toLowerCase() === 'duplo' || topMatch[1].toLowerCase() === 'triade')) {
                this.cachedModes.topology = topMatch[1].toLowerCase();
            }
            const autoMatch = content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([a-zA-Z_-]+)`?/i);
            if (autoMatch) {
                const val = autoMatch[1].toLowerCase();
                if (val === 'supervisionado' || val === 'autonomo_monitorado' || val === 'autonomo_headless') {
                    this.cachedModes.autonomy = val;
                }
            }
        }
        catch {
            // silencioso
        }
    }
    static async setTopology(mode, onUpdated) {
        this.cachedModes.topology = mode;
        this.initialized = true;
        const currentPath = this.getCurrentFilePath();
        if (currentPath && fs.existsSync(currentPath)) {
            try {
                let content = fs.readFileSync(currentPath, 'utf8');
                if (content.match(/\*\*Topologia de Agentes\*\*:/i)) {
                    content = content.replace(/\*\*Topologia de Agentes\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Topologia de Agentes**: \`${mode}\``);
                }
                else {
                    content = content.replace(/(\*   \*\*Status\*\*:[^\n]*\n)/i, `$1*   **Topologia de Agentes**: \`${mode}\`\n`);
                }
                fs.writeFileSync(currentPath, content, 'utf8');
            }
            catch {
                // segue com cache em memoria
            }
        }
        const label = mode === 'triade' ? '🏛️ Tríade de Agentes' : '👥 Duplo Agente';
        vscode.window.setStatusBarMessage(`Topologia: ${label}`, 2000);
        if (onUpdated) {
            onUpdated();
        }
    }
    static async setAutonomy(level, onUpdated) {
        this.cachedModes.autonomy = level;
        this.initialized = true;
        const currentPath = this.getCurrentFilePath();
        if (currentPath && fs.existsSync(currentPath)) {
            try {
                let content = fs.readFileSync(currentPath, 'utf8');
                if (content.match(/\*\*N[íi]vel de Autonomia\*\*:/i)) {
                    content = content.replace(/\*\*N[íi]vel de Autonomia\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Nível de Autonomia**: \`${level}\``);
                }
                else {
                    content = content.replace(/(\*   \*\*Topologia de Agentes\*\*:[^\n]*\n)/i, `$1*   **Nível de Autonomia**: \`${level}\`\n`);
                }
                fs.writeFileSync(currentPath, content, 'utf8');
            }
            catch {
                // segue com cache em memoria
            }
        }
        const labels = {
            supervisionado: '🛡️ Nível 1: Supervisionado',
            autonomo_monitorado: '👁️ Nível 2: Autônomo Monitorado',
            autonomo_headless: '🤖 Nível 3: Autônomo Headless'
        };
        vscode.window.setStatusBarMessage(`Autonomia: ${labels[level]}`, 2000);
        if (onUpdated) {
            onUpdated();
        }
    }
    static getCurrentFilePath() {
        return sddScopeManager_1.SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
    }
}
exports.ModesManager = ModesManager;
//# sourceMappingURL=modesManager.js.map
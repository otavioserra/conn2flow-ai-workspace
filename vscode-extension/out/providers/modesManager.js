"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModesManager = void 0;
const vscode = require("vscode");
const fs = require("fs");
const sddScopeManager_1 = require("./sddScopeManager");
const localizationManager_1 = require("./localizationManager");
const workspacePreferencesPolicy_1 = require("../workspacePreferencesPolicy");
class ModesManager {
    static cachedModes = {
        topology: workspacePreferencesPolicy_1.DEFAULT_TOPOLOGY,
        autonomy: workspacePreferencesPolicy_1.DEFAULT_AUTONOMY
    };
    static initialized = false;
    static getCurrentModes() {
        if (!this.initialized) {
            this.initFromPersistedSources();
            this.initialized = true;
        }
        return this.cachedModes;
    }
    /** Relê as preferências persistidas (usado após troca de escopo SDD). */
    static reload() {
        this.initFromPersistedSources();
        this.initialized = true;
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
    /**
     * Precedência: `settings.json` (escolha explícita do operador, sobrevive ao
     * reload da janela) e, na ausência dela, o metadado declarado em `CURRENT.md`.
     */
    static initFromPersistedSources() {
        const config = vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION);
        const fromDisk = this.readModesFromCurrentFile();
        this.cachedModes = {
            topology: (0, workspacePreferencesPolicy_1.resolvePersistedPreference)({
                settings: config.get(workspacePreferencesPolicy_1.PREFERENCE_KEYS.topology),
                workspaceState: fromDisk.topology
            }, workspacePreferencesPolicy_1.recognizeTopology, workspacePreferencesPolicy_1.DEFAULT_TOPOLOGY),
            autonomy: (0, workspacePreferencesPolicy_1.resolvePersistedPreference)({
                settings: config.get(workspacePreferencesPolicy_1.PREFERENCE_KEYS.autonomy),
                workspaceState: fromDisk.autonomy
            }, workspacePreferencesPolicy_1.recognizeAutonomy, workspacePreferencesPolicy_1.DEFAULT_AUTONOMY)
        };
    }
    static readModesFromCurrentFile() {
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath))
            return {};
        try {
            return (0, workspacePreferencesPolicy_1.parseModesFromCurrentMarkdown)(fs.readFileSync(currentPath, 'utf8'));
        }
        catch {
            return {};
        }
    }
    static async setTopology(mode, onUpdated) {
        this.cachedModes.topology = mode;
        this.initialized = true;
        await this.persistSetting(workspacePreferencesPolicy_1.PREFERENCE_KEYS.topology, mode);
        this.syncCurrentFile({ topology: mode });
        const label = localizationManager_1.LocalizationManager.t(mode === 'triade' ? 'mode.triad' : 'mode.dual');
        vscode.window.setStatusBarMessage(`${localizationManager_1.LocalizationManager.t('overview.topology', { mode: label })}`, 2000);
        if (onUpdated) {
            onUpdated();
        }
    }
    static async setAutonomy(level, onUpdated) {
        this.cachedModes.autonomy = level;
        this.initialized = true;
        await this.persistSetting(workspacePreferencesPolicy_1.PREFERENCE_KEYS.autonomy, level);
        this.syncCurrentFile({ autonomy: level });
        const labelKeys = {
            supervisionado: 'mode.supervised',
            autonomo_monitorado: 'mode.monitored',
            autonomo_headless: 'mode.headless'
        };
        const label = localizationManager_1.LocalizationManager.t(labelKeys[level]);
        vscode.window.setStatusBarMessage(`${localizationManager_1.LocalizationManager.t('overview.autonomy', { mode: label })}`, 2000);
        if (onUpdated) {
            onUpdated();
        }
    }
    /**
     * Grava no escopo de workspace quando há pasta aberta; cai para o escopo
     * global apenas quando a extensão roda sem workspace.
     */
    static async persistSetting(key, value) {
        const config = vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION);
        const target = vscode.workspace.workspaceFolders?.length
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
        try {
            await config.update(key, value, target);
        }
        catch {
            try {
                await config.update(key, value, vscode.ConfigurationTarget.Global);
            }
            catch {
                // mantém apenas o cache em memória
            }
        }
    }
    static syncCurrentFile(modes) {
        const currentPath = this.getCurrentFilePath();
        if (!currentPath || !fs.existsSync(currentPath))
            return;
        try {
            const content = fs.readFileSync(currentPath, 'utf8');
            const updated = (0, workspacePreferencesPolicy_1.applyModesToCurrentMarkdown)(content, modes);
            if (updated !== content) {
                fs.writeFileSync(currentPath, updated, 'utf8');
            }
        }
        catch {
            // segue com cache em memoria
        }
    }
    static getCurrentFilePath() {
        return sddScopeManager_1.SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
    }
}
exports.ModesManager = ModesManager;
//# sourceMappingURL=modesManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationManager = void 0;
const vscode = require("vscode");
const localizationCatalog_1 = require("../localizationCatalog");
class LocalizationManager {
    static locale = 'en';
    static listener;
    static initialize(context, onChanged) {
        this.refreshLocale();
        this.listener = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('conn2flow.language')) {
                this.refreshLocale();
                onChanged();
            }
        });
        context.subscriptions.push(this.listener);
    }
    static get currentLocale() {
        return this.locale;
    }
    static get languageLabel() {
        return this.t(this.locale === 'pt-BR' ? 'language.pt-BR' : 'language.en');
    }
    static t(key, values = {}) {
        return (0, localizationCatalog_1.translate)(this.locale, key, values);
    }
    static async selectLanguage() {
        const options = [
            { label: this.t('language.auto'), value: 'auto' },
            { label: this.t('language.pt-BR'), value: 'pt-BR' },
            { label: this.t('language.en'), value: 'en' }
        ];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: this.t('settings.language')
        });
        if (!selected)
            return;
        await vscode.workspace
            .getConfiguration('conn2flow')
            .update('language', selected.value, vscode.ConfigurationTarget.Global);
        this.refreshLocale();
        vscode.window.showInformationMessage(`${this.t('language.changed', { language: selected.label })} ${this.t('language.reload')}`);
    }
    static refreshLocale() {
        const preference = vscode.workspace
            .getConfiguration('conn2flow')
            .get('language', 'auto');
        this.locale = (0, localizationCatalog_1.resolveLocale)(preference, vscode.env.language, process.env.CONN2FLOW_LANGUAGE);
    }
}
exports.LocalizationManager = LocalizationManager;
//# sourceMappingURL=localizationManager.js.map
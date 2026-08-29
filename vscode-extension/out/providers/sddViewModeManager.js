"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SddViewModeManager = void 0;
const vscode = require("vscode");
const localizationManager_1 = require("./localizationManager");
class SddViewModeManager {
    static _mode = 'preview';
    static storage;
    static storageKey = 'conn2flow.sdd.viewMode';
    static initialize(context) {
        this.storage = context.workspaceState;
        this._mode = this.storage.get(this.storageKey, 'preview');
    }
    static get mode() {
        return this._mode;
    }
    static get label() {
        switch (this._mode) {
            case 'both':
                return localizationManager_1.LocalizationManager.t('view.both');
            case 'preview':
                return localizationManager_1.LocalizationManager.t('view.preview');
            case 'code':
                return localizationManager_1.LocalizationManager.t('view.code');
        }
    }
    static toggle(onChanged) {
        if (this._mode === 'both') {
            this._mode = 'preview';
        }
        else if (this._mode === 'preview') {
            this._mode = 'code';
        }
        else {
            this._mode = 'both';
        }
        void this.storage?.update(this.storageKey, this._mode);
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('sdd.viewMode', { mode: this.label }), 2500);
        if (onChanged) {
            onChanged();
        }
        return this._mode;
    }
}
exports.SddViewModeManager = SddViewModeManager;
//# sourceMappingURL=sddViewModeManager.js.map
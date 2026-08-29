"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SddViewModeManager = void 0;
const vscode = require("vscode");
class SddViewModeManager {
    static _mode = 'preview';
    static get mode() {
        return this._mode;
    }
    static get label() {
        switch (this._mode) {
            case 'both':
                return 'Ambos Lado a Lado';
            case 'preview':
                return 'Apenas Renderizado (Preview)';
            case 'code':
                return 'Apenas Código-Fonte (Editor)';
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
        vscode.window.setStatusBarMessage(`Exibição SDD: ${this.label}`, 2500);
        if (onChanged) {
            onChanged();
        }
        return this._mode;
    }
}
exports.SddViewModeManager = SddViewModeManager;
//# sourceMappingURL=sddViewModeManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalModeManager = void 0;
const vscode = require("vscode");
class TerminalModeManager {
    static _reuseTerminal = true;
    static get isReuse() {
        return this._reuseTerminal;
    }
    static toggle(onChanged) {
        this._reuseTerminal = !this._reuseTerminal;
        vscode.window.setStatusBarMessage(this._reuseTerminal ? '🔄 Modo de Terminal: Reutilizando terminal ativo' : '➕ Modo de Terminal: Abrindo novo terminal para cada comando', 2500);
        if (onChanged) {
            onChanged();
        }
        return this._reuseTerminal;
    }
}
exports.TerminalModeManager = TerminalModeManager;
//# sourceMappingURL=terminalModeManager.js.map
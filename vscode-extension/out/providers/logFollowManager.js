"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFollowManager = void 0;
const vscode = require("vscode");
class LogFollowManager {
    static isApacheFollowing = false;
    static isPhpFollowing = false;
    static apacheTerminal;
    static phpTerminal;
    static toggleApacheLogs(onUpdated) {
        if (this.isApacheFollowing) {
            // Parar o follow enviando Ctrl+C (\u0003) para liberar o terminal
            if (this.apacheTerminal && this.apacheTerminal.exitStatus === undefined) {
                this.apacheTerminal.sendText('\u0003', false);
            }
            this.isApacheFollowing = false;
            vscode.window.showInformationMessage('⏹️ Monitoramento de Logs do Apache parado. Terminal liberado!');
        }
        else {
            // Iniciar o follow em terminal dedicado
            if (!this.apacheTerminal || this.apacheTerminal.exitStatus !== undefined) {
                this.apacheTerminal = vscode.window.createTerminal({ name: 'Conn2Flow: Logs Apache' });
            }
            this.apacheTerminal.show();
            this.apacheTerminal.sendText('docker logs conn2flow-app --tail 50 --follow');
            this.isApacheFollowing = true;
            vscode.window.showInformationMessage('🟢 Monitorando Logs do Apache ao vivo. Clique novamente no botão para parar!');
        }
        if (onUpdated) {
            onUpdated();
        }
    }
    static togglePhpLogs(onUpdated) {
        if (this.isPhpFollowing) {
            // Parar o follow enviando Ctrl+C (\u0003) para liberar o terminal
            if (this.phpTerminal && this.phpTerminal.exitStatus === undefined) {
                this.phpTerminal.sendText('\u0003', false);
            }
            this.isPhpFollowing = false;
            vscode.window.showInformationMessage('⏹️ Monitoramento de Logs PHP parado. Terminal liberado!');
        }
        else {
            // Iniciar o follow em terminal dedicado
            if (!this.phpTerminal || this.phpTerminal.exitStatus !== undefined) {
                this.phpTerminal = vscode.window.createTerminal({ name: 'Conn2Flow: Logs PHP' });
            }
            this.phpTerminal.show();
            this.phpTerminal.sendText('docker exec conn2flow-app bash -c "tail -f /var/log/php_errors.log"');
            this.isPhpFollowing = true;
            vscode.window.showInformationMessage('🟢 Monitorando Logs PHP ao vivo. Clique novamente no botão para parar!');
        }
        if (onUpdated) {
            onUpdated();
        }
    }
    static handleTerminalClosed(closedTerminal, onUpdated) {
        let changed = false;
        if (this.apacheTerminal === closedTerminal) {
            this.isApacheFollowing = false;
            this.apacheTerminal = undefined;
            changed = true;
        }
        if (this.phpTerminal === closedTerminal) {
            this.isPhpFollowing = false;
            this.phpTerminal = undefined;
            changed = true;
        }
        if (changed && onUpdated) {
            onUpdated();
        }
    }
}
exports.LogFollowManager = LogFollowManager;
//# sourceMappingURL=logFollowManager.js.map
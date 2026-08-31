"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubTaskWatcher = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const localizationManager_1 = require("./localizationManager");
const hubTaskWatcherPolicy_1 = require("../hubTaskWatcherPolicy");
class HubTaskWatcher {
    static _enabled = true;
    static storage;
    static storageKey = 'conn2flow.hub.watcherEnabled';
    static taskWatcher;
    static completionWatcher;
    static initialize(context, refreshAll) {
        this.storage = context.workspaceState;
        this._enabled = this.storage.get(this.storageKey, true);
        const disposables = [];
        try {
            this.taskWatcher = vscode.workspace.createFileSystemWatcher('**/tasks/*.json');
            this.taskWatcher.onDidCreate(uri => this.handleTaskUri(uri), null, disposables);
            this.taskWatcher.onDidChange(uri => this.handleTaskUri(uri), null, disposables);
            disposables.push(this.taskWatcher);
        }
        catch {
            // workspace sem suporte a watcher
        }
        try {
            this.completionWatcher = vscode.workspace.createFileSystemWatcher('**/completions/*.json');
            this.completionWatcher.onDidCreate(uri => this.handleCompletionUri(uri), null, disposables);
            this.completionWatcher.onDidChange(uri => this.handleCompletionUri(uri), null, disposables);
            disposables.push(this.completionWatcher);
        }
        catch {
            // workspace sem suporte a watcher
        }
        return {
            dispose: () => {
                disposables.forEach(d => d.dispose());
            }
        };
    }
    static isEnabled() {
        return this._enabled;
    }
    static toggle(onChanged) {
        this._enabled = !this._enabled;
        void this.storage?.update(this.storageKey, this._enabled);
        const msgKey = this._enabled ? 'hub.watcherStarted' : 'hub.watcherPaused';
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t(msgKey), 2500);
        onChanged?.();
        return this._enabled;
    }
    static setEnabled(enabled, onChanged) {
        this._enabled = enabled;
        void this.storage?.update(this.storageKey, this._enabled);
        onChanged?.();
    }
    static handleTaskUri(uri) {
        if (!this._enabled)
            return;
        try {
            if (fs.existsSync(uri.fsPath)) {
                const raw = fs.readFileSync(uri.fsPath, 'utf8');
                const payload = (0, hubTaskWatcherPolicy_1.parseHubPayload)(raw);
                const evalResult = (0, hubTaskWatcherPolicy_1.evaluateTaskEvent)(this._enabled, payload);
                if (evalResult.shouldHandle) {
                    const reqId = evalResult.reqId || path.basename(uri.fsPath, '.json');
                    const message = localizationManager_1.LocalizationManager.t('hub.taskDispatched', { req: reqId });
                    vscode.window.setStatusBarMessage(`$(sync~spin) ${message}`, 4000);
                }
            }
        }
        catch {
            // leitura silenciosa
        }
    }
    static handleCompletionUri(uri) {
        if (!this._enabled)
            return;
        try {
            if (fs.existsSync(uri.fsPath)) {
                const raw = fs.readFileSync(uri.fsPath, 'utf8');
                const payload = (0, hubTaskWatcherPolicy_1.parseHubPayload)(raw);
                const evalResult = (0, hubTaskWatcherPolicy_1.evaluateCompletionEvent)(this._enabled, payload);
                if (evalResult.shouldHandle) {
                    const batchId = evalResult.batchId || path.basename(uri.fsPath, '-executor-receipt.json');
                    const message = localizationManager_1.LocalizationManager.t('hub.executorCompleted', { batch: batchId });
                    vscode.window.setStatusBarMessage(`$(check) ${message}`, 4000);
                }
            }
        }
        catch {
            // leitura silenciosa
        }
    }
}
exports.HubTaskWatcher = HubTaskWatcher;
//# sourceMappingURL=hubTaskWatcher.js.map
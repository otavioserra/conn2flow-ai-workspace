"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MddRemoteSyncManager = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const mddRemoteSyncPolicy_1 = require("../mddRemoteSyncPolicy");
const localizationManager_1 = require("./localizationManager");
const mddHubManager_1 = require("./mddHubManager");
const skillKits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const configuration = ['autoSyncSkills', 'autoSyncIntervalHours', 'remoteMatrixUrl', 'projectDomain'];
class MddRemoteSyncManager {
    state;
    repaint;
    running = new Set();
    available = new Map();
    subscriptions;
    timer;
    disposed = false;
    constructor(state, repaint) {
        this.state = state;
        this.repaint = repaint;
        this.subscriptions = [
            vscode.workspace.onDidGrantWorkspaceTrust(() => void this.tick()),
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                const open = new Set((vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.toString()));
                for (const key of this.available.keys())
                    if (!open.has(key))
                        this.available.delete(key);
                this.repaint();
                void this.tick();
            }),
            vscode.workspace.onDidChangeConfiguration(event => {
                if (!configuration.some(key => event.affectsConfiguration('conn2flow.' + key)))
                    return;
                this.available.clear();
                this.repaint();
                void this.tick();
            })
        ];
        this.timer = setInterval(() => void this.tick(), 60_000);
        void this.tick();
    }
    dispose() {
        this.disposed = true;
        clearInterval(this.timer);
        for (const item of this.subscriptions)
            item.dispose();
    }
    pendingUpdates() {
        return [...this.available.values()].reduce((total, value) => total + value, 0);
    }
    async runManual() {
        if (!vscode.workspace.isTrusted) {
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'), 6000);
            return;
        }
        const folders = vscode.workspace.workspaceFolders ?? [];
        const folder = folders.length === 1 ? folders[0] : await vscode.window.showWorkspaceFolderPick();
        if (folder)
            await this.sync(folder, false, true);
    }
    async tick() {
        if (this.disposed || !vscode.workspace.isTrusted)
            return;
        for (const folder of vscode.workspace.workspaceFolders ?? []) {
            const settings = vscode.workspace.getConfiguration('conn2flow', folder.uri);
            const mode = settings.get('autoSyncSkills', 'notify');
            if (this.disposed || !vscode.workspace.isTrusted || mode === 'off' || folder.uri.scheme !== 'file')
                continue;
            const key = this.attemptKey(folder, settings);
            const interval = settings.get('autoSyncIntervalHours', 24);
            if (!(0, mddRemoteSyncPolicy_1.remoteSyncDue)(mode, interval, this.state.get(key), Date.now()))
                continue;
            if (!skillKits.some(kit => fs.existsSync(path.join(folder.uri.fsPath, kit, 'skills'))))
                continue;
            await this.sync(folder, mode === 'notify', false);
        }
    }
    attemptKey(folder, settings) {
        return 'conn2flow.remoteSkills.lastAttempt.' + JSON.stringify([
            folder.uri.toString(), settings.get('remoteMatrixUrl', mddRemoteSyncPolicy_1.DEFAULT_REMOTE_MATRIX), settings.get('projectDomain', 'auto'),
            settings.get('autoSyncSkills', 'notify')
        ]);
    }
    async sync(folder, checkOnly, manual) {
        const folderKey = folder.uri.toString();
        if (this.disposed || !vscode.workspace.isTrusted || folder.uri.scheme !== 'file' || this.running.has(folderKey))
            return;
        this.running.add(folderKey);
        try {
            const settings = vscode.workspace.getConfiguration('conn2flow', folder.uri);
            const url = settings.get('remoteMatrixUrl', mddRemoteSyncPolicy_1.DEFAULT_REMOTE_MATRIX);
            const args = (0, mddRemoteSyncPolicy_1.buildRemoteSyncArgs)(folder.uri.fsPath, settings.get('projectDomain'), url, checkOnly);
            const attempt = this.attemptKey(folder, settings);
            await this.state.update(attempt, Date.now());
            if (this.disposed || !vscode.workspace.isTrusted)
                return;
            const run = () => mddHubManager_1.MddHubManager.runMdd(args, folder.uri.fsPath, 300_000);
            const stdout = manual ? await vscode.window.withProgress({
                location: { viewId: 'conn2flow-mdd-hub' },
                title: localizationManager_1.LocalizationManager.t('mddHub.remoteSyncRunning')
            }, run) : await run();
            const report = (0, mddRemoteSyncPolicy_1.parseRemoteSyncReport)(stdout);
            mddHubManager_1.MddHubManager.log(JSON.stringify({ remoteSkillSync: { folder: folder.name, checkOnly, ...report } }));
            if (this.disposed)
                return;
            const current = vscode.workspace.getConfiguration('conn2flow', folder.uri);
            if (this.attemptKey(folder, current) !== attempt ||
                !vscode.workspace.workspaceFolders?.some(value => value.uri.toString() === folderKey))
                return;
            if (checkOnly && report.available.length) {
                this.available.set(folderKey, report.available.length);
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.remoteSyncAvailable', {
                    count: report.available.length
                }), 10000);
            }
            else {
                this.available.delete(folderKey);
                if (manual)
                    vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.remoteSyncResult', {
                        count: report.updated.length, conflicts: report.conflicts.length
                    }), 10000);
            }
            this.repaint();
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            mddHubManager_1.MddHubManager.log('Remote skill sync failed: ' + detail);
            if (manual && !this.disposed)
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.remoteSyncFailed'), 10000);
        }
        finally {
            this.running.delete(folderKey);
        }
    }
}
exports.MddRemoteSyncManager = MddRemoteSyncManager;
//# sourceMappingURL=mddRemoteSyncManager.js.map
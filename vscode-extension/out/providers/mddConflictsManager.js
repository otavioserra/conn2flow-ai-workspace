"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MddConflictsManager = void 0;
const child_process_1 = require("child_process");
const path = require("path");
const vscode = require("vscode");
const projectConflictsPolicy_1 = require("../projectConflictsPolicy");
const localizationManager_1 = require("./localizationManager");
const sddScopeManager_1 = require("./sddScopeManager");
const workspaceLocator_1 = require("./workspaceLocator");
/** UI bridge only: Python and the canonical synchronizer own hash decisions. */
class MddConflictsManager {
    static async open() {
        if (!vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'));
            return;
        }
        const memoryRoot = sddScopeManager_1.SddScopeManager.getActiveSddRoot();
        if (!memoryRoot) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('sdd.folderMissing', { scope: sddScopeManager_1.SddScopeManager.getScopeLabel() }));
            return;
        }
        const root = path.dirname(memoryRoot);
        try {
            const conflicts = (0, projectConflictsPolicy_1.parseMemorySyncReport)(await this.run((0, projectConflictsPolicy_1.buildMemorySyncArgs)(root), root, true));
            if (!conflicts.length) {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mdd.conflictsEmpty'), 4000);
                return;
            }
            const selected = await vscode.window.showQuickPick(conflicts.map(conflict => ({
                label: conflict.path,
                description: conflict.motivo,
                detail: localizationManager_1.LocalizationManager.t('mdd.conflictHashes', {
                    seed: conflict.seed_sha256 || '—', local: conflict.local_sha256 || '—'
                }),
                conflict
            })), { placeHolder: localizationManager_1.LocalizationManager.t('mdd.conflictsPrompt') });
            if (!selected || !selected.conflict.local_sha256 || !selected.conflict.seed_sha256)
                return;
            const action = localizationManager_1.LocalizationManager.t('mdd.customize');
            const choice = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('mdd.customizeConfirm', { path: selected.conflict.path }), { modal: true }, action);
            if (choice !== action)
                return;
            await this.run((0, projectConflictsPolicy_1.buildMemorySyncArgs)(root, selected.conflict.path, selected.conflict), root);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mdd.customized'), 4000);
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.conflictError', {
                message: error instanceof Error ? error.message : String(error)
            }));
        }
    }
    static run(args, root, audit = false) {
        const command = (0, projectConflictsPolicy_1.resolveMddExecutable)(workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot(), vscode.workspace.getConfiguration('conn2flow').get('mddExecutable'));
        return new Promise((resolve, reject) => (0, child_process_1.execFile)(command, args, {
            cwd: root, windowsHide: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024
        }, (error, stdout, stderr) => {
            // Audit intentionally exits 1 when conflicts exist; accept only a valid FAIL report.
            if (error) {
                try {
                    const data = JSON.parse(stdout);
                    if (audit && data.status === 'FAIL' && Array.isArray(data.divergentes)) {
                        resolve(stdout);
                        return;
                    }
                }
                catch { /* Show the process error below. */ }
                reject(new Error(stderr.trim() || error.message));
                return;
            }
            resolve(stdout);
        }));
    }
}
exports.MddConflictsManager = MddConflictsManager;
//# sourceMappingURL=mddConflictsManager.js.map
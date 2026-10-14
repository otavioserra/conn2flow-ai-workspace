import { execFile } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { buildMemorySyncArgs, parseMemorySyncReport, resolveMddExecutable } from '../projectConflictsPolicy';
import { LocalizationManager } from './localizationManager';
import { SddScopeManager } from './sddScopeManager';
import { WorkspaceLocator } from './workspaceLocator';

/** UI bridge only: Python and the canonical synchronizer own hash decisions. */
export class MddConflictsManager {
    public static async open(): Promise<void> {
        if (!vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(LocalizationManager.t('command.trustRequired'));
            return;
        }
        const memoryRoot = SddScopeManager.getActiveSddRoot();
        if (!memoryRoot) {
            vscode.window.showWarningMessage(LocalizationManager.t('sdd.folderMissing', { scope: SddScopeManager.getScopeLabel() }));
            return;
        }
        const root = path.dirname(memoryRoot);
        try {
            const conflicts = parseMemorySyncReport(await this.run(buildMemorySyncArgs(root), root, true));
            if (!conflicts.length) {
                vscode.window.setStatusBarMessage(LocalizationManager.t('mdd.conflictsEmpty'), 4000);
                return;
            }
            const selected = await vscode.window.showQuickPick(conflicts.map(conflict => ({
                label: conflict.path,
                description: conflict.motivo,
                detail: LocalizationManager.t('mdd.conflictHashes', {
                    seed: conflict.seed_sha256 || '—', local: conflict.local_sha256 || '—'
                }),
                conflict
            })), { placeHolder: LocalizationManager.t('mdd.conflictsPrompt') });
            if (!selected || !selected.conflict.local_sha256 || !selected.conflict.seed_sha256) return;
            const action = LocalizationManager.t('mdd.customize');
            const choice = await vscode.window.showWarningMessage(
                LocalizationManager.t('mdd.customizeConfirm', { path: selected.conflict.path }),
                { modal: true }, action
            );
            if (choice !== action) return;
            await this.run(buildMemorySyncArgs(root, selected.conflict.path, selected.conflict), root);
            vscode.window.setStatusBarMessage(LocalizationManager.t('mdd.customized'), 4000);
        } catch (error) {
            vscode.window.showErrorMessage(LocalizationManager.t('projects.conflictError', {
                message: error instanceof Error ? error.message : String(error)
            }));
        }
    }

    private static run(args: string[], root: string, audit = false): Promise<string> {
        const command = resolveMddExecutable(WorkspaceLocator.getAiWorkspaceRoot(),
            vscode.workspace.getConfiguration('conn2flow').get<string>('mddExecutable'));
        return new Promise((resolve, reject) => execFile(command, args, {
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
                } catch { /* Show the process error below. */ }
                reject(new Error(stderr.trim() || error.message));
                return;
            }
            resolve(stdout);
        }));
    }
}

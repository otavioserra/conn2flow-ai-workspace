"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MddBootstrapManager = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const domainPolicy_1 = require("../domainPolicy");
const localizationManager_1 = require("./localizationManager");
const mddHubManager_1 = require("./mddHubManager");
const workspaceLocator_1 = require("./workspaceLocator");
/**
 * "Initialize MDD in this Project" (ARCH-019 Phase 1). The domain list and every write come from
 * `mdd bootstrap`; this class only picks the folder and the domain and reports the result.
 */
class MddBootstrapManager {
    static async initializeProject() {
        if (!vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'));
            return false;
        }
        const folder = await this.pickFolder();
        if (!folder)
            return false;
        const matrix = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        const name = path.basename(folder);
        let catalog;
        try {
            catalog = (0, domainPolicy_1.parseDomainList)(await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: localizationManager_1.LocalizationManager.t('bootstrap.loadingDomains') }, () => mddHubManager_1.MddHubManager.runMdd((0, domainPolicy_1.buildListDomainsArgs)(folder, matrix), folder, 60000)));
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('bootstrap.failed', { message: this.message(error) }));
            return false;
        }
        if (catalog.errors.length) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('bootstrap.invalidDomains', {
                count: String(catalog.errors.length), names: catalog.errors.map(item => item.domain).join(', ')
            }));
        }
        const config = vscode.workspace.getConfiguration('conn2flow', vscode.Uri.file(folder));
        const configured = (0, domainPolicy_1.normalizeProjectDomain)(config.get('projectDomain'));
        const items = (0, domainPolicy_1.buildDomainPickItems)(catalog, configured, {
            auto: detected => localizationManager_1.LocalizationManager.t('bootstrap.auto', { domain: detected }),
            autoDetail: evidence => localizationManager_1.LocalizationManager.t('bootstrap.autoDetail', { evidence }),
            fallback: localizationManager_1.LocalizationManager.t('bootstrap.fallback'),
            current: localizationManager_1.LocalizationManager.t('bootstrap.current')
        });
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.activeItems = items.filter(item => item.picked);
        quickPick.placeholder = localizationManager_1.LocalizationManager.t('bootstrap.pickDomain', { folder: name });
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        const picked = await new Promise(resolve => {
            quickPick.onDidAccept(() => { resolve(quickPick.selectedItems[0]); quickPick.hide(); });
            quickPick.onDidHide(() => resolve(undefined));
            quickPick.show();
        });
        quickPick.dispose();
        if (!picked)
            return false;
        const domain = picked.domainId;
        const effective = domain === 'auto' ? catalog.detected?.id || domain : domain;
        try {
            const summary = (0, domainPolicy_1.parseBootstrapReport)(await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: localizationManager_1.LocalizationManager.t('bootstrap.running', { domain: effective, folder: name }) }, () => mddHubManager_1.MddHubManager.runMdd((0, domainPolicy_1.buildBootstrapArgs)(folder, domain, matrix), folder, 180000)));
            if (configured !== domain && vscode.workspace.workspaceFolders?.length)
                await config.update('projectDomain', domain, vscode.ConfigurationTarget.Workspace);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('bootstrap.done', {
                folder: name, domain: summary.domain, installed: String(summary.installed),
                preserved: String(summary.preserved), memory: String(summary.memoryCreated)
            }), 10000);
            // A freshly created memory tree opens its entry point; existing memory is left untouched and closed.
            const current = path.join(folder, 'memory', 'human-requests', 'CURRENT.md');
            if (!summary.memoryPreserved && summary.memoryCreated > 0 && fs.existsSync(current)) {
                await vscode.window.showTextDocument(vscode.Uri.file(current), { preview: true });
            }
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('bootstrap.failed', { message: this.message(error) }));
            return false;
        }
    }
    static async pickFolder() {
        const folders = vscode.workspace.workspaceFolders || [];
        if (folders.length === 1)
            return folders[0].uri.fsPath;
        if (folders.length > 1) {
            const picked = await vscode.window.showWorkspaceFolderPick({ placeHolder: localizationManager_1.LocalizationManager.t('bootstrap.pickFolder') });
            return picked?.uri.fsPath;
        }
        const chosen = await vscode.window.showOpenDialog({
            canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: localizationManager_1.LocalizationManager.t('bootstrap.pickFolder')
        });
        return chosen?.[0]?.fsPath;
    }
    static message(error) { return error instanceof Error ? error.message.split(/\r?\n/)[0] : String(error); }
}
exports.MddBootstrapManager = MddBootstrapManager;
//# sourceMappingURL=mddBootstrapManager.js.map
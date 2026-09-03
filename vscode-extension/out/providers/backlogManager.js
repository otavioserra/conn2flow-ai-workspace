"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacklogManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const backlogPolicy_1 = require("../backlogPolicy");
const localizationManager_1 = require("./localizationManager");
const sddScopeManager_1 = require("./sddScopeManager");
class BacklogManager {
    static async browse(openFile) {
        const root = sddScopeManager_1.SddScopeManager.getActiveSddRoot();
        const scope = sddScopeManager_1.SddScopeManager.getScopeLabel();
        if (!root) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('sdd.folderMissing', { scope }));
            return;
        }
        const backlogRoot = path.join(root, 'backlog');
        const indexPath = path.join(backlogRoot, 'BACKLOG-INDEX.md');
        if (!fs.existsSync(indexPath)) {
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('backlog.empty', { scope }), 3000);
            return;
        }
        const items = (0, backlogPolicy_1.parseBacklogIndex)(fs.readFileSync(indexPath, 'utf8')).map(item => this.withFileStatus(backlogRoot, item));
        if (items.length === 0) {
            await openFile('sdd/backlog/BACKLOG-INDEX.md');
            return;
        }
        const statuses = [...new Set(items.flatMap(item => [item.indexStatus, item.fileStatus].filter(Boolean)))].sort();
        const filter = await vscode.window.showQuickPick([{ label: localizationManager_1.LocalizationManager.t('backlog.all'), value: '*' }, ...statuses.map(status => ({ label: status, value: status }))], { placeHolder: localizationManager_1.LocalizationManager.t('backlog.filterPrompt') });
        if (!filter)
            return;
        const visible = filter.value === '*'
            ? items
            : items.filter(item => item.indexStatus === filter.value || item.fileStatus === filter.value);
        const selected = await vscode.window.showQuickPick(visible.map(item => ({
            label: `${(0, backlogPolicy_1.hasBacklogStatusDrift)(item) ? '$(warning) ' : ''}${item.id} — ${item.title}`,
            description: `${item.type} · ${item.indexStatus}`,
            detail: (0, backlogPolicy_1.hasBacklogStatusDrift)(item)
                ? localizationManager_1.LocalizationManager.t('backlog.drift', { index: item.indexStatus, file: item.fileStatus || '?' })
                : item.nextAction,
            item
        })), { placeHolder: localizationManager_1.LocalizationManager.t('backlog.itemPrompt', { scope }) });
        if (!selected)
            return;
        const action = await vscode.window.showQuickPick([
            { label: `$(go-to-file) ${selected.item.id}`, value: 'open' },
            { label: `$(diff-added) ${localizationManager_1.LocalizationManager.t('backlog.promote')}`, value: 'promote' },
            { label: `$(list-unordered) ${localizationManager_1.LocalizationManager.t('backlog.openIndex')}`, value: 'index' }
        ]);
        if (action?.value === 'open') {
            await openFile(`sdd/backlog/${selected.item.fileName}`);
        }
        else if (action?.value === 'index') {
            await openFile('sdd/backlog/BACKLOG-INDEX.md');
        }
        else if (action?.value === 'promote') {
            await this.preparePromotion(selected.item, openFile);
        }
    }
    static withFileStatus(root, item) {
        const filePath = path.join(root, item.fileName);
        return {
            ...item,
            fileStatus: fs.existsSync(filePath)
                ? (0, backlogPolicy_1.parseBacklogFileStatus)(fs.readFileSync(filePath, 'utf8'))
                : undefined
        };
    }
    static async preparePromotion(item, openFile) {
        const answer = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('backlog.intakeGate'), { modal: true }, localizationManager_1.LocalizationManager.t('backlog.promote'));
        if (!answer)
            return;
        const prompt = localizationManager_1.LocalizationManager.t('backlog.promotionPrompt', {
            id: item.id,
            type: item.type,
            status: item.fileStatus || item.indexStatus,
            title: item.title,
            action: item.nextAction,
            file: item.fileName
        });
        await vscode.env.clipboard.writeText(prompt);
        await openFile(`sdd/backlog/${item.fileName}`);
    }
}
exports.BacklogManager = BacklogManager;
//# sourceMappingURL=backlogManager.js.map
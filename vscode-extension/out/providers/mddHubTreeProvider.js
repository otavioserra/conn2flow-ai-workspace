"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MddHubTreeProvider = exports.MddHubTreeItem = void 0;
const vscode = require("vscode");
const mddHubPolicy_1 = require("../mddHubPolicy");
const localizationManager_1 = require("./localizationManager");
const mddHubManager_1 = require("./mddHubManager");
class MddHubTreeItem extends vscode.TreeItem {
    kind;
    children;
    serverId;
    feedback;
    constructor(label, kind, collapsible, children = [], serverId, feedback) {
        super(label, collapsible);
        this.kind = kind;
        this.children = children;
        this.serverId = serverId;
        this.feedback = feedback;
    }
}
exports.MddHubTreeItem = MddHubTreeItem;
/** "MDD Hub & Skills Control" view: server status/control and feedback triage. */
class MddHubTreeProvider {
    changeEmitter = new vscode.EventEmitter();
    onDidChangeTreeData = this.changeEmitter.event;
    loading;
    /** Re-probes servers and reloads `mdd feedback list`, then repaints. */
    async refresh() {
        if (!this.loading) {
            this.loading = Promise.all([mddHubManager_1.MddHubManager.refreshStatuses(), mddHubManager_1.MddHubManager.loadFeedback()])
                .then(() => undefined)
                .finally(() => { this.loading = undefined; });
        }
        await this.loading;
        this.changeEmitter.fire();
    }
    /** Repaints from cached state (no process probe). */
    repaint() { this.changeEmitter.fire(); }
    getTreeItem(element) { return element; }
    getChildren(element) {
        if (element)
            return element.children;
        return [this.serversSection(), this.feedbackSection()];
    }
    serversSection() {
        const section = new MddHubTreeItem(localizationManager_1.LocalizationManager.t('mddHub.section.servers'), 'section', vscode.TreeItemCollapsibleState.Expanded, mddHubManager_1.MDD_SERVER_IDS.map(id => this.serverItem(id)));
        section.id = 'mddHub.servers';
        section.iconPath = new vscode.ThemeIcon('server-process');
        section.tooltip = localizationManager_1.LocalizationManager.t('tooltip.mddHub.servers');
        return section;
    }
    serverItem(id) {
        const status = mddHubManager_1.MddHubManager.getCachedStatus(id);
        const busy = mddHubManager_1.MddHubManager.isBusy(id);
        const item = new MddHubTreeItem(mddHubManager_1.MddHubManager.serverLabel(id), 'server', vscode.TreeItemCollapsibleState.None, [], id);
        item.id = `mddHub.server.${id}`;
        item.description = busy ? localizationManager_1.LocalizationManager.t('mddHub.busy') : (0, mddHubPolicy_1.describeServerStatus)(status, localizationManager_1.LocalizationManager.currentLocale);
        item.contextValue = (0, mddHubPolicy_1.serverContextValue)(status);
        item.iconPath = busy
            ? new vscode.ThemeIcon('loading~spin')
            : new vscode.ThemeIcon(status.state === 'RUNNING' ? 'pass-filled' : 'circle-slash', new vscode.ThemeColor(status.state === 'RUNNING' ? 'testing.iconPassed' : 'disabledForeground'));
        item.tooltip = localizationManager_1.LocalizationManager.t(id === 'mdd-client' ? 'tooltip.mddHub.mddClient' : 'tooltip.mddHub.hub')
            + (status.external ? `

${localizationManager_1.LocalizationManager.t('mddHub.externalTooltip', { pid: String(status.pid ?? '?') })}` : '');
        return item;
    }
    feedbackSection() {
        const records = mddHubManager_1.MddHubManager.getFeedback();
        const error = mddHubManager_1.MddHubManager.getFeedbackError();
        let children;
        if (error) {
            children = [this.message(localizationManager_1.LocalizationManager.t('mddHub.feedbackError', { message: error.split(/\r?\n/)[0] }), 'warning', error)];
        }
        else if (!records.length) {
            children = [this.message(localizationManager_1.LocalizationManager.t('mddHub.feedbackEmpty'), 'inbox')];
        }
        else {
            children = (0, mddHubPolicy_1.groupFeedback)(records).map(group => {
                const node = new MddHubTreeItem(localizationManager_1.LocalizationManager.t('mddHub.groupLabel', {
                    verdict: (0, mddHubPolicy_1.feedbackLabel)(localizationManager_1.LocalizationManager.currentLocale, 'group', group.verdict), count: group.items.length
                }), 'group', group.verdict === 'PENDING' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed, group.items.map(record => this.feedbackItem(record)));
                node.id = `mddHub.group.${group.verdict}`;
                node.iconPath = new vscode.ThemeIcon(group.verdict === 'PENDING' ? 'inbox' : 'checklist');
                return node;
            });
        }
        const label = localizationManager_1.LocalizationManager.t('mddHub.section.feedback', { count: records.length });
        const section = new MddHubTreeItem(label, 'section', vscode.TreeItemCollapsibleState.Expanded, children);
        section.id = 'mddHub.feedback';
        section.iconPath = new vscode.ThemeIcon('feedback');
        section.description = mddHubManager_1.MddHubManager.includeGithub() ? localizationManager_1.LocalizationManager.t('mddHub.githubOn') : undefined;
        section.tooltip = localizationManager_1.LocalizationManager.t('tooltip.mddHub.feedback');
        section.contextValue = 'mddHubFeedbackSection';
        return section;
    }
    feedbackItem(record) {
        const item = new MddHubTreeItem(`${record.id} — ${record.summary}`, 'feedback', vscode.TreeItemCollapsibleState.None, [], undefined, record);
        item.id = `mddHub.feedback.${record.id}`;
        item.description = (0, mddHubPolicy_1.describeFeedback)(record, localizationManager_1.LocalizationManager.currentLocale);
        item.contextValue = (0, mddHubPolicy_1.canTriage)(record) ? 'mddHubFeedback.triage' : 'mddHubFeedback.readonly';
        const icon = record.severity === 'high' ? 'error' : record.severity === 'medium' ? 'warning' : 'info';
        item.iconPath = new vscode.ThemeIcon(record.source === 'github' ? 'github' : icon);
        const tooltip = new vscode.MarkdownString();
        tooltip.isTrusted = false;
        tooltip.appendText(`${record.title || record.id}\n\n`);
        tooltip.appendText((0, mddHubPolicy_1.describeFeedbackMetadata)(record, localizationManager_1.LocalizationManager.currentLocale));
        item.tooltip = tooltip;
        item.command = { command: 'conn2flow.mddHub.openFeedback', title: record.id, arguments: [item] };
        return item;
    }
    message(label, icon, tooltip) {
        const item = new MddHubTreeItem(label, 'message', vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon(icon);
        item.tooltip = tooltip || label;
        return item;
    }
}
exports.MddHubTreeProvider = MddHubTreeProvider;
//# sourceMappingURL=mddHubTreeProvider.js.map
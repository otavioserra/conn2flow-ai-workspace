import * as vscode from 'vscode';
import { canTriage, describeFeedback, describeFeedbackMetadata, describeServerStatus, feedbackLabel, FeedbackRecord, groupFeedback, MddServerId, serverContextValue } from '../mddHubPolicy';
import { LocalizationManager } from './localizationManager';
import { MDD_SERVER_IDS, MddHubManager } from './mddHubManager';

type NodeKind = 'section' | 'server' | 'group' | 'feedback' | 'message';

export class MddHubTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly kind: NodeKind,
    collapsible: vscode.TreeItemCollapsibleState,
    public readonly children: MddHubTreeItem[] = [],
    public readonly serverId?: MddServerId,
    public readonly feedback?: FeedbackRecord
  ) {
    super(label, collapsible);
  }
}

/** "MDD Hub & Skills Control" view: server status/control and feedback triage. */
export class MddHubTreeProvider implements vscode.TreeDataProvider<MddHubTreeItem> {
  private readonly changeEmitter = new vscode.EventEmitter<MddHubTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.changeEmitter.event;
  private loading: Promise<void> | undefined;

  /** Re-probes servers and reloads `mdd feedback list`, then repaints. */
  async refresh(): Promise<void> {
    if (!this.loading) {
      this.loading = Promise.all([MddHubManager.refreshStatuses(), MddHubManager.loadFeedback()])
        .then(() => undefined)
        .finally(() => { this.loading = undefined; });
    }
    await this.loading;
    this.changeEmitter.fire();
  }

  /** Repaints from cached state (no process probe). */
  repaint(): void { this.changeEmitter.fire(); }

  getTreeItem(element: MddHubTreeItem): vscode.TreeItem { return element; }

  getChildren(element?: MddHubTreeItem): MddHubTreeItem[] {
    if (element) return element.children;
    return [this.serversSection(), this.feedbackSection()];
  }

  private serversSection(): MddHubTreeItem {
    const section = new MddHubTreeItem(LocalizationManager.t('mddHub.section.servers'), 'section',
      vscode.TreeItemCollapsibleState.Expanded, MDD_SERVER_IDS.map(id => this.serverItem(id)));
    section.id = 'mddHub.servers';
    section.iconPath = new vscode.ThemeIcon('server-process');
    section.tooltip = LocalizationManager.t('tooltip.mddHub.servers');
    return section;
  }

  private serverItem(id: MddServerId): MddHubTreeItem {
    const status = MddHubManager.getCachedStatus(id);
    const busy = MddHubManager.isBusy(id);
    const item = new MddHubTreeItem(MddHubManager.serverLabel(id), 'server', vscode.TreeItemCollapsibleState.None, [], id);
    item.id = `mddHub.server.${id}`;
    item.description = busy ? LocalizationManager.t('mddHub.busy') : describeServerStatus(status, LocalizationManager.currentLocale);
    item.contextValue = serverContextValue(status);
    item.iconPath = busy
      ? new vscode.ThemeIcon('loading~spin')
      : new vscode.ThemeIcon(status.state === 'RUNNING' ? 'pass-filled' : 'circle-slash',
        new vscode.ThemeColor(status.state === 'RUNNING' ? 'testing.iconPassed' : 'disabledForeground'));
    item.tooltip = LocalizationManager.t(id === 'mdd-client' ? 'tooltip.mddHub.mddClient' : 'tooltip.mddHub.hub')
      + (status.external ? `

${LocalizationManager.t('mddHub.externalTooltip', { pid: String(status.pid ?? '?') })}` : '');
    return item;
  }

  private feedbackSection(): MddHubTreeItem {
    const records = MddHubManager.getFeedback();
    const error = MddHubManager.getFeedbackError();
    let children: MddHubTreeItem[];
    if (error) {
      children = [this.message(LocalizationManager.t('mddHub.feedbackError', { message: error.split(/\r?\n/)[0] }), 'warning', error)];
    } else if (!records.length) {
      children = [this.message(LocalizationManager.t('mddHub.feedbackEmpty'), 'inbox')];
    } else {
      children = groupFeedback(records).map(group => {
        const node = new MddHubTreeItem(LocalizationManager.t('mddHub.groupLabel', {
          verdict: feedbackLabel(LocalizationManager.currentLocale, 'group', group.verdict), count: group.items.length
        }), 'group',
          group.verdict === 'PENDING' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
          group.items.map(record => this.feedbackItem(record)));
        node.id = `mddHub.group.${group.verdict}`;
        node.iconPath = new vscode.ThemeIcon(group.verdict === 'PENDING' ? 'inbox' : 'checklist');
        return node;
      });
    }
    const label = LocalizationManager.t('mddHub.section.feedback', { count: records.length });
    const section = new MddHubTreeItem(label, 'section', vscode.TreeItemCollapsibleState.Expanded, children);
    section.id = 'mddHub.feedback';
    section.iconPath = new vscode.ThemeIcon('feedback');
    section.description = MddHubManager.includeGithub() ? LocalizationManager.t('mddHub.githubOn') : undefined;
    section.tooltip = LocalizationManager.t('tooltip.mddHub.feedback');
    section.contextValue = 'mddHubFeedbackSection';
    return section;
  }

  private feedbackItem(record: FeedbackRecord): MddHubTreeItem {
    const item = new MddHubTreeItem(`${record.id} — ${record.summary}`, 'feedback', vscode.TreeItemCollapsibleState.None,
      [], undefined, record);
    item.id = `mddHub.feedback.${record.id}`;
    item.description = describeFeedback(record, LocalizationManager.currentLocale);
    item.contextValue = canTriage(record) ? 'mddHubFeedback.triage' : 'mddHubFeedback.readonly';
    const icon = record.severity === 'high' ? 'error' : record.severity === 'medium' ? 'warning' : 'info';
    item.iconPath = new vscode.ThemeIcon(record.source === 'github' ? 'github' : icon);
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = false;
    tooltip.appendText(`${record.title || record.id}\n\n`);
    tooltip.appendText(describeFeedbackMetadata(record, LocalizationManager.currentLocale));
    item.tooltip = tooltip;
    item.command = { command: 'conn2flow.mddHub.openFeedback', title: record.id, arguments: [item] };
    return item;
  }

  private message(label: string, icon: string, tooltip?: string): MddHubTreeItem {
    const item = new MddHubTreeItem(label, 'message', vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon(icon);
    item.tooltip = tooltip || label;
    return item;
  }
}

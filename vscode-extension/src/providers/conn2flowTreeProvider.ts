import * as vscode from 'vscode';
import { ModesManager } from './modesManager';
import { ProjectsManager } from './projectsManager';
import { CustomActionsManager } from './customActionsManager';
import { LogFollowManager } from './logFollowManager';
import { SddViewModeManager } from './sddViewModeManager';
import { SddScopeManager } from './sddScopeManager';
import { GardeningManager } from './gardeningManager';
import { LocalizationManager } from './localizationManager';
import { ReleaseManager } from './releaseManager';
import { TranslationKey } from '../localizationCatalog';
import { nextTreeExpansionVersion, normalizeTreeExpansionVersion, treeSectionId } from '../treeExpansionPolicy';

export class Conn2FlowTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    commandId?: string,
    iconName?: string | vscode.ThemeIcon,
    tooltipText?: string,
    public readonly children?: Conn2FlowTreeItem[],
    commandArgs?: unknown[],
    itemDescription?: string,
    itemId?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltipText || label;
    this.description = itemDescription;
    this.id = itemId;
    if (iconName) this.iconPath = typeof iconName === 'string' ? new vscode.ThemeIcon(iconName) : iconName;
    if (commandId) this.command = { command: commandId, title: label, arguments: commandArgs || [] };
  }
}

export class Conn2FlowTreeProvider implements vscode.TreeDataProvider<Conn2FlowTreeItem> {
  private readonly changeEmitter = new vscode.EventEmitter<Conn2FlowTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.changeEmitter.event;
  private expansion: 'default' | 'expanded' | 'collapsed';
  private readonly expansionKey = 'conn2flow.tree.expansion';
  private expansionVersion: number;
  private readonly expansionVersionKey = 'conn2flow.tree.expansionVersion';

  constructor(private readonly context: vscode.ExtensionContext) {
    this.expansion = context.workspaceState.get(this.expansionKey, 'default');
    this.expansionVersion = normalizeTreeExpansionVersion(context.workspaceState.get(this.expansionVersionKey));
  }

  refresh(): void { this.changeEmitter.fire(); }
  expandAll(): void { this.setExpansion('expanded'); }
  collapseAll(): void { this.setExpansion('collapsed'); }
  getTreeItem(element: Conn2FlowTreeItem): vscode.TreeItem { return element; }
  getChildren(element?: Conn2FlowTreeItem): Thenable<Conn2FlowTreeItem[]> {
    return Promise.resolve(element?.children || this.rootItems());
  }

  private state(primary = false): vscode.TreeItemCollapsibleState {
    if (this.expansion === 'expanded') return vscode.TreeItemCollapsibleState.Expanded;
    if (this.expansion === 'collapsed') return vscode.TreeItemCollapsibleState.Collapsed;
    return primary ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
  }

  private setExpansion(expansion: 'expanded' | 'collapsed'): void {
    this.expansion = expansion;
    this.expansionVersion = nextTreeExpansionVersion(this.expansionVersion);
    void Promise.all([
      this.context.workspaceState.update(this.expansionKey, this.expansion),
      this.context.workspaceState.update(this.expansionVersionKey, this.expansionVersion)
    ]);
    this.refresh();
  }

  private leaf(key: TranslationKey, command: string, icon: string, values: Record<string, string> = {}): Conn2FlowTreeItem {
    const label = LocalizationManager.t(key, values);
    return new Conn2FlowTreeItem(label, vscode.TreeItemCollapsibleState.None, command, icon, label);
  }

  private section(key: TranslationKey, id: string, icon: string, children: Conn2FlowTreeItem[], primary = false): Conn2FlowTreeItem {
    const label = LocalizationManager.t(key);
    return new Conn2FlowTreeItem(
      label,
      this.state(primary),
      undefined,
      icon,
      label,
      children,
      undefined,
      undefined,
      treeSectionId(id, this.expansionVersion)
    );
  }

  private rootItems(): Conn2FlowTreeItem[] {
    const modes = ModesManager.getCurrentModes();
    const target = ProjectsManager.getTargetProject();
    const targetValues = { target: target || LocalizationManager.t('common.none') };
    const autonomyKey: TranslationKey = modes.autonomy === 'autonomo_monitorado'
      ? 'mode.monitored'
      : modes.autonomy === 'autonomo_headless' ? 'mode.headless' : 'mode.supervised';

    const overview = [
      this.leaf('overview.scope', 'conn2flow.sdd.selectScope', 'target', { scope: SddScopeManager.getScopeLabel() }),
      this.leaf(target ? 'overview.target' : 'overview.noTarget', 'conn2flow.projects.setTarget', 'project', targetValues),
      this.leaf('overview.language', 'conn2flow.settings.selectLanguage', 'globe', { language: LocalizationManager.languageLabel }),
      this.leaf('overview.autonomy', 'conn2flow.modes.selectMode', 'shield', { mode: LocalizationManager.t(autonomyKey) })
    ];

    const sdd = [
      this.leaf('sdd.selectScope', 'conn2flow.sdd.selectScope', 'target'),
      this.leaf('sdd.viewMode', 'conn2flow.sdd.toggleViewMode', 'split-horizontal', { mode: SddViewModeManager.label }),
      this.leaf('sdd.openCurrent', 'conn2flow.sdd.openCurrent', 'file-text'),
      this.leaf('sdd.openSpec', 'conn2flow.sdd.openSpec', 'file-code'),
      this.leaf('sdd.openChecklist', 'conn2flow.sdd.openChecklist', 'checklist'),
      this.leaf('sdd.browseRequests', 'conn2flow.sdd.browseRequests', 'request-changes'),
      this.leaf('sdd.browseBatches', 'conn2flow.sdd.browseBatches', 'history'),
      this.leaf('sdd.browseBacklog', 'conn2flow.sdd.browseBacklog', 'list-unordered'),
      this.leaf('sdd.browseDecisions', 'conn2flow.sdd.browseDecisions', 'law'),
      this.leaf('sdd.browseHandoffs', 'conn2flow.sdd.browseHandoffs', 'repo-pull'),
      this.leaf('sdd.autoGardening', 'conn2flow.sdd.toggleAutoGardening', 'pulse', {
        status: LocalizationManager.t(GardeningManager.isAutoGardeningEnabled() ? 'gardening.enabled' : 'gardening.disabled')
      }),
      this.leaf('sdd.runGardening', 'conn2flow.sdd.runGardening', 'trash'),
      this.leaf('sdd.createGardening', 'conn2flow.sdd.createGardeningRequest', 'diff-added')
    ];

    const core = [
      this.leaf('core.updateAll', 'conn2flow.manager.updateAll', 'sync'),
      this.leaf('core.syncResources', 'conn2flow.manager.syncResources', 'file-submodule')
    ];
    if (target) {
      core.push(this.leaf('core.cssRebuild', 'conn2flow.manager.cssRebuild', 'zap', targetValues));
      core.push(this.leaf('core.cssAudit', 'conn2flow.manager.cssAudit', 'search', targetValues));
    }
    core.push(this.leaf('release.verify', 'conn2flow.release.verifyPermission', 'verified'));
    if (ReleaseManager.permissionState === 'allowed') {
      core.push(this.leaf('release.manager', 'conn2flow.release.manager', 'package'));
      core.push(this.leaf('release.installer', 'conn2flow.release.installer', 'package'));
      core.push(this.leaf('release.openActions', 'conn2flow.release.openActions', 'github-action'));
    }

    const projects = [this.leaf('projects.setTarget', 'conn2flow.projects.setTarget', 'target')];
    if (target) {
      projects.push(this.leaf('projects.updateAll', 'conn2flow.projects.updateAllTarget', 'refresh', targetValues));
      projects.push(this.leaf('projects.syncCore', 'conn2flow.projects.syncCoreTarget', 'arrow-right', targetValues));
      projects.push(this.leaf('projects.syncFiles', 'conn2flow.projects.syncFilesTarget', 'cloud-upload', targetValues));
      projects.push(this.leaf('projects.deploy', 'conn2flow.projects.deployTarget', 'rocket', targetValues));
    }
    projects.push(this.leaf('projects.updateSelect', 'conn2flow.projects.updateAllWithSelect', 'list-selection'));
    projects.push(this.leaf('projects.deploySelect', 'conn2flow.projects.deployOther', 'send'));
    projects.push(this.leaf('projects.scaffold', 'conn2flow.projects.scaffoldNew', 'new-folder'));
    projects.push(this.leaf('projects.register', 'conn2flow.projects.registerExisting', 'plus'));
    projects.push(this.leaf('projects.clone', 'conn2flow.projects.cloneMissing', 'repo-clone'));
    projects.push(this.leaf('projects.syncTemplate', 'conn2flow.projects.syncTemplate', 'diff-added'));

    const diagnostics = [
      this.leaf('diagnostics.dockerStatus', 'conn2flow.docker.status', 'pulse'),
      this.leaf('diagnostics.apacheLogs', 'conn2flow.docker.logsApache', LogFollowManager.isApacheFollowing ? 'debug-stop' : 'output'),
      this.leaf('diagnostics.phpLogs', 'conn2flow.docker.logsPhp', LogFollowManager.isPhpFollowing ? 'debug-stop' : 'terminal'),
      this.leaf('diagnostics.truncatePhp', 'conn2flow.docker.truncatePhpLog', 'trash'),
      this.leaf('diagnostics.aiSync', 'conn2flow.ai.sync', 'extensions'),
      this.leaf('diagnostics.syncAll', 'conn2flow.ai.syncAllRepos', 'repo-clone')
    ];

    const agents = [
      this.leaf('agents.selectMode', 'conn2flow.modes.selectMode', 'settings-gear'),
      this.leaf('agents.launchClaude', 'conn2flow.bridge.launchClaudeGoal', 'play-circle'),
      this.leaf('agents.copyPrompt', 'conn2flow.bridge.copyPrompt', 'clippy'),
      this.leaf('agents.recordHandoff', 'conn2flow.bridge.recordHandoff', 'repo-pull'),
      this.leaf('agents.prepareReview', 'conn2flow.bridge.notifyArchitect', 'source-control'),
      this.leaf('docs.panel', 'conn2flow.docs.openDevToolsGuide', 'dashboard'),
      this.leaf('docs.marketplace', 'conn2flow.docs.openMarketplaceGuide', 'cloud-upload'),
      this.leaf('docs.cli', 'conn2flow.docs.openDevGuide', 'book'),
      this.leaf('docs.orchestration', 'conn2flow.docs.openSddGuide', 'organization'),
      this.leaf('docs.architecture', 'conn2flow.docs.openArchitectureGuide', 'type-hierarchy'),
      this.leaf('docs.skills', 'conn2flow.ai.openCatalog', 'list-unordered'),
      this.leaf('settings.language', 'conn2flow.settings.selectLanguage', 'globe')
    ];

    const result = [
      this.section('section.overview', 'overview', 'dashboard', overview, true),
      this.section('section.sdd', 'sdd', 'shield', sdd),
      this.section('section.core', 'core', 'tools', core),
      this.section('section.projects', 'projects', 'folder-library', projects),
      this.section('section.diagnostics', 'diagnostics', 'server', diagnostics),
      this.section('section.agents', 'agents', 'organization', agents)
    ];

    const custom = CustomActionsManager.getActionsManifest();
    if (custom?.actions.length) {
      const children = custom.actions.map(action => new Conn2FlowTreeItem(
        action.label,
        vscode.TreeItemCollapsibleState.None,
        action.type === 'file' ? 'conn2flow.custom.openFile' : 'conn2flow.custom.runTerminal',
        action.icon || (action.type === 'file' ? 'file-code' : 'play'),
        action.description || action.label,
        undefined,
        [action.type === 'file' ? action.path : action.command]
      ));
      children.push(this.leaf('custom.edit', 'conn2flow.custom.editManifest', 'edit'));
      result.push(this.section('section.custom', 'custom', 'star', children));
    }
    return result;
  }
}

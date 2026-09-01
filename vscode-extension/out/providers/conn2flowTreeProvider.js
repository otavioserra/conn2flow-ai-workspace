"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conn2FlowTreeProvider = exports.Conn2FlowTreeItem = void 0;
const vscode = require("vscode");
const modesManager_1 = require("./modesManager");
const projectsManager_1 = require("./projectsManager");
const customActionsManager_1 = require("./customActionsManager");
const logFollowManager_1 = require("./logFollowManager");
const sddViewModeManager_1 = require("./sddViewModeManager");
const sddScopeManager_1 = require("./sddScopeManager");
const gardeningManager_1 = require("./gardeningManager");
const localizationManager_1 = require("./localizationManager");
const releaseManager_1 = require("./releaseManager");
const hubTaskWatcher_1 = require("./hubTaskWatcher");
const treeExpansionPolicy_1 = require("../treeExpansionPolicy");
const treeTooltipPolicy_1 = require("../treeTooltipPolicy");
class Conn2FlowTreeItem extends vscode.TreeItem {
    children;
    constructor(label, collapsibleState, commandId, iconName, tooltipText, children, commandArgs, itemDescription, itemId) {
        super(label, collapsibleState);
        this.children = children;
        const tooltip = new vscode.MarkdownString(tooltipText || label);
        tooltip.isTrusted = false;
        this.tooltip = tooltip;
        this.description = itemDescription;
        this.id = itemId;
        if (iconName)
            this.iconPath = typeof iconName === 'string' ? new vscode.ThemeIcon(iconName) : iconName;
        if (commandId)
            this.command = { command: commandId, title: label, arguments: commandArgs || [] };
    }
}
exports.Conn2FlowTreeItem = Conn2FlowTreeItem;
class Conn2FlowTreeProvider {
    context;
    changeEmitter = new vscode.EventEmitter();
    onDidChangeTreeData = this.changeEmitter.event;
    expansion;
    expansionKey = 'conn2flow.tree.expansion';
    expansionVersion;
    expansionVersionKey = 'conn2flow.tree.expansionVersion';
    constructor(context) {
        this.context = context;
        this.expansion = context.workspaceState.get(this.expansionKey, 'default');
        this.expansionVersion = (0, treeExpansionPolicy_1.normalizeTreeExpansionVersion)(context.workspaceState.get(this.expansionVersionKey));
    }
    refresh() { this.changeEmitter.fire(); }
    expandAll() { this.setExpansion('expanded'); }
    collapseAll() { this.setExpansion('collapsed'); }
    getTreeItem(element) { return element; }
    getChildren(element) {
        return Promise.resolve(element?.children || this.rootItems());
    }
    state(primary = false) {
        if (this.expansion === 'expanded')
            return vscode.TreeItemCollapsibleState.Expanded;
        if (this.expansion === 'collapsed')
            return vscode.TreeItemCollapsibleState.Collapsed;
        return primary ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }
    setExpansion(expansion) {
        this.expansion = expansion;
        this.expansionVersion = (0, treeExpansionPolicy_1.nextTreeExpansionVersion)(this.expansionVersion);
        void Promise.all([
            this.context.workspaceState.update(this.expansionKey, this.expansion),
            this.context.workspaceState.update(this.expansionVersionKey, this.expansionVersion)
        ]);
        this.refresh();
    }
    leaf(key, command, icon, values = {}) {
        const label = localizationManager_1.LocalizationManager.t(key, values);
        return new Conn2FlowTreeItem(label, vscode.TreeItemCollapsibleState.None, command, icon, `**${label}**\n\n${localizationManager_1.LocalizationManager.t((0, treeTooltipPolicy_1.treeTooltipKey)(key), values)}`);
    }
    section(key, id, icon, children, primary = false) {
        const label = localizationManager_1.LocalizationManager.t(key);
        return new Conn2FlowTreeItem(label, this.state(primary), undefined, icon, `**${label}**\n\n${localizationManager_1.LocalizationManager.t((0, treeTooltipPolicy_1.treeTooltipKey)(key))}`, children, undefined, undefined, (0, treeExpansionPolicy_1.treeSectionId)(id, this.expansionVersion));
    }
    releaseExecutionItem(product, key, command) {
        if (releaseManager_1.ReleaseManager.canExecute(product))
            return this.leaf(key, command, 'rocket');
        const label = localizationManager_1.LocalizationManager.t(key);
        return new Conn2FlowTreeItem(label, vscode.TreeItemCollapsibleState.None, command, 'lock', `**${label}**\n\n${localizationManager_1.LocalizationManager.t((0, treeTooltipPolicy_1.treeTooltipKey)(key))}\n\n${releaseManager_1.ReleaseManager.executionBlockerLabel(product)}`);
    }
    rootItems() {
        const modes = modesManager_1.ModesManager.getCurrentModes();
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        const targetValues = { target: target || localizationManager_1.LocalizationManager.t('common.none') };
        const topologyKey = modes.topology === 'duplo' ? 'mode.dual' : 'mode.triad';
        const autonomyKey = modes.autonomy === 'autonomo_monitorado'
            ? 'mode.monitored'
            : modes.autonomy === 'autonomo_headless' ? 'mode.headless' : 'mode.supervised';
        const watcherKey = hubTaskWatcher_1.HubTaskWatcher.isEnabled()
            ? 'agents.hubWatcherActive'
            : 'agents.hubWatcherPaused';
        const watcherIcon = hubTaskWatcher_1.HubTaskWatcher.isEnabled() ? 'pulse' : 'debug-pause';
        const overview = [
            this.leaf('overview.scope', 'conn2flow.sdd.selectScope', 'target', { scope: sddScopeManager_1.SddScopeManager.getScopeLabel() }),
            this.leaf(target ? 'overview.target' : 'overview.noTarget', 'conn2flow.projects.setTarget', 'project', targetValues),
            this.leaf('overview.language', 'conn2flow.settings.selectLanguage', 'globe', { language: localizationManager_1.LocalizationManager.languageLabel }),
            this.leaf('overview.topology', 'conn2flow.modes.selectTopology', 'organization', { mode: localizationManager_1.LocalizationManager.t(topologyKey) }),
            this.leaf('overview.autonomy', 'conn2flow.modes.selectAutonomy', 'shield', { mode: localizationManager_1.LocalizationManager.t(autonomyKey) }),
            this.leaf(watcherKey, 'conn2flow.hub.toggleWatcher', watcherIcon)
        ];
        const sdd = [
            this.leaf('agents.launchClaude', 'conn2flow.bridge.launchClaudeGoal', 'play-circle'),
            this.leaf('agents.copyPrompt', 'conn2flow.bridge.copyPrompt', 'clippy'),
            this.leaf('agents.recordHandoff', 'conn2flow.bridge.recordHandoff', 'repo-pull'),
            this.leaf('agents.prepareReview', 'conn2flow.bridge.notifyArchitect', 'source-control'),
            this.leaf('sdd.selectScope', 'conn2flow.sdd.selectScope', 'target'),
            this.leaf('sdd.viewMode', 'conn2flow.sdd.toggleViewMode', 'split-horizontal', { mode: sddViewModeManager_1.SddViewModeManager.label }),
            this.leaf('sdd.openCurrent', 'conn2flow.sdd.openCurrent', 'file-text'),
            this.leaf('sdd.openSpec', 'conn2flow.sdd.openSpec', 'file-code'),
            this.leaf('sdd.openChecklist', 'conn2flow.sdd.openChecklist', 'checklist'),
            this.leaf('sdd.browseRequests', 'conn2flow.sdd.browseRequests', 'request-changes'),
            this.leaf('sdd.browseBatches', 'conn2flow.sdd.browseBatches', 'history'),
            this.leaf('sdd.browseBacklog', 'conn2flow.sdd.browseBacklog', 'list-unordered'),
            this.leaf('sdd.browseDecisions', 'conn2flow.sdd.browseDecisions', 'law'),
            this.leaf('sdd.browseHandoffs', 'conn2flow.sdd.browseHandoffs', 'repo-pull'),
            this.leaf('sdd.autoGardening', 'conn2flow.sdd.toggleAutoGardening', 'pulse', {
                status: localizationManager_1.LocalizationManager.t(gardeningManager_1.GardeningManager.isAutoGardeningEnabled() ? 'gardening.enabled' : 'gardening.disabled')
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
        core.push(this.leaf('release.manager', 'conn2flow.release.manager', 'package'));
        core.push(this.leaf('release.installer', 'conn2flow.release.installer', 'package'));
        core.push(this.releaseExecutionItem('manager', 'release.executeManager', 'conn2flow.release.executeManager'));
        core.push(this.releaseExecutionItem('installer', 'release.executeInstaller', 'conn2flow.release.executeInstaller'));
        if (releaseManager_1.ReleaseManager.permissionState === 'allowed') {
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
            this.leaf('diagnostics.apacheLogs', 'conn2flow.docker.logsApache', logFollowManager_1.LogFollowManager.isApacheFollowing ? 'debug-stop' : 'output'),
            this.leaf('diagnostics.phpLogs', 'conn2flow.docker.logsPhp', logFollowManager_1.LogFollowManager.isPhpFollowing ? 'debug-stop' : 'terminal'),
            this.leaf('diagnostics.truncatePhp', 'conn2flow.docker.truncatePhpLog', 'trash'),
            this.leaf('diagnostics.aiSync', 'conn2flow.ai.sync', 'extensions'),
            this.leaf('diagnostics.syncAll', 'conn2flow.ai.syncAllRepos', 'repo-clone')
        ];
        const docsConfig = [
            this.leaf('docs.panel', 'conn2flow.docs.openDevToolsGuide', 'dashboard'),
            this.leaf('docs.cli', 'conn2flow.docs.openDevGuide', 'book'),
            this.leaf('docs.orchestration', 'conn2flow.docs.openSddGuide', 'organization'),
            this.leaf('docs.architecture', 'conn2flow.docs.openArchitectureGuide', 'type-hierarchy'),
            this.leaf('docs.skills', 'conn2flow.ai.openCatalog', 'list-unordered')
        ];
        const result = [
            this.section('section.overview', 'overview', 'dashboard', overview, true),
            this.section('section.sdd', 'sdd', 'shield', sdd),
            this.section('section.core', 'core', 'tools', core),
            this.section('section.projects', 'projects', 'folder-library', projects),
            this.section('section.diagnostics', 'diagnostics', 'server', diagnostics),
            this.section('section.agents', 'agents', 'organization', docsConfig)
        ];
        const custom = customActionsManager_1.CustomActionsManager.getActionsManifest();
        if (custom?.actions.length) {
            const children = custom.actions.map(action => new Conn2FlowTreeItem(action.label, vscode.TreeItemCollapsibleState.None, action.type === 'file' ? 'conn2flow.custom.openFile' : 'conn2flow.custom.runTerminal', action.icon || (action.type === 'file' ? 'file-code' : 'play'), `**${action.label}**\n\n${action.description || localizationManager_1.LocalizationManager.t('tooltip.custom.action')}`, undefined, [action.type === 'file' ? action.path : action.command]));
            children.push(this.leaf('custom.edit', 'conn2flow.custom.editManifest', 'edit'));
            result.push(this.section('section.custom', 'custom', 'star', children));
        }
        return result;
    }
}
exports.Conn2FlowTreeProvider = Conn2FlowTreeProvider;
//# sourceMappingURL=conn2flowTreeProvider.js.map
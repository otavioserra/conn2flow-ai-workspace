"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const conn2flowTreeProvider_1 = require("./providers/conn2flowTreeProvider");
const modesManager_1 = require("./providers/modesManager");
const projectsManager_1 = require("./providers/projectsManager");
const customActionsManager_1 = require("./providers/customActionsManager");
const logFollowManager_1 = require("./providers/logFollowManager");
const agentBridgeManager_1 = require("./providers/agentBridgeManager");
const sddViewModeManager_1 = require("./providers/sddViewModeManager");
const sddBrowserManager_1 = require("./providers/sddBrowserManager");
const sddScopeManager_1 = require("./providers/sddScopeManager");
const gardeningManager_1 = require("./providers/gardeningManager");
const shellHelper_1 = require("./providers/shellHelper");
const localizationManager_1 = require("./providers/localizationManager");
const commandRunner_1 = require("./providers/commandRunner");
const workspaceLocator_1 = require("./providers/workspaceLocator");
const backlogManager_1 = require("./providers/backlogManager");
const releaseManager_1 = require("./providers/releaseManager");
const hubTaskWatcher_1 = require("./providers/hubTaskWatcher");
const markdownPreviewPolicy_1 = require("./markdownPreviewPolicy");
const documentationSearchPolicy_1 = require("./documentationSearchPolicy");
const vmDiagnosticsPolicy_1 = require("./vmDiagnosticsPolicy");
let dockerStatusBarItem;
let sddStatusBarItem;
let modesStatusBarItem;
function activate(context) {
    sddScopeManager_1.SddScopeManager.initialize(context);
    sddViewModeManager_1.SddViewModeManager.initialize(context);
    gardeningManager_1.GardeningManager.initialize(context);
    releaseManager_1.ReleaseManager.initialize(context);
    const hubWatcher = hubTaskWatcher_1.HubTaskWatcher.initialize(context, () => refreshAll());
    context.subscriptions.push(hubWatcher);
    let refreshAll = () => undefined;
    localizationManager_1.LocalizationManager.initialize(context, () => refreshAll());
    const treeProvider = new conn2flowTreeProvider_1.Conn2FlowTreeProvider(context);
    const commandRunner = new commandRunner_1.CommandRunner();
    vscode.window.registerTreeDataProvider('conn2flow-explorer', treeProvider);
    // Status Bar Items
    dockerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    dockerStatusBarItem.command = 'conn2flow.docker.status';
    context.subscriptions.push(dockerStatusBarItem);
    sddStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    sddStatusBarItem.command = 'conn2flow.sdd.openCurrent';
    context.subscriptions.push(sddStatusBarItem);
    modesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    modesStatusBarItem.command = 'conn2flow.modes.selectAutonomy';
    context.subscriptions.push(modesStatusBarItem);
    refreshAll = () => {
        treeProvider.refresh();
        updateStatusBar();
        gardeningManager_1.GardeningManager.checkAndNotify();
    };
    refreshAll();
    context.subscriptions.push(projectsManager_1.ProjectsManager.onTargetProjectChanged(() => updateStatusBar()), vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('conn2flow.projects.activeId'))
            updateStatusBar();
    }));
    const managedPreviewStateKey = 'conn2flow.sdd.managedMpePreviewPath';
    let managedMpePreviewPath = context.workspaceState.get(managedPreviewStateKey);
    let managedNativePreviewTab;
    const describeTab = (tab) => {
        if (tab.input instanceof vscode.TabInputText) {
            return { kind: 'text', uriPath: tab.input.uri.fsPath };
        }
        if (tab.input instanceof vscode.TabInputCustom) {
            return {
                kind: 'custom',
                uriPath: tab.input.uri.fsPath,
                viewType: tab.input.viewType
            };
        }
        return { kind: 'other' };
    };
    const closeTabsForPreview = async (targetUri, reasons) => {
        const tabsToClose = [];
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                const reason = (0, markdownPreviewPolicy_1.getPreviewCloseReason)(describeTab(tab), targetUri.fsPath, managedMpePreviewPath);
                if (reason && reasons.has(reason)) {
                    tabsToClose.push(tab);
                }
            }
        }
        if (tabsToClose.length > 0) {
            await vscode.window.tabGroups.close(tabsToClose, true);
        }
    };
    const waitForMpePreview = async (targetUri) => {
        for (let attempt = 0; attempt < 10; attempt++) {
            const found = vscode.window.tabGroups.all.some(group => group.tabs.some(tab => tab.isActive && (0, markdownPreviewPolicy_1.isTargetMpePreview)(describeTab(tab), targetUri.fsPath)));
            if (found) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return false;
    };
    const closeManagedNativePreview = async () => {
        if (!managedNativePreviewTab)
            return;
        const stillOpen = vscode.window.tabGroups.all.some(group => group.tabs.includes(managedNativePreviewTab));
        if (stillOpen)
            await vscode.window.tabGroups.close(managedNativePreviewTab, true);
        managedNativePreviewTab = undefined;
    };
    const waitForNativePreview = async () => {
        for (let attempt = 0; attempt < 10; attempt++) {
            const active = vscode.window.tabGroups.activeTabGroup.activeTab;
            if (active?.isActive && active.input instanceof vscode.TabInputWebview) {
                managedNativePreviewTab = active;
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return false;
    };
    const closeAllManagedPreviews = async (targetUri) => {
        await closeTabsForPreview(targetUri, new Set(['managed-preview']));
        await closeManagedNativePreview();
    };
    // Watcher para .c2f/actions.json (Hot Reload Plug & Play!)
    const actionsWatcher = customActionsManager_1.CustomActionsManager.setupWatcher(refreshAll);
    context.subscriptions.push(actionsWatcher);
    // Monitorar fechamento de terminais de log
    context.subscriptions.push(vscode.window.onDidCloseTerminal(t => logFollowManager_1.LogFollowManager.handleTerminalClosed(t, refreshAll)));
    const interval = setInterval(refreshAll, 30000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
    const runInTerminal = (command, name = 'Conn2Flow', impact = 'mutating', target, exclusive = false, confirmationSatisfied = false, showProgress = false) => {
        const cwd = workspaceLocator_1.WorkspaceLocator.getCoreRoot() || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!cwd)
            return;
        void commandRunner.run({
            command,
            cwd,
            label: name,
            impact,
            target,
            exclusive,
            confirmationSatisfied,
            progressTitle: showProgress ? localizationManager_1.LocalizationManager.t('command.progressTitle', { label: name }) : undefined
        });
    };
    // Markdown Opener com suporte a Modos: Código, Preview ou Ambos Lado a Lado
    const openMarkdownFile = async (relativePath) => {
        vscode.window.setStatusBarMessage(`$(file-text) ${localizationManager_1.LocalizationManager.t('common.loading')}`, 1200);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('common.noWorkspace'));
            return;
        }
        let resolvedFullPath = path.isAbsolute(relativePath) && fs.existsSync(relativePath)
            ? relativePath
            : sddScopeManager_1.SddScopeManager.resolveSddFile(relativePath);
        const isScopedSddPath = /^sdd[/\\]/i.test(relativePath);
        if (!resolvedFullPath && !isScopedSddPath) {
            const candidates = [];
            for (const folder of workspaceFolders) {
                candidates.push(path.join(folder.uri.fsPath, relativePath));
                candidates.push(path.join(folder.uri.fsPath, '..', 'conn2flow', relativePath));
                candidates.push(path.join(folder.uri.fsPath, '..', 'conn2flow-ai-workspace', relativePath));
                candidates.push(path.join(folder.uri.fsPath, '..', 'conn2flow', 'ai-workspace', relativePath));
                candidates.push(path.join(folder.uri.fsPath, 'ai-workspace', relativePath));
            }
            for (const fullPath of candidates) {
                if (fs.existsSync(fullPath)) {
                    resolvedFullPath = fullPath;
                    break;
                }
            }
        }
        if (!resolvedFullPath || !fs.existsSync(resolvedFullPath)) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('sdd.fileMissing', { path: relativePath, scope: sddScopeManager_1.SddScopeManager.getScopeLabel() }));
            return;
        }
        const uri = vscode.Uri.file(resolvedFullPath);
        try {
            const viewMode = sddViewModeManager_1.SddViewModeManager.mode;
            // Garante que o MPE esteja ativo se instalado
            const mpe = vscode.extensions.getExtension('shd101wyy.markdown-preview-enhanced');
            if (mpe && !mpe.isActive) {
                try {
                    await mpe.activate();
                }
                catch {
                    // continua
                }
            }
            // 1. Modo Apenas Renderizado (Preview direto via Custom Editor MPE)
            if (viewMode === 'preview') {
                if (mpe) {
                    try {
                        // Fecha somente o preview que uma chamada anterior desta extensão registrou.
                        // Previews MPE abertos manualmente nunca são adotados implicitamente.
                        await (0, markdownPreviewPolicy_1.runPreviewLifecycle)({
                            closePreviousManagedPreview: () => closeAllManagedPreviews(uri),
                            openPreview: async () => {
                                await vscode.commands.executeCommand('vscode.openWith', uri, markdownPreviewPolicy_1.MPE_VIEW_TYPE, vscode.ViewColumn.Active);
                            },
                            waitUntilPreviewIsActive: () => waitForMpePreview(uri),
                            // Remove somente a fonte do documento solicitado, preservando o foco.
                            closeTargetSource: () => closeTabsForPreview(uri, new Set(['target-source']))
                        });
                        // Revela explicitamente o Custom Editor depois da limpeza para garantir foco.
                        managedMpePreviewPath = uri.fsPath;
                        await context.workspaceState.update(managedPreviewStateKey, managedMpePreviewPath);
                        return;
                    }
                    catch {
                        // fallback para preview nativo
                    }
                }
                try {
                    await (0, markdownPreviewPolicy_1.runPreviewLifecycle)({
                        closePreviousManagedPreview: () => closeAllManagedPreviews(uri),
                        openPreview: async () => {
                            await vscode.commands.executeCommand('markdown.showPreview', uri, vscode.ViewColumn.Active);
                        },
                        waitUntilPreviewIsActive: waitForNativePreview,
                        closeTargetSource: () => closeTabsForPreview(uri, new Set(['target-source']))
                    });
                    return;
                }
                catch {
                    // fallback
                }
                return;
            }
            // 2. Modo Apenas Código-Fonte (Editor normal)
            if (viewMode === 'code') {
                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
                return;
            }
            // 3. Modo Ambos Lado a Lado (Código na esquerda + Preview MPE na direita)
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
            if (mpe) {
                try {
                    await vscode.commands.executeCommand('markdown-preview-enhanced.openPreviewToTheSide', uri);
                    return;
                }
                catch {
                    // fallback para nativo
                }
            }
            try {
                await vscode.commands.executeCommand('markdown.showPreviewToSide');
            }
            catch {
                // documento já aberto na tela
            }
            return;
        }
        catch (err) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: err.message }));
            return;
        }
    };
    let managedPreviewNavigationInProgress = false;
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        const candidatePath = editor?.document.uri.fsPath;
        if (!candidatePath || !(0, markdownPreviewPolicy_1.shouldRedirectMarkdownSourceToPreview)(candidatePath, managedMpePreviewPath, sddViewModeManager_1.SddViewModeManager.mode, managedPreviewNavigationInProgress))
            return;
        managedPreviewNavigationInProgress = true;
        void openMarkdownFile(candidatePath).finally(() => {
            managedPreviewNavigationInProgress = false;
        });
    }));
    const documentationRoots = () => {
        const roots = [];
        const locale = localizationManager_1.LocalizationManager.currentLocale === 'en' ? 'en' : 'pt-br';
        for (const folder of vscode.workspace.workspaceFolders || []) {
            const workspaceRoot = folder.uri.fsPath;
            roots.push({ rootPath: path.join(workspaceRoot, 'docs', locale), label: `${path.basename(workspaceRoot)}/docs/${locale}` }, { rootPath: path.join(workspaceRoot, 'docs'), label: `${path.basename(workspaceRoot)}/docs` }, { rootPath: path.join(workspaceRoot, 'ai-workspace', 'pt-br', 'docs'), label: 'conn2flow/ai-workspace/pt-br/docs' }, { rootPath: path.join(workspaceRoot, '..', 'conn2flow', 'ai-workspace', 'pt-br', 'docs'), label: 'conn2flow/ai-workspace/pt-br/docs' }, { rootPath: path.join(workspaceRoot, '..', 'conn2flow-ai-workspace', 'docs', locale), label: `conn2flow-ai-workspace/docs/${locale}` });
        }
        return roots;
    };
    const runVmLog = (logName) => {
        const connection = projectsManager_1.ProjectsManager.getTargetVmConnection();
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!connection || !target) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('diagnostics.vmConfigMissing'));
            return;
        }
        runInTerminal((0, vmDiagnosticsPolicy_1.buildVmLogCommand)(connection, logName), localizationManager_1.LocalizationManager.t(logName === 'php-error.log' ? 'diagnostics.vmPhpLogs' : 'diagnostics.vmNginxLogs'), 'read-only', target);
    };
    // Helper para seleção de projeto do environment.json
    const selectProjectFromEnvironment = async (placeHolder) => {
        const list = projectsManager_1.ProjectsManager.getProjectsList();
        if (list.length === 0) {
            return await promptProjectIdManual(placeHolder);
        }
        const items = list.map(p => ({
            label: p.name,
            description: `[${p.id}] ${p.url || ''}`,
            detail: p.path,
            id: p.id
        }));
        items.push({
            label: '✍️ Digitar ID manualmente...',
            description: '',
            detail: 'Para projetos ainda não cadastrados no environment.json',
            id: '__manual__'
        });
        const sel = await vscode.window.showQuickPick(items, { placeHolder });
        if (!sel)
            return undefined;
        if (sel.id === '__manual__') {
            return await promptProjectIdManual(placeHolder);
        }
        return sel.id;
    };
    const promptProjectIdManual = async (placeHolder) => {
        return await vscode.window.showInputBox({
            prompt: placeHolder,
            placeHolder: 'ex: transformamp-local, conn2flow-site, etc.'
        });
    };
    const localizedDoc = (ptBr, english) => localizationManager_1.LocalizationManager.currentLocale === 'en' && english ? english : ptBr;
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('conn2flow.refreshTree', () => {
        refreshAll();
    }), vscode.commands.registerCommand('conn2flow.expandAll', () => {
        treeProvider.expandAll();
    }), vscode.commands.registerCommand('conn2flow.collapseAll', () => {
        treeProvider.collapseAll();
    }), 
    // Custom Actions Commands (Plug & Play!)
    vscode.commands.registerCommand('conn2flow.custom.runTerminal', (cmd) => {
        if (cmd) {
            if (!vscode.workspace.isTrusted) {
                vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('custom.trustRequired'));
                return;
            }
            runInTerminal(cmd, 'Conn2Flow Custom Action', 'destructive', customActionsManager_1.CustomActionsManager.getManifestPath());
        }
    }), vscode.commands.registerCommand('conn2flow.custom.openFile', (filePath) => {
        if (filePath) {
            if (filePath.endsWith('.md')) {
                openMarkdownFile(filePath);
            }
            else {
                openFileGeneral(filePath);
            }
        }
    }), vscode.commands.registerCommand('conn2flow.custom.editManifest', async () => {
        const p = customActionsManager_1.CustomActionsManager.getManifestPath();
        if (p && fs.existsSync(p)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(p));
            await vscode.window.showTextDocument(doc);
        }
        else {
            await customActionsManager_1.CustomActionsManager.initSampleManifest(refreshAll);
        }
    }), vscode.commands.registerCommand('conn2flow.custom.initManifest', async () => {
        await customActionsManager_1.CustomActionsManager.initSampleManifest(refreshAll);
    }), 
    // Modes & Autonomy Commands
    vscode.commands.registerCommand('conn2flow.modes.setDoubleAgent', async () => {
        await modesManager_1.ModesManager.setTopology('duplo', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.setTriAgent', async () => {
        await modesManager_1.ModesManager.setTopology('triade', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.setSupervised', async () => {
        await modesManager_1.ModesManager.setAutonomy('supervisionado', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.setMonitored', async () => {
        await modesManager_1.ModesManager.setAutonomy('autonomo_monitorado', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.setHeadless', async () => {
        await modesManager_1.ModesManager.setAutonomy('autonomo_headless', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.selectTopology', async () => {
        await modesManager_1.ModesManager.selectTopology(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.selectAutonomy', async () => {
        await modesManager_1.ModesManager.selectAutonomy(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.modes.selectMode', async () => {
        const items = [
            { label: localizationManager_1.LocalizationManager.t('mode.triad'), action: () => modesManager_1.ModesManager.setTopology('triade', refreshAll) },
            { label: localizationManager_1.LocalizationManager.t('mode.dual'), action: () => modesManager_1.ModesManager.setTopology('duplo', refreshAll) },
            { label: localizationManager_1.LocalizationManager.t('mode.supervised'), action: () => modesManager_1.ModesManager.setAutonomy('supervisionado', refreshAll) },
            { label: localizationManager_1.LocalizationManager.t('mode.monitored'), action: () => modesManager_1.ModesManager.setAutonomy('autonomo_monitorado', refreshAll) },
            { label: localizationManager_1.LocalizationManager.t('mode.headless'), action: () => modesManager_1.ModesManager.setAutonomy('autonomo_headless', refreshAll) }
        ];
        const sel = await vscode.window.showQuickPick(items, { placeHolder: localizationManager_1.LocalizationManager.t('agents.selectMode') });
        if (sel) {
            await sel.action();
        }
    }), 
    // SDD Commands & Interactive Browsers
    vscode.commands.registerCommand('conn2flow.sdd.selectScope', async () => {
        // Trocar de escopo troca o CURRENT.md de referência: recarrega os modos
        // persistidos antes de repintar a árvore (REQ-049 / BATCH-051).
        await sddScopeManager_1.SddScopeManager.selectScope(() => {
            modesManager_1.ModesManager.reload();
            refreshAll();
        });
    }), vscode.commands.registerCommand('conn2flow.sdd.toggleViewMode', () => {
        sddViewModeManager_1.SddViewModeManager.toggle(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.sdd.toggleAutoGardening', () => {
        gardeningManager_1.GardeningManager.toggleAutoGardening(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.sdd.runGardening', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('ai:prune-memories'));
    }), vscode.commands.registerCommand('conn2flow.sdd.createGardeningRequest', async () => {
        await gardeningManager_1.GardeningManager.createGardeningRequest(openMarkdownFile, refreshAll);
    }), vscode.commands.registerCommand('conn2flow.sdd.openCurrent', () => {
        openMarkdownFile('sdd/human-requests/CURRENT.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openSpec', () => {
        openMarkdownFile('sdd/SPEC.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openChecklist', () => {
        openMarkdownFile('sdd/validation/VALIDATION-CHECKLIST.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.browseRequests', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('human-requests', localizationManager_1.LocalizationManager.t('sdd.browseRequests'), openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseBatches', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('implementation', localizationManager_1.LocalizationManager.t('sdd.browseBatches'), openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseBacklog', async () => {
        await backlogManager_1.BacklogManager.browse(openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseDecisions', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('decisions', localizationManager_1.LocalizationManager.t('sdd.browseDecisions'), openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseHandoffs', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('handoffs', localizationManager_1.LocalizationManager.t('sdd.browseHandoffs'), openMarkdownFile);
    }), 
    // Triad Bridge Commands (Agent Handoff & Goal Mode)
    vscode.commands.registerCommand('conn2flow.bridge.launchClaudeGoal', async () => {
        await agentBridgeManager_1.AgentBridgeManager.launchClaudeGoal(runInTerminal);
    }), vscode.commands.registerCommand('conn2flow.bridge.copyPrompt', async () => {
        await agentBridgeManager_1.AgentBridgeManager.copyExecutorPrompt();
    }), vscode.commands.registerCommand('conn2flow.bridge.recordHandoff', async () => {
        await agentBridgeManager_1.AgentBridgeManager.recordTerminalHandoff(openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.bridge.notifyArchitect', async () => {
        await agentBridgeManager_1.AgentBridgeManager.notifyArchitect(openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.hub.toggleWatcher', () => {
        hubTaskWatcher_1.HubTaskWatcher.toggle(refreshAll);
    }), 
    // Docker Commands
    vscode.commands.registerCommand('conn2flow.docker.status', () => {
        runInTerminal('docker ps');
    }), vscode.commands.registerCommand('conn2flow.docker.logsApache', () => {
        logFollowManager_1.LogFollowManager.toggleApacheLogs(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.docker.logsPhp', () => {
        logFollowManager_1.LogFollowManager.togglePhpLogs(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.docker.truncatePhpLog', () => {
        runInTerminal('docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"', localizationManager_1.LocalizationManager.t('diagnostics.truncatePhp'), 'destructive', 'conn2flow-app:/var/log/php_errors.log');
    }), 
    // Manager & Core Commands
    vscode.commands.registerCommand('conn2flow.manager.updateAll', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('manager:update-all'), localizationManager_1.LocalizationManager.t('core.updateAll'), 'mutating', 'Core', true, false, true);
    }), vscode.commands.registerCommand('conn2flow.manager.syncResources', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('resources:sync'), localizationManager_1.LocalizationManager.t('core.syncResources'), 'mutating', 'Core', true, false, true);
    }), vscode.commands.registerCommand('conn2flow.manager.cssRebuild', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`css:rebuild --project=${target}`), localizationManager_1.LocalizationManager.t('core.cssRebuild', { target }), 'mutating', target, true, false, true);
    }), vscode.commands.registerCommand('conn2flow.manager.cssAudit', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`css:audit --project=${target}`), localizationManager_1.LocalizationManager.t('core.cssAudit', { target }), 'read-only', target);
    }), 
    // Projects Commands
    vscode.commands.registerCommand('conn2flow.projects.setTarget', async () => {
        const list = projectsManager_1.ProjectsManager.getProjectsList();
        const items = list.map(p => ({
            label: p.name,
            description: `[${p.id}]`,
            id: p.id
        }));
        const sel = await vscode.window.showQuickPick(items, { placeHolder: localizationManager_1.LocalizationManager.t('projects.targetPrompt') });
        if (sel) {
            await projectsManager_1.ProjectsManager.setTargetProject(sel.id, refreshAll);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.deployTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:deploy ${target}`), localizationManager_1.LocalizationManager.t('projects.deploy', { target }), 'remote', target, true, false, true);
    }), vscode.commands.registerCommand('conn2flow.projects.syncCoreTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:sync-core ${target}`), localizationManager_1.LocalizationManager.t('projects.syncCore', { target }), 'mutating', target, true, false, true);
    }), vscode.commands.registerCommand('conn2flow.projects.syncFilesTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:sync-files ${target}`), localizationManager_1.LocalizationManager.t('projects.syncFiles', { target }), 'mutating', target, true);
    }), vscode.commands.registerCommand('conn2flow.projects.deployWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
        if (projectId) {
            runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:deploy ${projectId}`), localizationManager_1.LocalizationManager.t('projects.deploy', { target: projectId }), 'remote', projectId, true, false, true);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        if (!target)
            return void vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.noTargetWarning'));
        const remoteConfirmation = projectsManager_1.ProjectsManager.remoteConfirmationArgument(target);
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:update-all ${target}${remoteConfirmation}`), localizationManager_1.LocalizationManager.t('projects.updateAll', { target }), 'mutating', target, true, false, true);
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Update All (6 etapas):');
        if (projectId) {
            const remoteConfirmation = projectsManager_1.ProjectsManager.remoteConfirmationArgument(projectId);
            runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:update-all ${projectId}${remoteConfirmation}`), localizationManager_1.LocalizationManager.t('projects.updateAll', { target: projectId }), 'mutating', projectId, true, false, true);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.addNew', async () => {
        await projectsManager_1.ProjectsManager.addNewProject(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.scaffoldProject', async () => {
        await projectsManager_1.ProjectsManager.scaffoldNewSatelliteProject(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.cloneRepository', async () => {
        await projectsManager_1.ProjectsManager.cloneMissingRepository(runInTerminal, refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.checkRepositories', () => {
        const status = projectsManager_1.ProjectsManager.checkAdjacentRepositories();
        const missing = status.filter(s => !s.exists);
        if (missing.length === 0) {
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('projects.allPresent'), 3000);
        }
        else {
            const names = missing.map(m => m.name).join(', ');
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.missingRepositories', { names }));
        }
    }), vscode.commands.registerCommand('conn2flow.projects.syncTemplate', async () => {
        await projectsManager_1.ProjectsManager.syncWithTemplate(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.openTemplate', async () => {
        await projectsManager_1.ProjectsManager.openTemplateEnvironment();
    }), vscode.commands.registerCommand('conn2flow.projects.openActive', async () => {
        await projectsManager_1.ProjectsManager.openActiveEnvironment();
    }), 
    // AI Workspace Hub Commands
    vscode.commands.registerCommand('conn2flow.ai.sync', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('ai:sync'));
    }), vscode.commands.registerCommand('conn2flow.ai.syncSkills', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('ai:sync'));
    }), vscode.commands.registerCommand('conn2flow.ai.syncAllRepos', () => {
        const language = localizationManager_1.LocalizationManager.currentLocale === 'pt-BR' ? 'pt-br' : 'en';
        const cmd = shellHelper_1.ShellHelper.formatPowerShellScript('scripts/sync-all-repos.ps1', `-Force -Language ${language}`);
        runInTerminal(cmd);
    }), vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('ai:sync'));
    }), vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md', 'docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md'));
    }), vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/CATALOGO-DE-SKILLS.md', 'docs/en/SKILLS-CATALOG.md'));
    }), vscode.commands.registerCommand('conn2flow.ai.openAgents', () => {
        openMarkdownFile('AGENTS.md');
    }), vscode.commands.registerCommand('conn2flow.ai.openGemini', () => {
        openMarkdownFile('GEMINI.md');
    }), 
    // Documentation & Guides Commands
    vscode.commands.registerCommand('conn2flow.docs.openDevToolsGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md', 'docs/en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openIndex', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/README.md', 'docs/en/README.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openPanelGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md', 'docs/en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openMarketplaceGuide', () => {
        openMarkdownFile('docs/pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md');
    }), vscode.commands.registerCommand('conn2flow.docs.openDevGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md', 'docs/en/QUICKSTART-CLI-AND-MCP.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openSddGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md', 'docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openTailwindGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md', 'docs/en/DOUBLE-AGENT-ARCHITECTURE.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openArchitectureGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md', 'docs/en/DOUBLE-AGENT-ARCHITECTURE.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openDockerGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md', 'docs/en/QUICKSTART-CLI-AND-MCP.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openResourcesGuide', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/CATALOGO-DE-SKILLS.md', 'docs/en/SKILLS-CATALOG.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.openRoadmap', () => {
        openMarkdownFile(localizedDoc('docs/pt-br/ROTEIRO-EVOLUCAO-FUTURA.md', 'docs/en/FUTURE-EVOLUTION-ROADMAP.md'));
    }), vscode.commands.registerCommand('conn2flow.docs.search', async () => {
        const documents = (0, documentationSearchPolicy_1.collectMarkdownDocuments)(documentationRoots());
        if (documents.length === 0) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('docs.searchEmpty'));
            return;
        }
        const selected = await vscode.window.showQuickPick(documents, {
            placeHolder: localizationManager_1.LocalizationManager.t('docs.searchPlaceholder'),
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (selected)
            await openMarkdownFile(selected.path);
    }), vscode.commands.registerCommand('conn2flow.vm.logsPhp', () => runVmLog('php-error.log')), vscode.commands.registerCommand('conn2flow.vm.logsNginx', () => runVmLog('nginx-error.log')), vscode.commands.registerCommand('conn2flow.vm.diagnostics', async () => {
        const selected = await vscode.window.showQuickPick([
            { label: localizationManager_1.LocalizationManager.t('diagnostics.vmPhpLogs'), command: 'conn2flow.vm.logsPhp' },
            { label: localizationManager_1.LocalizationManager.t('diagnostics.vmNginxLogs'), command: 'conn2flow.vm.logsNginx' }
        ], { placeHolder: localizationManager_1.LocalizationManager.t('diagnostics.vmSelectLog') });
        if (selected)
            await vscode.commands.executeCommand(selected.command);
    }), vscode.commands.registerCommand('conn2flow.projects.deployOther', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
        if (projectId) {
            runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:deploy ${projectId}`), localizationManager_1.LocalizationManager.t('projects.deploy', { target: projectId }), 'remote', projectId, true, false, true);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.scaffoldNew', async () => {
        await projectsManager_1.ProjectsManager.scaffoldNewSatelliteProject(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.registerExisting', async () => {
        await projectsManager_1.ProjectsManager.addNewProject(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.projects.cloneMissing', async () => {
        await projectsManager_1.ProjectsManager.cloneMissingRepository(runInTerminal, refreshAll);
    }), vscode.commands.registerCommand('conn2flow.settings.selectLanguage', async () => {
        await localizationManager_1.LocalizationManager.selectLanguage();
        refreshAll();
    }), vscode.commands.registerCommand('conn2flow.release.verifyPermission', async () => {
        await releaseManager_1.ReleaseManager.verifyPermission(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.release.manager', async () => {
        await releaseManager_1.ReleaseManager.prepare('manager', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.release.installer', async () => {
        await releaseManager_1.ReleaseManager.prepare('installer', refreshAll);
    }), vscode.commands.registerCommand('conn2flow.release.executeManager', async () => {
        await releaseManager_1.ReleaseManager.execute('manager', commandRunner, refreshAll);
    }), vscode.commands.registerCommand('conn2flow.release.executeInstaller', async () => {
        await releaseManager_1.ReleaseManager.execute('installer', commandRunner, refreshAll);
    }), vscode.commands.registerCommand('conn2flow.release.openActions', async () => {
        await releaseManager_1.ReleaseManager.openActions();
    }));
}
async function openFileGeneral(relativePath) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0)
        return;
    for (const folder of workspaceFolders) {
        const full = path.join(folder.uri.fsPath, relativePath);
        if (fs.existsSync(full)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(full));
            await vscode.window.showTextDocument(doc);
            return;
        }
    }
}
function updateStatusBar() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        dockerStatusBarItem.hide();
        modesStatusBarItem.hide();
        sddStatusBarItem.hide();
        return;
    }
    const modes = modesManager_1.ModesManager.getCurrentModes();
    const topLabel = localizationManager_1.LocalizationManager.t(modes.topology === 'triade' ? 'mode.triad' : 'mode.dual');
    const autoMap = {
        supervisionado: localizationManager_1.LocalizationManager.t('mode.supervised'),
        autonomo_monitorado: localizationManager_1.LocalizationManager.t('mode.monitored'),
        autonomo_headless: localizationManager_1.LocalizationManager.t('mode.headless')
    };
    const autoLabel = autoMap[modes.autonomy] || localizationManager_1.LocalizationManager.t('mode.supervised');
    modesStatusBarItem.text = `$(organization) ${topLabel} | ${autoLabel}`;
    modesStatusBarItem.tooltip = localizationManager_1.LocalizationManager.t('status.modesTooltip');
    modesStatusBarItem.show();
    let activeReq = 'Ativo';
    for (const folder of workspaceFolders) {
        const currentPath = sddScopeManager_1.SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
        if (currentPath && fs.existsSync(currentPath)) {
            try {
                const content = fs.readFileSync(currentPath, 'utf8');
                const match = content.match(/req-(\d+)\.md/i);
                if (match && match[1]) {
                    activeReq = `REQ-${match[1]}`;
                }
            }
            catch {
                // Silencioso
            }
            break;
        }
    }
    sddStatusBarItem.text = `$(git-commit) SDD: ${activeReq}`;
    sddStatusBarItem.tooltip = localizationManager_1.LocalizationManager.t('status.sddTooltip');
    sddStatusBarItem.show();
    if (projectsManager_1.ProjectsManager.isTargetVm()) {
        const connection = projectsManager_1.ProjectsManager.getTargetVmConnection();
        dockerStatusBarItem.text = `$(vm) Conn2Flow VM`;
        dockerStatusBarItem.tooltip = localizationManager_1.LocalizationManager.t('status.vmTooltip', {
            connection: (0, vmDiagnosticsPolicy_1.describeVmConnection)(connection) || localizationManager_1.LocalizationManager.t('common.unknown')
        });
        dockerStatusBarItem.command = 'conn2flow.vm.diagnostics';
        dockerStatusBarItem.show();
    }
    else {
        dockerStatusBarItem.text = `$(server) Conn2Flow Docker`;
        dockerStatusBarItem.tooltip = localizationManager_1.LocalizationManager.t('status.dockerTooltip');
        dockerStatusBarItem.command = 'conn2flow.docker.status';
        dockerStatusBarItem.show();
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map
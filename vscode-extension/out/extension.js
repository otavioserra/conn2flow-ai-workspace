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
const terminalModeManager_1 = require("./providers/terminalModeManager");
const sddViewModeManager_1 = require("./providers/sddViewModeManager");
const sddBrowserManager_1 = require("./providers/sddBrowserManager");
const shellHelper_1 = require("./providers/shellHelper");
let terminal;
let dockerStatusBarItem;
let sddStatusBarItem;
let modesStatusBarItem;
function activate(context) {
    const treeProvider = new conn2flowTreeProvider_1.Conn2FlowTreeProvider();
    vscode.window.registerTreeDataProvider('conn2flow-explorer', treeProvider);
    // Status Bar Items
    dockerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    dockerStatusBarItem.command = 'conn2flow.docker.status';
    context.subscriptions.push(dockerStatusBarItem);
    sddStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    sddStatusBarItem.command = 'conn2flow.sdd.openCurrent';
    context.subscriptions.push(sddStatusBarItem);
    modesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    modesStatusBarItem.command = 'conn2flow.modes.selectMode';
    context.subscriptions.push(modesStatusBarItem);
    const refreshAll = () => {
        treeProvider.refresh();
        updateStatusBar();
    };
    refreshAll();
    // Watcher para .c2f/actions.json (Hot Reload Plug & Play!)
    const actionsWatcher = customActionsManager_1.CustomActionsManager.setupWatcher(refreshAll);
    context.subscriptions.push(actionsWatcher);
    // Monitorar fechamento de terminais de log
    context.subscriptions.push(vscode.window.onDidCloseTerminal(t => logFollowManager_1.LogFollowManager.handleTerminalClosed(t, refreshAll)));
    const interval = setInterval(refreshAll, 30000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
    // Terminal Runner Helper com suporte inteligente a Reutilizar vs Criar Novo
    const runInTerminal = (command, name = 'Conn2Flow Dev Terminal') => {
        if (terminalModeManager_1.TerminalModeManager.isReuse) {
            if (terminal && terminal.exitStatus === undefined) {
                terminal.show();
                terminal.sendText(command);
                return;
            }
            const active = vscode.window.activeTerminal;
            if (active && active.exitStatus === undefined) {
                active.show();
                active.sendText(command);
                return;
            }
            terminal = vscode.window.createTerminal({ name: 'Conn2Flow Dev Terminal' });
            terminal.show();
            terminal.sendText(command);
        }
        else {
            const newTerm = vscode.window.createTerminal({ name });
            newTerm.show();
            newTerm.sendText(command);
        }
    };
    // Markdown Opener com suporte a Modos: Código, Preview ou Ambos Lado a Lado
    const openMarkdownFile = async (relativePath) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('Nenhum workspace aberto no VS Code.');
            return;
        }
        const candidates = [];
        for (const folder of workspaceFolders) {
            candidates.push(path.join(folder.uri.fsPath, relativePath));
            candidates.push(path.join(folder.uri.fsPath, '..', 'conn2flow', relativePath));
            candidates.push(path.join(folder.uri.fsPath, '..', 'conn2flow', 'ai-workspace', relativePath));
            candidates.push(path.join(folder.uri.fsPath, 'ai-workspace', relativePath));
        }
        for (const fullPath of candidates) {
            if (fs.existsSync(fullPath)) {
                const uri = vscode.Uri.file(fullPath);
                try {
                    const viewMode = sddViewModeManager_1.SddViewModeManager.mode;
                    // 1. SEMPRE abre o documento no editor primeiro para que activeTextEditor exista
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
                    // Se o usuário quer apenas código-fonte
                    if (viewMode === 'code') {
                        return;
                    }
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
                    // 2. Modo Apenas Renderizado (Preview)
                    if (viewMode === 'preview') {
                        if (mpe) {
                            try {
                                await vscode.commands.executeCommand('markdown-preview-enhanced.openPreviewToTheSide', uri);
                                // Pequena pausa para o MPE inicializar o webview antes de fechar o código
                                await new Promise(resolve => setTimeout(resolve, 250));
                                await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
                                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                                return;
                            }
                            catch {
                                // fallback
                            }
                        }
                        try {
                            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                            await vscode.commands.executeCommand('markdown.showPreview', uri);
                            return;
                        }
                        catch {
                            // fallback
                        }
                        return;
                    }
                    // 3. Modo Ambos Lado a Lado (Código na esquerda + Preview na direita)
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
                    vscode.window.showErrorMessage(`Falha ao abrir documento: ${err.message}`);
                    return;
                }
            }
        }
        vscode.window.showErrorMessage(`Documento não encontrado: ${relativePath}`);
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
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('conn2flow.refreshTree', () => {
        refreshAll();
    }), vscode.commands.registerCommand('conn2flow.terminal.toggleMode', () => {
        terminalModeManager_1.TerminalModeManager.toggle(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.expandAll', () => {
        treeProvider.expandAll();
    }), vscode.commands.registerCommand('conn2flow.collapseAll', () => {
        treeProvider.collapseAll();
    }), 
    // Custom Actions Commands (Plug & Play!)
    vscode.commands.registerCommand('conn2flow.custom.runTerminal', (cmd) => {
        if (cmd) {
            runInTerminal(cmd);
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
    }), vscode.commands.registerCommand('conn2flow.modes.selectMode', async () => {
        const items = [
            { label: '🏛️ Tríade de Agentes', description: 'Arquiteto + Executor + Revisor Técnico (Rigor Máximo)', action: () => modesManager_1.ModesManager.setTopology('triade', refreshAll) },
            { label: '👥 Duplo Agente', description: 'Arquiteto + Executor (Ágil / Aprendizado)', action: () => modesManager_1.ModesManager.setTopology('duplo', refreshAll) },
            { label: '🛡️ Nível 1: Supervisionado', description: 'Sem commit/deploy automático sem OK humano', action: () => modesManager_1.ModesManager.setAutonomy('supervisionado', refreshAll) },
            { label: '👁️ Nível 2: Autônomo Monitorado', description: 'Live Todo List na tela e deploy exclusivo de teste', action: () => modesManager_1.ModesManager.setAutonomy('autonomo_monitorado', refreshAll) },
            { label: '🤖 Nível 3: Autônomo Headless', description: 'Segundo plano isolado via Worktree e MCP Hub', action: () => modesManager_1.ModesManager.setAutonomy('autonomo_headless', refreshAll) }
        ];
        const sel = await vscode.window.showQuickPick(items, { placeHolder: 'Selecione a Topologia ou Nível de Autonomia:' });
        if (sel) {
            await sel.action();
        }
    }), 
    // SDD Commands & Interactive Browsers
    vscode.commands.registerCommand('conn2flow.sdd.toggleViewMode', () => {
        sddViewModeManager_1.SddViewModeManager.toggle(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.sdd.openCurrent', () => {
        openMarkdownFile('sdd/human-requests/CURRENT.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openSpec', () => {
        openMarkdownFile('sdd/SPEC.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openChecklist', () => {
        openMarkdownFile('sdd/validation/VALIDATION-CHECKLIST.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.browseRequests', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('human-requests', 'Requisições Humanas', openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseBatches', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('implementation', 'Registros de Lotes', openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseDecisions', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('decisions', 'Decisões Arquiteturais (ADRs)', openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.sdd.browseHandoffs', async () => {
        await sddBrowserManager_1.SddBrowserManager.browseDirectory('handoffs', 'Handoffs de Agentes', openMarkdownFile);
    }), 
    // Triad Bridge Commands (Agent Handoff & Goal Mode)
    vscode.commands.registerCommand('conn2flow.bridge.launchClaudeGoal', async () => {
        await agentBridgeManager_1.AgentBridgeManager.launchClaudeGoal(runInTerminal);
    }), vscode.commands.registerCommand('conn2flow.bridge.copyPrompt', async () => {
        await agentBridgeManager_1.AgentBridgeManager.copyExecutorPrompt();
    }), vscode.commands.registerCommand('conn2flow.bridge.recordHandoff', async () => {
        await agentBridgeManager_1.AgentBridgeManager.recordTerminalHandoff(openMarkdownFile);
    }), vscode.commands.registerCommand('conn2flow.bridge.notifyArchitect', () => {
        agentBridgeManager_1.AgentBridgeManager.notifyArchitect(runInTerminal);
    }), 
    // Docker Commands
    vscode.commands.registerCommand('conn2flow.docker.status', () => {
        runInTerminal('docker ps');
    }), vscode.commands.registerCommand('conn2flow.docker.logsApache', () => {
        logFollowManager_1.LogFollowManager.toggleApacheLogs(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.docker.logsPhp', () => {
        logFollowManager_1.LogFollowManager.togglePhpLogs(refreshAll);
    }), vscode.commands.registerCommand('conn2flow.docker.truncatePhpLog', () => {
        runInTerminal('docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"');
        vscode.window.showInformationMessage('Log de erros PHP truncado com sucesso.');
    }), 
    // Manager & Core Commands
    vscode.commands.registerCommand('conn2flow.manager.updateAll', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('manager:update-all'));
    }), vscode.commands.registerCommand('conn2flow.manager.syncResources', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('resources:sync'));
    }), vscode.commands.registerCommand('conn2flow.manager.cssRebuild', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject() || 'transformamp';
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`css:rebuild --project=${target}`));
    }), vscode.commands.registerCommand('conn2flow.manager.cssAudit', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject() || 'transformamp';
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`css:audit --project=${target}`));
    }), 
    // Projects Commands
    vscode.commands.registerCommand('conn2flow.projects.setTarget', async () => {
        const list = projectsManager_1.ProjectsManager.getProjectsList();
        const items = list.map(p => ({
            label: p.name,
            description: `[${p.id}]`,
            id: p.id
        }));
        const sel = await vscode.window.showQuickPick(items, { placeHolder: 'Selecione qual projeto será o Projeto Alvo padrão:' });
        if (sel) {
            await projectsManager_1.ProjectsManager.setTargetProject(sel.id, refreshAll);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.deployTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:deploy ${target}`));
    }), vscode.commands.registerCommand('conn2flow.projects.deployWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
        if (projectId) {
            runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:deploy ${projectId}`));
        }
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:update-all ${target}`));
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Update All (6 etapas):');
        if (projectId) {
            runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand(`project:update-all ${projectId}`));
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
            vscode.window.showInformationMessage('✔ Todos os repositórios oficiais estão clonados e presentes ao lado do workspace!');
        }
        else {
            const names = missing.map(m => m.name).join(', ');
            vscode.window.showWarningMessage(`Atenção: Os seguintes repositórios não foram encontrados: ${names}. Para trabalhar com eles, certifique-se de cloná-los na mesma pasta pai.`);
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
        const cmd = shellHelper_1.ShellHelper.formatPowerShellScript('scripts/sync-all-repos.ps1', '-Force');
        runInTerminal(cmd);
    }), vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
        runInTerminal(shellHelper_1.ShellHelper.formatC2fCommand('ai:sync'));
    }), vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
        openMarkdownFile('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md');
    }), vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
        openMarkdownFile('docs/pt-br/CATALOGO-DE-SKILLS.md');
    }), 
    // Documentation & Guides Commands
    vscode.commands.registerCommand('conn2flow.docs.openPanelGuide', () => {
        openMarkdownFile('pt-br/docs/GUIA-PAINEL-DEV-TOOLS-VSCODE.md');
    }), vscode.commands.registerCommand('conn2flow.docs.openMarketplaceGuide', () => {
        openMarkdownFile('docs/pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md');
    }), vscode.commands.registerCommand('conn2flow.docs.openArchitectureGuide', () => {
        openMarkdownFile('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md');
    }), vscode.commands.registerCommand('conn2flow.docs.openDockerGuide', () => {
        openMarkdownFile('pt-br/docs/CONN2FLOW-AMBIENTE-DOCKER.md');
    }), vscode.commands.registerCommand('conn2flow.docs.openResourcesGuide', () => {
        openMarkdownFile('pt-br/docs/CONN2FLOW-SISTEMA-RECURSOS.md');
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
    const topLabel = modes.topology === 'triade' ? 'Tríade' : 'Duplo';
    const autoMap = {
        supervisionado: 'Supervisionado',
        autonomo_monitorado: 'Monitorado',
        autonomo_headless: 'Headless'
    };
    const autoLabel = autoMap[modes.autonomy] || 'Supervisionado';
    modesStatusBarItem.text = `$(organization) ${topLabel} | ${autoLabel}`;
    modesStatusBarItem.tooltip = 'Clique para alterar a Topologia de Agentes ou Nível de Autonomia';
    modesStatusBarItem.show();
    let activeReq = 'Ativo';
    for (const folder of workspaceFolders) {
        const currentPath = path.join(folder.uri.fsPath, 'sdd', 'human-requests', 'CURRENT.md');
        if (fs.existsSync(currentPath)) {
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
    sddStatusBarItem.tooltip = 'Clique para abrir a requisição SDD ativa no Preview';
    sddStatusBarItem.show();
    dockerStatusBarItem.text = `$(server) Conn2Flow Docker`;
    dockerStatusBarItem.tooltip = 'Clique para inspecionar containers Docker ativos';
    dockerStatusBarItem.show();
}
function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
//# sourceMappingURL=extension.js.map
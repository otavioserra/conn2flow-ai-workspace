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
    modesStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    modesStatusBarItem.command = 'conn2flow.modes.selectMode';
    context.subscriptions.push(modesStatusBarItem);
    sddStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
    sddStatusBarItem.command = 'conn2flow.sdd.openCurrent';
    context.subscriptions.push(sddStatusBarItem);
    const refreshAll = () => {
        treeProvider.refresh();
        updateStatusBar();
    };
    refreshAll();
    // Watcher para .c2f/actions.json (Hot Reload Plug & Play!)
    const actionsWatcher = customActionsManager_1.CustomActionsManager.setupWatcher(refreshAll);
    context.subscriptions.push(actionsWatcher);
    const interval = setInterval(refreshAll, 30000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
    // Terminal Runner Helper
    const runInTerminal = (command, name = 'Conn2Flow Dev Terminal') => {
        if (!terminal || terminal.exitStatus !== undefined) {
            terminal = vscode.window.createTerminal({ name });
        }
        terminal.show();
        terminal.sendText(command);
    };
    // Markdown Opener with MPE / Preview Detection
    const openMarkdownFile = async (relativePath) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('Nenhum workspace aberto no VS Code.');
            return;
        }
        for (const folder of workspaceFolders) {
            const fullPath = path.join(folder.uri.fsPath, relativePath);
            if (fs.existsSync(fullPath)) {
                const uri = vscode.Uri.file(fullPath);
                const mpe = vscode.extensions.getExtension('shd101wyy.markdown-preview-enhanced');
                if (mpe) {
                    try {
                        await vscode.commands.executeCommand('markdown-preview-enhanced.openPreview', uri);
                        return;
                    }
                    catch {
                        // Fallback para preview padrão se falhar
                    }
                }
                try {
                    await vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
                }
                catch {
                    const doc = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(doc);
                }
                return;
            }
        }
        vscode.window.showErrorMessage(`Arquivo não encontrado no workspace: ${relativePath}`);
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
        vscode.window.showInformationMessage('Painel Conn2Flow atualizado.');
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
    // SDD Commands (Markdown Preview Automatic)
    vscode.commands.registerCommand('conn2flow.sdd.openCurrent', () => {
        openMarkdownFile('sdd/human-requests/CURRENT.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openSpec', () => {
        openMarkdownFile('sdd/SPEC.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openChecklist', () => {
        openMarkdownFile('sdd/validation/VALIDATION-CHECKLIST.md');
    }), 
    // Docker Commands
    vscode.commands.registerCommand('conn2flow.docker.status', () => {
        runInTerminal('docker ps');
    }), vscode.commands.registerCommand('conn2flow.docker.logsApache', () => {
        runInTerminal('docker logs conn2flow-app --tail 50 --follow');
    }), vscode.commands.registerCommand('conn2flow.docker.logsPhp', () => {
        runInTerminal('docker exec conn2flow-app bash -c "tail -f /var/log/php_errors.log"');
    }), vscode.commands.registerCommand('conn2flow.docker.truncatePhpLog', () => {
        runInTerminal('docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"');
        vscode.window.showInformationMessage('Log de erros PHP truncado com sucesso.');
    }), 
    // Manager & Core Commands
    vscode.commands.registerCommand('conn2flow.manager.updateAll', () => {
        runInTerminal('./c2f manager:update-all');
    }), vscode.commands.registerCommand('conn2flow.manager.syncResources', () => {
        runInTerminal('./c2f resources:sync');
    }), vscode.commands.registerCommand('conn2flow.manager.cssRebuild', () => {
        runInTerminal('./c2f css:rebuild');
    }), vscode.commands.registerCommand('conn2flow.manager.cssAudit', () => {
        runInTerminal('./c2f css:audit');
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
        runInTerminal(`./c2f project:deploy ${target}`);
    }), vscode.commands.registerCommand('conn2flow.projects.deployWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
        if (projectId) {
            runInTerminal(`./c2f project:deploy ${projectId}`);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllTarget', () => {
        const target = projectsManager_1.ProjectsManager.getTargetProject();
        runInTerminal(`./c2f project:update-all ${target}`);
    }), vscode.commands.registerCommand('conn2flow.projects.updateAllWithSelect', async () => {
        const projectId = await selectProjectFromEnvironment('Selecione o projeto para Update All (6 etapas):');
        if (projectId) {
            runInTerminal(`./c2f project:update-all ${projectId}`);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.addNew', async () => {
        await projectsManager_1.ProjectsManager.addNewProject(refreshAll);
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
    vscode.commands.registerCommand('conn2flow.ai.syncSkills', () => {
        runInTerminal('powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\sync-all-repos.ps1');
    }), vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
        runInTerminal('php cli/c2f.php ai:sync');
    }), vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
        openMarkdownFile('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md');
    }), vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
        openMarkdownFile('docs/pt-br/CATALOGO-DE-SKILLS.md');
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const conn2flowTreeProvider_1 = require("./providers/conn2flowTreeProvider");
const modesManager_1 = require("./providers/modesManager");
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
    // Polling periódico do status bar a cada 30 segundos
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
    // File Opener Helper
    const openWorkspaceFile = async (relativePath) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('Nenhum workspace aberto no VS Code.');
            return;
        }
        for (const folder of workspaceFolders) {
            const fullPath = path.join(folder.uri.fsPath, relativePath);
            if (fs.existsSync(fullPath)) {
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fullPath));
                await vscode.window.showTextDocument(doc);
                return;
            }
        }
        vscode.window.showErrorMessage(`Arquivo não encontrado no workspace: ${relativePath}`);
    };
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('conn2flow.refreshTree', () => {
        refreshAll();
        vscode.window.showInformationMessage('Painel Conn2Flow atualizado.');
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
    // SDD Commands
    vscode.commands.registerCommand('conn2flow.sdd.openCurrent', () => {
        openWorkspaceFile('sdd/human-requests/CURRENT.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openSpec', () => {
        openWorkspaceFile('sdd/SPEC.md');
    }), vscode.commands.registerCommand('conn2flow.sdd.openChecklist', () => {
        openWorkspaceFile('sdd/validation/VALIDATION-CHECKLIST.md');
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
    vscode.commands.registerCommand('conn2flow.projects.updateAll', async () => {
        const projectId = await promptProjectId('Selecione ou digite o ID do projeto para Update All:');
        if (projectId) {
            runInTerminal(`./c2f project:update-all ${projectId}`);
        }
    }), vscode.commands.registerCommand('conn2flow.projects.deploy', async () => {
        const projectId = await promptProjectId('Selecione ou digite o ID do projeto para Deploy:');
        if (projectId) {
            runInTerminal(`./c2f project:deploy ${projectId}`);
        }
    }), 
    // AI Workspace Hub Commands
    vscode.commands.registerCommand('conn2flow.ai.syncSkills', () => {
        runInTerminal('powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\sync-all-repos.ps1');
    }), vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
        runInTerminal('php cli/c2f.php ai:sync');
    }), vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
        openWorkspaceFile('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md');
    }), vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
        openWorkspaceFile('docs/pt-br/CATALOGO-DE-SKILLS.md');
    }));
}
async function promptProjectId(placeHolder) {
    const commonProjects = ['transformamp-local', 'transformamp', 'snapphoton-local', 'snapphoton', 'Outro...'];
    const selection = await vscode.window.showQuickPick(commonProjects, { placeHolder });
    if (!selection) {
        return undefined;
    }
    if (selection === 'Outro...') {
        return await vscode.window.showInputBox({
            prompt: 'Digite o identificador do projeto:',
            placeHolder: 'ex: meu-projeto-local'
        });
    }
    return selection;
}
function updateStatusBar() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        dockerStatusBarItem.hide();
        modesStatusBarItem.hide();
        sddStatusBarItem.hide();
        return;
    }
    // Modos SDD
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
    // Atualizar SDD Status Item
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
                // Silencioso em caso de lock temporário
            }
            break;
        }
    }
    sddStatusBarItem.text = `$(git-commit) SDD: ${activeReq}`;
    sddStatusBarItem.tooltip = 'Clique para abrir a requisição SDD ativa';
    sddStatusBarItem.show();
    // Atualizar Docker Status Item
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
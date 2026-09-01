"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBridgeManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const sddScopeManager_1 = require("./sddScopeManager");
const localizationManager_1 = require("./localizationManager");
const agentPromptPolicy_1 = require("../agentPromptPolicy");
class AgentBridgeManager {
    static getWorkspaceRoot() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return undefined;
        return workspaceFolders[0].uri.fsPath;
    }
    static getActiveRequestFile() {
        let currentPath = sddScopeManager_1.SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
        if (!currentPath || !fs.existsSync(currentPath)) {
            const root = this.getWorkspaceRoot();
            if (!root)
                return undefined;
            currentPath = path.join(root, 'sdd', 'human-requests', 'CURRENT.md');
            if (!fs.existsSync(currentPath))
                return undefined;
        }
        const currentContent = fs.readFileSync(currentPath, 'utf8');
        const pointerMatch = currentContent.match(/\[(req-[0-9a-zA-Z_-]+\.md)\]/);
        const pointer = pointerMatch ? pointerMatch[1] : 'CURRENT.md';
        const reqPath = path.join(path.dirname(currentPath), pointer);
        const reqContent = fs.existsSync(reqPath) ? fs.readFileSync(reqPath, 'utf8') : currentContent;
        return {
            pointer,
            fullPath: reqPath,
            currentPath,
            content: reqContent
        };
    }
    /**
     * Identificação obrigatória do repositório alvo (REQ-044): projeto, raiz
     * absoluta, raiz do SDD e caminhos absolutos de entrada, resolvidos a partir
     * do escopo SDD ativo para evitar ambiguidade entre repositórios abertos.
     */
    static resolvePromptIdentity(active) {
        return (0, agentPromptPolicy_1.buildAgentPromptIdentity)({
            sddRoot: sddScopeManager_1.SddScopeManager.getActiveSddRoot(),
            workspaceRoot: this.getWorkspaceRoot(),
            currentPath: active?.currentPath,
            reqPath: active?.fullPath,
            request: active?.pointer
        }, localizationManager_1.LocalizationManager.t('common.unknown'));
    }
    static async launchClaudeGoal(runInTerminal) {
        const active = this.getActiveRequestFile();
        const identity = this.resolvePromptIdentity(active);
        const reqName = identity.request;
        const instruction = localizationManager_1.LocalizationManager.t('agents.goalInstruction', {
            repo: identity.repo,
            root: identity.root,
            sddRoot: identity.sddRoot,
            currentPath: identity.currentPath,
            reqPath: identity.reqPath,
            request: reqName
        }).replace(/"/g, '\\"');
        const goalPrompt = `claude "${instruction}"`;
        const npxGoalPrompt = `npx -y @anthropic-ai/claude-code "${instruction}"`;
        const items = [
            {
                label: localizationManager_1.LocalizationManager.t('agents.copyOption'), action: 'copy'
            },
            {
                label: localizationManager_1.LocalizationManager.t('agents.cliOption'), action: 'cli'
            },
            {
                label: localizationManager_1.LocalizationManager.t('agents.npxOption'), action: 'npx'
            },
            {
                label: localizationManager_1.LocalizationManager.t('agents.installOption'), action: 'install'
            }
        ];
        const sel = await vscode.window.showQuickPick(items, {
            placeHolder: localizationManager_1.LocalizationManager.t('agents.launchPrompt')
        });
        if (!sel)
            return;
        if (sel.action === 'copy') {
            await this.copyExecutorPrompt();
        }
        else if (sel.action === 'cli') {
            runInTerminal(goalPrompt, 'Conn2Flow: Claude Code');
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('agents.started', { request: reqName }), 2500);
        }
        else if (sel.action === 'npx') {
            runInTerminal(npxGoalPrompt, 'Conn2Flow: Claude Code');
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('agents.started', { request: reqName }), 2500);
        }
        else if (sel.action === 'install') {
            runInTerminal('npm install -g @anthropic-ai/claude-code', 'Conn2Flow: Instalação Claude');
        }
    }
    static async copyExecutorPrompt() {
        const active = this.getActiveRequestFile();
        if (!active || !active.content) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('agents.activeMissing'));
            return;
        }
        const identity = this.resolvePromptIdentity(active);
        const fullPrompt = localizationManager_1.LocalizationManager.t('agents.executorPrompt', {
            repo: identity.repo,
            root: identity.root,
            sddRoot: identity.sddRoot,
            currentPath: identity.currentPath,
            reqPath: identity.reqPath,
            request: identity.request,
            content: active.content
        });
        await vscode.env.clipboard.writeText(fullPrompt);
        vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('agents.promptCopied'));
    }
    static async recordTerminalHandoff(openMarkdownFile) {
        const sddRoot = sddScopeManager_1.SddScopeManager.getActiveSddRoot();
        if (!sddRoot)
            return;
        const handoffPath = path.join(sddRoot, 'handoffs', 'CURRENT-HANDOFF.md');
        if (!fs.existsSync(path.dirname(handoffPath))) {
            fs.mkdirSync(path.dirname(handoffPath), { recursive: true });
        }
        if (!fs.existsSync(handoffPath)) {
            const active = this.getActiveRequestFile();
            const identity = this.resolvePromptIdentity(active);
            const initial = localizationManager_1.LocalizationManager.t('agents.handoffInitial', {
                repo: identity.repo,
                root: identity.root,
                sddRoot: identity.sddRoot,
                currentPath: identity.currentPath,
                reqPath: identity.reqPath,
                request: identity.request,
                timestamp: new Date().toISOString()
            });
            fs.writeFileSync(handoffPath, initial, 'utf8');
        }
        await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('agents.handoffOpened'), 2000);
    }
    static async notifyArchitect(openMarkdownFile) {
        await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
        await vscode.commands.executeCommand('workbench.view.scm');
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('agents.reviewReady'), 2500);
    }
}
exports.AgentBridgeManager = AgentBridgeManager;
//# sourceMappingURL=agentBridgeManager.js.map
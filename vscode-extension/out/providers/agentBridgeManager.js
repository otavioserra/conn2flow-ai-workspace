"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBridgeManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class AgentBridgeManager {
    static getWorkspaceRoot() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return undefined;
        return workspaceFolders[0].uri.fsPath;
    }
    static getActiveRequestFile() {
        const root = this.getWorkspaceRoot();
        if (!root)
            return undefined;
        const currentPath = path.join(root, 'sdd', 'human-requests', 'CURRENT.md');
        if (!fs.existsSync(currentPath))
            return undefined;
        const currentContent = fs.readFileSync(currentPath, 'utf8');
        const pointerMatch = currentContent.match(/\[(req-[0-9a-zA-Z_-]+\.md)\]/);
        const pointer = pointerMatch ? pointerMatch[1] : 'req-034.md';
        const reqPath = path.join(root, 'sdd', 'human-requests', pointer);
        const reqContent = fs.existsSync(reqPath) ? fs.readFileSync(reqPath, 'utf8') : '';
        return {
            pointer,
            fullPath: reqPath,
            content: reqContent
        };
    }
    static launchClaudeGoal(runInTerminal) {
        const active = this.getActiveRequestFile();
        const reqName = active ? active.pointer : 'CURRENT.md';
        const goalPrompt = `claude "/goal Leia o briefing ativo em sdd/human-requests/CURRENT.md (${reqName}), execute todas as etapas da Live Todo List com rigor SDD, valide com c2f ai:sync, preencha sdd/validation/VALIDATION-CHECKLIST.md, registre as notas em sdd/handoffs/CURRENT-HANDOFF.md e sincronize no Git com commit semântico."`;
        runInTerminal(goalPrompt, 'Conn2Flow: Claude Code');
        vscode.window.showInformationMessage(`🤖 Claude Code disparado no terminal dedicado em Modo /goal (${reqName})!`);
    }
    static async copyExecutorPrompt() {
        const active = this.getActiveRequestFile();
        if (!active || !active.content) {
            vscode.window.showErrorMessage('Requisição ativa não encontrada em sdd/human-requests/CURRENT.md.');
            return;
        }
        const fullPrompt = `Você é o Micro-Executor do ecossistema Conn2Flow operando sob a metodologia Spec-Driven Development (SDD).

SUA MISSAO: Implementar a requisição normativa ativa [${active.pointer}].

==================== REGRAS INVIOLAVEIS DE GOVERNANCA ====================
1. NUNCA utilize 'git add -A' ou 'git add .'. Sempre liste os caminhos específicos ('git add <caminhos>').
2. NUNCA copie arquivos manualmente para pastas de teste (dev-environment/data/sites/).
3. Mantenha e atualize ativamente a Live Todo List ([ ] ➔ [x]) a cada etapa.
4. Compile os recursos correspondentes (ex: 'npm run compile' ou './c2f resources:sync').
5. Ao concluir, atualize o 'sdd/validation/VALIDATION-CHECKLIST.md' e registre as evidências técnicas.
6. Registre um breve resumo do log de execução em 'sdd/handoffs/CURRENT-HANDOFF.md'.

==================== ESPECIFICACAO NORMATIVA (${active.pointer}) ====================
${active.content}
`;
        await vscode.env.clipboard.writeText(fullPrompt);
        vscode.window.showInformationMessage(`📋 Prompt completo da requisição [${active.pointer}] copiado para o Clipboard! Pronto para colar no Claude Code, Codex ou ChatGPT.`);
    }
    static async recordTerminalHandoff(openMarkdownFile) {
        const root = this.getWorkspaceRoot();
        if (!root)
            return;
        const handoffPath = path.join(root, 'sdd', 'handoffs', 'CURRENT-HANDOFF.md');
        if (!fs.existsSync(path.dirname(handoffPath))) {
            fs.mkdirSync(path.dirname(handoffPath), { recursive: true });
        }
        if (!fs.existsSync(handoffPath)) {
            const active = this.getActiveRequestFile();
            const initial = `# 🤝 Handoff do Agente Executor — ${active ? active.pointer : 'Sessão Ativa'}\n\n* **Data**: ${new Date().toISOString()}\n* **Status**: Em Andamento\n\n## 🖥️ Log do Terminal e Decisões Técnicas\n<!-- Cole aqui o log da execução do terminal -->\n`;
            fs.writeFileSync(handoffPath, initial, 'utf8');
        }
        await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
        vscode.window.showInformationMessage('📄 Handoff aberto. Cole o log ou resumo técnico do terminal aqui para o Arquiteto analisar.');
    }
    static notifyArchitect(runInTerminal) {
        const active = this.getActiveRequestFile();
        const reqName = active ? active.pointer : 'Lote Atual';
        const cmd = `git add sdd/human-requests/ sdd/implementation/ sdd/validation/ sdd/handoffs/; git commit -m "chore(handoff): deliver ${reqName} execution evidence for architect review"; git push origin main`;
        runInTerminal(cmd, 'Conn2Flow Dev Terminal');
        vscode.window.showInformationMessage(`📡 Sincronização disparada no Git! O Macro-Arquiteto já pode auditar o lote [${reqName}].`);
    }
}
exports.AgentBridgeManager = AgentBridgeManager;
//# sourceMappingURL=agentBridgeManager.js.map
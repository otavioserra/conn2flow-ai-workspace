import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { SddScopeManager } from './sddScopeManager';
import { LocalizationManager } from './localizationManager';

export class AgentBridgeManager {
  private static getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return undefined;
    return workspaceFolders[0].uri.fsPath;
  }

  public static getActiveRequestFile(): { pointer: string; fullPath: string; content: string } | undefined {
    let currentPath = SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');

    if (!currentPath || !fs.existsSync(currentPath)) {
      const root = this.getWorkspaceRoot();
      if (!root) return undefined;
      currentPath = path.join(root, 'sdd', 'human-requests', 'CURRENT.md');
      if (!fs.existsSync(currentPath)) return undefined;
    }

    const currentContent = fs.readFileSync(currentPath, 'utf8');
    const pointerMatch = currentContent.match(/\[(req-[0-9a-zA-Z_-]+\.md)\]/);
    const pointer = pointerMatch ? pointerMatch[1] : 'CURRENT.md';
    const reqPath = path.join(path.dirname(currentPath), pointer);

    const reqContent = fs.existsSync(reqPath) ? fs.readFileSync(reqPath, 'utf8') : currentContent;

    return {
      pointer,
      fullPath: reqPath,
      content: reqContent
    };
  }

  public static async launchClaudeGoal(runInTerminal: (cmd: string, name?: string) => void): Promise<void> {
    const active = this.getActiveRequestFile();
    const reqName = active ? active.pointer : 'CURRENT.md';

    const instruction = LocalizationManager.t('agents.goalInstruction', { request: reqName }).replace(/"/g, '\\"');
    const goalPrompt = `claude "${instruction}"`;
    const npxGoalPrompt = `npx -y @anthropic-ai/claude-code "${instruction}"`;

    const items = [
      {
        label: LocalizationManager.t('agents.copyOption'), action: 'copy'
      },
      {
        label: LocalizationManager.t('agents.cliOption'), action: 'cli'
      },
      {
        label: LocalizationManager.t('agents.npxOption'), action: 'npx'
      },
      {
        label: LocalizationManager.t('agents.installOption'), action: 'install'
      }
    ];

    const sel = await vscode.window.showQuickPick(items, {
      placeHolder: LocalizationManager.t('agents.launchPrompt')
    });

    if (!sel) return;

    if (sel.action === 'copy') {
      await this.copyExecutorPrompt();
    } else if (sel.action === 'cli') {
      runInTerminal(goalPrompt, 'Conn2Flow: Claude Code');
      vscode.window.setStatusBarMessage(LocalizationManager.t('agents.started', { request: reqName }), 2500);
    } else if (sel.action === 'npx') {
      runInTerminal(npxGoalPrompt, 'Conn2Flow: Claude Code');
      vscode.window.setStatusBarMessage(LocalizationManager.t('agents.started', { request: reqName }), 2500);
    } else if (sel.action === 'install') {
      runInTerminal('npm install -g @anthropic-ai/claude-code', 'Conn2Flow: Instalação Claude');
    }
  }

  public static async copyExecutorPrompt(): Promise<void> {
    const active = this.getActiveRequestFile();
    if (!active || !active.content) {
      vscode.window.showErrorMessage(LocalizationManager.t('agents.activeMissing'));
      return;
    }

    const fullPrompt = LocalizationManager.t('agents.executorPrompt', {
      request: active.pointer,
      content: active.content
    });

    await vscode.env.clipboard.writeText(fullPrompt);
    vscode.window.showInformationMessage(LocalizationManager.t('agents.promptCopied'));
  }

  public static async recordTerminalHandoff(openMarkdownFile: (file: string) => Promise<void>): Promise<void> {
    const sddRoot = SddScopeManager.getActiveSddRoot();
    if (!sddRoot) return;

    const handoffPath = path.join(sddRoot, 'handoffs', 'CURRENT-HANDOFF.md');
    if (!fs.existsSync(path.dirname(handoffPath))) {
      fs.mkdirSync(path.dirname(handoffPath), { recursive: true });
    }

    if (!fs.existsSync(handoffPath)) {
      const active = this.getActiveRequestFile();
      const initial = `# 🤝 Handoff do Agente Executor — ${active ? active.pointer : 'Sessão Ativa'}\n\n* **Data**: ${new Date().toISOString()}\n* **Status**: Em Andamento\n\n## 🖥️ Log do Terminal e Decisões Técnicas\n<!-- Cole aqui o log da execução do terminal -->\n`;
      fs.writeFileSync(handoffPath, initial, 'utf8');
    }

    await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
    vscode.window.setStatusBarMessage(LocalizationManager.t('agents.handoffOpened'), 2000);
  }

  public static async notifyArchitect(openMarkdownFile: (file: string) => Promise<void>): Promise<void> {
    await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
    await vscode.commands.executeCommand('workbench.view.scm');
    vscode.window.setStatusBarMessage(LocalizationManager.t('agents.reviewReady'), 2500);
  }
}

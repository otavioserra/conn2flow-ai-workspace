import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { SddScopeManager } from './sddScopeManager';
import { LocalizationManager } from './localizationManager';
import { AgentPromptIdentity, buildAgentPromptIdentity } from '../agentPromptPolicy';

export interface ActiveRequestFile {
  pointer: string;
  fullPath: string;
  currentPath: string;
  content: string;
}

export class AgentBridgeManager {
  private static getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return undefined;
    return workspaceFolders[0].uri.fsPath;
  }

  public static getActiveRequestFile(): ActiveRequestFile | undefined {
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
      currentPath,
      content: reqContent
    };
  }

  /**
   * Identificação obrigatória do repositório alvo (REQ-044): projeto, raiz
   * absoluta, raiz do SDD e caminhos absolutos de entrada, resolvidos a partir
   * do escopo SDD ativo para evitar ambiguidade entre repositórios abertos.
   */
  public static resolvePromptIdentity(active?: ActiveRequestFile): AgentPromptIdentity {
    return buildAgentPromptIdentity(
      {
        sddRoot: SddScopeManager.getActiveSddRoot(),
        workspaceRoot: this.getWorkspaceRoot(),
        currentPath: active?.currentPath,
        reqPath: active?.fullPath,
        request: active?.pointer
      },
      LocalizationManager.t('common.unknown')
    );
  }

  public static async launchClaudeGoal(runInTerminal: (cmd: string, name?: string) => void): Promise<void> {
    const active = this.getActiveRequestFile();
    const identity = this.resolvePromptIdentity(active);
    const reqName = identity.request;

    const instruction = LocalizationManager.t('agents.goalInstruction', {
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

    const identity = this.resolvePromptIdentity(active);

    const fullPrompt = LocalizationManager.t('agents.executorPrompt', {
      repo: identity.repo,
      root: identity.root,
      sddRoot: identity.sddRoot,
      currentPath: identity.currentPath,
      reqPath: identity.reqPath,
      request: identity.request,
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
      const identity = this.resolvePromptIdentity(active);
      const initial = LocalizationManager.t('agents.handoffInitial', {
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
    vscode.window.setStatusBarMessage(LocalizationManager.t('agents.handoffOpened'), 2000);
  }

  public static async notifyArchitect(openMarkdownFile: (file: string) => Promise<void>): Promise<void> {
    await openMarkdownFile('sdd/handoffs/CURRENT-HANDOFF.md');
    await vscode.commands.executeCommand('workbench.view.scm');
    vscode.window.setStatusBarMessage(LocalizationManager.t('agents.reviewReady'), 2500);
  }
}

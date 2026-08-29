import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Conn2FlowTreeProvider } from './providers/conn2flowTreeProvider';
import { ModesManager } from './providers/modesManager';
import { ProjectsManager } from './providers/projectsManager';
import { CustomActionsManager } from './providers/customActionsManager';
import { LogFollowManager } from './providers/logFollowManager';
import { AgentBridgeManager } from './providers/agentBridgeManager';
import { SddViewModeManager } from './providers/sddViewModeManager';
import { SddBrowserManager } from './providers/sddBrowserManager';
import { SddScopeManager } from './providers/sddScopeManager';
import { GardeningManager } from './providers/gardeningManager';
import { ShellHelper } from './providers/shellHelper';
import { LocalizationManager } from './providers/localizationManager';
import { CommandRunner, CommandImpact } from './providers/commandRunner';
import { WorkspaceLocator } from './providers/workspaceLocator';
import { BacklogManager } from './providers/backlogManager';
import { ReleaseManager } from './providers/releaseManager';
import {
  getPreviewCloseReason,
  MPE_VIEW_TYPE,
  normalizePreviewPath,
  PreviewTabDescriptor
} from './markdownPreviewPolicy';

let dockerStatusBarItem: vscode.StatusBarItem;
let sddStatusBarItem: vscode.StatusBarItem;
let modesStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  SddScopeManager.initialize(context);
  SddViewModeManager.initialize(context);
  GardeningManager.initialize(context);
  let refreshAll = () => undefined;
  LocalizationManager.initialize(context, () => refreshAll());
  const treeProvider = new Conn2FlowTreeProvider(context);
  const commandRunner = new CommandRunner();
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

  refreshAll = () => {
    treeProvider.refresh();
    updateStatusBar();
    GardeningManager.checkAndNotify();
  };

  refreshAll();

  const managedPreviewStateKey = 'conn2flow.sdd.managedMpePreviewPath';
  let managedMpePreviewPath = context.workspaceState.get<string>(managedPreviewStateKey);

  const describeTab = (tab: vscode.Tab): PreviewTabDescriptor => {
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

  const closeTabsForPreview = async (
    targetUri: vscode.Uri,
    reasons: ReadonlySet<'target-source' | 'managed-preview'>
  ): Promise<void> => {
    const tabsToClose: vscode.Tab[] = [];

    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        const reason = getPreviewCloseReason(describeTab(tab), targetUri.fsPath, managedMpePreviewPath);
        if (reason && reasons.has(reason)) {
          tabsToClose.push(tab);
        }
      }
    }

    if (tabsToClose.length > 0) {
      await vscode.window.tabGroups.close(tabsToClose, true);
    }
  };

  const waitForMpePreview = async (targetUri: vscode.Uri): Promise<boolean> => {
    const target = normalizePreviewPath(targetUri.fsPath);
    for (let attempt = 0; attempt < 10; attempt++) {
      const found = vscode.window.tabGroups.all.some(group =>
        group.tabs.some(tab =>
          tab.input instanceof vscode.TabInputCustom &&
          tab.input.viewType === MPE_VIEW_TYPE &&
          normalizePreviewPath(tab.input.uri.fsPath) === target
        )
      );
      if (found) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return false;
  };

  // Watcher para .c2f/actions.json (Hot Reload Plug & Play!)
  const actionsWatcher = CustomActionsManager.setupWatcher(refreshAll);
  context.subscriptions.push(actionsWatcher);

  // Monitorar fechamento de terminais de log
  context.subscriptions.push(vscode.window.onDidCloseTerminal(t => LogFollowManager.handleTerminalClosed(t, refreshAll)));

  const interval = setInterval(refreshAll, 30000);
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  const runInTerminal = (
    command: string,
    name = 'Conn2Flow',
    impact: CommandImpact = 'mutating',
    target?: string,
    exclusive = false,
    confirmationSatisfied = false
  ) => {
    const cwd = WorkspaceLocator.getCoreRoot() || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd) return;
    void commandRunner.run({ command, cwd, label: name, impact, target, exclusive, confirmationSatisfied });
  };

  // Markdown Opener com suporte a Modos: Código, Preview ou Ambos Lado a Lado
  const openMarkdownFile = async (relativePath: string) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage(LocalizationManager.t('common.noWorkspace'));
      return;
    }

    let resolvedFullPath = SddScopeManager.resolveSddFile(relativePath);

    const isScopedSddPath = /^sdd[/\\]/i.test(relativePath);
    if (!resolvedFullPath && !isScopedSddPath) {
      const candidates: string[] = [];
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
      vscode.window.showErrorMessage(LocalizationManager.t('sdd.fileMissing', { path: relativePath, scope: SddScopeManager.getScopeLabel() }));
      return;
    }

    const uri = vscode.Uri.file(resolvedFullPath);

        try {
          const viewMode = SddViewModeManager.mode;

          // Garante que o MPE esteja ativo se instalado
          const mpe = vscode.extensions.getExtension('shd101wyy.markdown-preview-enhanced');
          if (mpe && !mpe.isActive) {
            try {
              await mpe.activate();
            } catch {
              // continua
            }
          }

          // 1. Modo Apenas Renderizado (Preview direto via Custom Editor MPE)
          if (viewMode === 'preview') {
            if (mpe) {
              try {
                // Fecha somente o preview que uma chamada anterior desta extensão registrou.
                // Previews MPE abertos manualmente nunca são adotados implicitamente.
                await closeTabsForPreview(uri, new Set(['managed-preview']));

                await vscode.commands.executeCommand('vscode.openWith', uri, MPE_VIEW_TYPE);
                await waitForMpePreview(uri);

                // Remove somente a fonte do documento solicitado, preservando o foco.
                await closeTabsForPreview(uri, new Set(['target-source']));

                // Revela explicitamente o Custom Editor depois da limpeza para garantir foco.
                await vscode.commands.executeCommand('vscode.openWith', uri, MPE_VIEW_TYPE);
                managedMpePreviewPath = uri.fsPath;
                await context.workspaceState.update(managedPreviewStateKey, managedMpePreviewPath);
                return;
              } catch {
                // fallback para preview nativo
              }
            }
            try {
              await vscode.commands.executeCommand('markdown.showPreview', uri);
              await new Promise(resolve => setTimeout(resolve, 100));
              await closeTabsForPreview(uri, new Set(['target-source']));
              await vscode.commands.executeCommand('markdown.showPreview', uri);
              return;
            } catch {
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
            } catch {
              // fallback para nativo
            }
          }

          try {
            await vscode.commands.executeCommand('markdown.showPreviewToSide');
          } catch {
            // documento já aberto na tela
          }
          return;
        } catch (err: any) {
          vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
          return;
        }
  };

  // Helper para seleção de projeto do environment.json
  const selectProjectFromEnvironment = async (placeHolder: string): Promise<string | undefined> => {
    const list = ProjectsManager.getProjectsList();
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
    if (!sel) return undefined;
    if (sel.id === '__manual__') {
      return await promptProjectIdManual(placeHolder);
    }
    return sel.id;
  };

  const promptProjectIdManual = async (placeHolder: string): Promise<string | undefined> => {
    return await vscode.window.showInputBox({
      prompt: placeHolder,
      placeHolder: 'ex: transformamp-local, conn2flow-site, etc.'
    });
  };

  const localizedDoc = (ptBr: string, english?: string): string =>
    LocalizationManager.currentLocale === 'en' && english ? english : ptBr;

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('conn2flow.refreshTree', () => {
      refreshAll();
    }),
    vscode.commands.registerCommand('conn2flow.expandAll', () => {
      treeProvider.expandAll();
    }),
    vscode.commands.registerCommand('conn2flow.collapseAll', () => {
      treeProvider.collapseAll();
    }),

    // Custom Actions Commands (Plug & Play!)
    vscode.commands.registerCommand('conn2flow.custom.runTerminal', (cmd?: string) => {
      if (cmd) {
        if (!vscode.workspace.isTrusted) {
          vscode.window.showWarningMessage(LocalizationManager.t('custom.trustRequired'));
          return;
        }
        runInTerminal(cmd, 'Conn2Flow Custom Action', 'destructive', CustomActionsManager.getManifestPath());
      }
    }),
    vscode.commands.registerCommand('conn2flow.custom.openFile', (filePath?: string) => {
      if (filePath) {
        if (filePath.endsWith('.md')) {
          openMarkdownFile(filePath);
        } else {
          openFileGeneral(filePath);
        }
      }
    }),
    vscode.commands.registerCommand('conn2flow.custom.editManifest', async () => {
      const p = CustomActionsManager.getManifestPath();
      if (p && fs.existsSync(p)) {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(p));
        await vscode.window.showTextDocument(doc);
      } else {
        await CustomActionsManager.initSampleManifest(refreshAll);
      }
    }),
    vscode.commands.registerCommand('conn2flow.custom.initManifest', async () => {
      await CustomActionsManager.initSampleManifest(refreshAll);
    }),

    // Modes & Autonomy Commands
    vscode.commands.registerCommand('conn2flow.modes.setDoubleAgent', async () => {
      await ModesManager.setTopology('duplo', refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.modes.setTriAgent', async () => {
      await ModesManager.setTopology('triade', refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.modes.setSupervised', async () => {
      await ModesManager.setAutonomy('supervisionado', refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.modes.setMonitored', async () => {
      await ModesManager.setAutonomy('autonomo_monitorado', refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.modes.setHeadless', async () => {
      await ModesManager.setAutonomy('autonomo_headless', refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.modes.selectMode', async () => {
      const items = [
        { label: LocalizationManager.t('mode.triad'), action: () => ModesManager.setTopology('triade', refreshAll) },
        { label: LocalizationManager.t('mode.dual'), action: () => ModesManager.setTopology('duplo', refreshAll) },
        { label: LocalizationManager.t('mode.supervised'), action: () => ModesManager.setAutonomy('supervisionado', refreshAll) },
        { label: LocalizationManager.t('mode.monitored'), action: () => ModesManager.setAutonomy('autonomo_monitorado', refreshAll) },
        { label: LocalizationManager.t('mode.headless'), action: () => ModesManager.setAutonomy('autonomo_headless', refreshAll) }
      ];

      const sel = await vscode.window.showQuickPick(items, { placeHolder: LocalizationManager.t('agents.selectMode') });
      if (sel) {
        await sel.action();
      }
    }),

    // SDD Commands & Interactive Browsers
    vscode.commands.registerCommand('conn2flow.sdd.selectScope', async () => {
      await SddScopeManager.selectScope(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.toggleViewMode', () => {
      SddViewModeManager.toggle(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.toggleAutoGardening', () => {
      GardeningManager.toggleAutoGardening(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.runGardening', () => {
      runInTerminal(ShellHelper.formatC2fCommand('ai:prune-memories'));
    }),
    vscode.commands.registerCommand('conn2flow.sdd.createGardeningRequest', async () => {
      await GardeningManager.createGardeningRequest(openMarkdownFile, refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.openCurrent', () => {
      openMarkdownFile('sdd/human-requests/CURRENT.md');
    }),
    vscode.commands.registerCommand('conn2flow.sdd.openSpec', () => {
      openMarkdownFile('sdd/SPEC.md');
    }),
    vscode.commands.registerCommand('conn2flow.sdd.openChecklist', () => {
      openMarkdownFile('sdd/validation/VALIDATION-CHECKLIST.md');
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseRequests', async () => {
      await SddBrowserManager.browseDirectory('human-requests', LocalizationManager.t('sdd.browseRequests'), openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseBatches', async () => {
      await SddBrowserManager.browseDirectory('implementation', LocalizationManager.t('sdd.browseBatches'), openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseBacklog', async () => {
      await BacklogManager.browse(openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseDecisions', async () => {
      await SddBrowserManager.browseDirectory('decisions', LocalizationManager.t('sdd.browseDecisions'), openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseHandoffs', async () => {
      await SddBrowserManager.browseDirectory('handoffs', LocalizationManager.t('sdd.browseHandoffs'), openMarkdownFile);
    }),

    // Triad Bridge Commands (Agent Handoff & Goal Mode)
    vscode.commands.registerCommand('conn2flow.bridge.launchClaudeGoal', async () => {
      await AgentBridgeManager.launchClaudeGoal(runInTerminal);
    }),
    vscode.commands.registerCommand('conn2flow.bridge.copyPrompt', async () => {
      await AgentBridgeManager.copyExecutorPrompt();
    }),
    vscode.commands.registerCommand('conn2flow.bridge.recordHandoff', async () => {
      await AgentBridgeManager.recordTerminalHandoff(openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.bridge.notifyArchitect', async () => {
      await AgentBridgeManager.notifyArchitect(openMarkdownFile);
    }),

    // Docker Commands
    vscode.commands.registerCommand('conn2flow.docker.status', () => {
      runInTerminal('docker ps');
    }),
    vscode.commands.registerCommand('conn2flow.docker.logsApache', () => {
      LogFollowManager.toggleApacheLogs(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.docker.logsPhp', () => {
      LogFollowManager.togglePhpLogs(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.docker.truncatePhpLog', () => {
      runInTerminal('docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"', LocalizationManager.t('diagnostics.truncatePhp'), 'destructive', 'conn2flow-app:/var/log/php_errors.log');
    }),

    // Manager & Core Commands
    vscode.commands.registerCommand('conn2flow.manager.updateAll', () => {
      runInTerminal(ShellHelper.formatC2fCommand('manager:update-all'), LocalizationManager.t('core.updateAll'), 'mutating', 'Core', true);
    }),
    vscode.commands.registerCommand('conn2flow.manager.syncResources', () => {
      runInTerminal(ShellHelper.formatC2fCommand('resources:sync'), LocalizationManager.t('core.syncResources'), 'mutating', 'Core', true);
    }),
    vscode.commands.registerCommand('conn2flow.manager.cssRebuild', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`css:rebuild --project=${target}`), LocalizationManager.t('core.cssRebuild', { target }), 'mutating', target, true);
    }),
    vscode.commands.registerCommand('conn2flow.manager.cssAudit', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`css:audit --project=${target}`), LocalizationManager.t('core.cssAudit', { target }), 'read-only', target);
    }),

    // Projects Commands
    vscode.commands.registerCommand('conn2flow.projects.setTarget', async () => {
      const list = ProjectsManager.getProjectsList();
      const items = list.map(p => ({
        label: p.name,
        description: `[${p.id}]`,
        id: p.id
      }));

      const sel = await vscode.window.showQuickPick(items, { placeHolder: LocalizationManager.t('projects.targetPrompt') });
      if (sel) {
        await ProjectsManager.setTargetProject(sel.id, refreshAll);
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.deployTarget', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${target}`), LocalizationManager.t('projects.deploy', { target }), 'remote', target, true);
    }),
    vscode.commands.registerCommand('conn2flow.projects.syncCoreTarget', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`project:sync-core ${target}`), LocalizationManager.t('projects.syncCore', { target }), 'mutating', target, true);
    }),
    vscode.commands.registerCommand('conn2flow.projects.syncFilesTarget', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`project:sync-files ${target}`), LocalizationManager.t('projects.syncFiles', { target }), 'mutating', target, true);
    }),
    vscode.commands.registerCommand('conn2flow.projects.deployWithSelect', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${projectId}`), LocalizationManager.t('projects.deploy', { target: projectId }), 'remote', projectId, true);
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.updateAllTarget', () => {
      const target = ProjectsManager.getTargetProject();
      if (!target) return void vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      runInTerminal(ShellHelper.formatC2fCommand(`project:update-all ${target}`), LocalizationManager.t('projects.updateAll', { target }), 'mutating', target, true);
    }),
    vscode.commands.registerCommand('conn2flow.projects.updateAllWithSelect', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Update All (6 etapas):');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:update-all ${projectId}`), LocalizationManager.t('projects.updateAll', { target: projectId }), 'mutating', projectId, true);
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.addNew', async () => {
      await ProjectsManager.addNewProject(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.scaffoldProject', async () => {
      await ProjectsManager.scaffoldNewSatelliteProject(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.cloneRepository', async () => {
      await ProjectsManager.cloneMissingRepository(runInTerminal, refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.checkRepositories', () => {
      const status = ProjectsManager.checkAdjacentRepositories();
      const missing = status.filter(s => !s.exists);

      if (missing.length === 0) {
        vscode.window.showInformationMessage(LocalizationManager.t('projects.allPresent'));
      } else {
        const names = missing.map(m => m.name).join(', ');
        vscode.window.showWarningMessage(LocalizationManager.t('projects.missingRepositories', { names }));
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.syncTemplate', async () => {
      await ProjectsManager.syncWithTemplate(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.openTemplate', async () => {
      await ProjectsManager.openTemplateEnvironment();
    }),
    vscode.commands.registerCommand('conn2flow.projects.openActive', async () => {
      await ProjectsManager.openActiveEnvironment();
    }),

    // AI Workspace Hub Commands
    vscode.commands.registerCommand('conn2flow.ai.sync', () => {
      runInTerminal(ShellHelper.formatC2fCommand('ai:sync'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.syncSkills', () => {
      runInTerminal(ShellHelper.formatC2fCommand('ai:sync'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.syncAllRepos', () => {
      const language = LocalizationManager.currentLocale === 'pt-BR' ? 'pt-br' : 'en';
      const cmd = ShellHelper.formatPowerShellScript('scripts/sync-all-repos.ps1', `-Force -Language ${language}`);
      runInTerminal(cmd);
    }),
    vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
      runInTerminal(ShellHelper.formatC2fCommand('ai:sync'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md', 'docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/CATALOGO-DE-SKILLS.md', 'docs/en/SKILLS-CATALOG.md'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.openAgents', () => {
      openMarkdownFile('AGENTS.md');
    }),
    vscode.commands.registerCommand('conn2flow.ai.openGemini', () => {
      openMarkdownFile('GEMINI.md');
    }),

    // Documentation & Guides Commands
    vscode.commands.registerCommand('conn2flow.docs.openDevToolsGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md', 'docs/en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openPanelGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md', 'docs/en/VSCODE-DEV-TOOLS-PANEL-GUIDE.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openMarketplaceGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openDevGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md', 'docs/en/QUICKSTART-CLI-AND-MCP.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openSddGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md', 'docs/en/MULTI-AGENT-ORCHESTRATION-PLAYBOOK.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openTailwindGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md', 'docs/en/DOUBLE-AGENT-ARCHITECTURE.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openArchitectureGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md', 'docs/en/DOUBLE-AGENT-ARCHITECTURE.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openDockerGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md', 'docs/en/QUICKSTART-CLI-AND-MCP.md'));
    }),
    vscode.commands.registerCommand('conn2flow.docs.openResourcesGuide', () => {
      openMarkdownFile(localizedDoc('docs/pt-br/CATALOGO-DE-SKILLS.md', 'docs/en/SKILLS-CATALOG.md'));
    }),

    // Aliases para Projetos
    vscode.commands.registerCommand('conn2flow.projects.deployOther', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${projectId}`), LocalizationManager.t('projects.deploy', { target: projectId }), 'remote', projectId, true);
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.scaffoldNew', async () => {
      await ProjectsManager.scaffoldNewSatelliteProject(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.registerExisting', async () => {
      await ProjectsManager.addNewProject(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.projects.cloneMissing', async () => {
      await ProjectsManager.cloneMissingRepository(runInTerminal, refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.settings.selectLanguage', async () => {
      await LocalizationManager.selectLanguage();
      refreshAll();
    }),
    vscode.commands.registerCommand('conn2flow.release.verifyPermission', async () => {
      await ReleaseManager.verifyPermission(refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.release.manager', async () => {
      await ReleaseManager.create('manager', commandRunner, refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.release.installer', async () => {
      await ReleaseManager.create('installer', commandRunner, refreshAll);
    }),
    vscode.commands.registerCommand('conn2flow.release.openActions', async () => {
      await ReleaseManager.openActions();
    })
  );
}

async function openFileGeneral(relativePath: string) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) return;

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

  const modes = ModesManager.getCurrentModes();
  const topLabel = LocalizationManager.t(modes.topology === 'triade' ? 'mode.triad' : 'mode.dual');
  const autoMap: Record<string, string> = {
    supervisionado: LocalizationManager.t('mode.supervised'),
    autonomo_monitorado: LocalizationManager.t('mode.monitored'),
    autonomo_headless: LocalizationManager.t('mode.headless')
  };
  const autoLabel = autoMap[modes.autonomy] || LocalizationManager.t('mode.supervised');

  modesStatusBarItem.text = `$(organization) ${topLabel} | ${autoLabel}`;
  modesStatusBarItem.tooltip = LocalizationManager.t('status.modesTooltip');
  modesStatusBarItem.show();

  let activeReq = 'Ativo';
  for (const folder of workspaceFolders) {
    const currentPath = SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
    if (currentPath && fs.existsSync(currentPath)) {
      try {
        const content = fs.readFileSync(currentPath, 'utf8');
        const match = content.match(/req-(\d+)\.md/i);
        if (match && match[1]) {
          activeReq = `REQ-${match[1]}`;
        }
      } catch {
        // Silencioso
      }
      break;
    }
  }

  sddStatusBarItem.text = `$(git-commit) SDD: ${activeReq}`;
  sddStatusBarItem.tooltip = LocalizationManager.t('status.sddTooltip');
  sddStatusBarItem.show();

  dockerStatusBarItem.text = `$(server) Conn2Flow Docker`;
  dockerStatusBarItem.tooltip = LocalizationManager.t('status.dockerTooltip');
  dockerStatusBarItem.show();
}

export function deactivate() {}

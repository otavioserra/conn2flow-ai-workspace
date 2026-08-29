import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Conn2FlowTreeProvider } from './providers/conn2flowTreeProvider';
import { ModesManager } from './providers/modesManager';
import { ProjectsManager } from './providers/projectsManager';
import { CustomActionsManager } from './providers/customActionsManager';
import { LogFollowManager } from './providers/logFollowManager';
import { AgentBridgeManager } from './providers/agentBridgeManager';
import { TerminalModeManager } from './providers/terminalModeManager';
import { SddViewModeManager } from './providers/sddViewModeManager';
import { SddBrowserManager } from './providers/sddBrowserManager';
import { SddScopeManager } from './providers/sddScopeManager';
import { GardeningManager } from './providers/gardeningManager';
import { ShellHelper } from './providers/shellHelper';

let terminal: vscode.Terminal | undefined;
let dockerStatusBarItem: vscode.StatusBarItem;
let sddStatusBarItem: vscode.StatusBarItem;
let modesStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  const treeProvider = new Conn2FlowTreeProvider();
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
  const actionsWatcher = CustomActionsManager.setupWatcher(refreshAll);
  context.subscriptions.push(actionsWatcher);

  // Monitorar fechamento de terminais de log
  context.subscriptions.push(vscode.window.onDidCloseTerminal(t => LogFollowManager.handleTerminalClosed(t, refreshAll)));

  const interval = setInterval(refreshAll, 30000);
  context.subscriptions.push({ dispose: () => clearInterval(interval) });

  // Terminal Runner Helper com suporte inteligente a Reutilizar vs Criar Novo
  const runInTerminal = (command: string, name = 'Conn2Flow Dev Terminal') => {
    if (TerminalModeManager.isReuse) {
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
    } else {
      const newTerm = vscode.window.createTerminal({ name });
      newTerm.show();
      newTerm.sendText(command);
    }
  };

  // Markdown Opener com suporte a Modos: Código, Preview ou Ambos Lado a Lado
  const openMarkdownFile = async (relativePath: string) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('Nenhum workspace aberto no VS Code.');
      return;
    }

    let resolvedFullPath = SddScopeManager.resolveSddFile(relativePath);

    if (!resolvedFullPath) {
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
      vscode.window.showErrorMessage(`Documento não encontrado: ${relativePath} (${SddScopeManager.getScopeLabel()})`);
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

          // 1. Modo Apenas Renderizado (Preview DIRETO via Custom Editor MPE)
          if (viewMode === 'preview') {
            if (mpe) {
              try {
                await vscode.commands.executeCommand('vscode.openWith', uri, 'markdown-preview-enhanced');
                // Aguarda o VS Code instanciar o Custom Editor e fecha qualquer aba de texto que tenha sido aberta em paralelo
                await new Promise(resolve => setTimeout(resolve, 200));
                for (const group of vscode.window.tabGroups.all) {
                  for (const tab of group.tabs) {
                    if (tab.input instanceof vscode.TabInputText) {
                      const p = tab.input.uri.fsPath.toLowerCase();
                      if (p === uri.fsPath.toLowerCase() || p.includes('sdd') || p.includes('docs') || p.endsWith('.md')) {
                        await vscode.window.tabGroups.close(tab);
                      }
                    }
                  }
                }
                return;
              } catch {
                // fallback para preview nativo
              }
            }
            try {
              await vscode.commands.executeCommand('markdown.showPreview', uri);
              await new Promise(resolve => setTimeout(resolve, 150));
              for (const group of vscode.window.tabGroups.all) {
                for (const tab of group.tabs) {
                  if (tab.input instanceof vscode.TabInputText) {
                    const p = tab.input.uri.fsPath.toLowerCase();
                    if (p === uri.fsPath.toLowerCase() || p.includes('sdd') || p.includes('docs') || p.endsWith('.md')) {
                      await vscode.window.tabGroups.close(tab);
                    }
                  }
                }
              }
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
          vscode.window.showErrorMessage(`Falha ao abrir documento: ${err.message}`);
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

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('conn2flow.refreshTree', () => {
      refreshAll();
    }),
    vscode.commands.registerCommand('conn2flow.terminal.toggleMode', () => {
      TerminalModeManager.toggle(refreshAll);
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
        runInTerminal(cmd);
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
        { label: '🏛️ Tríade de Agentes', description: 'Arquiteto + Executor + Revisor Técnico (Rigor Máximo)', action: () => ModesManager.setTopology('triade', refreshAll) },
        { label: '👥 Duplo Agente', description: 'Arquiteto + Executor (Ágil / Aprendizado)', action: () => ModesManager.setTopology('duplo', refreshAll) },
        { label: '🛡️ Nível 1: Supervisionado', description: 'Sem commit/deploy automático sem OK humano', action: () => ModesManager.setAutonomy('supervisionado', refreshAll) },
        { label: '👁️ Nível 2: Autônomo Monitorado', description: 'Live Todo List na tela e deploy exclusivo de teste', action: () => ModesManager.setAutonomy('autonomo_monitorado', refreshAll) },
        { label: '🤖 Nível 3: Autônomo Headless', description: 'Segundo plano isolado via Worktree e MCP Hub', action: () => ModesManager.setAutonomy('autonomo_headless', refreshAll) }
      ];

      const sel = await vscode.window.showQuickPick(items, { placeHolder: 'Selecione a Topologia ou Nível de Autonomia:' });
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
      await SddBrowserManager.browseDirectory('human-requests', 'Requisições Humanas', openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseBatches', async () => {
      await SddBrowserManager.browseDirectory('implementation', 'Registros de Lotes', openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseDecisions', async () => {
      await SddBrowserManager.browseDirectory('decisions', 'Decisões Arquiteturais (ADRs)', openMarkdownFile);
    }),
    vscode.commands.registerCommand('conn2flow.sdd.browseHandoffs', async () => {
      await SddBrowserManager.browseDirectory('handoffs', 'Handoffs de Agentes', openMarkdownFile);
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
    vscode.commands.registerCommand('conn2flow.bridge.notifyArchitect', () => {
      AgentBridgeManager.notifyArchitect(runInTerminal);
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
      runInTerminal('docker exec conn2flow-app bash -c "truncate -s 0 /var/log/php_errors.log"');
      vscode.window.showInformationMessage('Log de erros PHP truncado com sucesso.');
    }),

    // Manager & Core Commands
    vscode.commands.registerCommand('conn2flow.manager.updateAll', () => {
      runInTerminal(ShellHelper.formatC2fCommand('manager:update-all'));
    }),
    vscode.commands.registerCommand('conn2flow.manager.syncResources', () => {
      runInTerminal(ShellHelper.formatC2fCommand('resources:sync'));
    }),
    vscode.commands.registerCommand('conn2flow.manager.cssRebuild', () => {
      const target = ProjectsManager.getTargetProject() || 'transformamp';
      runInTerminal(ShellHelper.formatC2fCommand(`css:rebuild --project=${target}`));
    }),
    vscode.commands.registerCommand('conn2flow.manager.cssAudit', () => {
      const target = ProjectsManager.getTargetProject() || 'transformamp';
      runInTerminal(ShellHelper.formatC2fCommand(`css:audit --project=${target}`));
    }),

    // Projects Commands
    vscode.commands.registerCommand('conn2flow.projects.setTarget', async () => {
      const list = ProjectsManager.getProjectsList();
      const items = list.map(p => ({
        label: p.name,
        description: `[${p.id}]`,
        id: p.id
      }));

      const sel = await vscode.window.showQuickPick(items, { placeHolder: 'Selecione qual projeto será o Projeto Alvo padrão:' });
      if (sel) {
        await ProjectsManager.setTargetProject(sel.id, refreshAll);
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.deployTarget', () => {
      const target = ProjectsManager.getTargetProject();
      runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${target}`));
    }),
    vscode.commands.registerCommand('conn2flow.projects.syncCoreTarget', () => {
      const target = ProjectsManager.getTargetProject();
      runInTerminal(ShellHelper.formatC2fCommand(`project:sync-core ${target}`));
    }),
    vscode.commands.registerCommand('conn2flow.projects.syncFilesTarget', () => {
      const target = ProjectsManager.getTargetProject();
      runInTerminal(ShellHelper.formatC2fCommand(`project:sync-files ${target}`));
    }),
    vscode.commands.registerCommand('conn2flow.projects.deployWithSelect', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${projectId}`));
      }
    }),
    vscode.commands.registerCommand('conn2flow.projects.updateAllTarget', () => {
      const target = ProjectsManager.getTargetProject();
      runInTerminal(ShellHelper.formatC2fCommand(`project:update-all ${target}`));
    }),
    vscode.commands.registerCommand('conn2flow.projects.updateAllWithSelect', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Update All (6 etapas):');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:update-all ${projectId}`));
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
        vscode.window.showInformationMessage('✔ Todos os repositórios oficiais estão clonados e presentes ao lado do workspace!');
      } else {
        const names = missing.map(m => m.name).join(', ');
        vscode.window.showWarningMessage(`Atenção: Os seguintes repositórios não foram encontrados: ${names}. Para trabalhar com eles, certifique-se de cloná-los na mesma pasta pai.`);
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
      const cmd = ShellHelper.formatPowerShellScript('scripts/sync-all-repos.ps1', '-Force');
      runInTerminal(cmd);
    }),
    vscode.commands.registerCommand('conn2flow.ai.validateSkills', () => {
      runInTerminal(ShellHelper.formatC2fCommand('ai:sync'));
    }),
    vscode.commands.registerCommand('conn2flow.ai.openPlaybook', () => {
      openMarkdownFile('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md');
    }),
    vscode.commands.registerCommand('conn2flow.ai.openCatalog', () => {
      openMarkdownFile('docs/pt-br/CATALOGO-DE-SKILLS.md');
    }),
    vscode.commands.registerCommand('conn2flow.ai.openAgents', () => {
      openMarkdownFile('AGENTS.md');
    }),
    vscode.commands.registerCommand('conn2flow.ai.openGemini', () => {
      openMarkdownFile('GEMINI.md');
    }),

    // Documentation & Guides Commands
    vscode.commands.registerCommand('conn2flow.docs.openDevToolsGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openPanelGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-PAINEL-DEV-TOOLS-VSCODE.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openMarketplaceGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-PUBLICACAO-VSCODE-MARKETPLACE.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openDevGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openSddGuide', () => {
      openMarkdownFile('docs/pt-br/PLAYBOOK-ORQUESTRACAO-MULTI-AGENTES.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openTailwindGuide', () => {
      openMarkdownFile('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openArchitectureGuide', () => {
      openMarkdownFile('docs/pt-br/ARQUITETURA-AGENTE-DUPLO.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openDockerGuide', () => {
      openMarkdownFile('docs/pt-br/GUIA-RAPIDO-CLI-E-MCP.md');
    }),
    vscode.commands.registerCommand('conn2flow.docs.openResourcesGuide', () => {
      openMarkdownFile('docs/pt-br/CATALOGO-DE-SKILLS.md');
    }),

    // Aliases para Projetos
    vscode.commands.registerCommand('conn2flow.projects.deployOther', async () => {
      const projectId = await selectProjectFromEnvironment('Selecione o projeto para Deploy:');
      if (projectId) {
        runInTerminal(ShellHelper.formatC2fCommand(`project:deploy ${projectId}`));
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
  const topLabel = modes.topology === 'triade' ? 'Tríade' : 'Duplo';
  const autoMap: Record<string, string> = {
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
      } catch {
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

export function deactivate() {
  if (terminal) {
    terminal.dispose();
  }
}

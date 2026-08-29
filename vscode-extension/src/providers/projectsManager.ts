import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LocalizationManager } from './localizationManager';

export interface DevProject {
  id: string;
  name: string;
  path: string;
  path_tests?: string;
  local?: boolean;
  url?: string;
}

export class ProjectsManager {
  private static toGitPath(value: string): string {
    return value.replace(/^([A-Za-z]):[\\/]/, (_, drive: string) => `/${drive.toLowerCase()}/`).replace(/\\/g, '/');
  }

  private static getCoreRoot(): string | undefined {
    const envPath = this.getEnvironmentFilePath();
    return envPath ? path.resolve(path.dirname(envPath), '..', '..') : undefined;
  }

  private static getRepositoryParent(): string | undefined {
    const root = this.getCoreRoot() || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return root ? path.dirname(root) : undefined;
  }

  private static getGithubOwner(): string | undefined {
    const configured = vscode.workspace.getConfiguration('conn2flow').get<string>('githubOwner', '').trim();
    if (configured) return configured;
    const root = this.getCoreRoot();
    const configPath = root ? path.join(root, '.git', 'config') : undefined;
    if (!configPath || !fs.existsSync(configPath)) return undefined;
    const config = fs.readFileSync(configPath, 'utf8');
    return config.match(/github\.com[/:]([^/\s]+)\//i)?.[1];
  }
  public static getEnvironmentFilePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const candidates = [
        path.join(folder.uri.fsPath, 'dev-environment', 'data', 'environment.json'),
        path.join(folder.uri.fsPath, '..', 'conn2flow', 'dev-environment', 'data', 'environment.json'),
        path.join(folder.uri.fsPath, 'environment.json')
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return cand;
        }
      }
    }

    return undefined;
  }

  public static getEnvironmentTemplatePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const candidates = [
        path.join(folder.uri.fsPath, '..', 'conn2flow', 'dev-environment', 'templates', 'environment', 'environment.json'),
        path.join(folder.uri.fsPath, 'dev-environment', 'templates', 'environment', 'environment.json')
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return cand;
        }
      }
    }

    return undefined;
  }

  public static getEnvironmentData(): any | undefined {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      return undefined;
    }

    try {
      const raw = fs.readFileSync(envPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  public static getTargetProject(): string | undefined {
    const data = this.getEnvironmentData();
    const target = data?.devEnvironment?.projectTarget;
    if (typeof target === 'string' && data?.devProjects?.[target]) {
      return target;
    }
    return undefined;
  }

  public static getProject(projectId: string | undefined): DevProject | undefined {
    return projectId ? this.getProjectsList().find(project => project.id === projectId) : undefined;
  }

  public static getProjectsList(): DevProject[] {
    const data = this.getEnvironmentData();
    const list: DevProject[] = [];

    if (data && data.devProjects) {
      for (const [id, proj] of Object.entries<any>(data.devProjects)) {
        list.push({
          id,
          name: proj.name || id,
          path: proj.path || '',
          path_tests: proj.path_tests,
          local: proj.local,
          url: proj.url
        });
      }
    }

    return list;
  }

  public static async setTargetProject(projectId: string, onUpdated?: () => void): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    try {
      const data = this.getEnvironmentData();
      if (!data) return;

      if (!data.devEnvironment) {
        data.devEnvironment = {};
      }

      data.devEnvironment.projectTarget = projectId;
      fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');

      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.targetChanged', { target: projectId }), 2000);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  public static async addNewProject(onUpdated?: () => void): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    const id = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.idPrompt'),
      placeHolder: 'ex: meu-novo-projeto'
    });
    if (!id) return;

    const name = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.namePrompt'),
      placeHolder: 'ex: Meu Novo Projeto'
    });
    if (!name) return;

    const url = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.urlPrompt'),
      placeHolder: 'ex: http://localhost/meu-novo-projeto/ ou https://meusite.com/'
    });

    const isLocalChoice = await vscode.window.showQuickPick([LocalizationManager.t('common.yesLocal'), LocalizationManager.t('common.noRemote')], {
      placeHolder: LocalizationManager.t('projects.localPrompt')
    });
    const isLocal = isLocalChoice ? isLocalChoice === LocalizationManager.t('common.yesLocal') : true;

    try {
      const data = this.getEnvironmentData();
      if (!data) return;

      if (!data.devProjects) {
        data.devProjects = {};
      }

      const coreRoot = this.getCoreRoot();
      const parent = this.getRepositoryParent();
      if (!coreRoot || !parent) throw new Error('Raiz dos repositórios não encontrada.');
      data.devProjects[id] = {
        name,
        path: this.toGitPath(path.join(parent, id, 'gestor')),
        path_tests: isLocal ? this.toGitPath(path.join(coreRoot, 'dev-environment', 'data', 'sites', 'localhost', id)) + '/' : '',
        local: isLocal,
        gitDeploy: false,
        gitDeployBaseRef: 'HEAD',
        url: url || `http://localhost/${id}/`,
        api: {}
      };

      fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      vscode.window.showInformationMessage(LocalizationManager.t('projects.saved', { name, id }));

      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  public static async syncWithTemplate(onUpdated?: () => void): Promise<void> {
    const templatePath = this.getEnvironmentTemplatePath();
    const envPath = this.getEnvironmentFilePath();

    if (!templatePath || !fs.existsSync(templatePath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.templateMissing'));
      return;
    }

    if (!envPath) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    try {
      const templateRaw = fs.readFileSync(templatePath, 'utf8');
      const template = JSON.parse(templateRaw);

      let targetData: any = {};
      if (fs.existsSync(envPath)) {
        targetData = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      }

      // Função de deep merge preservando dados existentes
      const mergeMissing = (tmpl: any, target: any) => {
        for (const key of Object.keys(tmpl)) {
          if (key === 'devProjects') continue; // Projetos reais não são sobrescritos

          if (target[key] === undefined) {
            target[key] = tmpl[key];
          } else if (typeof tmpl[key] === 'object' && tmpl[key] !== null && !Array.isArray(tmpl[key])) {
            mergeMissing(tmpl[key], target[key]);
          }
        }
      };

      mergeMissing(template, targetData);
      fs.writeFileSync(envPath, JSON.stringify(targetData, null, 2), 'utf8');

      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.syncSucceeded'), 2000);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  public static async openActiveEnvironment(): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (envPath && fs.existsSync(envPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(envPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
    }
  }

  public static async openTemplateEnvironment(): Promise<void> {
    const tmplPath = this.getEnvironmentTemplatePath();
    if (tmplPath && fs.existsSync(tmplPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmplPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.templateMissing'));
    }
  }

  public static checkAdjacentRepositories(): { name: string; exists: boolean; path: string }[] {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return [];

    const rootParent = this.getRepositoryParent() || path.join(workspaceFolders[0].uri.fsPath, '..');
    const repos = ['conn2flow', 'lumix', 'transformamp', 'conn2flow-site'];

    return repos.map(repo => {
      const full = path.join(rootParent, repo);
      return {
        name: repo,
        exists: fs.existsSync(full),
        path: full
      };
    });
  }

  public static async cloneMissingRepository(runInTerminal: (cmd: string) => void, onUpdated?: () => void): Promise<void> {
    const repos = this.checkAdjacentRepositories();
    const missing = repos.filter(r => !r.exists);

    if (missing.length === 0) {
      vscode.window.showInformationMessage(LocalizationManager.t('projects.allPresent'));
      return;
    }

    let owner = this.getGithubOwner();
    if (!owner) {
      owner = await vscode.window.showInputBox({ prompt: LocalizationManager.t('projects.githubOwnerPrompt') });
    }
    if (!owner || !/^[A-Za-z0-9_.-]+$/.test(owner)) return;

    const items = missing.map(m => ({
      label: `📥 Clonar ${m.name}`,
      description: `https://github.com/${owner}/${m.name}.git`,
      repo: m.name
    }));

    if (missing.length > 1) {
      items.unshift({
        label: '🚀 Clonar TODOS os Repositórios Faltantes',
        description: missing.map(m => m.name).join(', '),
        repo: '__all__'
      });
    }

    const sel = await vscode.window.showQuickPick(items, {
      placeHolder: LocalizationManager.t('projects.clonePrompt')
    });
    if (!sel) return;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const parentPath = this.getRepositoryParent() || path.join(workspaceFolders[0].uri.fsPath, '..');
    const clone = (repo: string) => `git -C '${parentPath.replace(/'/g, "''")}' clone 'https://github.com/${owner}/${repo}.git'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`;

    if (sel.repo === '__all__') {
      const commands = missing.map(m => clone(m.name)).join('; ');
      runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${commands}"`);
    } else {
      runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${clone(sel.repo)}"`);
    }
    onUpdated?.();
  }

  public static async scaffoldNewSatelliteProject(onUpdated?: () => void): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.noWorkspace'));
      return;
    }

    const id = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.idPrompt'),
      placeHolder: 'ex: meu-satelite'
    });
    if (!id) return;

    const name = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.namePrompt'),
      placeHolder: 'ex: Meu Projeto Satélite'
    });
    if (!name) return;

    const url = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.urlPrompt'),
      placeHolder: `ex: http://localhost/${id}/`
    });

    const isLocalChoice = await vscode.window.showQuickPick([LocalizationManager.t('common.yesLocal'), LocalizationManager.t('common.noRemote')], {
      placeHolder: LocalizationManager.t('projects.localPrompt')
    });
    const isLocal = isLocalChoice ? isLocalChoice === LocalizationManager.t('common.yesLocal') : true;

    try {
      const parentDir = path.join(workspaceFolders[0].uri.fsPath, '..');
      const projectDir = path.join(parentDir, id);

      // Criar pastas físicas do scaffold
      const subdirs = [
        path.join(projectDir, 'gestor', 'modulos'),
        path.join(projectDir, 'gestor', 'assets'),
        path.join(projectDir, 'gestor', 'resources'),
        path.join(projectDir, 'docs')
      ];

      for (const d of subdirs) {
        if (!fs.existsSync(d)) {
          fs.mkdirSync(d, { recursive: true });
        }
      }

      // Criar README.md básico
      const readmePath = path.join(projectDir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const readmeContent = `# ${name}\n\nProjeto satélite Conn2Flow provisionado via Conn2Flow Dev Tools.\n\n- **Identificador**: \`${id}\`\n- **URL**: ${url || `http://localhost/${id}/`}\n- **Criado em**: ${new Date().toISOString()}\n`;
        fs.writeFileSync(readmePath, readmeContent, 'utf8');
      }

      // Cadastrar no environment.json ativo
      const envPath = this.getEnvironmentFilePath();
      if (envPath && fs.existsSync(envPath)) {
        const data = JSON.parse(fs.readFileSync(envPath, 'utf8'));
        if (!data.devProjects) data.devProjects = {};

        const coreRoot = this.getCoreRoot();
        if (!coreRoot) throw new Error('Raiz do Core não encontrada.');
        data.devProjects[id] = {
          name,
          path: this.toGitPath(path.join(projectDir, 'gestor')),
          path_tests: isLocal ? this.toGitPath(path.join(coreRoot, 'dev-environment', 'data', 'sites', 'localhost', id)) + '/' : '',
          local: isLocal,
          gitDeploy: false,
          gitDeployBaseRef: 'HEAD',
          url: url || `http://localhost/${id}/`,
          api: {
            access_token: '',
            refresh_token: '',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'read write'
          }
        };

        fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      }

      vscode.window.showInformationMessage(LocalizationManager.t('projects.scaffolded', { name, id }));
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }
}

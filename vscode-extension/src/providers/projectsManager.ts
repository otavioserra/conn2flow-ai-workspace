import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface DevProject {
  id: string;
  name: string;
  path: string;
  path_tests?: string;
  local?: boolean;
  url?: string;
}

export class ProjectsManager {
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

  public static getTargetProject(): string {
    const data = this.getEnvironmentData();
    if (data && data.devEnvironment && data.devEnvironment.projectTarget) {
      return data.devEnvironment.projectTarget;
    }
    return 'conn2flow-site';
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
      vscode.window.showErrorMessage('environment.json não encontrado para atualizar projeto alvo.');
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

      vscode.window.showInformationMessage(`Projeto Alvo padrão alterado para: ${projectId}`);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Erro ao salvar environment.json: ${err.message}`);
    }
  }

  public static async addNewProject(onUpdated?: () => void): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage('environment.json não encontrado.');
      return;
    }

    const id = await vscode.window.showInputBox({
      prompt: 'Identificador único do projeto (slug em minúsculas):',
      placeHolder: 'ex: meu-novo-projeto'
    });
    if (!id) return;

    const name = await vscode.window.showInputBox({
      prompt: 'Nome de exibição do projeto:',
      placeHolder: 'ex: Meu Novo Projeto'
    });
    if (!name) return;

    const url = await vscode.window.showInputBox({
      prompt: 'URL base do projeto (local ou remota):',
      placeHolder: 'ex: http://localhost/meu-novo-projeto/ ou https://meusite.com/'
    });

    const isLocalChoice = await vscode.window.showQuickPick(['Sim (Ambiente de Testes Local)', 'Não (Produção Remota)'], {
      placeHolder: 'O projeto roda no ambiente local Docker?'
    });
    const isLocal = isLocalChoice ? isLocalChoice.startsWith('Sim') : true;

    try {
      const data = this.getEnvironmentData();
      if (!data) return;

      if (!data.devProjects) {
        data.devProjects = {};
      }

      data.devProjects[id] = {
        name,
        path: `/c/Users/otavi/OneDrive/Documentos/GIT/${id}/gestor`,
        path_tests: isLocal ? `/c/Users/otavi/OneDrive/Documentos/GIT/conn2flow/dev-environment/data/sites/localhost/${id}/` : '',
        local: isLocal,
        gitDeploy: false,
        gitDeployBaseRef: 'HEAD',
        url: url || `http://localhost/${id}/`,
        api: {}
      };

      fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      vscode.window.showInformationMessage(`Projeto '${name}' (${id}) cadastrado com sucesso no environment.json!`);

      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Falha ao adicionar projeto: ${err.message}`);
    }
  }

  public static async syncWithTemplate(onUpdated?: () => void): Promise<void> {
    const templatePath = this.getEnvironmentTemplatePath();
    const envPath = this.getEnvironmentFilePath();

    if (!templatePath || !fs.existsSync(templatePath)) {
      vscode.window.showErrorMessage('Template de environment.json não encontrado em dev-environment/templates/environment/.');
      return;
    }

    if (!envPath) {
      vscode.window.showErrorMessage('Arquivo ativo environment.json não encontrado.');
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

      vscode.window.showInformationMessage('Estrutura de environment.json sincronizada com o template canônico do Core com sucesso!');
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Falha ao sincronizar com template: ${err.message}`);
    }
  }

  public static async openActiveEnvironment(): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (envPath && fs.existsSync(envPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(envPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage('environment.json ativo não encontrado.');
    }
  }

  public static async openTemplateEnvironment(): Promise<void> {
    const tmplPath = this.getEnvironmentTemplatePath();
    if (tmplPath && fs.existsSync(tmplPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmplPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage('Template de environment.json não encontrado.');
    }
  }

  public static checkAdjacentRepositories(): { name: string; exists: boolean; path: string }[] {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return [];

    const rootParent = path.join(workspaceFolders[0].uri.fsPath, '..');
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
}

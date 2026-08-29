import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectsManager } from './projectsManager';

export interface SddScope {
  id: string; // 'core' | 'ai-workspace' | 'project:<id>'
  label: string;
  description: string;
  sddPath: string;
}

export class SddScopeManager {
  private static _currentScopeId: string = 'core';

  public static getCurrentScopeId(): string {
    return this._currentScopeId;
  }

  public static getScopeLabel(): string {
    const scope = this.getCurrentScope();
    return scope ? scope.label : '🏛️ Core (conn2flow)';
  }

  public static getAvailableScopes(): SddScope[] {
    const scopes: SddScope[] = [];

    // 1. Core (conn2flow)
    const coreSdd = this.findRepoSdd('conn2flow');
    scopes.push({
      id: 'core',
      label: '🏛️ Core (Sistema)',
      description: 'conn2flow/sdd',
      sddPath: coreSdd || ''
    });

    // 2. Projetos Satélites do environment.json
    const projects = ProjectsManager.getProjectsList();
    for (const proj of projects) {
      const projSdd = this.findProjectSdd(proj.id, proj.path);
      if (projSdd && fs.existsSync(projSdd)) {
        scopes.push({
          id: `project:${proj.id}`,
          label: `🚀 Projeto: ${proj.name}`,
          description: `${proj.id}/sdd`,
          sddPath: projSdd
        });
      }
    }

    // 3. AI Workspace
    const aiSdd = this.findRepoSdd('conn2flow-ai-workspace');
    if (aiSdd && fs.existsSync(aiSdd)) {
      scopes.push({
        id: 'ai-workspace',
        label: '📚 AI Workspace Hub',
        description: 'conn2flow-ai-workspace/sdd',
        sddPath: aiSdd
      });
    }

    return scopes;
  }

  public static getCurrentScope(): SddScope | undefined {
    const scopes = this.getAvailableScopes();
    const found = scopes.find(s => s.id === this._currentScopeId);
    if (found) return found;

    return scopes[0];
  }

  public static getActiveSddRoot(): string | undefined {
    const scope = this.getCurrentScope();
    if (scope && scope.sddPath && fs.existsSync(scope.sddPath)) {
      return scope.sddPath;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const f of workspaceFolders) {
        const s = path.join(f.uri.fsPath, 'sdd');
        if (fs.existsSync(s)) return s;
      }
    }
    return undefined;
  }

  public static resolveSddFile(relativePathInSdd: string): string | undefined {
    const sddRoot = this.getActiveSddRoot();
    if (sddRoot) {
      const cleanRel = relativePathInSdd.replace(/^sdd[/\\]/, '');
      const full = path.join(sddRoot, cleanRel);
      if (fs.existsSync(full)) {
        return full;
      }
    }
    return undefined;
  }

  public static async selectScope(onChanged?: () => void): Promise<void> {
    const scopes = this.getAvailableScopes();
    const targetProject = ProjectsManager.getTargetProject();

    const items: vscode.QuickPickItem[] = scopes.map(s => {
      const isActive = s.id === this._currentScopeId;
      const isTarget = s.id === `project:${targetProject}`;
      let extra = '';
      if (isActive) extra = ' ● ATIVO';
      if (isTarget) extra += ' (Projeto Alvo Atual)';

      return {
        label: `${s.label}${extra}`,
        description: s.description,
        detail: s.id
      };
    });

    const sel = await vscode.window.showQuickPick(items, {
      placeHolder: 'Selecione o Escopo SDD (Core do Sistema ou Projeto Satélite):'
    });

    if (sel && sel.detail) {
      this._currentScopeId = sel.detail;
      const chosen = scopes.find(s => s.id === sel.detail);
      vscode.window.setStatusBarMessage(`Escopo SDD: ${chosen?.label || sel.detail}`, 2500);
      if (onChanged) {
        onChanged();
      }
    }
  }

  private static findRepoSdd(repoName: string): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return undefined;

    for (const f of workspaceFolders) {
      const candidates = [
        path.join(f.uri.fsPath, 'sdd'),
        path.join(f.uri.fsPath, '..', repoName, 'sdd'),
        path.join(f.uri.fsPath, repoName, 'sdd')
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          return c;
        }
      }
    }
    return undefined;
  }

  private static findProjectSdd(projectId: string, projPathConfig?: string): string | undefined {
    const candidates: string[] = [];

    if (projPathConfig) {
      let clean = projPathConfig;
      clean = clean.replace(/^\/([a-zA-Z])\//, '$1:/');
      clean = clean.replace(/[/\\]gestor\/?$/, '');
      candidates.push(path.join(clean, 'sdd'));
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const f of workspaceFolders) {
        candidates.push(path.join(f.uri.fsPath, '..', projectId, 'sdd'));
        candidates.push(path.join(f.uri.fsPath, 'projects', projectId, 'sdd'));
        candidates.push(path.join(f.uri.fsPath, projectId, 'sdd'));
      }
    }

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
    return undefined;
  }
}

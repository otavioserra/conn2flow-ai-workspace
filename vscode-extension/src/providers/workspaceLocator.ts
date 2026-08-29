import * as vscode from 'vscode';
import * as fs from 'fs';
import { buildRepositoryRootCandidates } from '../repositoryLocator';

export class WorkspaceLocator {
  public static getWorkspacePaths(): string[] {
    return vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
  }

  public static findRepositoryRoot(repoName: string): string | undefined {
    return buildRepositoryRootCandidates(this.getWorkspacePaths(), repoName).find(candidate =>
      fs.existsSync(candidate)
    );
  }

  public static getCoreRoot(): string | undefined {
    return this.findRepositoryRoot('conn2flow');
  }

  public static getAiWorkspaceRoot(): string | undefined {
    return this.findRepositoryRoot('conn2flow-ai-workspace');
  }
}

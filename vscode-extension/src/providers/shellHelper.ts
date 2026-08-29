import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export type ShellType = 'bash' | 'powershell' | 'cmd';

export class ShellHelper {
  public static getActiveShellType(): ShellType {
    const active = vscode.window.activeTerminal;
    const name = (active?.name || '').toLowerCase();

    if (name.includes('bash') || name.includes('mingw') || name.includes('sh') || name.includes('git')) {
      return 'bash';
    }
    if (name.includes('pwsh') || name.includes('powershell')) {
      return 'powershell';
    }
    if (name.includes('cmd') || name.includes('prompt')) {
      return 'cmd';
    }

    const defaultProfile = vscode.workspace.getConfiguration('terminal.integrated.defaultProfile').get<string>('windows', '').toLowerCase();
    if (defaultProfile.includes('bash') || defaultProfile.includes('git') || defaultProfile.includes('mingw')) {
      return 'bash';
    }
    if (defaultProfile.includes('pwsh') || defaultProfile.includes('powershell')) {
      return 'powershell';
    }

    return 'bash';
  }

  public static formatC2fCommand(subCommand: string): string {
    const shell = this.getActiveShellType();
    if (shell === 'bash') {
      return `./c2f ${subCommand}`;
    } else {
      return `php cli/c2f.php ${subCommand}`;
    }
  }

  public static formatPowerShellScript(scriptRelativePath: string, args: string = ''): string {
    const shell = this.getActiveShellType();

    // Encontra o caminho absoluto do script no workspace ou ai-workspace
    let absolutePath = '';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const f of workspaceFolders) {
        const candidates = [
          path.join(f.uri.fsPath, scriptRelativePath),
          path.join(f.uri.fsPath, '..', 'conn2flow-ai-workspace', scriptRelativePath),
          path.join(f.uri.fsPath, 'ai-workspace', scriptRelativePath)
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) {
            absolutePath = c;
            break;
          }
        }
        if (absolutePath) break;
      }
    }

    if (!absolutePath) {
      absolutePath = scriptRelativePath;
    }

    if (shell === 'bash') {
      const normalized = absolutePath.replace(/\\/g, '/');
      return `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${normalized}" ${args}`.trim();
    } else {
      return `powershell -NoProfile -ExecutionPolicy Bypass -File "${absolutePath}" ${args}`.trim();
    }
  }
}

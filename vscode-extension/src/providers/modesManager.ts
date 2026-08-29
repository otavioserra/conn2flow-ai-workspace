import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export type TopologyMode = 'duplo' | 'triade';
export type AutonomyLevel = 'supervisionado' | 'autonomo_monitorado' | 'autonomo_headless';

export interface SDDModes {
  topology: TopologyMode;
  autonomy: AutonomyLevel;
}

export class ModesManager {
  private static cachedModes: SDDModes = {
    topology: 'triade',
    autonomy: 'supervisionado'
  };
  private static initialized = false;

  public static getCurrentModes(): SDDModes {
    if (!this.initialized) {
      this.initFromDisk();
      this.initialized = true;
    }
    return this.cachedModes;
  }

  private static initFromDisk(): void {
    const currentPath = this.getCurrentFilePath();
    if (!currentPath || !fs.existsSync(currentPath)) return;

    try {
      const content = fs.readFileSync(currentPath, 'utf8');

      const topMatch = content.match(/\*\*Topologia de Agentes\*\*:\s*`?([a-zA-Z_-]+)`?/i);
      if (topMatch && (topMatch[1].toLowerCase() === 'duplo' || topMatch[1].toLowerCase() === 'triade')) {
        this.cachedModes.topology = topMatch[1].toLowerCase() as TopologyMode;
      }

      const autoMatch = content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([a-zA-Z_-]+)`?/i);
      if (autoMatch) {
        const val = autoMatch[1].toLowerCase();
        if (val === 'supervisionado' || val === 'autonomo_monitorado' || val === 'autonomo_headless') {
          this.cachedModes.autonomy = val as AutonomyLevel;
        }
      }
    } catch {
      // silencioso
    }
  }

  public static async setTopology(mode: TopologyMode, onUpdated?: () => void): Promise<void> {
    this.cachedModes.topology = mode;
    this.initialized = true;

    const currentPath = this.getCurrentFilePath();
    if (currentPath && fs.existsSync(currentPath)) {
      try {
        let content = fs.readFileSync(currentPath, 'utf8');
        if (content.match(/\*\*Topologia de Agentes\*\*:/i)) {
          content = content.replace(/\*\*Topologia de Agentes\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Topologia de Agentes**: \`${mode}\``);
        } else {
          content = content.replace(/(\*   \*\*Status\*\*:[^\n]*\n)/i, `$1*   **Topologia de Agentes**: \`${mode}\`\n`);
        }
        fs.writeFileSync(currentPath, content, 'utf8');
      } catch {
        // segue com cache em memoria
      }
    }

    const label = mode === 'triade' ? '🏛️ Tríade de Agentes' : '👥 Duplo Agente';
    vscode.window.setStatusBarMessage(`Topologia: ${label}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  public static async setAutonomy(level: AutonomyLevel, onUpdated?: () => void): Promise<void> {
    this.cachedModes.autonomy = level;
    this.initialized = true;

    const currentPath = this.getCurrentFilePath();
    if (currentPath && fs.existsSync(currentPath)) {
      try {
        let content = fs.readFileSync(currentPath, 'utf8');
        if (content.match(/\*\*N[íi]vel de Autonomia\*\*:/i)) {
          content = content.replace(/\*\*N[íi]vel de Autonomia\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Nível de Autonomia**: \`${level}\``);
        } else {
          content = content.replace(/(\*   \*\*Topologia de Agentes\*\*:[^\n]*\n)/i, `$1*   **Nível de Autonomia**: \`${level}\`\n`);
        }
        fs.writeFileSync(currentPath, content, 'utf8');
      } catch {
        // segue com cache em memoria
      }
    }

    const labels: Record<AutonomyLevel, string> = {
      supervisionado: '🛡️ Nível 1: Supervisionado',
      autonomo_monitorado: '👁️ Nível 2: Autônomo Monitorado',
      autonomo_headless: '🤖 Nível 3: Autônomo Headless'
    };
    vscode.window.setStatusBarMessage(`Autonomia: ${labels[level]}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  private static getCurrentFilePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const candidates = [
        path.join(folder.uri.fsPath, 'sdd', 'human-requests', 'CURRENT.md'),
        path.join(folder.uri.fsPath, '..', 'conn2flow', 'sdd', 'human-requests', 'CURRENT.md'),
        path.join(folder.uri.fsPath, '..', 'conn2flow-ai-workspace', 'sdd', 'human-requests', 'CURRENT.md')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          return p;
        }
      }
    }

    return undefined;
  }
}
